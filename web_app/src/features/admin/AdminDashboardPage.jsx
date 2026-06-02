import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import logoImage from '../../assets/logo.png';
import '../dashboard/Home.css';
import { Shield, ChevronLeft, ChevronRight, AlertTriangle, Sparkles } from 'lucide-react';

export default function AdminDashboardPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination State
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;
  
  // In a real app we'd fetch the exact count from backend, but for this demo 
  // we'll just disable 'Next' if we got fewer items than PAGE_SIZE.
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const skip = (page - 1) * PAGE_SIZE;
      const data = await adminService.getUsers(skip, PAGE_SIZE);
      setUsers(data);
      setHasMore(data.length === PAGE_SIZE);
    } catch (err) {
      setError('Failed to fetch users. Ensure you have the right permissions.');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => setPage(p => p + 1);
  const handlePrev = () => setPage(p => Math.max(1, p - 1));

  const handleToggleAiAccess = async (userId, currentValue) => {
    try {
      const updated = await adminService.toggleAiAccess(userId, !currentValue);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, has_ai_access: updated.has_ai_access } : u));
    } catch (err) {
      console.error('Failed to toggle AI access', err);
    }
  };

  return (
    <div className="home-layout">
      {/* ── Admin Nav ── */}
      <header className="home-nav" role="banner">
        <div className="nav-container">
          <Link to="/home" className="auth-brand" aria-label="GigToGeek home">
            <img src={logoImage} alt="GigToGeek Logo" className="brand-logo-img" />
            <span className="brand-name">GigToGeek</span>
            <span style={{ marginLeft: '12px', fontSize: '10px', background: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)', padding: '4px 8px', borderRadius: '12px', fontWeight: 700, textTransform: 'uppercase' }}>
              Admin Mode
            </span>
          </Link>

          <nav className="nav-links" aria-label="Main navigation">
            <Link to="/admin" className="nav-link nav-link--active">Users</Link>
            <Link to="/admin/profile" className="nav-link">Settings</Link>
          </nav>
        </div>
      </header>

      <main className="home-main">
        <section className="home-header-section" style={{ marginBottom: '24px' }}>
          <div>
            <h1 className="greeting-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={24} style={{ color: 'var(--danger)' }} /> Platform Users
            </h1>
            <p className="greeting-sub">Overview of all registered gig workers and their financial health.</p>
          </div>
        </section>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '24px' }}>
            <AlertTriangle size={16} /> {error}
          </div>
        )}

        <div className="chart-card" style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '16px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>User</th>
                  <th style={{ padding: '16px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Income</th>
                  <th style={{ padding: '16px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Balance</th>
                  <th style={{ padding: '16px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Logged Exp (MTD)</th>
                  <th style={{ padding: '16px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Fixed Needs</th>
                  <th style={{ padding: '16px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '16px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>AI Access</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading users...</td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>No users found.</td>
                  </tr>
                ) : (
                  users.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.full_name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{u.email}</div>
                      </td>
                      <td style={{ padding: '16px', color: 'var(--success)', fontWeight: 500 }}>
                        ₹{(u.total_monthly_income || 0).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '16px', fontWeight: 500, color: 'var(--text-primary)' }}>
                        ₹{(u.current_balance || 0).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '16px', color: 'var(--danger)', fontWeight: 500 }}>
                        ₹{(u.logged_expenses_mtd || 0).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '16px', color: 'var(--danger)', opacity: 0.8 }}>
                        ₹{(u.fixed_expenses_total || 0).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase',
                          background: u.is_active ? 'rgba(52, 211, 153, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: u.is_active ? 'var(--success)' : 'var(--danger)'
                        }}>
                          {u.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <button
                          onClick={() => handleToggleAiAccess(u.id, u.has_ai_access)}
                          title={u.has_ai_access ? 'Revoke AI Access' : 'Grant AI Access'}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '6px 12px', borderRadius: '8px', border: 'none',
                            cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                            background: u.has_ai_access ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255,255,255,0.04)',
                            color: u.has_ai_access ? '#a78bfa' : 'var(--text-muted)',
                            transition: 'all 0.2s',
                          }}
                        >
                          <Sparkles size={13} />
                          {u.has_ai_access ? 'Enabled' : 'Disabled'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          <div style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Page {page}</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={handlePrev} 
                disabled={page === 1 || loading}
                style={{ padding: '8px 12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: 'none', borderRadius: '8px', cursor: (page === 1 || loading) ? 'not-allowed' : 'pointer', opacity: (page === 1 || loading) ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <button 
                onClick={handleNext} 
                disabled={!hasMore || loading}
                style={{ padding: '8px 12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: 'none', borderRadius: '8px', cursor: (!hasMore || loading) ? 'not-allowed' : 'pointer', opacity: (!hasMore || loading) ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
