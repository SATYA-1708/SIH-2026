import { Router } from 'express';
import { prisma } from '../db';

const router = Router();

// GET /api/verify/:reference
router.get('/:reference', async (req, res) => {
  try {
    const { reference } = req.params;

    // Search by transactionReference or lotReference
    const transaction = await prisma.transaction.findFirst({
      where: {
        OR: [
          { transactionReference: reference },
          { id: reference },
          { lot: { lotReference: reference } }
        ]
      },
      include: {
        lot: {
          include: {
            traceabilityRecords: true,
          }
        },
        collector: true,
        recycler: true,
      }
    });

    if (!transaction) {
      return res.status(404).json({
        verified: false,
        message: 'No authorized transaction or lot record found matching reference.'
      });
    }

    const latestTraceability = transaction.lot.traceabilityRecords[0];

    return res.json({
      verified: true,
      verificationReference: transaction.transactionReference,
      lotReference: transaction.lot.lotReference,
      status: transaction.transactionStatus,
      paymentStatus: transaction.paymentStatus,
      materialCategory: transaction.lot.materialCategory,
      materialDescription: transaction.lot.materialDescription,
      photograph: transaction.lot.imageReference,
      approximateWeight: transaction.lot.approximateWeight,
      finalWeight: latestTraceability?.weight || transaction.lot.approximateWeight,
      quotedRatePerKg: transaction.quotedPrice,
      finalSaleValue: transaction.finalSaleValue,
      collector: {
        id: transaction.collector.id,
        name: transaction.collector.displayName,
        generalLocation: transaction.collector.generalOperatingLocation,
      },
      recycler: {
        id: transaction.recycler.id,
        name: transaction.recycler.name,
        authorizationNumber: transaction.recycler.authorizationNumber,
        authorizationStatus: transaction.recycler.authorizationStatus,
        facilityLocation: transaction.recycler.facilityLocation,
      },
      collectionLocation: transaction.lot.collectionLocation,
      handoverLocation: transaction.handoverLocation,
      gpsCoordinates: latestTraceability?.gpsCoordinates || `${transaction.handoverLatitude}, ${transaction.handoverLongitude}`,
      dateTime: transaction.dateTime,
      recyclerConfirmation: latestTraceability?.recyclerConfirmation ?? true,
      traceabilityStatus: latestTraceability?.subsequentStatus || 'Recorded in National Formal Register',
    });
  } catch (error) {
    console.error('Verify error:', error);
    return res.status(500).json({ error: 'Verification failed' });
  }
});

export default router;
