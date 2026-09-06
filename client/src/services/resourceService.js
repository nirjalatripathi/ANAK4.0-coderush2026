import api from './api';

export const resourceService = {
  list: (params) => api.get('/resources', { params }),
  create: (payload) => api.post('/resources', payload),
  update: (id, payload) => api.put(`/resources/${id}`, payload),
  warehouses: () => api.get('/resources/warehouses'),
  governments: () => api.get('/resources/governments'),
  readiness: () => api.get('/resources/readiness'),
};
