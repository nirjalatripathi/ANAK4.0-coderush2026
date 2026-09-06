import api from './api';

export const reliefService = {
  needs: (params) => api.get('/relief/needs', { params }),
  match: (params) => api.get('/relief/match', { params }),
  supplyDemand: () => api.get('/relief/supply-demand'),
  commandCenter: () => api.get('/admin/command-center'),
  requests: () => api.get('/relief/requests'),
  createRequest: (payload) => api.post('/relief/requests', payload),
  verifyRequest: (id) => api.put(`/relief/requests/${id}/verify`),
  allocations: () => api.get('/relief/allocations'),
  recommendAllocation: (payload) => api.post('/relief/allocations', payload),
  confirmAllocation: (id, payload) => api.put(`/relief/allocations/${id}/confirm`, payload),
  shipments: (params) => api.get('/relief/shipments', { params }),
  createShipment: (payload) => api.post('/relief/shipments', payload),
  dispatchShipment: (id) => api.put(`/relief/shipments/${id}/dispatch`),
  receiveShipment: (id, payload) => api.put(`/relief/shipments/${id}/receive`, payload),
  distribute: (payload) => api.post('/relief/distributions', payload),
  distributions: (params) => api.get('/relief/distributions', { params }),
};
