export function formatNPR(value) {
  const amount = Number(value || 0);
  return `NPR ${amount.toLocaleString('en-NP', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function donationProgress(status, kind = 'Money') {
  const money = ['Pending', 'Payment Verified', 'Allocated', 'In Use', 'Impact Verified', 'Completed'];
  const physical = ['Pledged', 'Accepted', 'Dispatched', 'Received', 'Verified', 'Distributed', 'Completed'];
  const steps = kind === 'Physical' ? physical : money;
  const index = Math.max(0, steps.indexOf(status));
  return { steps, index, percent: Math.round(((index + 1) / steps.length) * 100) };
}

export function workspacePath(role) {
  if (role === 'admin') return '/admin/dashboard';
  if (role === 'local_authority' || role === 'local_admin') return '/authority/dashboard';
  if (role === 'camp_official') return '/camp/dashboard';
  if (role === 'donor') return '/donor/dashboard';
  return '/citizen/dashboard';
}

export function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-NP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-NP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function occupancy(camp) {
  if (!camp?.capacity) return 0;
  return Math.round(((camp.currentPopulation || 0) / camp.capacity) * 100);
}

export function getErrorMessage(error, fallback = 'Unable to load this information. Please try again.') {
  return error?.response?.data?.message || error?.message || fallback;
}

export function ageFromDob(dob) {
  if (!dob) return null;
  const date = new Date(dob);
  if (Number.isNaN(date.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const m = today.getMonth() - date.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < date.getDate())) age -= 1;
  return age;
}

export function documentRequirements(dob) {
  const age = ageFromDob(dob);
  if (age === null) return { age: null, items: [] };
  if (age < 16) {
    return { age, under16: true, items: ['Birth Certificate', 'Recent Photograph'] };
  }
  return { age, under16: false, items: ['Citizenship Certificate or National ID', 'Recent Photograph'] };
}

export function shortage(item) {
  return Math.max(0, (item?.required || 0) - (item?.current || 0));
}
