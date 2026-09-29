import { Router } from 'express';
import { prisma } from '../db';

const router = Router();

// GET Admin Analytics & KPI Metrics
router.get('/analytics', async (req, res) => {
  try {
    const totalCollectors = await prisma.collector.count();
    const totalRecyclers = await prisma.recycler.count();
    const totalLots = await prisma.lot.count();
    const totalTransactions = await prisma.transaction.count();

    const allLots = await prisma.lot.findMany();
    const allTransactions = await prisma.transaction.findMany({
      include: {
        lot: true,
        collector: true,
        recycler: true,
      }
    });

    const totalWeightKg = allLots.reduce((acc, l) => acc + (l.approximateWeight || 0), 0);
    const totalTransactionValue = allTransactions.reduce((acc, t) => acc + (t.finalSaleValue || 0), 0);
    const pendingTransactions = allTransactions.filter(t => t.paymentStatus === 'PENDING').length;

    // Material category distribution
    const categoryDistribution: Record<string, { count: number; totalWeight: number }> = {};
    for (const l of allLots) {
      if (!categoryDistribution[l.materialCategory]) {
        categoryDistribution[l.materialCategory] = { count: 0, totalWeight: 0 };
      }
      categoryDistribution[l.materialCategory].count += 1;
      categoryDistribution[l.materialCategory].totalWeight += Math.round(l.approximateWeight);
    }

    const materialDistributionChart = Object.entries(categoryDistribution).map(([category, val]) => ({
      category,
      lots: val.count,
      weightKg: val.totalWeight,
    }));

    // Transactions anomaly alerts
    const anomalies = allTransactions.filter(t => t.anomalyFlag);

    // Sync activity logs
    const syncLogs = await prisma.syncLog.findMany({
      take: 20,
      orderBy: { syncedAt: 'desc' }
    });

    // Recent activity list
    const recentActivity = allTransactions.slice(0, 10).map(t => ({
      id: t.id,
      ref: t.transactionReference,
      lotRef: t.lot.lotReference,
      collector: t.collector.displayName,
      recycler: t.recycler.name,
      material: t.lot.materialCategory,
      weight: t.lot.approximateWeight,
      amount: t.finalSaleValue,
      status: t.transactionStatus,
      payment: t.paymentStatus,
      date: t.dateTime,
      anomaly: t.anomalyFlag,
      anomalyReason: t.anomalyReason,
    }));

    return res.json({
      metrics: {
        totalCollectors,
        totalRecyclers,
        totalLots,
        totalTransactions,
        totalWeightKg: Math.round(totalWeightKg),
        totalTransactionValue,
        pendingTransactions,
      },
      materialDistributionChart,
      anomalies,
      recentActivity,
      syncLogs,
    });
  } catch (error) {
    console.error('Admin analytics error:', error);
    return res.status(500).json({ error: 'Failed to fetch admin analytics' });
  }
});

export default router;
