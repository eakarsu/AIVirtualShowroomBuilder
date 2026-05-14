import React, { useState } from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import AIResultPanel from '../components/AIResultPanel.jsx';

// PRODUCT-DECISION (FE): the BE never scrapes — caller supplies competitor descriptions.
// We provide a simple JSON textarea + an "add row" form for convenience.

export default function CompetitorShowroomAnalysis() {
  const navigate = useNavigate();
  const [competitorsText, setCompetitorsText] = useState(
    JSON.stringify([{ name: 'Competitor A', description: 'Premium minimalist UX with curated 50-product catalog.', urls: [], notes: '' }], null, 2)
  );
  const [focusAreas, setFocusAreas] = useState('layout\npricing\nmerchandising\nux\nbranding');
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
      let competitors = [];
      try { competitors = JSON.parse(competitorsText); }
      catch { setError('Competitors must be valid JSON array.'); setLoading(false); return; }
      if (!Array.isArray(competitors) || competitors.length === 0) {
        setError('Provide at least one competitor.'); setLoading(false); return;
      }
      const res = await api.competitorShowroomAnalysis({ competitors, focus_areas: splitLines(focusAreas) });
      setResult(res.analysis || res.result || res);
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
          <h1>Competitor Showroom Analysis</h1>
          <p className="subtitle">Position your showroom against caller-supplied competitor descriptions</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card" style={{ padding: '1.5rem' }}>
        <div className="form-group">
          <label>Competitors (JSON array — name, description, urls?, notes?)</label>
          <textarea rows="10" value={competitorsText} onChange={(e) => setCompetitorsText(e.target.value)} style={{ fontFamily: 'monospace', fontSize: 12 }} />
        </div>
        <div className="form-group">
          <label>Focus Areas (one per line)</label>
          <textarea rows="5" value={focusAreas} onChange={(e) => setFocusAreas(e.target.value)} />
        </div>
        {unconfigured && (
          <div style={{ background: '#fffbeb', color: '#92400e', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', border: '1px solid #fcd34d' }}>
            <strong>AI not configured:</strong> backend is missing OPENROUTER_API_KEY. Set it in the server environment and restart.
          </div>
        )}
        {error && <div style={{ background: '#fee', color: '#c00', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>{error}</div>}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          <Sparkles size={16} style={{ marginRight: '0.5rem' }} />
          {loading ? 'Analyzing competitors...' : 'Run Competitor Analysis'}
        </button>
      </form>

      {result && <AIResultPanel result={result} title="Competitor Analysis" />}
    </div>
  );
}
