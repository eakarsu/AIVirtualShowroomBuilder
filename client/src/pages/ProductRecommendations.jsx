import React, { useState } from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import AIResultPanel from '../components/AIResultPanel.jsx';

export default function ProductRecommendations() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    age: '',
    gender: '',
    style_preferences: '',
    budget: '',
    interests: '',
  });
  const [history, setHistory] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const set = (k) => (e) => setProfile({ ...profile, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const purchaseHistory = history
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      const res = await api.productRecommendations({
        customer_profile: profile,
        purchase_history: purchaseHistory,
      });
      setResult(res.recommendations || res.result || res);
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
          <h1>Personalized Product Recommendations</h1>
          <p className="subtitle">AI-driven recommendations from customer profile and history</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <div className="form-group">
            <label>Age</label>
            <input type="text" value={profile.age} onChange={set('age')} placeholder="e.g. 28" />
          </div>
          <div className="form-group">
            <label>Gender</label>
            <input type="text" value={profile.gender} onChange={set('gender')} placeholder="e.g. female" />
          </div>
          <div className="form-group">
            <label>Style Preferences</label>
            <input type="text" value={profile.style_preferences} onChange={set('style_preferences')} placeholder="e.g. minimalist, scandi" />
          </div>
          <div className="form-group">
            <label>Budget</label>
            <input type="text" value={profile.budget} onChange={set('budget')} placeholder="e.g. $200-$500" />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Interests</label>
            <input type="text" value={profile.interests} onChange={set('interests')} placeholder="e.g. sustainability, home office" />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Purchase History (one item per line)</label>
            <textarea rows="4" value={history} onChange={(e) => setHistory(e.target.value)}
              placeholder="Walnut desk lamp&#10;Linen accent chair" />
          </div>
        </div>
        {error && <div style={{ background: '#fee', color: '#c00', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>{error}</div>}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          <Sparkles size={16} style={{ marginRight: '0.5rem' }} />
          {loading ? 'Generating recommendations...' : 'Recommend Products'}
        </button>
      </form>

      {result && <AIResultPanel result={result} title="Recommended Products" />}
    </div>
  );
}
