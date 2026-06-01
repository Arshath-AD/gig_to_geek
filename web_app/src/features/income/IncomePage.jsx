import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Search, ChevronLeft, ChevronRight, Plus, TrendingUp } from 'lucide-react';
import logoImage from '../../assets/logo.png';
import AddIncomeSheet from '../dashboard/AddIncomeSheet';
import { incomeService } from '../../services/expenseService';
import './Income.css';
import '../dashboard/Home.css';

// Real incomes will be loaded from the backend

const PAGE_SIZE = 8;

const FILTERS = [
  { key: 'all',      label: 'All' },
  { key: 'Bonus',    label: '🎁 Bonus' },
  { key: 'Tip',      label: '💰 Tips' },
  { key: 'Referral', label: '🔗 Referral' },
  { key: 'Freelance Gig', label: '💻 Freelance' },
  { key: 'cash',     label: '💵 Cash' },
];

function formatDate(iso) {
  const d = new Date(iso);
  const diff = (Date.now() - d) / 1000;
  if (diff < 60)     return 'Just now';
  if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)  return 'Today, ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  if (diff < 172800) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function IncomePage() {
  const { user } = useAuth();
  const firstName = user?.full_name?.split(' ')[0] ?? 'User';

  const [incomes, setIncomes]         = useState([]);
  const [search, setSearch]           = useState('');
  const [filter, setFilter]           = useState('all');
  const [page, setPage]               = useState(1);
  const [showSheet, setShowSheet]     = useState(false);

  useEffect(() => {
    incomeService.getIncomes()
      .then(data => { if (data) setIncomes(data); })
      .catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    let list = [...incomes];
    if (filter === 'cash')    list = list.filter(t => t.payment_method === 'cash');
    else if (filter !== 'all') list = list.filter(t => t.category === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(t => t.name.toLowerCase().includes(q) || t.category?.toLowerCase().includes(q) || t.note?.toLowerCase().includes(q));
    }
    return list;
  }, [incomes, filter, search]);

  useEffect(() => { setPage(1); }, [filter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);
  const avgIncome   = incomes.length ? Math.round(totalIncome / incomes.length) : 0;
  const thisMonth   = incomes.filter(i => new Date(i.timestamp) >= new Date(new Date().setDate(1))).reduce((s, i) => s + i.amount, 0);

  const fmt = n => `₹${n.toLocaleString('en-IN')}`;

  const pageNumbers = () => {
    const pages = [];
    const start = Math.max(1, page - 2);
    const end   = Math.min(totalPages, page + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="income-page">
      <header className="home-nav" role="banner">
        <div className="nav-container">
          <Link to="/home" className="auth-brand" aria-label="GigToGeek home">
            <img src={logoImage} alt="GigToGeek Logo" className="brand-logo-img" />
            <span className="brand-name">GigToGeek</span>
          </Link>
          <nav className="nav-links" aria-label="Main navigation">
            <Link to="/home"         className="nav-link">Overview</Link>
            <Link to="/transactions" className="nav-link">Transactions</Link>
            <Link to="/income"       className="nav-link nav-link--active">Income</Link>
            <Link to="/profile"      className="nav-link">Settings</Link>
          </nav>
          <div className="nav-actions">
            <Link to="/profile" className="nav-avatar" aria-label={`Logged in as ${user?.full_name}`}>
              {firstName.charAt(0).toUpperCase()}
            </Link>
          </div>
        </div>
      </header>

      <main className="income-main">
        {/* Header */}
        <div className="income-page-header">
          <div>
            <h1 className="income-page-title">Extra Income</h1>
            <p className="income-page-sub">Bonuses, tips, referrals & petty payments</p>
          </div>
          <button className="btn-income-primary" onClick={() => setShowSheet(true)}>
            <Plus size={15} /> Log Income
          </button>
        </div>

        {/* Summary strip */}
        <div className="income-summary-strip">
          <div className="income-summary-card accent">
            <div className="income-summary-label">This Month</div>
            <div className="income-summary-value">{fmt(thisMonth)}</div>
          </div>
          <div className="income-summary-card">
            <div className="income-summary-label">All Time</div>
            <div className="income-summary-value">{fmt(totalIncome)}</div>
          </div>
          <div className="income-summary-card">
            <div className="income-summary-label">Avg per Entry</div>
            <div className="income-summary-value">{fmt(avgIncome)}</div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="txn-controls">
          <div className="txn-search-wrap">
            <Search size={15} className="txn-search-icon" />
            <input
              type="search"
              className="txn-search"
              placeholder="Search income entries…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="txn-filter-group" role="group">
            {FILTERS.map(f => (
              <button
                key={f.key}
                className={`txn-filter-btn${filter === f.key ? ' active' : ''}`}
                onClick={() => setFilter(f.key)}
                aria-pressed={filter === f.key}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="txn-list-card">
          <div className="txn-list-header">
            <span className="txn-list-heading">Income Entries</span>
            <span className="txn-count-badge">{filtered.length} entries</span>
          </div>

          {paginated.length === 0 ? (
            <div className="txn-empty">
              <div className="txn-empty-icon">💸</div>
              <h3>No entries found</h3>
              <p>Try a different filter or log your first payment</p>
            </div>
          ) : (
            paginated.map(entry => (
              <div key={entry.id} className="txn-row income-row">
                <div className="txn-row-icon">{entry.category_emoji || '💰'}</div>
                <div className="txn-row-info">
                  <p className="txn-row-name">{entry.name}</p>
                  <div className="txn-row-meta">
                    <span className="txn-row-date">{formatDate(entry.timestamp)}</span>
                    {entry.category && <span className="txn-cat-pill">{entry.category}</span>}
                    <span className={`txn-pay-pill ${entry.payment_method}`}>
                      {entry.payment_method === 'online' ? '⚡ UPI' : '💵 Cash'}
                    </span>
                  </div>
                  {entry.note && <p className="income-note">📝 {entry.note}</p>}
                </div>
                <div className="txn-row-amount credit">+{fmt(entry.amount)}</div>
              </div>
            ))
          )}

          {filtered.length > PAGE_SIZE && (
            <div className="txn-pagination">
              <span className="pagination-info">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
              </span>
              <div className="pagination-controls">
                <button className="page-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1} aria-label="Previous page">
                  <ChevronLeft size={15} />
                </button>
                {pageNumbers().map(n => (
                  <button key={n} className={`page-btn${page === n ? ' active' : ''}`} onClick={() => setPage(n)}>
                    {n}
                  </button>
                ))}
                <button className="page-btn" onClick={() => setPage(p => p + 1)} disabled={page === totalPages} aria-label="Next page">
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {showSheet && (
        <AddIncomeSheet
          onClose={() => setShowSheet(false)}
          onSuccess={() => setShowSheet(false)}
        />
      )}
    </div>
  );
}
