import api from './api';

export const notificationService = {
  list: (params) => api.get('/notifications', { params }),
  read: (id) => api.put(`/notifications/${id}/read`),
  readAll: () => api.put('/notifications/read-all'),
  announce: (payload) => api.post('/notifications/announce', payload),
};

export const publicService = {
  stats: () => api.get('/public/stats'),
  contact: (payload) => api.post('/public/contact', payload),
  constants: () => api.get('/public/constants'),
};

export const adminService = {
  dashboard: () => api.get('/admin/dashboard'),
  settings: () => api.get('/admin/settings'),
  updateSettings: (payload) => api.put('/admin/settings', payload),
  reports: () => api.get('/admin/reports'),
  citizens: (params) => api.get('/admin/citizens', { params }),
  citizen: (id) => api.get(`/admin/citizens/${id}`),
  updateCitizen: (id, payload) => api.put(`/admin/citizens/${id}`, payload),
  verification: () => api.get('/admin/verification'),
  decide: (id, payload) => api.put(`/admin/verification/${id}`, payload),
  households: (params) => api.get('/admin/households', { params }),
  officials: () => api.get('/admin/officials'),
  createOfficial: (payload) => api.post('/admin/officials', payload),
  updateOfficial: (id, payload) => api.put(`/admin/officials/${id}`, payload),
  auditLogs: (params) => api.get('/admin/audit-logs', { params }),
  documentUrl: (docId) => `/api/admin/documents/${docId}`,
};
