const Citizen = require('../../models/Citizen');
const Household = require('../../models/Household');
const Disaster = require('../../models/Disaster');
const ReliefCamp = require('../../models/ReliefCamp');
const UnregisteredPerson = require('../../models/UnregisteredPerson');
const Donation = require('../../models/Donation');
const EmergencyReport = require('../../models/EmergencyReport');
const AuditLog = require('../../models/AuditLog');
const CampInventory = require('../../models/CampInventory');
const SystemSettings = require('../../models/SystemSettings');
const ContactMessage = require('../../models/ContactMessage');
const {
  PERSON_STATUS,
  VERIFICATION_STATUS,
  DISASTER_STATUS,
  DONATION_STATUS,
  PRIORITY,
} = require('../../utils/constants');
const { writeAudit } = require('../../services/auditService');

async function dashboard(req, res, next) {
  try {
    const [
      totalCitizens,
      verifiedCitizens,
      pendingVerification,
      missingPeople,
      foundPeople,
      inCamps,
      unregisteredPeople,
      activeDisasters,
      activeReliefCamps,
      donations,
      verificationRequests,
      recentActivity,
      camps,
      criticalShortages,
      openEmergencies,
    ] = await Promise.all([
      Citizen.countDocuments(),
      Citizen.countDocuments({ verificationStatus: VERIFICATION_STATUS.VERIFIED }),
      Citizen.countDocuments({ verificationStatus: VERIFICATION_STATUS.PENDING }),
      Citizen.countDocuments({ disasterStatus: PERSON_STATUS.MISSING }),
      Citizen.countDocuments({ disasterStatus: { $in: [PERSON_STATUS.FOUND, PERSON_STATUS.IN_RELIEF_CAMP] } }),
      Citizen.countDocuments({ disasterStatus: PERSON_STATUS.IN_RELIEF_CAMP }),
      UnregisteredPerson.countDocuments(),
      Disaster.countDocuments({ status: DISASTER_STATUS.ACTIVE }),
      ReliefCamp.countDocuments({ isActive: true }),
      Donation.countDocuments(),
      Citizen.countDocuments({
        verificationStatus: { $in: [VERIFICATION_STATUS.PENDING, VERIFICATION_STATUS.RESUBMISSION] },
      }),
      AuditLog.find().sort({ createdAt: -1 }).limit(8).populate('user', 'fullName role'),
      ReliefCamp.find({ isActive: true }).select('currentPopulation name'),
      CampInventory.find().then((items) =>
        items.filter((item) => Math.max(0, item.required - item.current) > 0 && [PRIORITY.CRITICAL, PRIORITY.HIGH].includes(item.priority)).length
      ),
      EmergencyReport.countDocuments({ status: { $in: ['Open', 'Acknowledged', 'In Progress'] } }),
    ]);

    const totalCampPopulation = camps.reduce((sum, camp) => sum + (camp.currentPopulation || 0), 0);
    const receivedDonations = await Donation.countDocuments({ status: DONATION_STATUS.RECEIVED });
    const [
      moneyDonated,
      pendingPayments,
      pendingAllocations,
      completedDonations,
      discrepancies,
    ] = await Promise.all([
      Donation.aggregate([
        { $match: { kind: 'Money', isDemo: { $ne: true } } },
        { $group: { _id: null, total: { $sum: '$amountNPR' } } },
      ]),
      Donation.countDocuments({ kind: 'Money', status: DONATION_STATUS.PENDING }),
      Donation.countDocuments({ status: DONATION_STATUS.PAYMENT_VERIFIED }),
      Donation.countDocuments({ status: DONATION_STATUS.COMPLETED }),
      Donation.countDocuments({ status: DONATION_STATUS.PARTIALLY_RECEIVED }),
    ]);

    const verificationBreakdown = await Citizen.aggregate([
      { $group: { _id: '$verificationStatus', count: { $sum: 1 } } },
    ]);
    const statusBreakdown = await Citizen.aggregate([
      { $group: { _id: '$disasterStatus', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      stats: {
        totalCitizens,
        verifiedCitizens,
        pendingVerification,
        missingPeople,
        foundPeople,
        peopleInReliefCamps: inCamps,
        unregisteredPeople,
        activeDisasters,
        activeReliefCamps,
        totalCampPopulation,
        criticalSupplyShortages: criticalShortages,
        donations,
        receivedDonations,
        totalMoneyDonatedNPR: moneyDonated[0]?.total || 0,
        pendingPayments,
        pendingAllocations,
        completedDonations,
        discrepancies,
        verificationRequests,
        openEmergencies,
        systemActivity: recentActivity.length,
      },
      charts: {
        verificationBreakdown,
        statusBreakdown,
      },
      recentActivity,
    });
  } catch (error) {
    next(error);
  }
}

async function getSettings(req, res, next) {
  try {
    let settings = await SystemSettings.findOne({ key: 'system' });
    if (!settings) {
      settings = await SystemSettings.create({
        key: 'system',
        value: {
          portalName: 'RAHAT',
          helpDeskEmail: 'helpdesk@rahat.gov.np',
          emergencyHotline: '1149',
          allowPublicRegistration: true,
          maintenanceMode: false,
        },
      });
    }
    res.json({ success: true, settings: settings.value });
  } catch (error) {
    next(error);
  }
}

async function updateSettings(req, res, next) {
  try {
    const settings = await SystemSettings.findOneAndUpdate(
      { key: 'system' },
      { value: req.body },
      { returnDocument: 'after', upsert: true }
    );
    await writeAudit({
      user: req.user,
      action: 'System settings updated',
      entityType: 'SystemSettings',
      entityId: 'system',
      metadata: req.body,
      ip: req.ip,
    });
    res.json({ success: true, settings: settings.value });
  } catch (error) {
    next(error);
  }
}

async function reports(req, res, next) {
  try {
    const User = require('../../models/User');
    const VictimApplication = require('../../models/VictimApplication');
    const { VICTIM_STATUS } = VictimApplication;
    const paidStatuses = [
      DONATION_STATUS.PAYMENT_VERIFIED,
      DONATION_STATUS.ALLOCATED,
      DONATION_STATUS.IN_USE,
      DONATION_STATUS.IMPACT_VERIFIED,
      DONATION_STATUS.COMPLETED,
    ];

    const [users, victims, donations] = await Promise.all([
      User.find().select('fullName email role isActive createdAt lastLoginAt').sort({ createdAt: -1 }),
      VictimApplication.find().sort({ createdAt: -1 }),
      Donation.find()
        .populate('victim', 'displayName applicationId fullName')
        .populate('donorUser', 'fullName email role')
        .sort({ createdAt: -1 }),
    ]);

    const moneyRows = donations.filter((row) => row.kind === 'Money');
    const verifiedRows = moneyRows.filter((row) => paidStatuses.includes(row.status));
    const pendingRows = moneyRows.filter((row) => row.status === DONATION_STATUS.PENDING);

    const donorMap = new Map();
    for (const row of moneyRows) {
      const key = (row.donorEmail || row.donorName || 'unknown').toLowerCase();
      if (!donorMap.has(key)) {
        donorMap.set(key, {
          name: row.donorName,
          email: row.donorEmail || '',
          gifts: 0,
          verifiedGifts: 0,
          totalNPR: 0,
          verifiedNPR: 0,
          lastGiftAt: row.createdAt,
        });
      }
      const donor = donorMap.get(key);
      donor.gifts += 1;
      donor.totalNPR += row.amountNPR || 0;
      if (paidStatuses.includes(row.status)) {
        donor.verifiedGifts += 1;
        donor.verifiedNPR += row.amountNPR || 0;
      }
      if (row.createdAt > donor.lastGiftAt) donor.lastGiftAt = row.createdAt;
    }

    const victimGiftCount = {};
    for (const row of verifiedRows) {
      const id = String(row.victim?._id || row.victim || '');
      if (!id) continue;
      victimGiftCount[id] = (victimGiftCount[id] || 0) + 1;
    }

    res.json({
      success: true,
      summary: {
        users: users.length,
        donors: users.filter((row) => row.role === 'donor').length,
        victims: victims.length,
        publicVictims: victims.filter((row) => row.isPublic).length,
        pendingVictims: victims.filter((row) => row.status === VICTIM_STATUS.PENDING).length,
        transactions: moneyRows.length,
        verifiedTransactions: verifiedRows.length,
        pendingTransactions: pendingRows.length,
        verifiedNPR: verifiedRows.reduce((sum, row) => sum + (row.amountNPR || 0), 0),
        pendingNPR: pendingRows.reduce((sum, row) => sum + (row.amountNPR || 0), 0),
        neededNPR: victims.reduce((sum, row) => sum + (row.amountNeededNPR || 0), 0),
        raisedNPR: victims.reduce((sum, row) => sum + (row.amountRaisedNPR || 0), 0),
      },
      users,
      donors: [...donorMap.values()].sort((a, b) => b.verifiedNPR - a.verifiedNPR),
      victims: victims.map((row) => ({
        id: row._id,
        applicationId: row.applicationId,
        displayName: row.displayName,
        fullName: row.fullName,
        district: row.district,
        municipality: row.municipality,
        category: row.category,
        status: row.status,
        isPublic: row.isPublic,
        amountNeededNPR: row.amountNeededNPR,
        amountRaisedNPR: row.amountRaisedNPR,
        remainingNPR: Math.max(0, (row.amountNeededNPR || 0) - (row.amountRaisedNPR || 0)),
        gifts: victimGiftCount[String(row._id)] || 0,
      })),
      transactions: moneyRows.map((row) => ({
        id: row._id,
        donationId: row.donationId,
        donorName: row.donorName,
        donorEmail: row.donorEmail,
        victimName: row.victim?.displayName || row.purpose || '—',
        victimId: row.victim?.applicationId || '',
        amountNPR: row.amountNPR,
        status: row.status,
        provider: row.paymentProvider || 'manual',
        khaltiPidx: row.khaltiPidx || '',
        khaltiTxnId: row.khaltiTxnId || '',
        createdAt: row.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { dashboard, getSettings, updateSettings, reports };
