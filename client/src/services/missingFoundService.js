import api from './api';

export const missingFoundService = {
  list: (params) => api.get('/missing-found', { params }),
};
