import api from './api';

export const emergencyService = {
  create: (payload) => api.post('/emergencies', payload),
  list: (params) => api.get('/emergencies', { params }),
  update: (id, payload) => api.put(`/emergencies/${id}`, payload),
};
