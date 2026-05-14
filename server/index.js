import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { generalLimiter } from './middleware/rateLimiter.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.SERVER_PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(helmet());
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(generalLimiter);

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
import aiRoutes from './routes/ai.js';
import _b8___routes_personalizedRecommendations_js from './routes/personalizedRecommendations.js';
import _b8___routes_visualMerchandisingOptimizer_js from './routes/visualMerchandisingOptimizer.js';
import _b8___routes_journeyHeatmap_js from './routes/journeyHeatmap.js';
import _b8___routes_competitorShowroomAnalysis_js from './routes/competitorShowroomAnalysis.js';
import _b8___routes_seasonalLayoutRecommender_js from './routes/seasonalLayoutRecommender.js';
import _b8___routes_auto3dModel_js from './routes/auto3dModel.js';

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
app.use('/api/ai', aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/personalized-recommendations', _b8___routes_personalizedRecommendations_js); app.use('/api/visual-merchandising-optimizer', _b8___routes_visualMerchandisingOptimizer_js); app.use('/api/journey-heatmap', _b8___routes_journeyHeatmap_js); app.use('/api/competitor-showroom-analysis', _b8___routes_competitorShowroomAnalysis_js); app.use('/api/seasonal-layout-recommender', _b8___routes_seasonalLayoutRecommender_js); app.use('/api/auto-3d-model', _b8___routes_auto3dModel_js);

// === Batch 08 Gaps & Frontend Mounts ===
app.use('/api/gap-no-ai-driven-personalized-product-recommendations', require('./routes/gapNoAiDrivenPersonalizedProductRecommendations'));
app.use('/api/gap-no-ai-visual-merchandising-optimizer', require('./routes/gapNoAiVisualMerchandisingOptimizer'));
app.use('/api/gap-no-ai-generated-3d-model-auto-rigging-from-photos', require('./routes/gapNoAiGenerated3dModelAutoRiggingFromPhotos'));
app.use('/api/gap-limited-e-commerce-platform-integration-only-a-generic-integrations', require('./routes/gapLimitedECommercePlatformIntegrationOnlyAGenericIntegrations'));
app.use('/api/gap-no-native-webar-webxr-platform-integration', require('./routes/gapNoNativeWebarWebxrPlatformIntegration'));
app.use('/api/gap-no-customer-path-heatmap-visualization', require('./routes/gapNoCustomerPathHeatmapVisualization'));
app.use('/api/gap-no-pos-inventory-sync', require('./routes/gapNoPosInventorySync'));
app.use('/api/gap-no-webhooks', require('./routes/gapNoWebhooks'));
app.use('/api/gap-no-notifications-subsystem', require('./routes/gapNoNotificationsSubsystem'));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
