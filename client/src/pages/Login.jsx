import React, { useState } from 'react';
import { api } from '../services/api.js';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.login(email, password);
      onLogin(data.user, data.token);
    } catch (err) {
      setError(err.message || 'Login failed');
    }
    setLoading(false);
  };

  const fillDemo = () => {
    setEmail('admin@showroom.com');
    setPassword('admin123');
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>AI Showroom</h1>
        <p className="subtitle">Virtual Store Builder Platform</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          {error && (
            <div style={{ color: '#f87171', fontSize: 13, marginBottom: 16, padding: '10px 14px', background: 'rgba(239,68,68,0.1)', borderRadius: 8 }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginBottom: 12 }}>
            {loading ? <><span className="spinner"></span> Signing in...</> : 'Sign In'}
          </button>

          <button type="button" className="btn btn-fill" onClick={fillDemo} style={{ width: '100%', justifyContent: 'center' }}>
            Fill Demo Credentials
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: 'var(--text-muted)' }}>
          E-commerce AI Platform &middot; $500-5K/mo
        </div>
      </div>
    </div>
  );
}
