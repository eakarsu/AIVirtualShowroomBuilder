import React, { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import AIResultPanel from '../components/AIResultPanel.jsx';

export default function DescriptionEnhancer() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [features, setFeatures] = useState('');
  const [targetMarket, setTargetMarket] = useState('premium consumers');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getAll('products').then(setProducts).catch(() => {});
  }, []);

  const handleProductSelect = (id) => {
    setProductId(id);
    if (id) {
      const p = products.find(pp => String(pp.id) === String(id));
      if (p) {
        setName(p.name || '');
        setDescription(p.description || '');
        setCategory(p.category || '');
        setPrice(p.price || '');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      if (!name) throw new Error('Product name is required');
      const featureList = features ? features.split(',').map(f => f.trim()).filter(Boolean) : [];
      const res = await api.productDescriptionEnhancer({
        productId: productId || undefined,
        name,
        description,
        category,
        price: price ? parseFloat(price) : undefined,
        features: featureList,
        targetMarket
      });
      setResult(res.enhanced);
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
          <h1>Product Description Enhancer</h1>
          <p className="subtitle">Generate marketing copy, SEO, emotional triggers</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card" style={{ padding: '1.5rem' }}>
        <div className="form-group">
          <label>Pick existing product (optional)</label>
          <select value={productId} onChange={(e) => handleProductSelect(e.target.value)}>
            <option value="">— New / manual entry —</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <div className="form-group">
            <label>Name *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Category</label>
            <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Price ($)</label>
            <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Target Market</label>
            <input type="text" value={targetMarket} onChange={(e) => setTargetMarket(e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label>Current Description</label>
          <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Key Features (comma-separated)</label>
          <input type="text" value={features} onChange={(e) => setFeatures(e.target.value)} placeholder="e.g., waterproof, leather, ergonomic" />
        </div>
        {error && <div style={{ background: '#fee', color: '#c00', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>{error}</div>}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          <Sparkles size={16} style={{ marginRight: '0.5rem' }} />
          {loading ? 'Enhancing...' : 'Enhance Description'}
        </button>
      </form>

      {result && <AIResultPanel result={result} title="Enhanced Marketing Copy" />}
    </div>
  );
}
