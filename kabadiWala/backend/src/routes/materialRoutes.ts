import { Router } from 'express';
import { prisma } from '../db';

const router = Router();

// GET all material types from catalog
router.get('/', async (req, res) => {
  try {
    const materials = await prisma.materialCatalog.findMany({
      orderBy: { category: 'asc' }
    });
    return res.json(materials);
  } catch (error) {
    console.error('Fetch materials error:', error);
    return res.status(500).json({ error: 'Failed to fetch materials' });
  }
});

// GET unique categories list
router.get('/categories', async (req, res) => {
  try {
    const materials = await prisma.materialCatalog.findMany({
      select: { category: true }
    });
    const unique = Array.from(new Set(materials.map(m => m.category)));
    return res.json(unique);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

export default router;
