import api from './api';

export const chatService = {
  sendMessage: async (message) => {
    const res = await api.post('/chat/message', { message });
    return res.data; // { reply: "..." }
  },
};
