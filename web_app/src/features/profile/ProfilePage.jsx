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
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [balance, setBalance] = useState(user?.current_balance || '');
  const [monthlyGoal, setMonthlyGoal] = useState(user?.monthly_saving_goal || '');
  const [occupations, setOccupations] = useState(user?.occupations || []);
  const [incomes, setIncomes] = useState({});

  useEffect(() => {
    if (user?.income_per_occupation) {
      const initialIncomes = {};
      user.income_per_occupation.forEach((item) => {
        initialIncomes[item.occupation] = item.income;
      });
      setIncomes(initialIncomes);
    }
  }, [user]);

  const handleAddOccupation = () => {
    const name = window.prompt("Enter new occupation name (e.g. Graphic Design):");
    if (name && name.trim()) {
      const occName = name.trim();
      if (!occupations.includes(occName)) {
        setOccupations([...occupations, occName]);
        setIncomes({ ...incomes, [occName]: '' });
      }
    }
  };

  const handleRemoveOccupation = (occName) => {
    setOccupations(occupations.filter(o => o !== occName));
    const newIncomes = { ...incomes };
    delete newIncomes[occName];
    setIncomes(newIncomes);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const incomePerOcc = occupations.map(occ => ({
        occupation: occ,
        income: parseFloat(incomes[occ]) || 0
      }));

      const totalIncome = incomePerOcc.reduce((sum, item) => sum + item.income, 0);
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
                    <span className="income-list-title">{occ}</span>
                    
                    <div className="income-input-wrap">
                      <span style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: '500' }}>₹</span>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="0"
                        value={incomes[occ] ?? ''}
                        onChange={(e) => setIncomes({ ...incomes, [occ]: e.target.value })}
                      />
                      <button type="button" className="icon-btn" onClick={() => handleRemoveOccupation(occ)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button type="button" className="add-btn-outline" onClick={handleAddOccupation}>
                <Plus size={16} /> Add new income source
              </button>
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
