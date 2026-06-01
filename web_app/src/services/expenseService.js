import api from './api';

export const expenseService = {
  createExpense: async (expenseData) => {
    // Map UI structure to backend structure
    const payload = {
      transaction_type: 'expense',
      amount: expenseData.amount,
      category: expenseData.category,
      description: expenseData.name,
      source: expenseData.payment_method, // online or cash
      transaction_date: expenseData.timestamp,
    };
    const res = await api.post('/transactions/', payload);
    return res.data;
  },

  getExpenses: async () => {
    const res = await api.get('/transactions/');
    const all = res.data || [];
    // Transform back to UI structure
    return all.filter(t => t.transaction_type === 'expense').map(t => ({
      id: t.id,
      name: t.description || 'Unknown',
      category: t.category,
      amount: t.amount,
      type: 'debit',
      payment_method: t.source || 'online',
      timestamp: t.transaction_date,
    }));
  },

  deleteExpense: async (id) => {
    const res = await api.delete(`/transactions/${id}`);
    return res.data;
  },
};

export const incomeService = {
  createIncome: async (data) => {
    let desc = data.name;
    if (data.note) desc += ` - ${data.note}`;
    const payload = {
      transaction_type: 'income',
      amount: data.amount,
      category: data.category,
      description: desc,
      source: data.payment_method,
      transaction_date: data.timestamp,
    };
    const res = await api.post('/transactions/', payload);
    return res.data;
  },

  getIncomes: async () => {
    const res = await api.get('/transactions/');
    const all = res.data || [];
    return all.filter(t => t.transaction_type === 'income').map(t => {
      // Try to parse out note if embedded
      let name = t.description || 'Unknown';
      let note = '';
      if (name.includes(' - ')) {
        const parts = name.split(' - ');
        name = parts[0];
        note = parts.slice(1).join(' - ');
      }
      return {
        id: t.id,
        name,
        note,
        category: t.category,
        amount: t.amount,
        type: 'credit',
        payment_method: t.source || 'online',
        timestamp: t.transaction_date,
      };
    });
  },
};

// Default income source categories
export const DEFAULT_INCOME_CATEGORIES = [
  { id: 'bonus',      label: 'Bonus',         emoji: '🎁' },
  { id: 'tip',        label: 'Tip',           emoji: '💰' },
  { id: 'referral',   label: 'Referral',      emoji: '🔗' },
  { id: 'freelance',  label: 'Freelance Gig', emoji: '💻' },
  { id: 'pettycash',  label: 'Petty Cash',    emoji: '🪙' },
  { id: 'cashback',   label: 'Cashback',      emoji: '↩️' },
  { id: 'gift',       label: 'Gift',          emoji: '🎀' },
  { id: 'rental',     label: 'Rental',        emoji: '🏠' },
  { id: 'dividend',   label: 'Dividend',      emoji: '📈' },
  { id: 'other',      label: 'Other',         emoji: '📦' },
];

// Default expense categories
export const DEFAULT_CATEGORIES = [
  { id: 'food',        label: 'Food & Drinks',    emoji: '🍔' },
  { id: 'transport',   label: 'Transport',         emoji: '🚗' },
  { id: 'shopping',    label: 'Shopping',          emoji: '🛍️' },
  { id: 'health',      label: 'Health',            emoji: '💊' },
  { id: 'utilities',   label: 'Bills & Utilities', emoji: '💡' },
  { id: 'rent',        label: 'Rent',              emoji: '🏠' },
  { id: 'fuel',        label: 'Fuel',              emoji: '⛽' },
  { id: 'entertainment', label: 'Entertainment',   emoji: '🎬' },
  { id: 'education',   label: 'Education',         emoji: '📚' },
  { id: 'other',       label: 'Other',             emoji: '📦' },
];

// Persist custom categories in localStorage
export const getCustomCategories = () => {
  try {
    return JSON.parse(localStorage.getItem('gg_custom_categories') || '[]');
  } catch {
    return [];
  }
};

export const saveCustomCategory = (category) => {
  const existing = getCustomCategories();
  const updated = [...existing, category];
  localStorage.setItem('gg_custom_categories', JSON.stringify(updated));
  return updated;
};
