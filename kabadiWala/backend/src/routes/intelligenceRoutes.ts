import { Router } from 'express';
import { 
  evaluateDealFairness, 
  getRecyclerTrustProfile, 
  estimateMaterialRecoveryYield,
  getUnitEconomicsAnalysis
} from '../services/trustAndIntelligence';

const router = Router();

// GET /api/intelligence/unit-economics
router.get('/unit-economics', async (_req, res) => {
  try {
    const analysis = getUnitEconomicsAnalysis();
    return res.json(analysis);
  } catch (error) {
    console.error('Unit economics retrieval error:', error);
    return res.status(500).json({ error: 'Failed to retrieve unit economics analysis' });
  }
});

// POST /api/intelligence/evaluate-quote
router.post('/evaluate-quote', async (req, res) => {
  try {
    const { materialCategory, offeredRate, location } = req.body;
    if (!materialCategory || offeredRate === undefined) {
      return res.status(400).json({ error: 'materialCategory and offeredRate are required' });
    }

    const evaluation = await evaluateDealFairness(
      String(materialCategory),
      parseFloat(offeredRate),
      location ? String(location) : 'Nagpur'
    );

    return res.json(evaluation);
  } catch (error) {
    console.error('Deal evaluation error:', error);
    return res.status(500).json({ error: 'Failed to evaluate deal' });
  }
});

// GET /api/intelligence/recycler-trust/:id
router.get('/recycler-trust/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await getRecyclerTrustProfile(id);
    return res.json(profile);
  } catch (error) {
    console.error('Recycler trust profile error:', error);
    return res.status(500).json({ error: 'Failed to fetch recycler trust metrics' });
  }
});

// GET /api/intelligence/recovery-yield
router.get('/recovery-yield', async (req, res) => {
  try {
    const { category = 'PCB', weight = '25' } = req.query;
    const wt = parseFloat(String(weight)) || 25;
    const yieldEstimate = estimateMaterialRecoveryYield(String(category), wt);
    return res.json(yieldEstimate);
  } catch (error) {
    console.error('Recovery yield estimation error:', error);
    return res.status(500).json({ error: 'Failed to estimate recovery yield' });
  }
});

export default router;
