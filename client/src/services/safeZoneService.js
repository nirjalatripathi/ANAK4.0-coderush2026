import api from './api';

export const safeZoneService = {
  list: (params) => api.get('/safe-zones', { params }),
  map: () => api.get('/safe-zones/map'),
  details: (id) => api.get(`/safe-zones/${id}`),
  create: (payload) => api.post('/safe-zones', payload),
  declare: (id, payload) => api.put(`/safe-zones/${id}/declare`, payload),
  checkIn: (id, payload) => api.post(`/safe-zones/${id}/check-in`, payload),
  transfer: (payload) => api.post('/safe-zones/transfer', payload),
};
