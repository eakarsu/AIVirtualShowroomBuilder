import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, LayoutGrid, Glasses, PenTool, Sparkles, DollarSign, ShoppingBag, Users, Package, Warehouse, Palette, Tag, Star, BarChart3, Target, Wand2 } from 'lucide-react';

const features = [
  {
    path: '/ai-tools', title: 'AI Tools Hub', icon: Wand2, ai: true,
    desc: 'Advanced AI: room layout optimizer, lighting mood generator, visitor behavior, comparison & history.',
    color: '#a855f7', stats: '6 tools'
  },
  {
    path: '/models3d', title: '3D Model Generation', icon: Box, ai: true,
    desc: 'Generate photorealistic 3D models from product photos using AI. Support for GLB, OBJ, FBX formats.',
    color: '#8b5cf6', stats: '15 models'
  },
  {
    path: '/layouts', title: 'Virtual Store Layouts', icon: LayoutGrid, ai: true,
    desc: 'AI-designed virtual store environments with optimized traffic flow and product placement.',
    color: '#6366f1', stats: '15 layouts'
  },
  {
    path: '/artryons', title: 'AR Try-On Integration', icon: Glasses, ai: true,
    desc: 'Virtual try-on experiences with body tracking, fit accuracy, and style scoring.',
    color: '#0ea5e9', stats: '15 sessions'
  },
  {
    path: '/descriptions', title: 'AI Product Descriptions', icon: PenTool, ai: true,
    desc: 'Generate compelling product copy with headlines, descriptions, and SEO optimization.',
    color: '#10b981', stats: '15 descriptions'
  },
  {
    path: '/styles', title: 'AI Style Recommendations', icon: Sparkles, ai: true,
    desc: 'Personalized fashion styling with outfit suggestions and trend forecasting.',
    color: '#f59e0b', stats: '15 profiles'
  },
  {
    path: '/pricing', title: 'AI Price Optimization', icon: DollarSign, ai: true,
    desc: 'AI-driven pricing strategy with elasticity analysis and revenue projections.',
    color: '#f43f5e', stats: '15 analyses'
  },
  {
    path: '/products', title: 'Product Catalog', icon: ShoppingBag,
    desc: 'Complete product management with categories, SKUs, pricing, and images.',
    color: '#64748b', stats: '18 products'
  },
  {
    path: '/customers', title: 'Customer Management', icon: Users,
    desc: 'Customer database with segmentation, lifetime value tracking, and profiles.',
    color: '#64748b', stats: '15 customers'
  },
  {
    path: '/orders', title: 'Order Management', icon: Package,
    desc: 'Track orders through processing, shipping, and delivery stages.',
    color: '#64748b', stats: '15 orders'
  },
  {
    path: '/inventory', title: 'Inventory Management', icon: Warehouse,
    desc: 'Multi-warehouse inventory tracking with reorder alerts and stock management.',
    color: '#64748b', stats: '15 records'
  },
  {
    path: '/themes', title: 'Store Themes', icon: Palette,
    desc: 'Customize store appearance with colors, fonts, and layout styles.',
    color: '#64748b', stats: '15 themes'
  },
  {
    path: '/promotions', title: 'Promotions & Discounts', icon: Tag,
    desc: 'Create and manage promotional campaigns with coupon codes and usage tracking.',
    color: '#64748b', stats: '15 promos'
  },
  {
    path: '/reviews', title: 'Reviews & Ratings', icon: Star,
    desc: 'Customer feedback management with ratings, verified purchases, and moderation.',
    color: '#64748b', stats: '15 reviews'
  },
  {
    path: '/analytics', title: 'Customer Analytics', icon: BarChart3,
    desc: 'Comprehensive analytics dashboard with KPIs, trends, and customer insights.',
    color: '#64748b', stats: '15 metrics'
  },
  {
    path: '/conversions', title: 'Conversion Tracking', icon: Target,
    desc: 'Monitor conversion funnel from awareness to purchase with device and source tracking.',
    color: '#64748b', stats: '15 events'
  },
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>AI Virtual Showroom Builder</h1>
          <p className="subtitle">15 features &middot; 6 AI-powered &middot; 9 management tools</p>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Total Products</div>
          <div className="stat-value" style={{ color: '#818cf8' }}>18</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">AI Features</div>
          <div className="stat-value" style={{ color: '#8b5cf6' }}>6</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value" style={{ color: '#10b981' }}>$284K</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Customers</div>
          <div className="stat-value" style={{ color: '#0ea5e9' }}>15</div>
        </div>
      </div>

      <div className="cards-grid">
        {features.map(f => (
          <div key={f.path} className="feature-card" onClick={() => navigate(f.path)}>
            <div className="card-icon" style={{ background: `${f.color}20` }}>
              <f.icon size={24} color={f.color} />
            </div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
            <div className="card-meta">
              <span className="stat"><strong>{f.stats}</strong></span>
              {f.ai && <span className="ai-badge" style={{ marginLeft: 'auto', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', color: 'white', fontSize: 10, padding: '2px 8px', borderRadius: 12, fontWeight: 700 }}>AI POWERED</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
