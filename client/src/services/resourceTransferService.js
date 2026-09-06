import api from './api';

export const resourceTransferService = {
  recommendations: () => api.get('/resource-transfers/recommendations'),
  list: (params) => api.get('/resource-transfers', { params }),
  create: (payload) => api.post('/resource-transfers', payload),
  update: (id, status) => api.put(`/resource-transfers/${id}`, { status }),
};
