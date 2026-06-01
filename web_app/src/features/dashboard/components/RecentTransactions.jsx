import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

export function RecentTransactions({ transactions }) {
  return (
    <div>
      <h2 className="section-title">Recent Transactions</h2>
      <div className="overview-card" style={{ padding: transactions.length > 0 ? '8px 24px' : '32px 24px', textAlign: transactions.length === 0 ? 'center' : 'left' }}>
        {transactions.length > 0 ? (
          transactions.map(txn => (
            <div key={txn.id} className="txn-item">
              <div className="txn-left">
                <div className="txn-icon">
                  {txn.type === 'credit' ? <ArrowDownRight size={18} color="var(--success)" /> : <ArrowUpRight size={18} color="var(--text-primary)" />}
                </div>
                <div className="txn-info">
                  <h4>{txn.title}</h4>
                  <p>{txn.date}</p>
                </div>
              </div>
              <div className={`txn-amount ${txn.type === 'credit' ? 'positive' : 'negative'}`}>
                {txn.type === 'credit' ? '+' : '-'}₹{txn.amount.toLocaleString()}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
            <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '50%', marginBottom: '8px' }}>
              <ArrowUpRight size={24} color="var(--text-muted)" />
            </div>
            <h3 style={{ fontSize: '15px', color: 'var(--text-primary)', margin: 0 }}>No recent activity</h3>
            <p style={{ fontSize: '13px', margin: 0 }}>Your latest transactions will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
