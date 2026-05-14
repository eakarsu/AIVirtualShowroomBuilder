import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import AIResultPanel from '../components/AIResultPanel.jsx';

export default function AIResultsHistory() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchPage(1);
  }, []);

  const fetchPage = async (page) => {
    setLoading(true);
    try {
      const res = await api.aiResults(page, 20);
      setItems(res.data || []);
      setPagination(res.pagination || { page, totalPages: 1, total: (res.data || []).length });
    } catch (err) {
      setError(err.message || 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  };

  if (selected) {
    return (
      <div>
        <button className="back-btn" onClick={() => setSelected(null)}>
          <ArrowLeft size={16} /> Back to history
        </button>
        <div className="page-header">
          <div>
            <h2>{selected.endpoint}</h2>
            <p className="subtitle">{new Date(selected.created_at).toLocaleString()}</p>
          </div>
        </div>
        <div className="card" style={{ padding: '1rem', marginBottom: '1rem' }}>
          <h4>Input</h4>
          <pre style={{ fontSize: '0.8rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '0.5rem', overflow: 'auto' }}>
            {JSON.stringify(typeof selected.input_data === 'string' ? JSON.parse(selected.input_data) : selected.input_data, null, 2)}
          </pre>
        </div>
        <AIResultPanel
          result={typeof selected.result === 'string' ? (() => { try { return JSON.parse(selected.result); } catch { return selected.result; } })() : selected.result}
          title="AI Output"
        />
      </div>
    );
  }

  return (
    <div>
      <button className="back-btn" onClick={() => navigate('/ai-tools')}>
        <ArrowLeft size={16} /> Back to AI Tools
      </button>
      <div className="page-header">
        <div>
          <h1>AI Results History</h1>
          <p className="subtitle">{pagination.total} past analyses</p>
        </div>
      </div>

      {error && <div style={{ background: '#fee', color: '#c00', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>{error}</div>}

      {loading ? (
        <div className="loading-container"><div className="loading-spinner" /></div>
      ) : items.length === 0 ? (
        <div className="card" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
          No AI results yet. Run a tool from the AI Tools hub!
        </div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Endpoint</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} onClick={() => setSelected(item)}>
                  <td>{item.id}</td>
                  <td><code style={{ fontSize: '0.8rem' }}>{item.endpoint}</code></td>
                  <td>{new Date(item.created_at).toLocaleString()}</td>
                  <td><button className="btn btn-secondary btn-sm">View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
          <button className="btn btn-secondary btn-sm" disabled={pagination.page <= 1} onClick={() => fetchPage(pagination.page - 1)}>← Prev</button>
          <span style={{ padding: '0.5rem' }}>Page {pagination.page} of {pagination.totalPages}</span>
          <button className="btn btn-secondary btn-sm" disabled={pagination.page >= pagination.totalPages} onClick={() => fetchPage(pagination.page + 1)}>Next →</button>
        </div>
      )}
    </div>
  );
}
