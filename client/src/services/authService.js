import api from './api';

export const authService = {
  register: (payload) => api.post('/auth/register', payload),
  registerDonor: (payload) => api.post('/auth/register-donor', payload),
  login: (payload) => api.post('/auth/login', payload),
  adminLogin: (payload) => api.post('/auth/admin/login', payload),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  forgotPassword: (payload) => api.post('/auth/forgot-password', payload),
};
