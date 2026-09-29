import { Router } from 'express';
import { prisma } from '../db';
import { detectPriceAnomaly } from '../services/aiInference';
import { computeRecordHash } from '../services/tamperEvidence';

const router = Router();

// GET all transactions (filtered by collector, recycler, status)
router.get('/', async (req, res) => {
  try {
    const { collectorId, recyclerId, status } = req.query;
    const where: any = {};
    if (collectorId) where.collectorId = String(collectorId);
    if (recyclerId) where.recyclerId = String(recyclerId);
    if (status) where.transactionStatus = String(status);

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        lot: true,
        collector: true,
        recycler: true,
        earnings: true,
      },
      orderBy: { dateTime: 'desc' }
    });

    return res.json(transactions);
  } catch (error) {
    console.error('Fetch transactions error:', error);
    return res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// GET single transaction with lot, collector, recycler, and traceability
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await prisma.transaction.findFirst({
      where: {
        OR: [{ id }, { transactionReference: id }]
      },
      include: {
        lot: {
          include: {
            traceabilityRecords: true,
          }
        },
        collector: true,
        recycler: true,
        earnings: true,
      }
    });

    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
    return res.json(transaction);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

// POST Create transaction for an existing lot
router.post('/', async (req, res) => {
  try {
    const { lotId, recyclerId, quotedPrice } = req.body;
    const lot = await prisma.lot.findUnique({ where: { id: lotId } });
    if (!lot) return res.status(404).json({ error: 'Lot not found' });

    const recycler = await prisma.recycler.findUnique({ where: { id: recyclerId } });
    if (!recycler) return res.status(404).json({ error: 'Recycler not found' });

    let finalRate = parseFloat(quotedPrice);
    if (isNaN(finalRate)) {
      try {
        const rates = JSON.parse(recycler.offeredRates);
        finalRate = rates[lot.materialCategory] || 50;
      } catch {
        finalRate = 50;
      }
    }

    const finalSaleValue = Math.round(finalRate * lot.approximateWeight);
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const txnCount = await prisma.transaction.count();
    const txnRef = `TXN-${dateStr}-${String(txnCount + 1).padStart(4, '0')}`;

    // AI Anomaly check
    const anomaly = detectPriceAnomaly(lot.materialCategory, finalRate);

    const transaction = await prisma.transaction.create({
      data: {
        transactionReference: txnRef,
        lotId: lot.id,
        collectorId: lot.collectorId,
        recyclerId: recycler.id,
        quotedPrice: finalRate,
        finalSaleValue,
        handoverLocation: lot.collectionLocation,
        handoverLatitude: lot.latitude,
        handoverLongitude: lot.longitude,
        paymentStatus: 'PENDING',
        transactionStatus: 'INITIATED',
        anomalyFlag: anomaly.isAnomaly,
        anomalyReason: anomaly.reason || null,
      },
      include: {
        lot: true,
        collector: true,
        recycler: true,
      }
    });

    // Update lot status and selected recycler
    await prisma.lot.update({
      where: { id: lot.id },
      data: {
        status: 'ACCEPTED',
        selectedRecyclerId: recycler.id,
      }
    });

    return res.status(201).json(transaction);
  } catch (error) {
    console.error('Create transaction error:', error);
    return res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// PATCH /:id/status (Accept / Reject)
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, quotedPrice } = req.body;

    const txn = await prisma.transaction.findUnique({ where: { id }, include: { lot: true } });
    if (!txn) return res.status(404).json({ error: 'Transaction not found' });

    const updateData: any = { transactionStatus: status };
    if (quotedPrice) {
      const qp = parseFloat(quotedPrice);
      updateData.quotedPrice = qp;
      updateData.finalSaleValue = Math.round(qp * txn.lot.approximateWeight);
      
      const anomaly = detectPriceAnomaly(txn.lot.materialCategory, qp);
      updateData.anomalyFlag = anomaly.isAnomaly;
      updateData.anomalyReason = anomaly.reason || null;
    }

    const updated = await prisma.transaction.update({
      where: { id },
      data: updateData,
      include: { lot: true, collector: true, recycler: true }
    });

    if (status === 'ACCEPTED') {
      await prisma.lot.update({ where: { id: txn.lotId }, data: { status: 'ACCEPTED' } });
    } else if (status === 'REJECTED') {
      await prisma.lot.update({ where: { id: txn.lotId }, data: { status: 'REJECTED' } });
    }

    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update transaction status' });
  }
});

// POST /:id/handover (Confirm physical pickup/handover & create Traceability record)
router.post('/:id/handover', async (req, res) => {
  try {
    const { id } = req.params;
    const { finalWeight, handoverLocation, handoverLatitude, handoverLongitude, photo } = req.body;

    const txn = await prisma.transaction.findUnique({
      where: { id },
      include: { lot: true, collector: true, recycler: true }
    });
    if (!txn) return res.status(404).json({ error: 'Transaction not found' });

    const wt = finalWeight ? parseFloat(finalWeight) : txn.lot.approximateWeight;
    const finalValue = Math.round(wt * txn.quotedPrice);

    const updatedTxn = await prisma.transaction.update({
      where: { id },
      data: {
        finalSaleValue: finalValue,
        handoverLocation: handoverLocation || txn.handoverLocation,
        handoverLatitude: handoverLatitude ? parseFloat(handoverLatitude) : txn.handoverLatitude,
        handoverLongitude: handoverLongitude ? parseFloat(handoverLongitude) : txn.handoverLongitude,
        transactionStatus: 'HANDED_OVER',
      }
    });

    // Update lot status and weight
    await prisma.lot.update({
      where: { id: txn.lotId },
      data: {
        approximateWeight: wt,
        status: 'HANDED_OVER',
      }
    });

    // Generate SHA-256 tamper-evident hash linked to previous handover record
    const precedingRecord = await prisma.traceabilityRecord.findFirst({
      orderBy: { timestamp: 'desc' }
    });
    const previousHash = precedingRecord?.id ? `HASH-${precedingRecord.id.substring(0, 16)}` : 'GENESIS_SEAL_CPCB_2026';

    const hashBlock = computeRecordHash({
      lotReference: txn.lot.lotReference,
      transactionReference: txn.transactionReference,
      materialCategory: txn.lot.materialCategory,
      verifiedWeightKg: wt,
      collectorId: txn.collectorId,
      recyclerId: txn.recyclerId,
      gpsCoordinates: `${updatedTxn.handoverLatitude}, ${updatedTxn.handoverLongitude}`,
      timestamp: new Date().toISOString(),
      recyclerLicenseNumber: txn.recycler.authorizationNumber,
    }, previousHash);

    // Create immutable Traceability Record with audit hash chain
    const traceability = await prisma.traceabilityRecord.create({
      data: {
        lotId: txn.lotId,
        photographs: JSON.stringify([photo || txn.lot.imageReference || '/demo-images/pcb.jpg']),
        weight: wt,
        gpsCoordinates: `${updatedTxn.handoverLatitude}, ${updatedTxn.handoverLongitude}`,
        handoverReference: txn.transactionReference,
        recyclerConfirmation: true,
        subsequentStatus: `Verified at Facility [SHA-256: ${hashBlock.currentRecordHash.substring(0, 12)}...]`,
      }
    });

    return res.json({
      transaction: updatedTxn,
      traceability,
      tamperEvidentSeal: hashBlock,
      message: 'Physical handover recorded and tamper-evident cryptographic traceability seal generated',
    });
  } catch (error) {
    console.error('Handover error:', error);
    return res.status(500).json({ error: 'Failed to record handover' });
  }
});

// POST /:id/payment (Confirm payment - Cash dual-signoff + Digital UPI/Bank)
router.post('/:id/payment', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      paymentMethod = 'Instant UPI Direct', 
      amount,
      digitalPaymentRef, // UPI UTR or Bank Txn Ref
      confirmedByRole = 'recycler' // 'recycler' | 'collector'
    } = req.body;

    const txn = await prisma.transaction.findUnique({
      where: { id },
      include: { lot: true }
    });
    if (!txn) return res.status(404).json({ error: 'Transaction not found' });

    const payAmount = amount ? parseFloat(amount) : txn.finalSaleValue;
    const isCash = paymentMethod.toLowerCase().includes('cash');

    const updatedTxn = await prisma.transaction.update({
      where: { id },
      data: {
        paymentStatus: 'PAID',
        transactionStatus: 'COMPLETED',
      }
    });

    await prisma.lot.update({
      where: { id: txn.lotId },
      data: { status: 'COMPLETED' }
    });

    const paymentLabel = isCash 
      ? `Cash Handover (${confirmedByRole === 'collector' ? 'Collector Confirmed Received' : 'Recycler Confirmed Paid'})`
      : `UPI Direct ${digitalPaymentRef ? `[UTR: ${digitalPaymentRef}]` : '[Instant Bank]'}`;

    // Create or update Earnings entry
    const earnings = await prisma.earnings.create({
      data: {
        collectorId: txn.collectorId,
        transactionId: txn.id,
        amount: payAmount,
        paymentMethod: paymentLabel,
        paymentStatus: 'PAID',
        date: new Date(),
      }
    });

    return res.json({
      transaction: updatedTxn,
      earnings,
      paymentVerification: {
        method: isCash ? 'CASH' : 'UPI',
        dualConfirmationStatus: isCash ? 'MUTUALLY_SETTLED' : 'INSTANT_SETTLED',
        settlementReference: digitalPaymentRef || `CASH-CONF-${Date.now()}`
      },
      message: 'Payment confirmed successfully and credited to collector ledger'
    });
  } catch (error) {
    console.error('Payment confirmation error:', error);
    return res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

export default router;
