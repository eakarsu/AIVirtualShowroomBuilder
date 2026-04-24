import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import FeaturePage from './pages/FeaturePage.jsx';
import Sidebar from './components/Sidebar.jsx';

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
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  );
}
