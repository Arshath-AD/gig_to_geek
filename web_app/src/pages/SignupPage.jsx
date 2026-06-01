import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const OCCUPATIONS = [
  'Freelancer', 'Rideshare Driver', 'Delivery Partner', 'Content Creator',
  'Tutor / Educator', 'Handyman / Tradesperson', 'Graphic Designer',
  'Software Developer', 'Student', 'Other',
];

export default function SignupPage() {
  const { register, login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    occupation: '',
    monthly_income_estimate: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const validate = () => {
    if (!form.full_name.trim()) return 'Full name is required.';
    if (!form.email.trim()) return 'Email is required.';
    if (!/\S+@\S+\.\S+/.test(form.email)) return 'Please enter a valid email.';
    if (form.password.length < 8) return 'Password must be at least 8 characters.';
    if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    try {
      await register({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        password: form.password,
        occupation: form.occupation || null,
        monthly_income_estimate: form.monthly_income_estimate
          ? parseFloat(form.monthly_income_estimate)
          : null,
      });
      // Auto-login and go straight to onboarding
      await login(form.email.trim(), form.password);
      navigate('/onboarding', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.detail || 'Registration failed. Please try again.');
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
        <div className="glass-card auth-card auth-card--wide">
          {/* Header */}
          <div className="auth-header">
            <h1 className="auth-title">Create your account</h1>
            <p className="auth-subtitle">Start micro-saving on every gig you take</p>
          </div>

          {/* Alerts */}
          {error && (
            <div role="alert" className="alert alert-error">
              <span className="alert-icon">⚠</span>
              {error}
            </div>
          )}
          {success && (
            <div role="status" className="alert alert-success">
              <span className="alert-icon">✓</span>
              Account created! Setting up your profile…
            </div>
          )}

          {/* Form */}
          <form id="signup-form" className="auth-form" onSubmit={handleSubmit} noValidate>
            {/* Row: full name + email */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="signup-fullname" className="form-label">Full name</label>
                <input
                  id="signup-fullname"
                  name="full_name"
                  type="text"
                  autoComplete="name"
                  className="form-input"
                  placeholder="Alex Johnson"
                  value={form.full_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="signup-email" className="form-label">Email address</label>
                <input
                  id="signup-email"
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
            </div>

            {/* Row: password + confirm */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="signup-password" className="form-label">Password</label>
                <input
                  id="signup-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  className="form-input"
                  placeholder="Min 8 characters"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                />
              </div>
              <div className="form-group">
                <label htmlFor="signup-confirm" className="form-label">Confirm password</label>
                <input
                  id="signup-confirm"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  className="form-input"
                  placeholder="Repeat password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Row: occupation + income */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="signup-occupation" className="form-label">
                  Occupation <span className="optional-tag">(optional)</span>
                </label>
                <select
                  id="signup-occupation"
                  name="occupation"
                  className="form-input"
                  value={form.occupation}
                  onChange={handleChange}
                >
                  <option value="">Select occupation</option>
                  {OCCUPATIONS.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="signup-income" className="form-label">
                  Monthly income estimate <span className="optional-tag">(optional)</span>
                </label>
                <input
                  id="signup-income"
                  name="monthly_income_estimate"
                  type="number"
                  min="0"
                  step="100"
                  className="form-input"
                  placeholder="e.g. 3500"
                  value={form.monthly_income_estimate}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              id="signup-submit"
              type="submit"
              className="btn-primary"
              disabled={loading || success}
            >
              {loading ? <span className="spinner" aria-hidden="true" /> : null}
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          {/* Footer */}
          <p className="auth-footer-text">
            Already have an account?{' '}
            <Link to="/login" id="go-to-login" className="auth-link">
              Sign in →
            </Link>
          </p>
        </div>

        <div className="auth-badge" aria-hidden="true">
          <span className="badge-dot" />
          <span>Free forever · No credit card required</span>
        </div>
      </main>
    </div>
  );
}
