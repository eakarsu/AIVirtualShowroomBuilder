import React, { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import AIResultPanel from '../components/AIResultPanel.jsx';

export default function VisitorBehaviorAnalyzer() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [timeRange, setTimeRange] = useState('last 30 days');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getAll('analytics').then(setAnalytics).catch(() => {});
  }, []);

  const toggleAll = () => {
    if (selectedIds.length === analytics.length) setSelectedIds([]);
    else setSelectedIds(analytics.map(a => a.id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const res = await api.visitorBehaviorAnalyzer({
        analyticsIds: selectedIds,
        timeRange
      });
      setResult(res.analysis);
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
          <h1>Visitor Behavior Analyzer</h1>
          <p className="subtitle">Find dropoff points, hotspots, and segment insights</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card" style={{ padding: '1.5rem' }}>
        <div className="form-group">
          <label>Time Range</label>
          <input type="text" value={timeRange} onChange={(e) => setTimeRange(e.target.value)} />
        </div>
        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label>Analytics Records ({selectedIds.length} of {analytics.length} selected)</label>
            <button type="button" onClick={toggleAll} className="btn btn-secondary btn-sm">
              {selectedIds.length === analytics.length ? 'Deselect all' : 'Select all'}
            </button>
          </div>
          <div style={{ maxHeight: '240px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.5rem' }}>
            {analytics.length === 0 && <p style={{ color: '#94a3b8', padding: '0.5rem' }}>No analytics records. Backend will use most recent 50 by default.</p>}
            {analytics.map(a => (
              <label key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem' }}>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(a.id)}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedIds([...selectedIds, a.id]);
                    else setSelectedIds(selectedIds.filter(x => x !== a.id));
                  }}
                />
                <span>
                  <strong>{a.metric_name}</strong>
                  <small style={{ color: '#64748b', marginLeft: '0.5rem' }}>
                    {a.metric_type} · {a.metric_value} · {a.segment || 'all'}
                  </small>
                </span>
              </label>
            ))}
          </div>
        </div>
        {error && <div style={{ background: '#fee', color: '#c00', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>{error}</div>}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          <Sparkles size={16} style={{ marginRight: '0.5rem' }} />
          {loading ? 'Analyzing behavior...' : 'Run Behavior Analysis'}
        </button>
      </form>

      {result && <AIResultPanel result={result} title="Visitor Behavior Insights" />}
    </div>
  );
}
