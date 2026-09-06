import api from './api';

export const unregisteredService = {
  list: (params) => api.get('/unregistered', { params }),
  details: (id) => api.get(`/unregistered/${id}`),
  create: (formData) => api.post('/unregistered', formData),
  matchCitizen: (id, payload) => api.put(`/unregistered/${id}/match-citizen`, payload),
  matchHousehold: (id, payload) => api.put(`/unregistered/${id}/match-household`, payload),
  verify: (id, payload) => api.put(`/unregistered/${id}/verify`, payload),
  convert: (id, payload) => api.post(`/unregistered/${id}/convert`, payload),
};
