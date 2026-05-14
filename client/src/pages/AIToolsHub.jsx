import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, PenTool, Lightbulb, Activity, GitCompare, History, Sparkles, ShoppingBag, Store, Calendar, Map, Target } from 'lucide-react';

const tools = [
  {
    path: '/ai-tools/room-layout',
    title: 'Room Layout Optimizer',
    icon: LayoutGrid,
    color: '#8b5cf6',
    desc: 'Generate optimal showroom arrangements with traffic flow, lighting zones, and conversion hotspots.'
  },
  {
    path: '/ai-tools/description-enhancer',
    title: 'Product Description Enhancer',
    icon: PenTool,
    color: '#0ea5e9',
    desc: 'Create headlines, taglines, SEO copy, and emotional triggers for any product.'
  },
  {
    path: '/ai-tools/lighting-mood',
    title: 'Lighting Mood Generator',
    icon: Lightbulb,
    color: '#f59e0b',
    desc: 'Generate lighting presets (ambient + accent) optimized for product category and mood.'
  },
  {
    path: '/ai-tools/visitor-behavior',
    title: 'Visitor Behavior Analyzer',
    icon: Activity,
    color: '#10b981',
    desc: 'Find dropoff points, hotspots, and segment insights from analytics data.'
  },
  {
    path: '/ai-tools/comparison',
    title: 'Showroom Comparison',
    icon: GitCompare,
    color: '#f43f5e',
    desc: 'Score and compare 2+ store layouts on conversion, engagement, navigation, and accessibility.'
  },
  {
    path: '/ai-tools/product-recommendations',
    title: 'Product Recommendations',
    icon: ShoppingBag,
    color: '#ec4899',
    desc: 'Personalized product picks based on customer profile and purchase history.'
  },
  {
    path: '/ai-tools/merchandising-optimizer',
    title: 'Merchandising Optimizer',
    icon: Store,
    color: '#22c55e',
    desc: 'Visual merchandising plan with layout zones and expected lift estimates.'
  },
  {
    path: '/ai-tools/seasonal-layout',
    title: 'Seasonal Layout Recommendation',
    icon: Calendar,
    color: '#a855f7',
    desc: 'AI-driven seasonal showroom layout aligned with the calendar, holidays, and promotions.'
  },
  {
    path: '/ai-tools/customer-journey-heatmap',
    title: 'Customer Journey Heatmap',
    icon: Map,
    color: '#fb7185',
    desc: 'Visualize visitor flow, dwell zones, and drop-off across the funnel.'
  },
  {
    path: '/ai-tools/competitor-analysis',
    title: 'Competitor Showroom Analysis',
    icon: Target,
    color: '#0d9488',
    desc: 'Position your showroom against competitor descriptions across layout, pricing, UX, and branding.'
  },
  {
    path: '/ai-tools/history',
    title: 'AI Results History',
    icon: History,
    color: '#64748b',
    desc: 'Browse all your past AI analyses with full prompts and parsed outputs.'
  }
];

export default function AIToolsHub() {
  const navigate = useNavigate();
  return (
    <div>
      <div className="page-header">
        <div>
          <h1><Sparkles size={28} style={{ verticalAlign: 'middle', color: '#8b5cf6' }} /> AI Tools</h1>
          <p className="subtitle">Advanced AI-powered tools for the entire virtual showroom workflow</p>
        </div>
      </div>
      <div className="cards-grid">
        {tools.map(t => (
          <div key={t.path} className="feature-card" onClick={() => navigate(t.path)}>
            <div className="card-icon" style={{ background: `${t.color}20` }}>
              <t.icon size={24} color={t.color} />
            </div>
            <h3>{t.title}</h3>
            <p>{t.desc}</p>
            <div className="card-meta">
              <span className="ai-badge" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', color: 'white', fontSize: 10, padding: '2px 8px', borderRadius: 12, fontWeight: 700 }}>AI</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
