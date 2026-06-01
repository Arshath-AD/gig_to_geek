import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import './Home.css';

// ── Tiny stat card ───────────────────────────────────────────
function StatCard({ icon, label, value, trend, accent }) {
  return (
    <div className={`stat-card glass-card stat-card--${accent}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-info">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
      </div>
      {trend && (
        <span className={`stat-trend ${trend > 0 ? 'up' : 'down'}`}>
          {trend > 0 ? '▲' : '▼'} {Math.abs(trend)}%
        </span>
      )}
    </div>
  );
}

// ── Insight card ─────────────────────────────────────────────
function InsightCard({ insight }) {
  return (
    <div className={`insight-card glass-card ${insight.is_read ? '' : 'insight-card--unread'}`}>
      <div className="insight-type-badge">{insight.insight_type}</div>
      <h3 className="insight-title">{insight.title}</h3>
      <p className="insight-body">{insight.body}</p>
      {insight.confidence_score != null && (
        <div className="insight-confidence">
          <span>Confidence</span>
          <div className="confidence-bar">
            <div
              className="confidence-fill"
              style={{ width: `${(insight.confidence_score * 100).toFixed(0)}%` }}
            />
          </div>
          <span>{(insight.confidence_score * 100).toFixed(0)}%</span>
        </div>
      )}
    </div>
  );
}

// ── Savings goal card ─────────────────────────────────────────
function GoalCard({ goal }) {
  const progress = goal.target_amount > 0
    ? Math.min((goal.current_amount / goal.target_amount) * 100, 100)
    : 0;

  return (
    <div className="goal-card glass-card">
      <div className="goal-header">
        <h3 className="goal-title">{goal.title}</h3>
        <span className={`goal-status goal-status--${goal.status}`}>{goal.status}</span>
      </div>
      <div className="goal-amounts">
        <span className="goal-current">₹{goal.current_amount.toLocaleString()}</span>
        <span className="goal-sep"> / </span>
        <span className="goal-target">₹{goal.target_amount.toLocaleString()}</span>
      </div>
      <div className="goal-progress-bar" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
        <div className="goal-progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <span className="goal-pct">{progress.toFixed(1)}% saved</span>
    </div>
  );
}

// ── Main HomePage ─────────────────────────────────────────────
export default function HomePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [insights, setInsights] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loadingInsights, setLoadingInsights] = useState(true);
  const [loadingGoals, setLoadingGoals] = useState(true);

  useEffect(() => {
    api.get('/insights/').then(r => setInsights(r.data.slice(0, 3))).catch(() => {}).finally(() => setLoadingInsights(false));
    api.get('/savings-goals/').then(r => setGoals(r.data.slice(0, 3))).catch(() => {}).finally(() => setLoadingGoals(false));
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const firstName = user?.full_name?.split(' ')[0] ?? 'there';
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div className="home-page">
      <div className="mesh-bg"><div className="mesh-orb" /></div>

      {/* ── Top Nav ── */}
      <header className="home-nav" role="banner">
        <Link to="/home" className="auth-brand" aria-label="GigToGeek home">
          <div className="brand-logo">
            <span className="brand-icon">⚡</span>
          </div>
          <span className="brand-name">GigToGeek</span>
        </Link>

        <nav className="nav-links" aria-label="Main navigation">
          <Link to="/home" id="nav-dashboard" className="nav-link nav-link--active">Dashboard</Link>
          <Link to="/home" id="nav-transactions" className="nav-link">Transactions</Link>
          <Link to="/home" id="nav-goals" className="nav-link">Goals</Link>
        </nav>

        <div className="nav-actions">
          <div className="nav-avatar" aria-label={`Logged in as ${user?.full_name}`}>
            {firstName.charAt(0).toUpperCase()}
          </div>
          <button
            id="logout-btn"
            className="btn-ghost nav-logout"
            onClick={handleLogout}
            aria-label="Log out"
          >
            Log out
          </button>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="home-main">
        {/* Greeting */}
        <section className="home-greeting" aria-label="Greeting">
          <div>
            <h1 className="greeting-title">
              {greeting},{' '}
              <span className="text-gradient">{firstName}</span> 👋
            </h1>
            <p className="greeting-sub">
              {user?.occupation ? `${user.occupation} · ` : ''}
              Here&apos;s your financial snapshot for today.
            </p>
          </div>
          {user?.is_superuser && (
            <span className="superuser-badge" title="Super Admin">
              ⚡ Super Admin
            </span>
          )}
        </section>

        {/* Stats row */}
        <section className="stats-grid" aria-label="Key metrics">
          <StatCard icon="💰" label="Monthly income" value={user?.monthly_income_estimate ? `₹${Number(user.monthly_income_estimate).toLocaleString()}` : '—'} accent="blue" />
          <StatCard icon="🎯" label="Active goals" value={loadingGoals ? '…' : goals.length.toString()} accent="purple" />
          <StatCard icon="🤖" label="AI insights" value={loadingInsights ? '…' : insights.length.toString()} trend={3} accent="cyan" />
          <StatCard icon="✅" label="Account status" value={user?.is_active ? 'Active' : 'Inactive'} accent="green" />
        </section>

        {/* Two-column layout */}
        <div className="home-grid">
          {/* Savings goals */}
          <section className="home-section" aria-labelledby="goals-heading">
            <div className="section-header">
              <h2 id="goals-heading" className="section-title">Savings Goals</h2>
              <button id="add-goal-btn" className="btn-ghost section-action">+ Add goal</button>
            </div>
            {loadingGoals ? (
              <div className="section-loading"><span className="spinner" /></div>
            ) : goals.length > 0 ? (
              <div className="goals-list">
                {goals.map(g => <GoalCard key={g.id} goal={g} />)}
              </div>
            ) : (
              <div className="section-empty">
                <span className="empty-icon">🎯</span>
                <p>No savings goals yet. Create your first one!</p>
              </div>
            )}
          </section>

          {/* AI insights */}
          <section className="home-section" aria-labelledby="insights-heading">
            <div className="section-header">
              <h2 id="insights-heading" className="section-title">AI Insights</h2>
              <span className="section-tag">Powered by AI</span>
            </div>
            {loadingInsights ? (
              <div className="section-loading"><span className="spinner" /></div>
            ) : insights.length > 0 ? (
              <div className="insights-list">
                {insights.map(i => <InsightCard key={i.id} insight={i} />)}
              </div>
            ) : (
              <div className="section-empty">
                <span className="empty-icon">🤖</span>
                <p>No AI insights yet. Keep using GigToGeek to generate personalised nudges!</p>
              </div>
            )}
          </section>
        </div>

        {/* Quick actions */}
        <section className="quick-actions" aria-label="Quick actions">
          <h2 className="section-title" style={{ marginBottom: '16px' }}>Quick Actions</h2>
          <div className="actions-grid">
            <button id="qa-add-income" className="action-card glass-card">
              <span className="action-icon">💸</span>
              <span className="action-label">Log Income</span>
            </button>
            <button id="qa-add-expense" className="action-card glass-card">
              <span className="action-icon">🧾</span>
              <span className="action-label">Add Expense</span>
            </button>
            <button id="qa-add-savings" className="action-card glass-card">
              <span className="action-icon">🏦</span>
              <span className="action-label">Save Now</span>
            </button>
            <button id="qa-ai-nudge" className="action-card glass-card">
              <span className="action-icon">🧠</span>
              <span className="action-label">Get AI Nudge</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
