import api from './api';

export const disasterService = {
  list: () => api.get('/disasters'),
  adminList: () => api.get('/admin/disasters'),
  active: () => api.get('/disasters/active'),
  details: (id) => api.get(`/disasters/${id}`),
  create: (payload) => api.post('/disasters', payload),
  update: (id, payload) => api.put(`/disasters/${id}`, payload),
};
