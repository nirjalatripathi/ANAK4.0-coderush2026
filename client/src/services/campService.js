import api from './api';

export const campService = {
  list: (params) => api.get('/camps', { params }),
  details: (id) => api.get(`/camps/${id}`),
  population: (id) => api.get(`/camps/${id}/population`),
  create: (payload) => api.post('/camps', payload),
  update: (id, payload) => api.put(`/camps/${id}`, payload),
  myAssignment: () => api.get('/officials/me'),
  searchCitizens: (params) => api.get('/officials/search', { params }),
  getCitizen: (id) => api.get(`/officials/citizens/${id}`),
  updateStatus: (id, payload) => api.put(`/officials/citizens/${id}/status`, payload),
};
