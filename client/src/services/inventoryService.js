import api from './api';

export const inventoryService = {
  needs: (params) => api.get('/inventory/needs', { params }),
  list: (campId) => api.get(`/inventory/${campId}`),
  update: (campId, payload) => api.put(`/inventory/${campId}`, payload),
  refresh: (campId) => api.post(`/inventory/${campId}/refresh`),
};
