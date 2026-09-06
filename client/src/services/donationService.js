import api from './api';

export const donationService = {
  list: (params) => api.get('/donations', { params }),
  details: (id) => api.get(`/donations/${id}`),
  mine: () => api.get('/donations', { params: { mine: 'true' } }),
  recommend: (params) => api.get('/donations/recommend', { params }),
  donateMoney: (payload) => api.post('/donations/money', payload),
  donatePhysical: (payload) => api.post('/donations/physical', payload),
  pledge: (payload) => api.post('/donations', payload),
  updateStatus: (id, status) => api.put(`/donations/${id}/status`, { status }),
  receive: (id, payload) => api.put(`/donations/${id}/receive`, payload),
  deliveries: (params) => api.get('/donations/deliveries', { params }),
  verifyPayment: (id) => api.put(`/donations/${id}/verify-payment`),
  allocate: (id, payload) => api.post(`/donations/${id}/allocate`, payload),
  recordImpact: (id, payload) => api.post(`/donations/${id}/impact`, payload),
};
