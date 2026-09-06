const Counter = require('../models/Counter');

async function nextSequence(key, pad = 6) {
  const doc = await Counter.findOneAndUpdate(
    { key },
    { $inc: { seq: 1 } },
    { returnDocument: 'after', upsert: true }
  );
  return String(doc.seq).padStart(pad, '0');
}

async function generateCitizenId() {
  const year = new Date().getFullYear();
  const seq = await nextSequence(`CIT-${year}`, 6);
  return `CIT-${year}-${seq}`;
}

async function generateHouseholdId() {
  const year = new Date().getFullYear();
  const seq = await nextSequence(`HH-${year}`, 6);
  return `HH-${year}-${seq}`;
}

async function generateUnregisteredId() {
  const year = new Date().getFullYear();
  const seq = await nextSequence(`UNREG-${year}`, 6);
  return `UNREG-${year}-${seq}`;
}

async function generateCampId() {
  const year = new Date().getFullYear();
  const seq = await nextSequence(`CAMP-${year}`, 4);
  return `CAMP-${year}-${seq}`;
}

async function generateDisasterId() {
  const year = new Date().getFullYear();
  const seq = await nextSequence(`DIS-${year}`, 4);
  return `DIS-${year}-${seq}`;
}

async function generateOfficialId() {
  const year = new Date().getFullYear();
  const seq = await nextSequence(`OFF-${year}`, 4);
  return `OFF-${year}-${seq}`;
}

async function generateDonationId() {
  const year = new Date().getFullYear();
  const seq = await nextSequence(`DON-${year}`, 6);
  return `DON-${year}-${seq}`;
}

async function generateEmergencyId() {
  const year = new Date().getFullYear();
  const seq = await nextSequence(`SOS-${year}`, 6);
  return `SOS-${year}-${seq}`;
}

async function generateSafeZoneId() {
  const year = new Date().getFullYear();
  const seq = await nextSequence(`SZ-${year}`, 4);
  return `SZ-${year}-${seq}`;
}

async function generateShipmentId() {
  const year = new Date().getFullYear();
  const seq = await nextSequence(`REL-${year}`, 6);
  return `REL-${year}-${seq}`;
}

async function generateRequestId() {
  const year = new Date().getFullYear();
  const seq = await nextSequence(`REQ-${year}`, 6);
  return `REQ-${year}-${seq}`;
}

async function generateTransferId() {
  const year = new Date().getFullYear();
  const seq = await nextSequence(`TRF-${year}`, 6);
  return `TRF-${year}-${seq}`;
}

async function generateNeedId() {
  const year = new Date().getFullYear();
  const seq = await nextSequence(`NEED-${year}`, 6);
  return `NEED-${year}-${seq}`;
}

async function generateAllocationId() {
  const year = new Date().getFullYear();
  const seq = await nextSequence(`ALC-${year}`, 6);
  return `ALC-${year}-${seq}`;
}

async function setSequence(key, value) {
  await Counter.findOneAndUpdate(
    { key },
    { $set: { seq: value } },
    { upsert: true }
  );
}

module.exports = {
  nextSequence,
  generateCitizenId,
  generateHouseholdId,
  generateUnregisteredId,
  generateCampId,
  generateDisasterId,
  generateOfficialId,
  generateDonationId,
  generateEmergencyId,
  generateSafeZoneId,
  generateShipmentId,
  generateRequestId,
  generateAllocationId,
  generateTransferId,
  generateNeedId,
  setSequence,
};
