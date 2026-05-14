import React from 'react';
import { Sparkles } from 'lucide-react';

function renderValue(value, depth = 0) {
  if (value === null || value === undefined) return <span style={{ color: '#94a3b8' }}>—</span>;
  if (typeof value === 'boolean') return <span className={`badge ${value ? 'badge-success' : 'badge-danger'}`}>{value ? 'Yes' : 'No'}</span>;
  if (typeof value === 'number') return <span style={{ fontWeight: 600, color: '#6366f1' }}>{value}</span>;
  if (typeof value === 'string') return <span>{value}</span>;
  if (Array.isArray(value)) {
    if (value.length === 0) return <span style={{ color: '#94a3b8' }}>None</span>;
    return (
      <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
        {value.map((item, i) => (
          <li key={i} style={{ marginBottom: '0.35rem' }}>
            {typeof item === 'object' && item !== null ? renderObject(item, depth + 1) : renderValue(item, depth + 1)}
          </li>
        ))}
      </ul>
    );
  }
  if (typeof value === 'object') return renderObject(value, depth + 1);
  return <span>{String(value)}</span>;
}

function renderObject(obj, depth = 0) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: depth > 0 ? '0.75rem' : 0, borderLeft: depth > 0 ? '2px solid #e2e8f0' : 'none' }}>
      {Object.entries(obj).map(([k, v]) => (
        <div key={k}>
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 600, marginBottom: '0.15rem' }}>{k.replace(/_/g, ' ')}</div>
          <div>{renderValue(v, depth)}</div>
        </div>
      ))}
    </div>
  );
}

export default function AIResultPanel({ result, title = 'AI Result' }) {
  if (!result) return null;
  const isStr = typeof result === 'string';
  return (
    <div style={{ marginTop: '1.5rem', borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
      <div style={{
        background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
        color: 'white',
        padding: '0.875rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <Sparkles size={20} />
        <h3 style={{ margin: 0, fontSize: '1rem' }}>{title}</h3>
      </div>
      <div style={{ padding: '1.25rem', background: '#fafbff' }}>
        {isStr ? (
          <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.9rem', margin: 0 }}>{result}</pre>
        ) : (
          renderObject(result)
        )}
      </div>
    </div>
  );
}
