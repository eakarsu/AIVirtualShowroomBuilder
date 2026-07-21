import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { generalLimiter } from './middleware/rateLimiter.js';
import { authenticateToken } from './middleware/auth.js';
import governanceRouter from './governance/index.js';

import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import models3dRoutes from './routes/models3d.js';
import layoutRoutes from './routes/layouts.js';
import arTryonRoutes from './routes/artryons.js';
import analyticsRoutes from './routes/analytics.js';
import conversionRoutes from './routes/conversions.js';
import descriptionRoutes from './routes/descriptions.js';
import styleRoutes from './routes/styles.js';
import pricingRoutes from './routes/pricing.js';
import customerRoutes from './routes/customers.js';
import orderRoutes from './routes/orders.js';
import themeRoutes from './routes/themes.js';
import promotionRoutes from './routes/promotions.js';
import reviewRoutes from './routes/reviews.js';
import inventoryRoutes from './routes/inventory.js';

dotenv.config();

for (const name of ['DATABASE_URL', 'GOVERNANCE_TENANT_ID']) {
  if (!process.env[name]) throw new Error(`${name} is required`);
}
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters');
}

const app = express();
const PORT = process.env.PORT || process.env.SERVER_PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const generatedRoutesEnabled = process.env.ENABLE_GENERATED_FEATURES === 'true' && process.env.NODE_ENV !== 'production';

app.use(helmet());
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(generalLimiter);

app.use('/api/auth', authRoutes);
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', generatedRoutesEnabled, timestamp: new Date().toISOString() });
});

// Every business route is authenticated. Governance applies an additional
// signed tenant/role/subject policy before it touches durable workflow state.
app.use('/api', authenticateToken);
app.use('/api/governance', governanceRouter);
app.use('/api/products', productRoutes);
app.use('/api/models3d', models3dRoutes);
app.use('/api/layouts', layoutRoutes);
app.use('/api/artryons', arTryonRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/conversions', conversionRoutes);
app.use('/api/descriptions', descriptionRoutes);
app.use('/api/styles', styleRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/themes', themeRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/inventory', inventoryRoutes);

if (generatedRoutesEnabled) {
  const generated = await Promise.all([
    import('./routes/ai.js'),
    import('./routes/personalizedRecommendations.js'),
    import('./routes/visualMerchandisingOptimizer.js'),
    import('./routes/journeyHeatmap.js'),
    import('./routes/competitorShowroomAnalysis.js'),
    import('./routes/seasonalLayoutRecommender.js'),
    import('./routes/auto3dModel.js')
  ]);
  const mounts = ['/api/ai', '/api/personalized-recommendations', '/api/visual-merchandising-optimizer',
    '/api/journey-heatmap', '/api/competitor-showroom-analysis', '/api/seasonal-layout-recommender', '/api/auto-3d-model'];
  generated.forEach((route, index) => app.use(mounts[index], route.default));
}

app.use((req, res) => res.status(404).json({ error: 'not found' }));
app.use((err, req, res, next) => {
  console.error('Unhandled request error:', err.message);
  res.status(500).json({ error: 'internal server error' });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
