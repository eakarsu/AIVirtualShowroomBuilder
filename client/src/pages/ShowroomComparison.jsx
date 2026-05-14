import React, { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import AIResultPanel from '../components/AIResultPanel.jsx';

const DEFAULT_CRITERIA = ['conversion', 'engagement', 'navigation', 'aesthetics', 'accessibility'];

export default function ShowroomComparison() {
  const navigate = useNavigate();
  const [layouts, setLayouts] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [criteria, setCriteria] = useState(DEFAULT_CRITERIA);
  const [context, setContext] = useState('premium retail showroom');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getAll('layouts').then(setLayouts).catch(() => {});
  }, []);

  const toggleCriteria = (c) => {
    if (criteria.includes(c)) setCriteria(criteria.filter(x => x !== c));
    else setCriteria([...criteria, c]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      if (selectedIds.length < 2) throw new Error('Select at least 2 layouts to compare');
      const res = await api.showroomComparison({
        layoutIds: selectedIds,
        criteria,
        context
      });
      setResult(res.comparison);
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
          <h1>Showroom Comparison</h1>
          <p className="subtitle">Score and compare 2+ layouts side-by-side</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card" style={{ padding: '1.5rem' }}>
        <div className="form-group">
          <label>Business Context</label>
          <input type="text" value={context} onChange={(e) => setContext(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Evaluation Criteria</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {DEFAULT_CRITERIA.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => toggleCriteria(c)}
                className={`btn btn-sm ${criteria.includes(c) ? 'btn-primary' : 'btn-secondary'}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label>Layouts to Compare ({selectedIds.length} selected, min 2)</label>
          <div style={{ maxHeight: '240px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.5rem' }}>
            {layouts.length === 0 && <p style={{ color: '#94a3b8', padding: '0.5rem' }}>No layouts found. Create some first.</p>}
            {layouts.map(l => (
              <label key={l.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem' }}>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(l.id)}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedIds([...selectedIds, l.id]);
                    else setSelectedIds(selectedIds.filter(x => x !== l.id));
                  }}
                />
                <span>
                  <strong>{l.name}</strong>
                  <small style={{ color: '#64748b', marginLeft: '0.5rem' }}>
                    {l.layout_type} · {l.zone_count} zones · {l.total_area}
                  </small>
                </span>
              </label>
            ))}
          </div>
        </div>
        {error && <div style={{ background: '#fee', color: '#c00', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>{error}</div>}
        <button type="submit" className="btn btn-primary" disabled={loading || selectedIds.length < 2}>
          <Sparkles size={16} style={{ marginRight: '0.5rem' }} />
          {loading ? 'Comparing...' : 'Compare Layouts'}
        </button>
      </form>

      {result && <AIResultPanel result={result} title="Comparison Result" />}
    </div>
  );
}
