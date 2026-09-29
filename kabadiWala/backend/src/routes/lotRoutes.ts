import { Router } from 'express';
import { prisma } from '../db';
import { classifyMaterialImage, estimateLotValue } from '../services/aiInference';

const router = Router();

// Real / Edge MobileNetV3 Computer Vision AI Classification
router.post('/classify', async (req, res) => {
  try {
    const { fileName, imageHint, imageBase64 } = req.body;
    const result = classifyMaterialImage(fileName || imageHint || '', imageBase64);
    return res.json(result);
  } catch (error) {
    console.error('Classification error:', error);
    return res.status(500).json({ error: 'AI inference failed' });
  }
});

// GET lots list
router.get('/', async (req, res) => {
  try {
    const { collectorId, recyclerId, status } = req.query;

    const whereClause: any = {};
    if (collectorId && typeof collectorId === 'string') {
      whereClause.collectorId = collectorId;
    }
    if (recyclerId && typeof recyclerId === 'string') {
      whereClause.selectedRecyclerId = recyclerId;
    }
    if (status && typeof status === 'string') {
      whereClause.status = status;
    }

    const lots = await prisma.lot.findMany({
      where: whereClause,
      include: {
        collector: true,
        transactions: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(lots);
  } catch (error) {
    console.error('Fetch lots error:', error);
    return res.status(500).json({ error: 'Failed to fetch lots' });
  }
});

// GET single lot by ID or Reference
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const lot = await prisma.lot.findFirst({
      where: {
        OR: [{ id }, { lotReference: id }]
      },
      include: {
        collector: true,
        transactions: {
          include: {
            recycler: true,
            earnings: true,
          }
        },
        traceabilityRecords: true,
      }
    });

    if (!lot) return res.status(404).json({ error: 'Lot not found' });
    return res.json(lot);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch lot' });
  }
});

// POST Create new lot
router.post('/', async (req, res) => {
  try {
    const {
      collectorId,
      materialCategory,
      materialDescription,
      imageReference,
      approximateWeight,
      condition = 'Good',
      collectionLocation,
      latitude,
      longitude,
      selectedRecyclerId,
      clientLotId,
    } = req.body;

    if (!materialCategory || !approximateWeight) {
      return res.status(400).json({ error: 'Material category and weight are required' });
    }

    const wt = parseFloat(approximateWeight);
    const estimate = estimateLotValue(materialCategory, wt, condition);

    // Format current date for Lot ID: EWL-YYYYMMDD-XXXX
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const countToday = await prisma.lot.count();
    const lotRef = `EWL-${dateStr}-${String(countToday + 1).padStart(4, '0')}`;

    // Fallback collector
    let targetCollectorId = collectorId;
    if (!targetCollectorId) {
      const defaultCol = await prisma.collector.findFirst();
      targetCollectorId = defaultCol?.id;
    }

    const newLot = await prisma.lot.create({
      data: {
        lotReference: lotRef,
        collectorId: targetCollectorId,
        materialCategory,
        materialDescription: materialDescription || `${condition} condition ${materialCategory} batch`,
        imageReference: imageReference || '/demo-images/pcb.jpg',
        approximateWeight: wt,
        condition,
        estimatedValue: estimate.estimatedTotalValue,
        estimatedRangeMin: estimate.estimatedRangeMin,
        estimatedRangeMax: estimate.estimatedRangeMax,
        collectionLocation: collectionLocation || 'Nagpur Central Hub',
        latitude: latitude ? parseFloat(latitude) : 21.1458,
        longitude: longitude ? parseFloat(longitude) : 79.0882,
        status: selectedRecyclerId ? 'ACCEPTED' : 'PENDING_MATCH',
        selectedRecyclerId: selectedRecyclerId || null,
      },
      include: {
        collector: true,
      }
    });

    // If a recycler was directly selected during creation, also prepare initial transaction
    if (selectedRecyclerId) {
      const recycler = await prisma.recycler.findUnique({ where: { id: selectedRecyclerId } });
      let offeredRate = estimate.estimatedRatePerKg;
      try {
        const rates = JSON.parse(recycler?.offeredRates || '{}');
        if (rates[materialCategory]) offeredRate = rates[materialCategory];
      } catch {}

      const finalValue = Math.round(offeredRate * wt);
      const txnCount = await prisma.transaction.count();
      const txnRef = `TXN-${dateStr}-${String(txnCount + 1).padStart(4, '0')}`;

      const transaction = await prisma.transaction.create({
        data: {
          transactionReference: txnRef,
          lotId: newLot.id,
          collectorId: targetCollectorId,
          recyclerId: selectedRecyclerId,
          quotedPrice: offeredRate,
          finalSaleValue: finalValue,
          handoverLocation: collectionLocation || 'Nagpur Central Hub',
          handoverLatitude: newLot.latitude,
          handoverLongitude: newLot.longitude,
          paymentStatus: 'PENDING',
          transactionStatus: 'INITIATED',
        }
      });

      return res.status(201).json({
        lot: newLot,
        transaction,
        message: 'Lot created and assigned to recycler successfully'
      });
    }

    return res.status(201).json({
      lot: newLot,
      message: 'Lot created successfully'
    });
  } catch (error) {
    console.error('Create lot error:', error);
    return res.status(500).json({ error: 'Failed to create lot' });
  }
});

export default router;
