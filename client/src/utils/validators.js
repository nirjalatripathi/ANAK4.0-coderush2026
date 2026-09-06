export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

export function isPhone(value) {
  return /^[0-9+\-\s]{7,20}$/.test(String(value || '').trim());
}

export function requiredFields(fields, values) {
  return fields.filter((field) => !String(values[field] || '').trim());
}
