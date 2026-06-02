import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Plus } from 'lucide-react';
import { FinancialSnapshot } from './components/FinancialSnapshot';
import { IncomeSources } from './components/IncomeSources';
import { RecentTransactions } from './components/RecentTransactions';
import { SmartRecommendations } from './components/SmartRecommendations';
import { FinancialCharts } from './components/FinancialCharts';
import AddExpenseSheet from './AddExpenseSheet';
import AddIncomeSheet from './AddIncomeSheet';
import logoImage from '../../assets/logo.png';
import { expenseService } from '../../services/expenseService';
import api from '../../services/api';
import './Home.css';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [insights, setInsights] = useState([]);
  const [loadingInsights, setLoadingInsights] = useState(true);
  const [showExpenseSheet, setShowExpenseSheet] = useState(false);
  const [showIncomeSheet, setShowIncomeSheet]   = useState(false);

  const [allTransactions, setAllTransactions] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    api.get('/insights/')
      .then(r => setInsights(r.data.slice(0, 3)))
      .catch(() => {})
      .finally(() => setLoadingInsights(false));

    // Fetch unified recent transactions
    api.get('/transactions/')
      .then(r => {
        if (r.data) {
          setAllTransactions(r.data);

          const recent = r.data.slice(0, 5).map(t => ({
            id: t.id,
            title: t.description || 'Transaction',
            date: new Date(t.transaction_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
            amount: t.amount,
            type: t.transaction_type === 'income' ? 'credit' : 'debit'
          }));
          setRecentTransactions(recent);
        }
      })
      .catch(() => {});
  }, []);



  const firstName = user?.full_name?.split(' ')[0] ?? 'User';
  
  // Calculate progress
  const currentBal = user?.current_balance || 0;
  const goalTarget = user?.monthly_saving_goal || 0;
  const progressPct = goalTarget > 0 ? Math.min((currentBal / goalTarget) * 100, 100) : 0;
  const incomes = user?.income_per_occupation || [];

  return (
    <div className="home-page">
      {/* ── Top Nav ── */}
      <header className="home-nav" role="banner">
        <div className="nav-container">
          <Link to="/home" className="auth-brand" aria-label="GigToGeek home">
            <img src={logoImage} alt="GigToGeek Logo" className="brand-logo-img" />
            <span className="brand-name">GigToGeek</span>
          </Link>

          <nav className="nav-links" aria-label="Main navigation">
            <Link to="/home"         className="nav-link nav-link--active">Overview</Link>
            <Link to="/transactions" className="nav-link">Transactions</Link>
            <Link to="/income"       className="nav-link">Income</Link>
            {user?.has_ai_access && (
              <Link to="/ai-advisor" className="nav-link" style={{ color: '#a78bfa' }}>✦ AI Advisor</Link>
            )}
            <Link to="/profile"      className="nav-link">Settings</Link>
            {user?.is_superuser && <Link to="/admin" className="nav-link" style={{ color: 'var(--danger)', fontWeight: 600 }}>Admin Panel</Link>}
          </nav>

          <div className="nav-actions">
            <Link to="/profile" className="nav-avatar" aria-label={`Logged in as ${user?.full_name}`}>
              {firstName.charAt(0).toUpperCase()}
            </Link>
          </div>
        </div>
      </header>

      <main className="home-main">
        {/* Header */}
        <section className="home-header-section">
          <div>
            <h1 className="greeting-title">Overview</h1>
            <p className="greeting-sub">Welcome back, {firstName}. Here is your financial summary.</p>
          </div>
          <div className="header-actions">
            <button className="btn-ghost" onClick={() => setShowExpenseSheet(true)}>
              <Plus size={14} /> Add Expense
            </button>
            <button className="btn-primary" onClick={() => setShowIncomeSheet(true)}>
              <Plus size={14} /> Add Income
            </button>
          </div>
        </section>

        <FinancialSnapshot currentBal={currentBal} goalTarget={goalTarget} progressPct={progressPct} />
        
        <IncomeSources incomes={incomes} />

        <FinancialCharts transactions={allTransactions} />

        <section className="secondary-grid">
          <SmartRecommendations insights={insights} loadingInsights={loadingInsights} />
          <RecentTransactions transactions={recentTransactions} />
        </section>
      </main>

      {showExpenseSheet && (
        <AddExpenseSheet
          onClose={() => setShowExpenseSheet(false)}
          onSuccess={() => setShowExpenseSheet(false)}
        />
      )}

      {showIncomeSheet && (
        <AddIncomeSheet
          onClose={() => setShowIncomeSheet(false)}
          onSuccess={() => setShowIncomeSheet(false)}
        />
      )}
    </div>
  );
}
