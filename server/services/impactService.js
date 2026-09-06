const Donation = require('../models/Donation');
const DonationAllocation = require('../models/DonationAllocation');
const ImpactRecord = require('../models/ImpactRecord');
const ReliefNeed = require('../models/ReliefNeed');
const CampInventory = require('../models/CampInventory');
const { generateAllocationId } = require('../utils/generateId');
const { DONATION_STATUS } = require('../utils/constants');
const { createNotification } = require('./notificationService');
const { writeAudit } = require('./auditService');
const { AppError } = require('../middleware/errorMiddleware');

function addEvent(donation, key, label, description, byName = '') {
  donation.timeline = donation.timeline || [];
  donation.timeline.push({ key, label, at: new Date(), description, byName });
}

async function notifyDonor(donation, { type, title, body }) {
  if (!donation.donorUser) return;
  await createNotification({
    user: donation.donorUser,
    title,
    body,
    type,
    relatedModel: 'Donation',
    relatedId: donation._id,
  });
}

async function recommendNeeds({ amountNPR = 0, itemName = '', quantity = 0, includeDemo = false } = {}) {
  const filter = { isPublished: true };
  if (itemName) filter.itemName = itemName;
  const needs = await ReliefNeed.find(filter).populate('camp', 'name campId district currentPopulation isDemo');
  const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  const rank = (allowDemo) => needs
    .map((need) => {
      const shortage = need.projectedShortage || need.shortage || 0;
      return { need, shortage };
    })
    .filter((row) => row.shortage > 0 && (allowDemo || includeDemo || !row.need.camp?.isDemo))
    .sort((a, b) => (order[a.need.priority] ?? 9) - (order[b.need.priority] ?? 9) || b.shortage - a.shortage);

  let ranked = rank(false);
  if (!ranked.length) ranked = rank(true);

  if (itemName) {
    const stock = await CampInventory.find({ itemName });
    const demand = ranked.reduce((sum, row) => sum + row.shortage, 0);
    const available = stock.reduce((sum, item) => sum + (item.current || 0), 0);
    const incoming = stock.reduce((sum, item) => sum + (item.incoming || 0), 0);
    const remaining = Math.max(0, demand - Number(quantity || 0));
    const oversupplied = demand <= 0;
    return {
      itemName,
      quantity: Number(quantity || 0),
      demand,
      available,
      incoming,
      remainingShortage: remaining,
      canHelp: !oversupplied && demand > 0,
      oversupplied,
      alternatives: oversupplied
        ? (await ReliefNeed.find({ isPublished: true, itemName: { $ne: itemName }, projectedShortage: { $gt: 0 } })
          .populate('camp', 'name')
          .sort({ priority: 1 })
          .limit(3)).map((need) => ({ itemName: need.itemName, priority: need.priority, camp: need.camp?.name, shortage: need.projectedShortage || need.shortage }))
        : [],
      matches: ranked.map((row) => row.need),
    };
  }

  const urgent = ranked.filter((row) => row.need.priority === 'CRITICAL' || row.need.priority === 'HIGH');
  const highlyNecessary = (urgent.length ? urgent : ranked).slice(0, 6).map((row) => row.need);

  return {
    amountNPR: Number(amountNPR || 0),
    recommended: highlyNecessary[0] || ranked[0]?.need || null,
    alternatives: highlyNecessary.slice(1, 3),
    highlyNecessary,
    reason: highlyNecessary[0]
      ? `${highlyNecessary[0].itemName} is highly necessary — ${highlyNecessary[0].priorityReason || `${highlyNecessary[0].priority} shortage at ${highlyNecessary[0].camp?.name || 'a relief center'}`}.`
      : 'No verified shortages are currently published.',
  };
}

async function verifyPayment(donation, user) {
  if (donation.kind !== 'Money') throw new AppError('This record is not a money donation', 400);
  if (donation.status !== DONATION_STATUS.PENDING) throw new AppError('Only pending payments can be verified', 409);
  donation.status = DONATION_STATUS.PAYMENT_VERIFIED;
  addEvent(donation, 'verified', 'Payment Verified', 'Administrator confirmed the demo payment record.', user.fullName);
  await donation.save();
  await writeAudit({ user, action: 'Donation verified', entityType: 'Donation', entityId: donation.donationId });
  await notifyDonor(donation, {
    type: 'donation_verified',
    title: 'Your payment has been verified',
    body: `Donation ${donation.donationId} of NPR ${donation.amountNPR} has been verified. We will notify you when it is allocated.`,
  });
  return donation;
}

async function allocateDonation(donation, { needId, reason }, user) {
  const allocatable = [DONATION_STATUS.PAYMENT_VERIFIED, DONATION_STATUS.PLEDGED, DONATION_STATUS.ACCEPTED, DONATION_STATUS.ALLOCATED];
  if (!allocatable.includes(donation.status)) {
    throw new AppError(`A ${donation.status} donation cannot be allocated`, 409);
  }
  let need = null;
  if (needId) {
    need = await ReliefNeed.findById(needId).populate('camp', 'name campId');
  } else {
    const pick = await recommendNeeds({
      amountNPR: donation.amountNPR,
      itemName: donation.itemName,
      includeDemo: true,
    });
    need = pick.recommended || pick.matches?.[0] || null;
  }
  if (!need) throw new AppError('No verified relief need is available for allocation', 409);

  const allocation = await DonationAllocation.create({
    allocationId: await generateAllocationId(),
    donation: donation._id,
    need: need._id,
    camp: need.camp?._id || need.camp,
    itemName: need.itemName,
    amountNPR: donation.kind === 'Money' ? donation.amountNPR : 0,
    quantity: donation.kind === 'Physical' ? donation.quantity : 0,
    reason: reason || `Highest verified shortage: ${need.itemName} at ${need.camp?.name || 'relief center'}.`,
    allocatedBy: user._id,
  });

  donation.status = DONATION_STATUS.ALLOCATED;
  donation.reliefNeed = need._id;
  donation.camp = need.camp?._id || need.camp;
  donation.itemName = donation.itemName || need.itemName;
  donation.allocatedAmount = donation.kind === 'Money' ? donation.amountNPR : donation.quantity;
  donation.remainingAmount = donation.kind === 'Money' ? donation.amountNPR : donation.quantity;
  addEvent(donation, 'allocated', 'Donation Allocated', allocation.reason, user.fullName);
  await donation.save();
  await writeAudit({ user, action: 'Donation allocated', entityType: 'Donation', entityId: donation.donationId, metadata: { allocationId: allocation.allocationId } });
  await notifyDonor(donation, {
    type: 'donation_allocated',
    title: 'Your contribution has been allocated',
    body: `Donation ${donation.donationId} was allocated to ${need.itemName} at ${need.camp?.name || 'a relief center'}.`,
  });
  return { donation, allocation, need };
}

async function recordImpact(donation, payload, user) {
  if (![DONATION_STATUS.ALLOCATED, DONATION_STATUS.IN_USE, DONATION_STATUS.IMPACT_VERIFIED].includes(donation.status)) {
    throw new AppError('Impact can only be recorded after allocation', 409);
  }
  const used = Number(payload.amountUsedNPR ?? donation.allocatedAmount ?? donation.amountNPR ?? 0);
  const people = Number(payload.peopleSupported || 0);
  const proofs = (payload.proofs || []).map((item) => ({
    kind: item.kind || 'photo',
    url: item.url || '',
    caption: item.caption || '',
    donorFacing: item.donorFacing !== false,
  }));
  const impact = await ImpactRecord.create({
    donation: donation._id,
    camp: donation.camp,
    itemName: payload.itemName || donation.itemName,
    amountUsedNPR: used,
    quantityDelivered: Number(payload.quantityDelivered || 0),
    unit: payload.unit || donation.unit || '',
    peopleSupported: people,
    location: payload.location || '',
    verifiedBy: user._id,
    verifiedAt: new Date(),
    notes: payload.notes || '',
    donorFacing: payload.donorFacing !== false,
    proofs,
  });
  donation.status = DONATION_STATUS.COMPLETED;
  donation.usedAmount = used;
  donation.remainingAmount = Math.max(0, (donation.allocatedAmount || donation.amountNPR || 0) - used);
  donation.peopleSupported = people;
  addEvent(donation, 'delivered', 'Delivered to Relief Center', payload.deliveryNote || 'Relief prepared and delivered.', user.fullName);
  addEvent(donation, 'verified_use', 'Distribution Verified', 'Administrator verified distribution.', user.fullName);
  addEvent(donation, 'impact', 'Impact Recorded', `Supported approximately ${people} people.`, user.fullName);
  await donation.save();
  await writeAudit({ user, action: 'Proof uploaded', entityType: 'Donation', entityId: donation.donationId });
  await notifyDonor(donation, {
    type: 'donation_impact',
    title: 'Your donation has now been used for relief',
    body: `Your contribution ${donation.donationId} was used for ${impact.itemName || 'relief'} at ${payload.location || 'the assigned relief center'}. Proof is available on your donation record.`,
  });
  return impact;
}

module.exports = {
  addEvent,
  notifyDonor,
  recommendNeeds,
  verifyPayment,
  allocateDonation,
  recordImpact,
};
