import api from './api';

export const citizenService = {
  me: () => api.get('/citizens/me'),
  updateMe: (formData) => api.put('/citizens/me', formData),
  documents: () => api.get('/citizens/me/documents'),
  uploadDocuments: (formData) => api.post('/citizens/me/documents', formData),
};
