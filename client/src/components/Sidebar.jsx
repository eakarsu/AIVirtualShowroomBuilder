import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Layers, ShoppingBag, Palette, BarChart3, Target, PenTool, Sparkles, DollarSign, Users, Package, Tag, Star, Warehouse, LayoutGrid, LogOut, Glasses, Wand2 } from 'lucide-react';

const aiFeatures = [
  { path: '/ai-tools', label: 'AI Tools Hub', icon: Wand2, ai: true },
  { path: '/models3d', label: '3D Model Generation', icon: Box, ai: true },
  { path: '/layouts', label: 'Store Layouts', icon: LayoutGrid, ai: true },
  { path: '/artryons', label: 'AR Try-On', icon: Glasses, ai: true },
  { path: '/descriptions', label: 'AI Descriptions', icon: PenTool, ai: true },
  { path: '/styles', label: 'Style Recommendations', icon: Sparkles, ai: true },
  { path: '/pricing', label: 'Price Optimization', icon: DollarSign, ai: true },
];

const managementFeatures = [
  { path: '/products', label: 'Product Catalog', icon: ShoppingBag },
  { path: '/customers', label: 'Customers', icon: Users },
  { path: '/orders', label: 'Orders', icon: Package },
  { path: '/inventory', label: 'Inventory', icon: Warehouse },
  { path: '/themes', label: 'Store Themes', icon: Palette },
  { path: '/promotions', label: 'Promotions', icon: Tag },
  { path: '/reviews', label: 'Reviews', icon: Star },
];

const analyticsFeatures = [
  { path: '/analytics', label: 'Customer Analytics', icon: BarChart3 },
  { path: '/conversions', label: 'Conversion Tracking', icon: Target },
];

export default function Sidebar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="sidebar">
      <div className="sidebar-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <h2>AI Showroom</h2>
        <span>Virtual Store Builder</span>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-title">AI Features</div>
        {aiFeatures.map(f => (
          <div key={f.path}
            className={`sidebar-link ${location.pathname === f.path ? 'active' : ''}`}
            onClick={() => navigate(f.path)}>
            <f.icon className="icon" size={20} />
            {f.label}
            <span className="ai-badge">AI</span>
          </div>
        ))}
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-title">Management</div>
        {managementFeatures.map(f => (
          <div key={f.path}
            className={`sidebar-link ${location.pathname === f.path ? 'active' : ''}`}
            onClick={() => navigate(f.path)}>
            <f.icon className="icon" size={20} />
            {f.label}
          </div>
        ))}
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-title">Analytics</div>
        {analyticsFeatures.map(f => (
          <div key={f.path}
            className={`sidebar-link ${location.pathname === f.path ? 'active' : ''}`}
            onClick={() => navigate(f.path)}>
            <f.icon className="icon" size={20} />
            {f.label}
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-link" onClick={onLogout} style={{ color: '#f87171' }}>
          <LogOut className="icon" size={20} />
          Sign Out
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8, paddingLeft: 8 }}>
          {user?.name || user?.email}
        </div>
      </div>
    </nav>
  );
}
