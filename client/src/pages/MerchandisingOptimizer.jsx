import React, { useState } from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import AIResultPanel from '../components/AIResultPanel.jsx';

export default function MerchandisingOptimizer() {
  const navigate = useNavigate();
  const [storeType, setStoreType] = useState('boutique');
  const [season, setSeason] = useState('fall');
  const [goal, setGoal] = useState('maximize basket size');
  const [products, setProducts] = useState('');
  const [trafficNotes, setTrafficNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const productList = products
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      if (productList.length === 0) throw new Error('Please list at least one product');
      const res = await api.merchandisingOptimizer({
        store_type: storeType,
        season,
        goal,
        products: productList,
        traffic_notes: trafficNotes,
      });
      setResult(res.plan || res.result || res);
    } catch (err) {
      setError(err.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button className="back-btn" onClick={() => navigate('/ai-tools')}>
        <ArrowLeft size={16} /> Back to AI Tools
      </button>
      <div className="page-header">
        <div>
          <h1>Visual Merchandising Optimizer</h1>
          <p className="subtitle">Generate a merchandising plan with expected lift estimates</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <div className="form-group">
            <label>Store Type</label>
            <select value={storeType} onChange={(e) => setStoreType(e.target.value)}>
              <option value="boutique">Boutique</option>
              <option value="department">Department Store</option>
              <option value="popup">Pop-up</option>
              <option value="flagship">Flagship</option>
              <option value="virtual">Virtual / VR</option>
            </select>
          </div>
          <div className="form-group">
            <label>Season</label>
            <select value={season} onChange={(e) => setSeason(e.target.value)}>
              <option value="spring">Spring</option>
              <option value="summer">Summer</option>
              <option value="fall">Fall</option>
              <option value="winter">Winter</option>
              <option value="holiday">Holiday</option>
            </select>
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Primary Goal</label>
            <input type="text" value={goal} onChange={(e) => setGoal(e.target.value)} />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Products (one per line)</label>
            <textarea rows="5" value={products} onChange={(e) => setProducts(e.target.value)}
              placeholder="Cashmere sweater&#10;Wool overcoat&#10;Leather boots" required />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Traffic / Layout Notes</label>
            <textarea rows="3" value={trafficNotes} onChange={(e) => setTrafficNotes(e.target.value)}
              placeholder="Heavy foot traffic on left wall, low on right back corner..." />
          </div>
        </div>
        {error && <div style={{ background: '#fee', color: '#c00', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>{error}</div>}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          <Sparkles size={16} style={{ marginRight: '0.5rem' }} />
          {loading ? 'Optimizing...' : 'Generate Merchandising Plan'}
        </button>
      </form>

      {result && <AIResultPanel result={result} title="Merchandising Plan" />}
    </div>
  );
}
