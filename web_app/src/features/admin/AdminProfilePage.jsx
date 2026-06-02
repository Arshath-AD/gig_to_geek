import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, User, LogOut, Mail, Calendar } from 'lucide-react';
import logoImage from '../../assets/logo.png';
import '../dashboard/Home.css';

export default function AdminProfilePage() {
  const { user, logout } = useAuth();
  
  const formattedDate = user?.created_at 
    ? new Date(user.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'System Initialisation';

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
            <Link to="/admin" className="nav-link">Users</Link>
            <Link to="/admin/profile" className="nav-link nav-link--active">Settings</Link>
          </nav>
        </div>
      </header>

      <main className="profile-main">
        <div className="profile-container">
          <section className="home-header-section" style={{ marginBottom: '24px' }}>
            <div>
              <h1 className="greeting-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={24} style={{ color: 'var(--danger)' }} /> Administrator Settings
              </h1>
              <p className="greeting-sub">Manage your admin access and security.</p>
            </div>
          </section>

          <div className="profile-section" style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 700 }}>
              {(user?.full_name?.charAt(0) ?? 'A').toUpperCase()}
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)' }}>{user?.full_name || 'Admin'}</h2>
              <span style={{ fontSize: '12px', color: 'var(--danger)', fontWeight: 600, textTransform: 'uppercase' }}>Superuser Account</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <User size={18} style={{ color: 'var(--text-muted)' }} />
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Full Name</div>
                <div style={{ fontSize: '14px', color: 'var(--text-primary)', marginTop: '2px' }}>{user?.full_name}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <Mail size={18} style={{ color: 'var(--text-muted)' }} />
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Email Address</div>
                <div style={{ fontSize: '14px', color: 'var(--text-primary)', marginTop: '2px' }}>{user?.email}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <Calendar size={18} style={{ color: 'var(--text-muted)' }} />
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Admin Since</div>
                <div style={{ fontSize: '14px', color: 'var(--text-primary)', marginTop: '2px' }}>{formattedDate}</div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
            <button 
              onClick={logout} 
              className="btn-primary" 
              style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <LogOut size={16} /> Sign out of Admin Panel
            </button>
          </div>

        </div>
        </div>
      </main>
    </div>
  );
}
