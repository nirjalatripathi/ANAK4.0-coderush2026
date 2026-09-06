import api from './api';

export const donationService = {
  list: (params) => api.get('/donations', { params }),
  pledge: (payload) => api.post('/donations', payload),
  updateStatus: (id, status) => api.put(`/donations/${id}/status`, { status }),
  mine: () => api.get('/donations', { params: { mine: 'true' } }),
  receive: (id, payload) => api.put(`/donations/${id}/receive`, payload),
  deliveries: (params) => api.get('/donations/deliveries', { params }),
};
