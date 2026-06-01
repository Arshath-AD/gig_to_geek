import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Search, ChevronLeft, ChevronRight, Plus, Banknote, Wifi, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import logoImage from '../../assets/logo.png';
import AddExpenseSheet from '../dashboard/AddExpenseSheet';
import { expenseService } from '../../services/expenseService';
import './Transactions.css';
import '../dashboard/Home.css';

// ── Seed mock data so the page isn't empty ──────────────────
const MOCK_TRANSACTIONS = [
  { id: 'm1',  name: 'Swiggy Payout',      category: 'Food & Drinks',    category_emoji: '🍔', amount: 850,   type: 'credit', payment_method: 'online', timestamp: new Date(Date.now() - 1*3600000).toISOString() },
  { id: 'm2',  name: 'Fuel (HP)',           category: 'Fuel',             category_emoji: '⛽', amount: 300,   type: 'debit',  payment_method: 'cash',   timestamp: new Date(Date.now() - 26*3600000).toISOString() },
  { id: 'm3',  name: 'Freelance Design',   category: 'Other',            category_emoji: '📦', amount: 4500,  type: 'credit', payment_method: 'online', timestamp: new Date(Date.now() - 3*86400000).toISOString() },
  { id: 'm4',  name: 'Zomato Dinner',      category: 'Food & Drinks',    category_emoji: '🍔', amount: 620,   type: 'debit',  payment_method: 'online', timestamp: new Date(Date.now() - 4*86400000).toISOString() },
  { id: 'm5',  name: 'Netflix',            category: 'Entertainment',    category_emoji: '🎬', amount: 499,   type: 'debit',  payment_method: 'online', timestamp: new Date(Date.now() - 5*86400000).toISOString() },
  { id: 'm6',  name: 'Uber Ride',          category: 'Transport',        category_emoji: '🚗', amount: 180,   type: 'debit',  payment_method: 'online', timestamp: new Date(Date.now() - 6*86400000).toISOString() },
  { id: 'm7',  name: 'Medical Checkup',    category: 'Health',           category_emoji: '💊', amount: 750,   type: 'debit',  payment_method: 'cash',   timestamp: new Date(Date.now() - 7*86400000).toISOString() },
  { id: 'm8',  name: 'Electricity Bill',   category: 'Bills & Utilities', category_emoji: '💡', amount: 1200,  type: 'debit',  payment_method: 'online', timestamp: new Date(Date.now() - 8*86400000).toISOString() },
  { id: 'm9',  name: 'Grocery (D-Mart)',   category: 'Shopping',         category_emoji: '🛍️', amount: 2340,  type: 'debit',  payment_method: 'cash',   timestamp: new Date(Date.now() - 9*86400000).toISOString() },
  { id: 'm10', name: 'Ola Payout',         category: 'Other',            category_emoji: '📦', amount: 3200,  type: 'credit', payment_method: 'online', timestamp: new Date(Date.now() - 10*86400000).toISOString() },
  { id: 'm11', name: 'Gym Membership',     category: 'Health',           category_emoji: '💊', amount: 1500,  type: 'debit',  payment_method: 'online', timestamp: new Date(Date.now() - 11*86400000).toISOString() },
  { id: 'm12', name: 'House Rent',         category: 'Rent',             category_emoji: '🏠', amount: 12000, type: 'debit',  payment_method: 'online', timestamp: new Date(Date.now() - 12*86400000).toISOString() },
  { id: 'm13', name: 'Udemy Course',       category: 'Education',        category_emoji: '📚', amount: 699,   type: 'debit',  payment_method: 'online', timestamp: new Date(Date.now() - 13*86400000).toISOString() },
  { id: 'm14', name: 'Coffee (Starbucks)', category: 'Food & Drinks',    category_emoji: '🍔', amount: 350,   type: 'debit',  payment_method: 'cash',   timestamp: new Date(Date.now() - 14*86400000).toISOString() },
  { id: 'm15', name: 'Rapido Payout',      category: 'Other',            category_emoji: '📦', amount: 1800,  type: 'credit', payment_method: 'online', timestamp: new Date(Date.now() - 15*86400000).toISOString() },
  { id: 'm16', name: 'New Headphones',     category: 'Shopping',         category_emoji: '🛍️', amount: 4999,  type: 'debit',  payment_method: 'online', timestamp: new Date(Date.now() - 16*86400000).toISOString() },
  { id: 'm17', name: 'Auto (Local)',       category: 'Transport',        category_emoji: '🚗', amount: 60,    type: 'debit',  payment_method: 'cash',   timestamp: new Date(Date.now() - 17*86400000).toISOString() },
  { id: 'm18', name: 'Fiverr Payout',      category: 'Other',            category_emoji: '📦', amount: 6500,  type: 'credit', payment_method: 'online', timestamp: new Date(Date.now() - 18*86400000).toISOString() },
];

const PAGE_SIZE = 8;

const FILTERS = [
  { key: 'all',    label: 'All' },
  { key: 'debit',  label: '↑ Expenses' },
  { key: 'credit', label: '↓ Income' },
  { key: 'online', label: 'Online / UPI' },
  { key: 'cash',   label: 'Cash' },
];

function formatDate(isoString) {
  const d = new Date(isoString);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60)       return 'Just now';
  if (diff < 3600)     return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)    return 'Today, ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  if (diff < 172800)   return 'Yesterday';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function TransactionsPage() {
  const { user } = useAuth();
  const firstName = user?.full_name?.split(' ')[0] ?? 'User';

  const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS);
  const [search, setSearch]             = useState('');
  const [filter, setFilter]             = useState('all');
  const [page, setPage]                 = useState(1);
  const [showExpenseSheet, setShowExpenseSheet] = useState(false);

  // Fetch real transactions (if backend has endpoint)
  useEffect(() => {
    expenseService.getExpenses()
      .then((data) => {
        if (data?.length) setTransactions([...data, ...MOCK_TRANSACTIONS]);
      })
      .catch(() => {});
  }, []);

  // Filter + search
  const filtered = useMemo(() => {
    let list = [...transactions];
    if (filter === 'debit')  list = list.filter(t => t.type === 'debit');
    if (filter === 'credit') list = list.filter(t => t.type === 'credit');
    if (filter === 'online') list = list.filter(t => t.payment_method === 'online');
    if (filter === 'cash')   list = list.filter(t => t.payment_method === 'cash');
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.category?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [transactions, filter, search]);

  // Reset to page 1 on filter/search change
  useEffect(() => { setPage(1); }, [filter, search]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Summary stats
  const totalSpent  = transactions.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0);
  const totalEarned = transactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
  const net         = totalEarned - totalSpent;

  const fmt = (n) => `₹${Math.abs(n).toLocaleString('en-IN')}`;

  const pageNumbers = () => {
    const pages = [];
    const start = Math.max(1, page - 2);
    const end   = Math.min(totalPages, page + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="txn-page">
      {/* ── Shared Nav ── */}
      <header className="home-nav" role="banner">
        <div className="nav-container">
          <Link to="/home" className="auth-brand" aria-label="GigToGeek home">
            <img src={logoImage} alt="GigToGeek Logo" className="brand-logo-img" />
            <span className="brand-name">GigToGeek</span>
          </Link>

          <nav className="nav-links" aria-label="Main navigation">
            <Link to="/home"         className="nav-link">Overview</Link>
            <Link to="/transactions" className="nav-link nav-link--active">Transactions</Link>
            <Link to="/profile"      className="nav-link">Settings</Link>
          </nav>

          <div className="nav-actions">
            <Link to="/profile" className="nav-avatar" aria-label={`Logged in as ${user?.full_name}`}>
              {firstName.charAt(0).toUpperCase()}
            </Link>
          </div>
        </div>
      </header>

      <main className="txn-main">
        {/* ── Header ── */}
        <div className="txn-page-header">
          <div>
            <h1 className="txn-page-title">Transactions</h1>
            <p className="txn-page-sub">{transactions.length} total entries</p>
          </div>
          <button className="btn-primary" style={{ width: 'auto' }} onClick={() => setShowExpenseSheet(true)}>
            <Plus size={15} /> Add Expense
          </button>
        </div>

        {/* ── Summary Strip ── */}
        <div className="txn-summary-strip">
          <div className="txn-summary-card">
            <div className="txn-summary-label">Total Spent</div>
            <div className="txn-summary-value negative">{fmt(totalSpent)}</div>
          </div>
          <div className="txn-summary-card">
            <div className="txn-summary-label">Total Earned</div>
            <div className="txn-summary-value positive">{fmt(totalEarned)}</div>
          </div>
          <div className="txn-summary-card">
            <div className="txn-summary-label">Net Balance</div>
            <div className={`txn-summary-value ${net >= 0 ? 'positive' : 'negative'}`}>
              {net >= 0 ? '+' : '-'}{fmt(net)}
            </div>
          </div>
        </div>

        {/* ── Search & Filters ── */}
        <div className="txn-controls">
          <div className="txn-search-wrap">
            <Search size={15} className="txn-search-icon" />
            <input
              type="search"
              className="txn-search"
              placeholder="Search by name or category…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Search transactions"
            />
          </div>
          <div className="txn-filter-group" role="group" aria-label="Filter transactions">
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

        {/* ── List ── */}
        <div className="txn-list-card">
          <div className="txn-list-header">
            <span className="txn-list-heading">
              {filter === 'all' ? 'All Transactions' : FILTERS.find(f => f.key === filter)?.label}
            </span>
            <span className="txn-count-badge">{filtered.length} entries</span>
          </div>

          {paginated.length === 0 ? (
            <div className="txn-empty">
              <div className="txn-empty-icon">🔍</div>
              <h3>No transactions found</h3>
              <p>Try adjusting your search or filter</p>
            </div>
          ) : (
            paginated.map(txn => (
              <div key={txn.id} className="txn-row">
                <div className="txn-row-icon">{txn.category_emoji || '📦'}</div>
                <div className="txn-row-info">
                  <p className="txn-row-name">{txn.name}</p>
                  <div className="txn-row-meta">
                    <span className="txn-row-date">{formatDate(txn.timestamp)}</span>
                    {txn.category && (
                      <span className="txn-cat-pill">{txn.category}</span>
                    )}
                    <span className={`txn-pay-pill ${txn.payment_method}`}>
                      {txn.payment_method === 'online' ? '⚡ UPI' : '💵 Cash'}
                    </span>
                  </div>
                </div>
                <div className={`txn-row-amount ${txn.type}`}>
                  {txn.type === 'credit' ? '+' : '-'}{fmt(txn.amount)}
                </div>
              </div>
            ))
          )}

          {/* ── Pagination ── */}
          {filtered.length > PAGE_SIZE && (
            <div className="txn-pagination">
              <span className="pagination-info">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
              </span>
              <div className="pagination-controls" role="navigation" aria-label="Pagination">
                <button
                  className="page-btn"
                  onClick={() => setPage(p => p - 1)}
                  disabled={page === 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={15} />
                </button>

                {pageNumbers().map(n => (
                  <button
                    key={n}
                    className={`page-btn${page === n ? ' active' : ''}`}
                    onClick={() => setPage(n)}
                    aria-label={`Page ${n}`}
                    aria-current={page === n ? 'page' : undefined}
                  >
                    {n}
                  </button>
                ))}

                <button
                  className="page-btn"
                  onClick={() => setPage(p => p + 1)}
                  disabled={page === totalPages}
                  aria-label="Next page"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {showExpenseSheet && (
        <AddExpenseSheet
          onClose={() => setShowExpenseSheet(false)}
          onSuccess={() => {
            setShowExpenseSheet(false);
          }}
        />
      )}
    </div>
  );
}
