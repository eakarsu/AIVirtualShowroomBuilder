import React, { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import AIResultPanel from '../components/AIResultPanel.jsx';

export default function RoomLayoutOptimizer() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [width, setWidth] = useState(10);
  const [height, setHeight] = useState(3);
  const [depth, setDepth] = useState(10);
  const [style, setStyle] = useState('modern');
  const [targetAudience, setTargetAudience] = useState('premium consumers');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getAll('products').then(setProducts).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const selected = products.filter(p => selectedProductIds.includes(p.id));
      if (selected.length === 0) throw new Error('Please select at least one product');
      const res = await api.roomLayoutOptimizer({
        width: parseFloat(width),
        height: parseFloat(height),
        depth: parseFloat(depth),
        style,
        targetAudience,
        products: selected.map(p => ({ id: p.id, name: p.name, category: p.category, price: p.price }))
      });
      setResult(res.layout);
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
          <h1>Room Layout Optimizer</h1>
          <p className="subtitle">Generate optimal showroom layout with AI</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          <div className="form-group">
            <label>Width (m)</label>
            <input type="number" step="0.1" value={width} onChange={(e) => setWidth(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Height (m)</label>
            <input type="number" step="0.1" value={height} onChange={(e) => setHeight(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Depth (m)</label>
            <input type="number" step="0.1" value={depth} onChange={(e) => setDepth(e.target.value)} required />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <div className="form-group">
            <label>Style</label>
            <select value={style} onChange={(e) => setStyle(e.target.value)}>
              <option value="modern">Modern</option>
              <option value="luxury">Luxury</option>
              <option value="minimalist">Minimalist</option>
              <option value="industrial">Industrial</option>
              <option value="boutique">Boutique</option>
            </select>
          </div>
          <div className="form-group">
            <label>Target Audience</label>
            <input type="text" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label>Products to Place ({selectedProductIds.length} selected)</label>
          <div style={{ maxHeight: '240px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.5rem' }}>
            {products.map(p => (
              <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem' }}>
                <input
                  type="checkbox"
                  checked={selectedProductIds.includes(p.id)}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedProductIds([...selectedProductIds, p.id]);
                    else setSelectedProductIds(selectedProductIds.filter(x => x !== p.id));
                  }}
                />
                <span>{p.name} <small style={{ color: '#64748b' }}>({p.category} · ${p.price})</small></span>
              </label>
            ))}
          </div>
        </div>
        {error && <div style={{ background: '#fee', color: '#c00', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>{error}</div>}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          <Sparkles size={16} style={{ marginRight: '0.5rem' }} />
          {loading ? 'Generating optimal layout...' : 'Generate Layout'}
        </button>
      </form>

      {result && <AIResultPanel result={result} title="Optimized Layout" />}
    </div>
  );
}
