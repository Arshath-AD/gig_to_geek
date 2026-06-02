import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  User, Briefcase, Target, CreditCard,
  CheckCircle2, AlertTriangle, Plus, Trash2, TestTube
} from 'lucide-react';
import logoImage from '../../assets/logo.png';
import { authService } from '../../services/authService';
import './Profile.css';
import '../dashboard/Home.css';

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [success, setSuccess] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [fullName, setFullName]       = useState(user?.full_name || '');
  const [balance, setBalance]         = useState(user?.current_balance || '');
  const [monthlyGoal, setMonthlyGoal] = useState(user?.monthly_saving_goal || '');
  const [occupations, setOccupations] = useState(user?.occupations || []);
  const [incomes, setIncomes]         = useState({});
  const [frequencies, setFrequencies] = useState({});  // { [occupation]: 'daily'|'weekly'|'monthly' }
  const [newOccName, setNewOccName]   = useState('');
  const [showAddOcc, setShowAddOcc]   = useState(false);

  // Fixed Expenses State
  const [fixedExpenses, setFixedExpenses] = useState([]);
  const [expenseAmounts, setExpenseAmounts] = useState({});
  const [newExpenseName, setNewExpenseName] = useState('');
  const [showAddExpense, setShowAddExpense] = useState(false);

  useEffect(() => {
    if (user?.income_per_occupation) {
      const initIncomes = {};
      const initFreqs   = {};
      user.income_per_occupation.forEach((item) => {
        initIncomes[item.occupation] = item.income;
        initFreqs[item.occupation]   = item.frequency || 'monthly';
      });
      setIncomes(initIncomes);
      setFrequencies(initFreqs);
    }
    if (user?.constant_expenses) {
      const initExpNames = [];
      const initExpAmts = {};
      user.constant_expenses.forEach((item) => {
        initExpNames.push(item.name);
        initExpAmts[item.name] = item.amount;
      });
      setFixedExpenses(initExpNames);
      setExpenseAmounts(initExpAmts);
    }
  }, [user]);

  const handleAddOccupation = () => {
    const occName = newOccName.trim();
    if (!occName || occupations.includes(occName)) return;
    setOccupations([...occupations, occName]);
    setIncomes({ ...incomes, [occName]: '' });
    setFrequencies({ ...frequencies, [occName]: 'monthly' });
    setNewOccName('');
    setShowAddOcc(false);
  };

  // Compute monthly equivalent for an income source
  const toMonthly = (occ) => {
    const amt   = parseFloat(incomes[occ]) || 0;
    const freq  = frequencies[occ] || 'monthly';
    if (freq === 'daily')   return amt * 30;
    if (freq === 'weekly')  return amt * 4;
    return amt;
  };

  const handleRemoveOccupation = (occName) => {
    setOccupations(occupations.filter(o => o !== occName));
    const ni = { ...incomes };     delete ni[occName];     setIncomes(ni);
    const nf = { ...frequencies }; delete nf[occName];     setFrequencies(nf);
  };

  const handleAddExpense = () => {
    const expName = newExpenseName.trim();
    if (!expName || fixedExpenses.includes(expName)) return;
    setFixedExpenses([...fixedExpenses, expName]);
    setExpenseAmounts({ ...expenseAmounts, [expName]: '' });
    setNewExpenseName('');
    setShowAddExpense(false);
  };

  const handleRemoveExpense = (expName) => {
    setFixedExpenses(fixedExpenses.filter(e => e !== expName));
    const ne = { ...expenseAmounts }; delete ne[expName]; setExpenseAmounts(ne);
  };

  const totalMonthly = occupations.reduce((s, occ) => s + toMonthly(occ), 0);
  const totalFixedExpenses = fixedExpenses.reduce((s, exp) => s + (parseFloat(expenseAmounts[exp]) || 0), 0);

  // Auto-calculate savings goal (Income - Fixed Needs)
  useEffect(() => {
    if (totalMonthly > 0 || totalFixedExpenses > 0) {
      const difference = Math.max(0, totalMonthly - totalFixedExpenses);
      setMonthlyGoal(difference);
    }
  }, [totalMonthly, totalFixedExpenses]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const incomePerOcc = occupations.map(occ => ({
        occupation: occ,
        income:     parseFloat(incomes[occ]) || 0,
        frequency:  frequencies[occ] || 'monthly',
        monthly_equivalent: toMonthly(occ),
      }));

      const constantExps = fixedExpenses.map(exp => ({
        name: exp,
        amount: parseFloat(expenseAmounts[exp]) || 0,
      }));

      const totalIncome = incomePerOcc.reduce((sum, item) => sum + item.monthly_equivalent, 0);
      const monthly = parseFloat(monthlyGoal) || 0;

      await updateProfile({
        full_name: fullName.trim(),
        occupations: occupations,
        income_per_occupation: incomePerOcc,
        constant_expenses: constantExps,
        total_monthly_income: totalIncome,
        monthly_income_estimate: totalIncome,
        current_balance: parseFloat(balance) || null,
        monthly_saving_goal: monthly || null,
        weekly_saving_goal: monthly ? Math.round(monthly / 4) : null,
        daily_saving_goal: monthly ? Math.round(monthly / 30) : null,
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSeedMockData = async () => {
    setSeeding(true);
    setSeedSuccess(false);
    setError('');
    try {
      await authService.seedMockData();
      setSeedSuccess(true);
      setTimeout(() => setSeedSuccess(false), 3000);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to seed mock data');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="profile-page">
      <header className="home-nav" role="banner">
        <div className="nav-container">
          <Link to="/home" className="auth-brand" aria-label="GigToGeek home">
            <img src={logoImage} alt="GigToGeek Logo" className="brand-logo-img" />
            <span className="brand-name">GigToGeek</span>
          </Link>

          <nav className="nav-links" aria-label="Main navigation">
            <Link to="/home"         className="nav-link">Overview</Link>
            <Link to="/transactions" className="nav-link">Transactions</Link>
            <Link to="/income"       className="nav-link">Income</Link>
            <Link to="/profile"      className="nav-link nav-link--active">Settings</Link>
          </nav>

          <div className="nav-actions">
            <Link to="/profile" className="nav-avatar" aria-label={`Logged in as ${user?.full_name}`}>
              {(user?.full_name?.charAt(0) ?? 'U').toUpperCase()}
            </Link>
          </div>
        </div>
      </header>

      <main className="profile-main">
        <div className="profile-container">
          
          <div className="profile-avatar-row">
            <div className="profile-avatar-large">
              {fullName ? fullName.charAt(0).toUpperCase() : '?'}
            </div>
            <div className="profile-meta">
              <h2>{fullName || 'Your Name'}</h2>
              <p>{user?.email}</p>
            </div>
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: '24px' }}>
              <AlertTriangle size={16} />
              {error}
            </div>
          )}
          {success && (
            <div className="alert alert-success" style={{ marginBottom: '24px' }}>
              <CheckCircle2 size={16} />
              Settings saved successfully.
            </div>
          )}

          {/* Demo Options */}
          <div className="profile-section" style={{ border: '1px dashed var(--accent-1)', background: 'rgba(13, 148, 136, 0.03)' }}>
            <h3 className="profile-section-title"><TestTube size={16} /> Demo Options</h3>
            <p className="profile-section-desc">Instantly populate your account with realistic mock transactions to explore the app.</p>
            <div style={{ marginTop: '16px' }}>
              <button
                type="button"
                onClick={handleSeedMockData}
                disabled={seeding}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '10px 18px', borderRadius: '8px', fontWeight: 600, fontSize: '14px',
                  border: '1px solid var(--accent-1)', background: 'transparent',
                  color: 'var(--accent-1)', cursor: seeding ? 'not-allowed' : 'pointer',
                  opacity: seeding ? 0.7 : 1, transition: 'all 0.15s'
                }}
              >
                {seeding ? <span className="spinner" style={{ width: '14px', height: '14px', borderColor: 'var(--accent-1)', borderTopColor: 'transparent' }} /> : <TestTube size={15} />}
                {seeding ? 'Seeding…' : 'Seed Mock Data'}
              </button>
              {seedSuccess && (
                <p style={{ color: 'var(--success)', fontSize: '13px', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={14} /> 30 mock transactions seeded successfully!
                </p>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit}>

            {/* Personal Details */}
            <div className="profile-section">
              <h3 className="profile-section-title"><User size={16} /> Account</h3>
              <div className="form-group" style={{ maxWidth: '300px' }}>
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Occupations & Income */}
            <div className="profile-section">
              <h3 className="profile-section-title"><Briefcase size={16} /> Income Sources</h3>

              <div style={{ marginBottom: '16px' }}>
                {occupations.map((occ) => (
                  <div key={occ} className="income-list-item">
                    <div className="income-list-header-row">
                      <span className="income-list-title">{occ}</span>
                      <button type="button" className="icon-btn" onClick={() => handleRemoveOccupation(occ)} aria-label={`Remove ${occ}`}>
                        <Trash2 size={15} />
                      </button>
                    </div>

                    {/* Amount + frequency on same row */}
                    <div className="income-source-controls">
                      <div className="income-input-wrap">
                        <span className="income-currency">₹</span>
                        <input
                          type="number"
                          className="form-input"
                          placeholder="0"
                          value={incomes[occ] ?? ''}
                          onChange={(e) => setIncomes({ ...incomes, [occ]: e.target.value })}
                        />
                      </div>

                      {/* Frequency toggle */}
                      <div className="freq-toggle">
                        {['daily', 'weekly', 'monthly'].map(f => (
                          <button
                            key={f}
                            type="button"
                            className={`freq-btn${(frequencies[occ] || 'monthly') === f ? ' active' : ''}`}
                            onClick={() => setFrequencies({ ...frequencies, [occ]: f })}
                          >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Monthly equivalent hint */}
                    {incomes[occ] && parseFloat(incomes[occ]) > 0 && frequencies[occ] !== 'monthly' && (
                      <p className="income-monthly-hint">
                        ≈ ₹{toMonthly(occ).toLocaleString('en-IN')} / month
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Inline add occupation */}
              {showAddOcc ? (
                <div className="add-occ-row">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Graphic Design, Delivery, Writing…"
                    value={newOccName}
                    onChange={e => setNewOccName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddOccupation()}
                    autoFocus
                  />
                  <button type="button" className="add-occ-confirm" onClick={handleAddOccupation}>Add</button>
                  <button type="button" className="add-occ-cancel" onClick={() => { setShowAddOcc(false); setNewOccName(''); }}>Cancel</button>
                </div>
              ) : (
                <button type="button" className="add-btn-outline" onClick={() => setShowAddOcc(true)}>
                  <Plus size={16} /> Add income source
                </button>
              )}

              {/* Total monthly projection */}
              {occupations.length > 0 && totalMonthly > 0 && (
                <div className="income-total-bar">
                  <span>Projected monthly income</span>
                  <span className="income-total-val">₹{totalMonthly.toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>

            {/* Fixed Expenses */}
            <div className="profile-section">
              <h3 className="profile-section-title"><CreditCard size={16} /> Fixed Expenses (Needs)</h3>
              <p className="profile-section-desc">Constant recurring expenses like Rent, Gym, Internet, etc.</p>

              <div style={{ marginBottom: '16px' }}>
                {fixedExpenses.map((exp) => (
                  <div key={exp} className="income-list-item">
                    <div className="income-list-header-row">
                      <span className="income-list-title">{exp}</span>
                      <button type="button" className="icon-btn" onClick={() => handleRemoveExpense(exp)} aria-label={`Remove ${exp}`}>
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className="income-source-controls">
                      <div className="income-input-wrap" style={{ flex: 1 }}>
                        <span className="income-currency">₹</span>
                        <input
                          type="number"
                          className="form-input"
                          placeholder="0 / month"
                          value={expenseAmounts[exp] ?? ''}
                          onChange={(e) => setExpenseAmounts({ ...expenseAmounts, [exp]: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Inline add expense */}
              {showAddExpense ? (
                <div className="add-occ-row">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. House Rent, WiFi, Gym…"
                    value={newExpenseName}
                    onChange={e => setNewExpenseName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddExpense()}
                    autoFocus
                  />
                  <button type="button" className="add-occ-confirm" onClick={handleAddExpense}>Add</button>
                  <button type="button" className="add-occ-cancel" onClick={() => { setShowAddExpense(false); setNewExpenseName(''); }}>Cancel</button>
                </div>
              ) : (
                <button type="button" className="add-btn-outline" onClick={() => setShowAddExpense(true)}>
                  <Plus size={16} /> Add fixed expense
                </button>
              )}

              {fixedExpenses.length > 0 && totalFixedExpenses > 0 && (
                <div className="income-total-bar" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--text-primary)' }}>
                  <span>Total monthly fixed expenses</span>
                  <span className="income-total-val" style={{ color: 'var(--danger)' }}>₹{totalFixedExpenses.toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>

            {/* Savings Goals */}
            <div className="profile-section">
              <h3 className="profile-section-title"><Target size={16} /> Financial Goals</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Current Balance (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Monthly Savings Goal (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={monthlyGoal}
                    onChange={(e) => setMonthlyGoal(e.target.value)}
                  />
                  <p className="form-hint" style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
                    Auto-calculated: Extra money remaining after fixed expenses.
                  </p>
                </div>
              </div>
            </div>

            <div className="profile-actions">
              <button type="button" className="btn-danger" onClick={logout}>
                Log out
              </button>
              <button type="submit" className="btn-primary" disabled={loading} style={{ width: 'auto' }}>
                {loading ? <span className="spinner" /> : 'Save changes'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
