import api from './api';

export const householdService = {
  me: () => api.get('/households/me'),
  create: (payload) => api.post('/households', payload),
  update: (payload) => api.put('/households/me', payload),
  addMember: (payload) => api.post('/households/members', payload),
  removeMember: (payload) => api.delete('/households/members', { data: payload }),
};
