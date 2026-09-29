import { Router } from 'express';
import { prisma } from '../db';

const router = Router();

// Demo instant login endpoint
router.post('/demo-login', async (req, res) => {
  try {
    const { role } = req.body; // 'collector' | 'recycler' | 'admin'

    if (role === 'collector') {
      const collector = await prisma.collector.findFirst({
        where: { id: 'col-001' }
      }) || await prisma.collector.findFirst();

      return res.json({
        user: {
          id: collector?.id,
          name: collector?.displayName,
          role: 'collector',
          preferredLanguage: collector?.preferredLanguage || 'hi',
          location: collector?.generalOperatingLocation,
        },
        token: `demo-token-collector-${collector?.id}`
      });
    }

    if (role === 'recycler') {
      const recycler = await prisma.recycler.findFirst({
        where: { id: 'rec-001' }
      }) || await prisma.recycler.findFirst();

      return res.json({
        user: {
          id: recycler?.id,
          name: recycler?.name,
          role: 'recycler',
          authorizationStatus: recycler?.authorizationStatus,
          location: recycler?.facilityLocation,
        },
        token: `demo-token-recycler-${recycler?.id}`
      });
    }

    if (role === 'admin') {
      return res.json({
        user: {
          id: 'admin-001',
          name: 'CPCB / State Portal Admin (व्यवस्थापक)',
          role: 'admin',
          location: 'Central Monitoring Hub',
        },
        token: 'demo-token-admin'
      });
    }

    return res.status(400).json({ error: 'Invalid demo role requested' });
  } catch (error) {
    console.error('Demo login error:', error);
    return res.status(500).json({ error: 'Server error during demo login' });
  }
});

// Standard login / profile creation
router.post('/login', async (req, res) => {
  try {
    const { role, identifier, name, preferredLanguage, location } = req.body;

    if (role === 'collector') {
      // Find or create collector
      let collector = await prisma.collector.findFirst({
        where: { displayName: name }
      });

      if (!collector && name) {
        collector = await prisma.collector.create({
          data: {
            displayName: name,
            preferredLanguage: preferredLanguage || 'hi',
            generalOperatingLocation: location || 'Nagpur Central',
            phoneNumber: identifier || '+91 90000 00000',
          }
        });
      }

      if (!collector) {
        collector = await prisma.collector.findFirst() || await prisma.collector.create({
          data: {
            displayName: 'Ramesh Sonawane (रमेश सोनवणे)',
            preferredLanguage: 'hi',
            generalOperatingLocation: 'Nagpur MIDC',
          }
        });
      }

      return res.json({
        user: {
          id: collector.id,
          name: collector.displayName,
          role: 'collector',
          preferredLanguage: collector.preferredLanguage,
          location: collector.generalOperatingLocation,
        },
        token: `token-collector-${collector.id}`
      });
    }

    if (role === 'recycler') {
      let recycler = await prisma.recycler.findFirst();
      return res.json({
        user: {
          id: recycler?.id,
          name: recycler?.name,
          role: 'recycler',
          authorizationStatus: recycler?.authorizationStatus,
          location: recycler?.facilityLocation,
        },
        token: `token-recycler-${recycler?.id}`
      });
    }

    return res.status(400).json({ error: 'Role not supported' });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

  if (authHeader.includes('admin')) {
    return res.json({
      id: 'admin-001',
      name: 'CPCB / State Portal Admin (व्यवस्थापक)',
      role: 'admin',
    });
  }

  if (authHeader.includes('recycler')) {
    const id = authHeader.replace('Bearer demo-token-recycler-', '').replace('Bearer token-recycler-', '');
    const rec = await prisma.recycler.findUnique({ where: { id } }) || await prisma.recycler.findFirst();
    return res.json({
      id: rec?.id,
      name: rec?.name,
      role: 'recycler',
      authorizationStatus: rec?.authorizationStatus,
      location: rec?.facilityLocation,
    });
  }

  // Default collector
  const id = authHeader.replace('Bearer demo-token-collector-', '').replace('Bearer token-collector-', '');
  const col = await prisma.collector.findUnique({ where: { id } }) || await prisma.collector.findFirst();
  return res.json({
    id: col?.id,
    name: col?.displayName,
    role: 'collector',
    preferredLanguage: col?.preferredLanguage,
    location: col?.generalOperatingLocation,
  });
});

export default router;
