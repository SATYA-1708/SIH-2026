import { Router } from 'express';
import { prisma } from '../db';
import { rankRecyclersForLot, calculateDistanceKm } from '../services/aiInference';

const router = Router();

// GET all recyclers
router.get('/', async (req, res) => {
  try {
    const { material } = req.query;
    const recyclers = await prisma.recycler.findMany({
      orderBy: { name: 'asc' }
    });

    const collectorLat = 21.1458; // Nagpur center default
    const collectorLon = 79.0882;

    const formatted = recyclers.map(r => {
      let materials: string[] = [];
      let rates: Record<string, number> = {};
      try {
        materials = JSON.parse(r.materialsAccepted);
        rates = JSON.parse(r.offeredRates);
      } catch {
        materials = [];
        rates = {};
      }

      const dist = calculateDistanceKm(collectorLat, collectorLon, r.latitude, r.longitude);

      return {
        ...r,
        materialsAcceptedList: materials,
        offeredRatesMap: rates,
        distanceKm: dist,
      };
    });

    if (material && typeof material === 'string') {
      const filtered = formatted.filter(r => r.materialsAcceptedList.includes(material));
      return res.json(filtered);
    }

    return res.json(formatted);
  } catch (error) {
    console.error('Fetch recyclers error:', error);
    return res.status(500).json({ error: 'Failed to fetch recyclers' });
  }
});

// GET matched and ranked recyclers for a specific lot or criteria
router.get('/match', async (req, res) => {
  try {
    const { category = 'PCB', lat, lon, weight = '25' } = req.query;

    const collectorLat = lat ? parseFloat(lat as string) : 21.1458;
    const collectorLon = lon ? parseFloat(lon as string) : 79.0882;

    const recyclers = await prisma.recycler.findMany();

    const ranked = rankRecyclersForLot(
      recyclers,
      category as string,
      collectorLat,
      collectorLon
    );

    // Merge full recycler profile data with match breakdown
    const fullRanked = ranked.map(item => {
      const r = recyclers.find(rec => rec.id === item.recyclerId);
      let materials: string[] = [];
      let rates: Record<string, number> = {};
      try {
        materials = JSON.parse(r?.materialsAccepted || '[]');
        rates = JSON.parse(r?.offeredRates || '{}');
      } catch {}

      return {
        ...r,
        materialsAcceptedList: materials,
        offeredRatesMap: rates,
        matchDetails: item,
      };
    });

    return res.json(fullRanked);
  } catch (error) {
    console.error('Recycler match error:', error);
    return res.status(500).json({ error: 'Failed to match recyclers' });
  }
});

// GET single recycler
router.get('/:id', async (req, res) => {
  try {
    const recycler = await prisma.recycler.findUnique({
      where: { id: req.params.id },
      include: { transactions: true }
    });
    if (!recycler) return res.status(404).json({ error: 'Recycler not found' });
    return res.json(recycler);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch recycler' });
  }
});

export default router;
