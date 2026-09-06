const CampInventory = require('../models/CampInventory');
const ReliefNeed = require('../models/ReliefNeed');
const ReliefCamp = require('../models/ReliefCamp');
const Disaster = require('../models/Disaster');
const Citizen = require('../models/Citizen');
const { PRIORITY, SUPPLY_THRESHOLDS, PERSON_STATUS } = require('../utils/constants');

function metrics(item) {
  const current = Number(item.current || 0);
  const required = Number(item.required || 0);
  const incoming = Number(item.incoming || 0);
  const expectedDistribution = Number(item.expectedDistribution || 0);
  const daily = Number(item.dailyConsumption || 0);
  const projectedAvailable = Math.max(0, current + incoming - expectedDistribution);
  const projectedShortage = Math.max(0, required - projectedAvailable);
  const simpleShortage = Math.max(0, required - current);
  const daysOfSupply = daily > 0 ? Math.round((current / daily) * 100) / 100 : current > 0 ? 99 : 0;
  return { current, required, incoming, expectedDistribution, daily, projectedAvailable, projectedShortage, simpleShortage, daysOfSupply };
}

function supplyBand(daysOfSupply, daily) {
  if (daily <= 0) return daysOfSupply === 0 && false ? 'CRITICAL' : 'ADEQUATE';
  if (daysOfSupply < SUPPLY_THRESHOLDS.CRITICAL) return 'CRITICAL';
  if (daysOfSupply < SUPPLY_THRESHOLDS.HIGH) return 'HIGH';
  if (daysOfSupply < SUPPLY_THRESHOLDS.MODERATE) return 'MODERATE';
  return 'ADEQUATE';
}

function explainAndPrioritize({ item, camp, disaster, vulnerableCount = 0 }) {
  const m = metrics(item);
  const band = supplyBand(m.daysOfSupply, m.daily);
  const reasons = [];
  let priority = PRIORITY.LOW;

  if (m.projectedShortage <= 0 && band === 'ADEQUATE') {
    priority = PRIORITY.LOW;
    reasons.push('Projected stock covers the required amount.');
  } else {
    if (band === 'CRITICAL' || (m.current === 0 && m.required > 0)) {
      priority = PRIORITY.CRITICAL;
      reasons.push(m.daily > 0
        ? `Supply remaining is ${m.daysOfSupply} days, below the ${SUPPLY_THRESHOLDS.CRITICAL}-day emergency threshold.`
        : 'Current stock is exhausted against a recorded requirement.');
    } else if (band === 'HIGH' || m.projectedShortage / Math.max(1, m.required) >= 0.4) {
      priority = PRIORITY.HIGH;
      reasons.push(m.daily > 0
        ? `Supply remaining is ${m.daysOfSupply} days.`
        : `Projected shortage is ${m.projectedShortage} of ${m.required} required.`);
    } else if (m.projectedShortage > 0) {
      priority = PRIORITY.MEDIUM;
      reasons.push(`Projected shortage of ${m.projectedShortage} ${item.unit || 'units'} remains.`);
    }
  }

  if ((disaster?.disasterLevel || 0) >= 3 && m.projectedShortage > 0) {
    if (m.daysOfSupply < SUPPLY_THRESHOLDS.HIGH || band === 'CRITICAL') {
      priority = PRIORITY.CRITICAL;
      reasons.push(`Disaster level ${disaster.disasterLevel} with ${m.daysOfSupply} days of supply is treated as an emergency shortage.`);
    } else if (priority !== PRIORITY.CRITICAL) {
      priority = PRIORITY.HIGH;
      reasons.push(`Disaster level ${disaster.disasterLevel} requires coordinated allocation.`);
    }
  }
  if (vulnerableCount > 0 && m.projectedShortage > 0) {
    reasons.push(`Vulnerable people recorded at this camp: ${vulnerableCount}.`);
  }
  if (camp?.currentPopulation) {
    reasons.push(`Population affected: ${camp.currentPopulation}.`);
  }

  return {
    ...m,
    priority,
    supplyBand: band,
    priorityReason: reasons.join(' '),
  };
}

async function evaluateItem(item, camp, disaster) {
  const vulnerableCount = camp
    ? await Citizen.countDocuments({
      currentCamp: camp._id,
      isVulnerable: true,
      disasterStatus: { $in: [PERSON_STATUS.IN_RELIEF_CAMP, PERSON_STATUS.FOUND, PERSON_STATUS.TRANSFERRED] },
    })
    : 0;
  return explainAndPrioritize({ item, camp, disaster, vulnerableCount });
}

async function syncReliefNeeds(campId) {
  const camp = await ReliefCamp.findById(campId);
  const disaster = camp?.disaster ? await Disaster.findById(camp.disaster) : await Disaster.findOne({ status: 'Active' });
  const items = await CampInventory.find({ camp: campId });
  await ReliefNeed.deleteMany({ camp: campId });
  const published = [];
  for (const item of items) {
    const result = await evaluateItem(item, camp, disaster);
    item.priority = result.priority;
    item.priorityReason = result.priorityReason;
    await item.save();
    if (result.projectedShortage > 0) {
      published.push({
        camp: campId,
        inventory: item._id,
        itemName: item.itemName,
        available: result.current,
        required: result.required,
        shortage: result.projectedShortage,
        projectedShortage: result.projectedShortage,
        daysOfSupply: result.daysOfSupply,
        unit: item.unit || 'units',
        priority: result.priority,
        priorityReason: result.priorityReason,
        isPublished: true,
      });
    }
  }
  if (published.length) await ReliefNeed.insertMany(published);
  return published;
}

function decorateInventory(item, extras = {}) {
  const m = metrics(item);
  return {
    ...item.toJSON?.() || item,
    ...m,
    shortage: m.projectedShortage,
    supplyBand: supplyBand(m.daysOfSupply, m.daily),
    ...extras,
  };
}

module.exports = {
  metrics,
  supplyBand,
  explainAndPrioritize,
  evaluateItem,
  syncReliefNeeds,
  decorateInventory,
};
