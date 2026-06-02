import api from './api';

export const adminService = {
  getUsers: async (skip = 0, limit = 50) => {
    const res = await api.get(`/auth/admin/users?skip=${skip}&limit=${limit}`);
    return res.data;
  },

  toggleAiAccess: async (userId, hasAccess) => {
    const res = await api.patch(`/auth/admin/users/${userId}/ai-access`, {
      has_ai_access: hasAccess,
    });
    return res.data;
  },
};
