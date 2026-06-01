import { Link } from 'react-router-dom';
import { Briefcase } from 'lucide-react';

export function IncomeSources({ incomes }) {
  return (
    <section>
      <h2 className="section-title">Income Sources</h2>
      {incomes.length > 0 ? (
        <div className="income-sources-list">
          {incomes.map((inc, i) => (
            <div key={i} className="income-source-item">
              <div className="income-source-left">
                <div className="income-icon">
                  <Briefcase size={20} />
                </div>
                <span className="income-name">{inc.occupation}</span>
              </div>
              <div className="income-amount-wrap" style={{ textAlign: 'right' }}>
                <div className="income-amount">₹{Number(inc.income).toLocaleString()}</div>
                <div className="income-freq" style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                  {inc.frequency === 'daily' ? 'per day' : inc.frequency === 'weekly' ? 'per week' : 'per month'}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Briefcase size={24} style={{ marginBottom: '8px' }} />
          <p>No income sources added yet.</p>
          <Link to="/profile" style={{ color: 'var(--accent-1)', fontSize: '14px', marginTop: '8px' }}>Add one in Settings</Link>
        </div>
      )}
    </section>
  );
}
