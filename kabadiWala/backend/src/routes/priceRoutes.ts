import { Router } from 'express';
import { prisma } from '../db';

const router = Router();

// GET current price board summary across all materials & locations
router.get('/', async (req, res) => {
  try {
    const { location, category } = req.query;

    const whereClause: any = {};
    if (location && typeof location === 'string') {
      whereClause.location = location;
    }
    if (category && typeof category === 'string') {
      whereClause.materialCategory = category;
    }

    // Get latest prices for each category
    const allPrices = await prisma.price.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
      take: 200,
    });

    // Group by category to find current price and calculate trend vs 7 days ago
    const categoryMap = new Map<string, any>();
    
    for (const p of allPrices) {
      if (!categoryMap.has(p.materialCategory)) {
        categoryMap.set(p.materialCategory, {
          latest: p,
          older: null,
        });
      } else {
        const entry = categoryMap.get(p.materialCategory);
        if (!entry.older) {
          entry.older = p;
        }
      }
    }

    const priceBoard = Array.from(categoryMap.entries()).map(([cat, val]) => {
      const current = val.latest.buyingPrice;
      const prev = val.older ? val.older.buyingPrice : current;
      const diff = current - prev;
      const percentChange = prev > 0 ? ((diff / prev) * 100).toFixed(1) : '0.0';
      const trend = diff > 0 ? 'UP' : diff < 0 ? 'DOWN' : 'FLAT';

      // Realistic market ranges
      const minRange = Math.round(current * 0.92);
      const maxRange = Math.round(current * 1.15);

      return {
        materialCategory: cat,
        location: val.latest.location || 'Nagpur',
        currentBuyingPrice: current,
        sellingPrice: val.latest.sellingPrice,
        unit: val.latest.unit || 'kg',
        marketRangeMin: minRange,
        marketRangeMax: maxRange,
        lastUpdated: val.latest.date,
        trend,
        percentChange: Number(percentChange),
        diff,
        audioText: `${cat} current price is approximately ₹${current} per kilogram in ${val.latest.location}.`,
        audioTextHi: `${cat} का आज का भाव लगभग ₹${current} प्रति किलो है।`,
        audioTextMr: `${cat} चा आजचा दर अंदाजे ₹${current} प्रति किलो आहे.`
      };
    });

    return res.json(priceBoard);
  } catch (error) {
    console.error('Price board error:', error);
    return res.status(500).json({ error: 'Failed to fetch prices' });
  }
});

// GET historical price trends for charts
router.get('/trends', async (req, res) => {
  try {
    const { category, location } = req.query;

    const whereClause: any = {};
    if (category && typeof category === 'string' && category !== 'ALL') {
      whereClause.materialCategory = category;
    }
    if (location && typeof location === 'string' && location !== 'ALL') {
      whereClause.location = location;
    }

    const prices = await prisma.price.findMany({
      where: whereClause,
      orderBy: { date: 'asc' },
      take: 150,
    });

    // Format for charts
    const chartData = prices.map(p => ({
      date: p.date.toISOString().split('T')[0],
      displayDate: new Date(p.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      category: p.materialCategory,
      price: p.buyingPrice,
      sellingPrice: p.sellingPrice,
      location: p.location,
    }));

    return res.json(chartData);
  } catch (error) {
    console.error('Trends error:', error);
    return res.status(500).json({ error: 'Failed to fetch trends' });
  }
});

export default router;
