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
    const DonationDelivery = require('../../models/DonationDelivery');
    const ResourceTransfer = require('../../models/ResourceTransfer');
    const [citizens, camps, donations, inventory, transfers, deliveries] = await Promise.all([
      Citizen.find().select('fullName registrationId verificationStatus disasterStatus permanentAddress').limit(200),
      ReliefCamp.find(),
      Donation.find().populate('camp', 'name'),
      CampInventory.find().populate('camp', 'name'),
      ResourceTransfer.find().populate('sourceCamp destinationCamp', 'name'),
      DonationDelivery.find().populate('donation', 'donationId').populate('camp', 'name'),
    ]);
    res.json({ success: true, citizens, camps, donations, inventory, transfers, deliveries });
  } catch (error) {
    next(error);
  }
}

module.exports = { dashboard, getSettings, updateSettings, reports };
