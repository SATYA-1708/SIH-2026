import { Router } from 'express';
import { prisma } from '../db';
import { estimateLotValue } from '../services/aiInference';

const router = Router();

// POST /api/sync - Process queued offline actions
router.post('/', async (req, res) => {
  try {
    const { items, collectorId } = req.body; // Array of pending offline lots

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Items array is required for synchronization' });
    }

    const syncedResults: any[] = [];
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');

    for (const item of items) {
      try {
        const opId = item.operationId || item.id || item.localId;

        // Idempotency check: prevent duplicate lot creation upon network retry
        if (opId) {
          const existingSync = await prisma.syncLog.findFirst({
            where: { clientLotId: opId, status: 'SUCCESS' }
          });
          if (existingSync) {
            syncedResults.push({
              localId: opId,
              operationId: opId,
              status: 'SYNCED',
              message: 'Already processed (idempotent reply)',
            });
            continue;
          }
        }

        const wt = parseFloat(item.approximateWeight || '10');
        const estimate = estimateLotValue(item.materialCategory || 'Other', wt, item.condition || 'Good');
        
        const count = await prisma.lot.count();
        const lotRef = `EWL-${dateStr}-${String(count + 1).padStart(4, '0')}`;

        let targetColId = item.collectorId || collectorId;
        if (!targetColId) {
          const defaultCol = await prisma.collector.findFirst();
          targetColId = defaultCol?.id;
        }

        const newLot = await prisma.lot.create({
          data: {
            lotReference: lotRef,
            collectorId: targetColId,
            materialCategory: item.materialCategory || 'Other',
            materialDescription: item.materialDescription || 'Offline synchronized lot',
            imageReference: item.imageReference || '/demo-images/pcb.jpg',
            approximateWeight: wt,
            condition: item.condition || 'Good',
            estimatedValue: estimate.estimatedTotalValue,
            estimatedRangeMin: estimate.estimatedRangeMin,
            estimatedRangeMax: estimate.estimatedRangeMax,
            collectionLocation: item.collectionLocation || 'Nagpur (Offline Capture)',
            latitude: item.latitude ? parseFloat(item.latitude) : 21.1458,
            longitude: item.longitude ? parseFloat(item.longitude) : 79.0882,
            status: item.selectedRecyclerId ? 'ACCEPTED' : 'PENDING_MATCH',
            selectedRecyclerId: item.selectedRecyclerId || null,
          }
        });

        // Record sync log
        await prisma.syncLog.create({
          data: {
            clientLotId: item.id || item.localId,
            collectorId: targetColId,
            action: 'CREATE_LOT_OFFLINE_SYNC',
            status: 'SUCCESS',
            details: `Synced lot ${lotRef} (${item.materialCategory} - ${wt}kg)`
          }
        });

        syncedResults.push({
          localId: item.id || item.localId,
          serverLotId: newLot.id,
          lotReference: newLot.lotReference,
          status: 'SYNCED',
        });
      } catch (err: any) {
        console.error('Error syncing single item:', err);
        syncedResults.push({
          localId: item.id || item.localId,
          status: 'ERROR',
          error: err.message
        });
      }
    }

    return res.json({
      message: `Successfully synchronized ${syncedResults.filter(r => r.status === 'SYNCED').length} offline records.`,
      results: syncedResults,
    });
  } catch (error) {
    console.error('Sync queue error:', error);
    return res.status(500).json({ error: 'Synchronization failed' });
  }
});

export default router;
