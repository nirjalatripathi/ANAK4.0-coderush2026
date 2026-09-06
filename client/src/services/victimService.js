import api from './api';

export const victimService = {
  list: () => api.get('/victims'),
  details: (id) => api.get(`/victims/${id}`),
  apply: (payload) => api.post('/victims/apply', payload),
  mine: () => api.get('/victims/mine'),
  adminList: (params) => api.get('/admin/victims', { params }),
  review: (id, payload) => api.put(`/admin/victims/${id}/review`, payload),
};

export const khaltiService = {
  initiate: (payload) => api.post('/donations/khalti/initiate', payload),
  verify: (params) => api.post('/donations/khalti/verify', params),
  status: (params) => api.get('/donations/khalti/status', { params }),
  confirmSandbox: (params) => api.post('/donations/khalti/sandbox-confirm', params),
};

export function npr(value) {
  return `NPR ${Number(value || 0).toLocaleString('en-NP', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function rememberKhaltiCheckout(payment, meta = {}) {
  if (meta.donationId) sessionStorage.setItem('rahat_khalti_donation', meta.donationId);
  if (meta.amountNPR != null) sessionStorage.setItem('rahat_khalti_amount', String(meta.amountNPR));
  if (meta.purpose) sessionStorage.setItem('rahat_khalti_purpose', meta.purpose);
  if (payment?.pidx) sessionStorage.setItem('rahat_khalti_pidx', payment.pidx);
  if (payment?.paymentUrl) sessionStorage.setItem('rahat_khalti_url', payment.paymentUrl);
  sessionStorage.setItem('rahat_khalti_sandbox', payment?.sandboxFallback ? 'true' : 'false');
}

export function continueToKhalti(payment, meta = {}) {
  rememberKhaltiCheckout(payment, meta);
  if (!payment?.paymentUrl) throw new Error('Khalti did not return a checkout URL.');
  window.location.assign(payment.paymentUrl);
}
