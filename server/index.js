import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.SERVER_PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
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

app.use('/api/auth', authRoutes);
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
