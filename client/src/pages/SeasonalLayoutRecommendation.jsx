import React, { useState } from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import AIResultPanel from '../components/AIResultPanel.jsx';

export default function SeasonalLayoutRecommendation() {
  const navigate = useNavigate();
  const [season, setSeason] = useState('fall');
  const [region, setRegion] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [themes, setThemes] = useState('');
  const [productCategories, setProductCategories] = useState('');
  const [holidays, setHolidays] = useState('');
  const [businessGoals, setBusinessGoals] = useState('increase conversion\nincrease AOV');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [depth, setDepth] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [unconfigured, setUnconfigured] = useState(false);

  const splitLines = (s) => s.split('\n').map((x) => x.trim()).filter(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setUnconfigured(false);
    setResult(null);
    setLoading(true);
    try {
      const payload = {
        season,
        region: region || undefined,
        targetAudience: targetAudience || undefined,
        themes: splitLines(themes),
        productCategories: splitLines(productCategories),
        holidays: splitLines(holidays),
        businessGoals: splitLines(businessGoals),
      };
      if (width || height || depth) {
        payload.dimensions = {
          width: parseFloat(width) || undefined,
          height: parseFloat(height) || undefined,
          depth: parseFloat(depth) || undefined,
        };
      }
      const res = await api.seasonalLayoutRecommendation(payload);
      setResult(res.layout || res.result || res);
    } catch (err) {
      const msg = err.message || 'Failed';
      if (msg.toLowerCase().includes('openrouter') || msg.toLowerCase().includes('api key')) {
        setUnconfigured(true);
      } else {
        setError(msg);
      }
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
          <h1>Seasonal Layout Recommendation</h1>
          <p className="subtitle">AI-driven seasonal showroom layout aligned with calendar &amp; promotions</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <div className="form-group">
            <label>Season</label>
            <select value={season} onChange={(e) => setSeason(e.target.value)}>
              <option value="spring">Spring</option>
              <option value="summer">Summer</option>
              <option value="fall">Fall</option>
              <option value="winter">Winter</option>
              <option value="holiday">Holiday</option>
              <option value="back-to-school">Back to School</option>
              <option value="black-friday">Black Friday / Cyber</option>
            </select>
          </div>
          <div className="form-group">
            <label>Region</label>
            <input type="text" value={region} onChange={(e) => setRegion(e.target.value)} placeholder="e.g. North America" />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Target Audience</label>
            <input type="text" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} placeholder="e.g. millennials, urban professionals" />
          </div>
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
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Seasonal Themes (one per line)</label>
            <textarea rows="3" value={themes} onChange={(e) => setThemes(e.target.value)}
              placeholder="cozy harvest&#10;earth tones&#10;textured layers" />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Featured Product Categories (one per line)</label>
            <textarea rows="3" value={productCategories} onChange={(e) => setProductCategories(e.target.value)}
              placeholder="outerwear&#10;wool throws&#10;candles" />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Relevant Holidays / Events (one per line)</label>
            <textarea rows="3" value={holidays} onChange={(e) => setHolidays(e.target.value)}
              placeholder="Halloween&#10;Thanksgiving" />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Business Goals (one per line)</label>
            <textarea rows="3" value={businessGoals} onChange={(e) => setBusinessGoals(e.target.value)} />
          </div>
        </div>
        {unconfigured && (
          <div style={{ background: '#fffbeb', color: '#92400e', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', border: '1px solid #fcd34d' }}>
            <strong>AI not configured:</strong> backend is missing OPENROUTER_API_KEY. Set it in the server environment and restart.
          </div>
        )}
        {error && <div style={{ background: '#fee', color: '#c00', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>{error}</div>}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          <Sparkles size={16} style={{ marginRight: '0.5rem' }} />
          {loading ? 'Generating layout...' : 'Generate Seasonal Layout'}
        </button>
      </form>

      {result && <AIResultPanel result={result} title="Seasonal Layout Plan" />}
    </div>
  );
}
