import { Router } from 'express';
import { prisma } from '../db';

const router = Router();

// GET Collector Earnings Ledger
router.get('/:id/earnings', async (req, res) => {
  try {
    const { id } = req.params;

    // Total paid transactions
    const paidTransactions = await prisma.transaction.findMany({
      where: {
        collectorId: id,
        paymentStatus: 'PAID',
      }
    });

    // Pending transactions
    const pendingTransactions = await prisma.transaction.findMany({
      where: {
        collectorId: id,
        paymentStatus: 'PENDING',
      }
    });

    const totalEarned = paidTransactions.reduce((acc, t) => acc + t.finalSaleValue, 0);
    const pendingAmount = pendingTransactions.reduce((acc, t) => acc + t.finalSaleValue, 0);

    // Earnings timeline
    const earningsList = await prisma.earnings.findMany({
      where: { collectorId: id },
      include: {
        transaction: {
          include: {
            lot: true,
            recycler: true,
          }
        }
      },
      orderBy: { date: 'desc' }
    });

    return res.json({
      collectorId: id,
      totalEarned,
      pendingAmount,
      totalLotsCompleted: paidTransactions.length,
      earnings: earningsList,
    });
  } catch (error) {
    console.error('Fetch earnings error:', error);
    return res.status(500).json({ error: 'Failed to fetch earnings' });
  }
});

// GET Collector Transactions
router.get('/:id/transactions', async (req, res) => {
  try {
    const { id } = req.params;
    const transactions = await prisma.transaction.findMany({
      where: { collectorId: id },
      include: {
        lot: true,
        recycler: true,
      },
      orderBy: { dateTime: 'desc' }
    });
    return res.json(transactions);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch collector transactions' });
  }
});

// PATCH Update profile (language, location)
router.patch('/:id/profile', async (req, res) => {
  try {
    const { id } = req.params;
    const { preferredLanguage, generalOperatingLocation } = req.body;

    const updated = await prisma.collector.update({
      where: { id },
      data: {
        preferredLanguage: preferredLanguage || undefined,
        generalOperatingLocation: generalOperatingLocation || undefined,
      }
    });

    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
