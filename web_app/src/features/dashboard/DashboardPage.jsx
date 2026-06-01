import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Plus } from 'lucide-react';
import { FinancialSnapshot } from './components/FinancialSnapshot';
import { IncomeSources } from './components/IncomeSources';
import { RecentTransactions } from './components/RecentTransactions';
import { SmartRecommendations } from './components/SmartRecommendations';
import AddExpenseSheet from './AddExpenseSheet';
import logoImage from '../../assets/logo.png';
import api from '../../services/api';
import './Home.css';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [insights, setInsights] = useState([]);
  const [loadingInsights, setLoadingInsights] = useState(true);
  const [showExpenseSheet, setShowExpenseSheet] = useState(false);

  // Mock transactions for display since we don't have a GET /transactions endpoint yet
  const recentTransactions = [
    { id: 1, title: 'Swiggy Payout', date: 'Today, 2:40 PM', amount: 850, type: 'credit' },
    { id: 2, title: 'Fuel (HP)', date: 'Yesterday', amount: 300, type: 'debit' },
    { id: 3, title: 'Freelance Design', date: 'Oct 12', amount: 4500, type: 'credit' },
  ];

  useEffect(() => {
    api.get('/insights/')
      .then(r => setInsights(r.data.slice(0, 3)))
      .catch(() => {})
      .finally(() => setLoadingInsights(false));
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
            <Link to="/profile"      className="nav-link">Settings</Link>
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
            <button className="btn-ghost" onClick={() => setShowExpenseSheet(true)}>Add Expense</button>
            <button className="btn-primary" onClick={() => setShowExpenseSheet(true)}><Plus size={16} /> Log Income</button>
          </div>
        </section>

        <FinancialSnapshot currentBal={currentBal} goalTarget={goalTarget} progressPct={progressPct} />
        
        <IncomeSources incomes={incomes} />

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
    </div>
  );
}
