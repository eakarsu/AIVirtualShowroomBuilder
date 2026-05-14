import React, { useState } from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import AIResultPanel from '../components/AIResultPanel.jsx';

export default function CustomerJourneyHeatmap() {
  const navigate = useNavigate();
  const [stages, setStages] = useState('enter\nbrowse\nengage\ntry_on\ncart\ncheckout');
  const [daysBack, setDaysBack] = useState('30');
  const [segment, setSegment] = useState('');
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
        stages: splitLines(stages),
        days_back: parseInt(daysBack, 10) || 30,
      };
      if (segment) payload.segment = segment;
      const res = await api.customerJourneyHeatmap(payload);
      setResult(res.heatmap || res.result || res);
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
          <h1>Customer Journey Heatmap</h1>
          <p className="subtitle">Visualize visitor flow, dwell zones and drop-off across the funnel</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Funnel Stages (one per line)</label>
            <textarea rows="6" value={stages} onChange={(e) => setStages(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Days back</label>
            <input type="number" value={daysBack} onChange={(e) => setDaysBack(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Segment (optional)</label>
            <input type="text" value={segment} onChange={(e) => setSegment(e.target.value)} placeholder="e.g. mobile, returning, vip" />
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
          {loading ? 'Generating heatmap...' : 'Generate Heatmap'}
        </button>
      </form>

      {result && <AIResultPanel result={result} title="Customer Journey Heatmap" />}
    </div>
  );
}
