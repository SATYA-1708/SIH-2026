import express from 'express';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/authRoutes';
import materialRoutes from './routes/materialRoutes';
import priceRoutes from './routes/priceRoutes';
import recyclerRoutes from './routes/recyclerRoutes';
import lotRoutes from './routes/lotRoutes';
import transactionRoutes from './routes/transactionRoutes';
import collectorRoutes from './routes/collectorRoutes';
import adminRoutes from './routes/adminRoutes';
import syncRoutes from './routes/syncRoutes';
import verifyRoutes from './routes/verifyRoutes';
import intelligenceRoutes from './routes/intelligenceRoutes';

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static images serving
app.use('/demo-images', express.static(path.join(__dirname, '../public/demo-images')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/prices', priceRoutes);
app.use('/api/recyclers', recyclerRoutes);
app.use('/api/lots', lotRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/collectors', collectorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/intelligence', intelligenceRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'E-Waste Setu Backend API'
  });
});

app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🌱 E-Waste Platform Backend running on http://localhost:${PORT}`);
  console.log(`🔍 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`===============================================`);
});
