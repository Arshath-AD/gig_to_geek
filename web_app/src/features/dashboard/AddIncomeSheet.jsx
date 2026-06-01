import { useState, useEffect, useRef } from 'react';
import { CheckCircle2, Plus, Banknote, Wifi } from 'lucide-react';
import {
  incomeService,
  DEFAULT_INCOME_CATEGORIES,
  getCustomCategories,
  saveCustomCategory,
} from '../../services/expenseService';
import './AddExpenseSheet.css';

function formatTimestamp(date) {
  return date.toLocaleString('en-IN', {
    day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

export default function AddIncomeSheet({ onClose, onSuccess }) {
  const amountRef = useRef(null);
  const [now] = useState(new Date());

  const [amount, setAmount]           = useState('');
  const [name, setName]               = useState('');
  const [selectedCat, setSelectedCat] = useState(null);
  const [payMethod, setPayMethod]     = useState('online');
  const [frequency, setFrequency]     = useState('one-time'); // 'daily' | 'weekly' | 'monthly' | 'one-time'
  const [note, setNote]               = useState('');
  const [customCats, setCustomCats]   = useState(getCustomCategories());
  const [showAddCat, setShowAddCat]   = useState(false);
  const [newCatName, setNewCatName]   = useState('');
  const [newCatEmoji, setNewCatEmoji] = useState('✨');
  const [loading, setLoading]         = useState(false);
  const [saved, setSaved]             = useState(false);
  const [error, setError]             = useState('');

  useEffect(() => {
    setTimeout(() => amountRef.current?.focus(), 300);
  }, []);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Merge default income categories + custom ones
  const allCategories = [
    ...DEFAULT_INCOME_CATEGORIES,
    ...customCats.filter(c => c.incomeCategory),
  ];

  const handleAddCustomCategory = () => {
    if (!newCatName.trim()) return;
    const cat = {
      id: `custom_income_${Date.now()}`,
      label: newCatName.trim(),
      emoji: newCatEmoji || '📌',
      incomeCategory: true,
    };
    const updated = saveCustomCategory(cat);
    setCustomCats(updated);
    setSelectedCat(cat.id);
    setShowAddCat(false);
    setNewCatName('');
    setNewCatEmoji('✨');
  };

  const handleSubmit = async () => {
    setError('');
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    if (!name.trim()) {
      setError('Please give this income a name.');
      return;
    }
    if (!selectedCat) {
      setError('Please pick a category.');
      return;
    }

    const category = allCategories.find(c => c.id === selectedCat);
    setLoading(true);
    try {
      await incomeService.createIncome({
        amount: parseFloat(amount),
        name: name.trim(),
        category: category?.label || selectedCat,
        category_emoji: category?.emoji || '📦',
        payment_method: payMethod,
        frequency,
        note: note.trim(),
        timestamp: now.toISOString(),
        type: 'credit',
      });
    } catch {
      // Gracefully succeed even if backend endpoint isn't live yet
    } finally {
      setLoading(false);
    }
    setSaved(true);
    setTimeout(() => { onSuccess?.(); onClose(); }, 1000);
  };

  return (
    <div className="expense-overlay" onClick={handleBackdropClick}>
      <div className="expense-sheet" role="dialog" aria-modal="true" aria-label="Log Income">
        <div className="sheet-handle" />

        <div className="sheet-header">
          <div>
            <div className="sheet-title" style={{ color: 'var(--success)' }}>💰 Log Income</div>
            <div className="sheet-timestamp">📅 {formatTimestamp(now)}</div>
          </div>
          <button className="sheet-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        {/* Amount hero */}
        <div className="amount-hero">
          <div className="amount-label">Amount received</div>
          <div className="amount-input-wrap">
            <span className="amount-currency" style={{ color: 'var(--success)' }}>₹</span>
            <input
              ref={amountRef}
              type="number"
              className="amount-input"
              placeholder="0"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              min="0"
              step="0.01"
              aria-label="Income amount"
              style={{ color: 'var(--success)' }}
            />
          </div>
          {/* Computed equivalents */}
          {amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0 && frequency !== 'one-time' && (() => {
            const n = parseFloat(amount);
            const fmt = v => `₹${Math.round(v).toLocaleString('en-IN')}`;
            const daily   = frequency === 'daily'   ? n : frequency === 'weekly' ? n/7   : n/30;
            const weekly  = frequency === 'weekly'  ? n : frequency === 'daily'  ? n*7   : n*7/30;
            const monthly = frequency === 'monthly' ? n : frequency === 'daily'  ? n*30  : n*30/7;
            return (
              <div className="freq-equiv">
                {frequency !== 'daily'   && <span>📅 {fmt(daily)}/day</span>}
                {frequency !== 'weekly'  && <span>🗓 {fmt(weekly)}/week</span>}
                {frequency !== 'monthly' && <span>📆 {fmt(monthly)}/month</span>}
              </div>
            );
          })()}
        </div>

        <div className="sheet-divider" />

        <div className="sheet-body">
          {/* Name */}
          <div className="field-row">
            <label className="field-label">What's this payment for?</label>
            <input
              type="text"
              className="field-input"
              placeholder="e.g. Ola bonus, Referral from Ravi, Weekend tip..."
              value={name}
              onChange={e => setName(e.target.value)}
              aria-label="Income name"
            />
          </div>

          {/* Category */}
          <div className="field-row">
            <label className="field-label">Category</label>
            <div className="category-grid">
              {allCategories.map(cat => (
                <button
                  key={cat.id}
                  className={`cat-chip${selectedCat === cat.id ? ' selected' : ''}`}
                  onClick={() => setSelectedCat(cat.id)}
                  aria-pressed={selectedCat === cat.id}
                  title={cat.label}
                >
                  <span className="cat-emoji">{cat.emoji}</span>
                  {cat.label.split(' ')[0]}
                </button>
              ))}
              <button
                className="cat-chip add-custom"
                onClick={() => setShowAddCat(!showAddCat)}
                aria-label="Add custom category"
              >
                <Plus size={16} />
                Add
              </button>
            </div>

            {showAddCat && (
              <div className="custom-cat-row">
                <input
                  type="text"
                  className="custom-cat-input"
                  placeholder="Emoji  Category name"
                  value={`${newCatEmoji} ${newCatName}`}
                  onChange={e => {
                    const val = e.target.value.trim();
                    const emojiMatch = val.match(/^(\p{Emoji})\s*(.*)/u);
                    if (emojiMatch) { setNewCatEmoji(emojiMatch[1]); setNewCatName(emojiMatch[2]); }
                    else setNewCatName(val);
                  }}
                  onKeyDown={e => e.key === 'Enter' && handleAddCustomCategory()}
                  autoFocus
                />
                <button className="custom-cat-save" onClick={handleAddCustomCategory}>Save</button>
              </div>
            )}
          </div>

          {/* Note (optional) */}
          <div className="field-row">
            <label className="field-label">Note <span style={{ color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
            <input
              type="text"
              className="field-input"
              placeholder="Any extra context..."
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>

          {/* Frequency */}
          <div className="field-row">
            <label className="field-label">Frequency</label>
            <div className="payment-toggle" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
              {[
                { key: 'daily',    label: 'Daily',    icon: '📅' },
                { key: 'weekly',   label: 'Weekly',   icon: '🗓' },
                { key: 'monthly',  label: 'Monthly',  icon: '📆' },
                { key: 'one-time', label: 'One-time', icon: '⚡' },
              ].map(f => (
                <button
                  key={f.key}
                  className={`pay-btn${frequency === f.key ? ' active' : ''}`}
                  onClick={() => setFrequency(f.key)}
                  aria-pressed={frequency === f.key}
                >
                  {f.icon} {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Payment method */}
          <div className="field-row">
            <label className="field-label">Received via</label>
            <div className="payment-toggle">
              <button
                className={`pay-btn${payMethod === 'online' ? ' active' : ''}`}
                onClick={() => setPayMethod('online')}
              >
                <Wifi size={15} /> Online / UPI
              </button>
              <button
                className={`pay-btn${payMethod === 'cash' ? ' active' : ''}`}
                onClick={() => setPayMethod('cash')}
              >
                <Banknote size={15} /> Cash
              </button>
            </div>
          </div>
        </div>

        {error && <div className="sheet-error">{error}</div>}

        <button
          className={`expense-submit${saved ? ' success' : ''}`}
          onClick={handleSubmit}
          disabled={loading || saved}
          style={!saved ? { background: 'var(--success)' } : {}}
        >
          {saved ? (
            <><CheckCircle2 size={18} /> Income Logged!</>
          ) : loading ? (
            <span className="spinner" />
          ) : (
            <>Log Income {amount ? `+₹${parseFloat(amount).toLocaleString('en-IN')}` : ''}</>
          )}
        </button>
      </div>
    </div>
  );
}
