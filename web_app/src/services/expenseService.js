import api from './api';

export const expenseService = {
  createExpense: async (expenseData) => {
    const res = await api.post('/expenses/', expenseData);
    return res.data;
  },

  getExpenses: async () => {
    const res = await api.get('/expenses/');
    return res.data;
  },

  deleteExpense: async (id) => {
    const res = await api.delete(`/expenses/${id}`);
    return res.data;
  },
};

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
