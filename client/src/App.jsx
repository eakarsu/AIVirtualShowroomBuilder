import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import FeaturePage from './pages/FeaturePage.jsx';
import Sidebar from './components/Sidebar.jsx';
import AIToolsHub from './pages/AIToolsHub.jsx';
import RoomLayoutOptimizer from './pages/RoomLayoutOptimizer.jsx';
import DescriptionEnhancer from './pages/DescriptionEnhancer.jsx';
import LightingMoodGenerator from './pages/LightingMoodGenerator.jsx';
import VisitorBehaviorAnalyzer from './pages/VisitorBehaviorAnalyzer.jsx';
import ShowroomComparison from './pages/ShowroomComparison.jsx';
import AIResultsHistory from './pages/AIResultsHistory.jsx';
import ProductRecommendations from './pages/ProductRecommendations.jsx';
import MerchandisingOptimizer from './pages/MerchandisingOptimizer.jsx';
import SeasonalLayoutRecommendation from './pages/SeasonalLayoutRecommendation.jsx';
import CustomerJourneyHeatmap from './pages/CustomerJourneyHeatmap.jsx';
import CompetitorShowroomAnalysis from './pages/CompetitorShowroomAnalysis.jsx';
// === Batch 08 Gaps & Frontend Mounts ===
import CfPersonalizedProductRecommendationsFromBrowsingBehavior from './pages/CfPersonalizedProductRecommendationsFromBrowsingBehavior'
import CfVisualMerchandisingOptimizerUsingConversionData from './pages/CfVisualMerchandisingOptimizerUsingConversionData'
import CfCustomerJourneyHeatmapVisualizingDwellTime from './pages/CfCustomerJourneyHeatmapVisualizingDwellTime'
import CfCompetitorShowroomAnalysisAdaptingLayouts from './pages/CfCompetitorShowroomAnalysisAdaptingLayouts'
import CfSeasonalLayoutPromotionRecommender from './pages/CfSeasonalLayoutPromotionRecommender'
import Cf3dModelAutoGenerationFromProductPhotos from './pages/Cf3dModelAutoGenerationFromProductPhotos'
import GapNoAiDrivenPersonalizedProductRecommendations from './pages/GapNoAiDrivenPersonalizedProductRecommendations'
import GapNoAiVisualMerchandisingOptimizer from './pages/GapNoAiVisualMerchandisingOptimizer'
import GapNoAiGenerated3dModelAutoRigging from './pages/GapNoAiGenerated3dModelAutoRigging'
import GapLimitedECommercePlatformIntegrationOnlyA from './pages/GapLimitedECommercePlatformIntegrationOnlyA'
import GapNoNativeWebarWebxrPlatformIntegration from './pages/GapNoNativeWebarWebxrPlatformIntegration'
import GapNoCustomerPathHeatmapVisualization from './pages/GapNoCustomerPathHeatmapVisualization'
import GapNoPosInventorySync from './pages/GapNoPosInventorySync'
import GapNoWebhooks from './pages/GapNoWebhooks'
import GapNoNotificationsSubsystem from './pages/GapNoNotificationsSubsystem'

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) return null;

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-layout">
      <Sidebar user={user} onLogout={handleLogout} />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<FeaturePage resource="products" title="Product Catalog" subtitle="Manage your product inventory" />} />
          <Route path="/models3d" element={<FeaturePage resource="models3d" title="3D Model Generation" subtitle="AI-powered 3D models from product photos" aiFeature="generate3D" isAI />} />
          <Route path="/layouts" element={<FeaturePage resource="layouts" title="Virtual Store Layouts" subtitle="AI-designed virtual store environments" aiFeature="generateLayout" isAI />} />
          <Route path="/artryons" element={<FeaturePage resource="artryons" title="AR Try-On Integration" subtitle="AI-powered virtual try-on experiences" aiFeature="analyzeARTryon" isAI />} />
          <Route path="/analytics" element={<FeaturePage resource="analytics" title="Customer Analytics" subtitle="Track and analyze customer behavior" />} />
          <Route path="/conversions" element={<FeaturePage resource="conversions" title="Conversion Tracking" subtitle="Monitor conversion funnel performance" />} />
          <Route path="/descriptions" element={<FeaturePage resource="descriptions" title="AI Product Descriptions" subtitle="AI-generated compelling product copy" aiFeature="generateDescription" isAI />} />
          <Route path="/styles" element={<FeaturePage resource="styles" title="AI Style Recommendations" subtitle="Personalized AI fashion styling" aiFeature="generateStyle" isAI />} />
          <Route path="/pricing" element={<FeaturePage resource="pricing" title="AI Price Optimization" subtitle="AI-driven pricing strategy analysis" aiFeature="optimizePrice" isAI />} />
          <Route path="/customers" element={<FeaturePage resource="customers" title="Customer Management" subtitle="Manage your customer database" />} />
          <Route path="/orders" element={<FeaturePage resource="orders" title="Order Management" subtitle="Track and manage orders" />} />
          <Route path="/themes" element={<FeaturePage resource="themes" title="Store Themes" subtitle="Customize your store appearance" />} />
          <Route path="/promotions" element={<FeaturePage resource="promotions" title="Promotions & Discounts" subtitle="Manage promotional campaigns" />} />
          <Route path="/reviews" element={<FeaturePage resource="reviews" title="Reviews & Ratings" subtitle="Customer feedback management" />} />
          <Route path="/inventory" element={<FeaturePage resource="inventory" title="Inventory Management" subtitle="Track stock levels and warehouse data" />} />

          {/* Advanced AI Tools */}
          <Route path="/ai-tools" element={<AIToolsHub />} />
          <Route path="/ai-tools/room-layout" element={<RoomLayoutOptimizer />} />
          <Route path="/ai-tools/description-enhancer" element={<DescriptionEnhancer />} />
          <Route path="/ai-tools/lighting-mood" element={<LightingMoodGenerator />} />
          <Route path="/ai-tools/visitor-behavior" element={<VisitorBehaviorAnalyzer />} />
          <Route path="/ai-tools/comparison" element={<ShowroomComparison />} />
          <Route path="/ai-tools/product-recommendations" element={<ProductRecommendations />} />
          <Route path="/ai-tools/merchandising-optimizer" element={<MerchandisingOptimizer />} />
          <Route path="/ai-tools/seasonal-layout" element={<SeasonalLayoutRecommendation />} />
          <Route path="/ai-tools/customer-journey-heatmap" element={<CustomerJourneyHeatmap />} />
          <Route path="/ai-tools/competitor-analysis" element={<CompetitorShowroomAnalysis />} />
          <Route path="/ai-tools/history" element={<AIResultsHistory />} />

          {/* // === Batch 08 Gaps & Frontend Mounts === */}
      <Route path="/cf-personalized-product-recommendations-from-browsing-behavior" element={<ProtectedRoute><CfPersonalizedProductRecommendationsFromBrowsingBehavior /></ProtectedRoute>} />
      <Route path="/cf-visual-merchandising-optimizer-using-conversion-data" element={<ProtectedRoute><CfVisualMerchandisingOptimizerUsingConversionData /></ProtectedRoute>} />
      <Route path="/cf-customer-journey-heatmap-visualizing-dwell-time" element={<ProtectedRoute><CfCustomerJourneyHeatmapVisualizingDwellTime /></ProtectedRoute>} />
      <Route path="/cf-competitor-showroom-analysis-adapting-layouts" element={<ProtectedRoute><CfCompetitorShowroomAnalysisAdaptingLayouts /></ProtectedRoute>} />
      <Route path="/cf-seasonal-layout-promotion-recommender" element={<ProtectedRoute><CfSeasonalLayoutPromotionRecommender /></ProtectedRoute>} />
      <Route path="/cf-3d-model-auto-generation-from-product-photos" element={<ProtectedRoute><Cf3dModelAutoGenerationFromProductPhotos /></ProtectedRoute>} />
      <Route path="/gap-no-ai-driven-personalized-product-recommendations" element={<ProtectedRoute><GapNoAiDrivenPersonalizedProductRecommendations /></ProtectedRoute>} />
      <Route path="/gap-no-ai-visual-merchandising-optimizer" element={<ProtectedRoute><GapNoAiVisualMerchandisingOptimizer /></ProtectedRoute>} />
      <Route path="/gap-no-ai-generated-3d-model-auto-rigging-from-photos" element={<ProtectedRoute><GapNoAiGenerated3dModelAutoRigging /></ProtectedRoute>} />
      <Route path="/gap-limited-e-commerce-platform-integration-only-a-generic-integrations" element={<ProtectedRoute><GapLimitedECommercePlatformIntegrationOnlyA /></ProtectedRoute>} />
      <Route path="/gap-no-native-webar-webxr-platform-integration" element={<ProtectedRoute><GapNoNativeWebarWebxrPlatformIntegration /></ProtectedRoute>} />
      <Route path="/gap-no-customer-path-heatmap-visualization" element={<ProtectedRoute><GapNoCustomerPathHeatmapVisualization /></ProtectedRoute>} />
      <Route path="/gap-no-pos-inventory-sync" element={<ProtectedRoute><GapNoPosInventorySync /></ProtectedRoute>} />
      <Route path="/gap-no-webhooks" element={<ProtectedRoute><GapNoWebhooks /></ProtectedRoute>} />
      <Route path="/gap-no-notifications-subsystem" element={<ProtectedRoute><GapNoNotificationsSubsystem /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  );
}
