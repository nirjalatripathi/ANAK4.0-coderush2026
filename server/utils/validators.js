const { GENDERS, BLOOD_GROUPS, RELATIONSHIPS, DISASTER_TYPES } = require('./constants');

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

function isPhone(value) {
  return /^[0-9+\-\s]{7,20}$/.test(String(value || '').trim());
}

function required(fields, body) {
  const missing = fields.filter((field) => {
    const value = body[field];
    return value === undefined || value === null || String(value).trim() === '';
  });
  return missing;
}

function calculateAge(dateOfBirth) {
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age;
}

function sanitizePublicCitizen(citizen) {
  if (!citizen) return null;
  return {
    displayName: citizen.publicDisplayName || citizen.fullName,
    status: citizen.disasterStatus,
    lastVerifiedLocation: citizen.lastKnownLocation || null,
    lastUpdated: citizen.statusUpdatedAt || citizen.updatedAt,
    householdId: citizen.household?.householdId || null,
    registrationId: citizen.registrationId,
    gender: citizen.gender,
    campName: citizen.currentCamp?.name || null,
    district: citizen.currentAddress?.district || citizen.permanentAddress?.district || null,
  };
}

function stripSensitiveCitizen(citizen, { includeContact = false } = {}) {
  if (!citizen) return null;
  const data = typeof citizen.toObject === 'function' ? citizen.toObject() : { ...citizen };
  delete data.nationalId;
  delete data.citizenshipNumber;
  if (!includeContact) {
    delete data.phone;
    delete data.email;
    delete data.emergencyContact;
  }
  return data;
}

function validateGender(value) {
  return GENDERS.includes(value);
}

function validateBloodGroup(value) {
  return !value || BLOOD_GROUPS.includes(value);
}

function validateRelationship(value) {
  return RELATIONSHIPS.includes(value);
}

function validateDisasterType(value) {
  return DISASTER_TYPES.includes(value);
}

module.exports = {
  isEmail,
  isPhone,
  required,
  calculateAge,
  sanitizePublicCitizen,
  stripSensitiveCitizen,
  validateGender,
  validateBloodGroup,
  validateRelationship,
  validateDisasterType,
};
