import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Onboarding.css';

// ── Gig options ───────────────────────────────────────────────
const GIG_OPTIONS = [
  { id: 'swiggy',     label: 'Swiggy Delivery',   icon: '🛵' },
  { id: 'zomato',     label: 'Zomato Delivery',    icon: '🍕' },
  { id: 'uber',       label: 'Uber Driver',        icon: '🚗' },
  { id: 'rapido',     label: 'Rapido Rider',       icon: '🏍️' },
  { id: 'freelancer', label: 'Freelancer',         icon: '💻' },
  { id: 'parttime',   label: 'Part-Time Job',      icon: '💼' },
  { id: 'student',    label: 'Student Gig Worker', icon: '🎓' },
  { id: 'other',      label: 'Other',              icon: '✨' },
];

const STEPS = ['Work', 'Income', 'Balance', 'Goal', 'Review'];

// ── Helpers ───────────────────────────────────────────────────
const fmt = (n) => n ? '₹' + Number(n).toLocaleString('en-IN') : '—';

function getLabel(id, custom) {
  if (id === 'other') return custom?.trim() || 'Other Work';
  return GIG_OPTIONS.find(o => o.id === id)?.label ?? id;
}

function getIcon(label) {
  return GIG_OPTIONS.find(o => o.label === label)?.icon ?? '💰';
}

// ── Progress bar ──────────────────────────────────────────────
function ProgressBar({ step }) {
  return (
    <div className="ob-progress-wrap">
      <div className="ob-progress-track">
        <div
          className="ob-progress-fill"
          style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
        />
      </div>
      <div className="ob-step-dots">
        {STEPS.map((s, i) => (
          <div key={s} className={`ob-dot ${i <= step ? 'ob-dot--done' : ''} ${i === step ? 'ob-dot--active' : ''}`}>
            <span className="ob-dot-num">{i < step ? '✓' : i + 1}</span>
            <span className="ob-dot-label">{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── STEP 1: Occupation ────────────────────────────────────────
function StepWork({ selectedIds, custom, onToggle, onCustom }) {
  const hasOther = selectedIds.includes('other');
  return (
    <div className="ob-body">
      <div className="ob-hero">
        <div className="ob-hero-icon">💼</div>
        <h2 className="ob-title">What work do you do?</h2>
        <p className="ob-sub">Select all that apply — you can pick multiple</p>
      </div>

      <div className="chip-grid">
        {GIG_OPTIONS.map(opt => {
          const sel = selectedIds.includes(opt.id);
          return (
            <button
              key={opt.id}
              type="button"
              id={`chip-${opt.id}`}
              className={`gig-chip ${sel ? 'gig-chip--sel' : ''}`}
              onClick={() => onToggle(opt.id)}
              aria-pressed={sel}
            >
              <span className="chip-ico">{opt.icon}</span>
              <span className="chip-txt">{opt.label}</span>
              {sel && <span className="chip-chk">✓</span>}
            </button>
          );
        })}
      </div>

      {hasOther && (
        <div className="custom-wrap form-group">
          <label className="form-label" htmlFor="custom-occ">What do you do? ✍️</label>
          <input
            id="custom-occ"
            type="text"
            className="form-input"
            placeholder="e.g. Music Teacher, Electrician…"
            value={custom}
            onChange={e => onCustom(e.target.value)}
            autoFocus
          />
        </div>
      )}
    </div>
  );
}

// ── STEP 2: Income per occupation ─────────────────────────────
function StepIncome({ selectedIds, custom, incomes, onIncome }) {
  const labels = selectedIds.map(id => getLabel(id, custom));
  const total = labels.reduce((s, l) => s + (parseFloat(incomes[l]) || 0), 0);

  return (
    <div className="ob-body">
      <div className="ob-hero">
        <div className="ob-hero-icon">💸</div>
        <h2 className="ob-title">Monthly income per gig</h2>
        <p className="ob-sub">Enter your average monthly earnings from each source</p>
      </div>

      <div className="income-list">
        {labels.map(label => (
          <div key={label} className="income-row glass-card">
            <div className="income-row-header">
              <span className="income-ico">{getIcon(label)}</span>
              <span className="income-name">{label}</span>
            </div>
            <div className="currency-wrap">
              <span className="currency-sym">₹</span>
              <input
                id={`income-${label}`}
                type="number"
                min="0"
                step="500"
                className="form-input currency-input"
                placeholder="0"
                value={incomes[label] ?? ''}
                onChange={e => onIncome(label, e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>

      {total > 0 && (
        <div className="total-pill">
          <span>💰 Total Monthly Income</span>
          <strong>{fmt(total)}</strong>
        </div>
      )}
    </div>
  );
}

// ── STEP 3: Current balance ───────────────────────────────────
function StepBalance({ balance, onChange }) {
  return (
    <div className="ob-body ob-body--center">
      <div className="ob-hero">
        <div className="ob-hero-icon">🏦</div>
        <h2 className="ob-title">Current available balance</h2>
        <p className="ob-sub">Your approximate savings or bank balance right now</p>
      </div>

      <div className="big-field">
        <span className="big-sym">₹</span>
        <input
          id="balance-input"
          type="number"
          min="0"
          step="100"
          className="big-input"
          placeholder="0"
          value={balance}
          onChange={e => onChange(e.target.value)}
          autoFocus
        />
      </div>

      {balance && (
        <p className="field-confirm">
          You currently have <strong className="accent">{fmt(balance)}</strong> available
        </p>
      )}
    </div>
  );
}

// ── STEP 4: Savings goal ──────────────────────────────────────
function StepGoal({ goal, onChange }) {
  const monthly = parseFloat(goal) || 0;
  const weekly  = monthly ? Math.round(monthly / 4)  : 0;
  const daily   = monthly ? Math.round(monthly / 30) : 0;

  return (
    <div className="ob-body">
      <div className="ob-hero">
        <div className="ob-hero-icon">🎯</div>
        <h2 className="ob-title">Set your savings goal</h2>
        <p className="ob-sub">How much would you like to save every month?</p>
      </div>

      <div className="big-field">
        <span className="big-sym">₹</span>
        <input
          id="goal-input"
          type="number"
          min="0"
          step="100"
          className="big-input"
          placeholder="0"
          value={goal}
          onChange={e => onChange(e.target.value)}
          autoFocus
        />
        <span className="big-unit">/mo</span>
      </div>

      {monthly > 0 && (
        <div className="breakdown-grid">
          <div className="breakdown-card">
            <span className="bd-ico">📅</span>
            <span className="bd-label">Weekly Target</span>
            <span className="bd-val">{fmt(weekly)}</span>
            <span className="bd-note">÷ 4 weeks</span>
          </div>
          <div className="breakdown-card">
            <span className="bd-ico">☀️</span>
            <span className="bd-label">Daily Target</span>
            <span className="bd-val">{fmt(daily)}</span>
            <span className="bd-note">÷ 30 days</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── STEP 5: Review ────────────────────────────────────────────
function StepReview({ selectedIds, custom, incomes, balance, monthlyGoal, onEdit }) {
  const labels = selectedIds.map(id => getLabel(id, custom));
  const total  = labels.reduce((s, l) => s + (parseFloat(incomes[l]) || 0), 0);
  const monthly = parseFloat(monthlyGoal) || 0;
  const weekly  = monthly ? Math.round(monthly / 4)  : 0;
  const daily   = monthly ? Math.round(monthly / 30) : 0;

  const Row = ({ label, value, step }) => (
    <div className="rv-row">
      <span className="rv-key">{label}</span>
      <div className="rv-right">
        <span className="rv-val">{value}</span>
        <button type="button" className="rv-edit" onClick={() => onEdit(step)}>Edit</button>
      </div>
    </div>
  );

  return (
    <div className="ob-body">
      <div className="ob-hero">
        <div className="ob-hero-icon">🚀</div>
        <h2 className="ob-title">Looking good!</h2>
        <p className="ob-sub">Review your profile before we get started</p>
      </div>

      <div className="review-card glass-card">
        <div className="rv-section">
          <span className="rv-section-title">💼 Work</span>
          <Row label="Occupations" value={labels.join(', ') || '—'} step={0} />
        </div>

        <div className="rv-divider" />

        <div className="rv-section">
          <span className="rv-section-title">💸 Income</span>
          {labels.map(l => (
            <Row key={l} label={l} value={fmt(incomes[l])} step={1} />
          ))}
          <div className="rv-total">
            <span>Total Monthly Income</span>
            <strong>{fmt(total)}</strong>
          </div>
        </div>

        <div className="rv-divider" />

        <div className="rv-section">
          <span className="rv-section-title">🏦 Balance</span>
          <Row label="Current Balance" value={fmt(balance)} step={2} />
        </div>

        <div className="rv-divider" />

        <div className="rv-section">
          <span className="rv-section-title">🎯 Goals</span>
          <Row label="Monthly Goal"  value={fmt(monthly)} step={3} />
          <Row label="Weekly Target" value={fmt(weekly)}  step={3} />
          <Row label="Daily Target"  value={fmt(daily)}   step={3} />
        </div>
      </div>
    </div>
  );
}

// ── Main onboarding page ──────────────────────────────────────
export default function OnboardingPage() {
  const { updateProfile } = useAuth();
  const navigate = useNavigate();

  const [step, setStep]     = useState(0);
  const [dir, setDir]       = useState('forward');
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  // Form state
  const [selectedIds, setSelectedIds] = useState([]);
  const [custom, setCustom]           = useState('');
  const [incomes, setIncomes]         = useState({});
  const [balance, setBalance]         = useState('');
  const [monthlyGoal, setMonthlyGoal] = useState('');

  // ── Helpers ─────────────────────────────────────────────────
  const labels = selectedIds.map(id => getLabel(id, custom));
  const totalIncome = labels.reduce((s, l) => s + (parseFloat(incomes[l]) || 0), 0);

  const toggleOcc = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
    setError('');
  };

  const setIncome = (label, val) => {
    setIncomes(prev => ({ ...prev, [label]: val }));
  };

  // ── Validation ───────────────────────────────────────────────
  const validate = () => {
    if (step === 0 && selectedIds.length === 0)
      return 'Please select at least one occupation.';
    if (step === 0 && selectedIds.includes('other') && !custom.trim())
      return 'Please describe your "Other" occupation.';
    if (step === 1 && totalIncome === 0)
      return 'Please enter income for at least one occupation.';
    return null;
  };

  // ── Navigation ───────────────────────────────────────────────
  const next = () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setDir('forward');
    setStep(s => s + 1);
  };

  const back = (targetStep) => {
    setError('');
    setDir('back');
    setStep(typeof targetStep === 'number' ? targetStep : step - 1);
  };

  // ── Submit ───────────────────────────────────────────────────
  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const monthly = parseFloat(monthlyGoal) || 0;
      const incomePerOcc = labels.map(l => ({ occupation: l, income: parseFloat(incomes[l]) || 0 }));

      await updateProfile({
        occupations:            labels,
        custom_occupation:      custom.trim() || null,
        income_per_occupation:  incomePerOcc,
        total_monthly_income:   totalIncome,
        monthly_income_estimate: totalIncome,
        current_balance:        parseFloat(balance) || null,
        monthly_saving_goal:    monthly || null,
        weekly_saving_goal:     monthly ? Math.round(monthly / 4)  : null,
        daily_saving_goal:      monthly ? Math.round(monthly / 30) : null,
        occupation:             labels[0] ?? null,
      });
      navigate('/home', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.detail || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────
  const isLastStep = step === STEPS.length - 1;

  return (
    <div className="ob-page">
      <div className="mesh-bg"><div className="mesh-orb" /></div>

      {/* Header */}
      <header className="ob-header">
        <div className="ob-brand">
          <div className="brand-logo"><span className="brand-icon">⚡</span></div>
          <span className="brand-name">GigToGeek</span>
        </div>
        <ProgressBar step={step} />
      </header>

      {/* Step content */}
      <main className="ob-main">
        <div className={`ob-step-wrap ob-step-wrap--${dir}`} key={step}>
          {step === 0 && (
            <StepWork
              selectedIds={selectedIds}
              custom={custom}
              onToggle={toggleOcc}
              onCustom={setCustom}
            />
          )}
          {step === 1 && (
            <StepIncome
              selectedIds={selectedIds}
              custom={custom}
              incomes={incomes}
              onIncome={setIncome}
            />
          )}
          {step === 2 && (
            <StepBalance balance={balance} onChange={setBalance} />
          )}
          {step === 3 && (
            <StepGoal goal={monthlyGoal} onChange={setMonthlyGoal} />
          )}
          {step === 4 && (
            <StepReview
              selectedIds={selectedIds}
              custom={custom}
              incomes={incomes}
              balance={balance}
              monthlyGoal={monthlyGoal}
              onEdit={back}
            />
          )}
        </div>

        {error && (
          <div role="alert" className="ob-error">
            <span>⚠</span> {error}
          </div>
        )}
      </main>

      {/* Footer nav */}
      <footer className="ob-footer">
        {step > 0 ? (
          <button type="button" id="ob-back" className="btn-ghost ob-back" onClick={() => back()}>
            ← Back
          </button>
        ) : (
          <button
            type="button"
            className="ob-skip"
            onClick={() => navigate('/home', { replace: true })}
          >
            Skip
          </button>
        )}

        {isLastStep ? (
          <button
            type="button"
            id="ob-finish"
            className="btn-primary ob-next"
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading ? <span className="spinner" /> : '🚀 Get Started'}
          </button>
        ) : (
          <button type="button" id="ob-next" className="btn-primary ob-next" onClick={next}>
            Continue →
          </button>
        )}
      </footer>
    </div>
  );
}
