import React, { useState } from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import AIResultPanel from '../components/AIResultPanel.jsx';

export default function LightingMoodGenerator() {
  const navigate = useNavigate();
  const [productCategory, setProductCategory] = useState('');
  const [brandPersonality, setBrandPersonality] = useState('modern premium');
  const [targetEmotion, setTargetEmotion] = useState('desire and trust');
  const [showroomType, setShowroomType] = useState('virtual retail');
  const [width, setWidth] = useState(10);
  const [height, setHeight] = useState(3);
  const [depth, setDepth] = useState(10);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      if (!productCategory) throw new Error('Product category is required');
      const res = await api.lightingMoodGenerator({
        productCategory,
        brandPersonality,
        targetEmotion,
        showroomType,
        roomDimensions: { width: parseFloat(width), height: parseFloat(height), depth: parseFloat(depth) }
      });
      setResult(res.lighting);
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
          <h1>Lighting Mood Generator</h1>
          <p className="subtitle">Generate ambient + accent lighting presets for your showroom</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <div className="form-group">
            <label>Product Category *</label>
            <input type="text" value={productCategory} onChange={(e) => setProductCategory(e.target.value)} required placeholder="e.g., luxury watches, sneakers, jewelry" />
          </div>
          <div className="form-group">
            <label>Brand Personality</label>
            <input type="text" value={brandPersonality} onChange={(e) => setBrandPersonality(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Target Emotion</label>
            <input type="text" value={targetEmotion} onChange={(e) => setTargetEmotion(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Showroom Type</label>
            <select value={showroomType} onChange={(e) => setShowroomType(e.target.value)}>
              <option value="virtual retail">Virtual Retail</option>
              <option value="luxury boutique">Luxury Boutique</option>
              <option value="pop-up">Pop-up</option>
              <option value="flagship">Flagship</option>
              <option value="outlet">Outlet</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          <div className="form-group">
            <label>Width (m)</label>
            <input type="number" step="0.1" value={width} onChange={(e) => setWidth(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Height (m)</label>
            <input type="number" step="0.1" value={height} onChange={(e) => setHeight(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Depth (m)</label>
            <input type="number" step="0.1" value={depth} onChange={(e) => setDepth(e.target.value)} />
          </div>
        </div>
        {error && <div style={{ background: '#fee', color: '#c00', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>{error}</div>}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          <Sparkles size={16} style={{ marginRight: '0.5rem' }} />
          {loading ? 'Generating presets...' : 'Generate Lighting Presets'}
        </button>
      </form>

      {result && <AIResultPanel result={result} title="Lighting Presets" />}
    </div>
  );
}
