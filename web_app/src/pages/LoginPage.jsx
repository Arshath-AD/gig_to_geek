import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/home', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.detail || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="mesh-bg"><div className="mesh-orb" /></div>

      {/* Brand */}
      <Link to="/" className="auth-brand" aria-label="GigToGeek home">
        <div className="brand-logo">
          <span className="brand-icon">⚡</span>
        </div>
        <span className="brand-name">GigToGeek</span>
      </Link>

      <main className="auth-main">
        <div className="glass-card auth-card">
          {/* Header */}
          <div className="auth-header">
            <h1 className="auth-title">Welcome back</h1>
            <p className="auth-subtitle">Sign in to your GigToGeek account</p>
          </div>

          {/* Form */}
          <form id="login-form" className="auth-form" onSubmit={handleSubmit} noValidate>
            {error && (
              <div role="alert" className="alert alert-error">
                <span className="alert-icon">⚠</span>
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="login-email" className="form-label">Email address</label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                className="form-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password" className="form-label">Password</label>
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                className="form-input"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <button
              id="login-submit"
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? <span className="spinner" aria-hidden="true" /> : null}
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          {/* Footer */}
          <p className="auth-footer-text">
            Don&apos;t have an account?{' '}
            <Link to="/signup" id="go-to-signup" className="auth-link">
              Create one →
            </Link>
          </p>
        </div>

        {/* Decorative stats pill */}
        <div className="auth-badge" aria-hidden="true">
          <span className="badge-dot" />
          <span>2,400+ gig workers saving smarter</span>
        </div>
      </main>
    </div>
  );
}