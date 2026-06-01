import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  User, Briefcase, Target,
  CheckCircle2, AlertTriangle, Plus, Trash2
} from 'lucide-react';
import logoImage from '../../assets/logo.png';
import './Profile.css';
import '../dashboard/Home.css';

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
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

  const totalMonthly = occupations.reduce((s, occ) => s + toMonthly(occ), 0);

  const handleRemoveOccupation = (occName) => {
    setOccupations(occupations.filter(o => o !== occName));
    const ni = { ...incomes };     delete ni[occName];     setIncomes(ni);
    const nf = { ...frequencies }; delete nf[occName];     setFrequencies(nf);
  };

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

      const totalIncome = incomePerOcc.reduce((sum, item) => sum + item.monthly_equivalent, 0);
      const monthly = parseFloat(monthlyGoal) || 0;

      await updateProfile({
        full_name: fullName.trim(),
        occupations: occupations,
        income_per_occupation: incomePerOcc,
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
                  <strong>₹{totalMonthly.toLocaleString('en-IN')}</strong>
                </div>
              )}
            </div>

            {/* Financial Goals */}
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
