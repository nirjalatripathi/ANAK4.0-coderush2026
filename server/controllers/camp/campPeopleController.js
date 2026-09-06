const Citizen = require('../../models/Citizen');
const Household = require('../../models/Household');
const PersonStatusHistory = require('../../models/PersonStatusHistory');
const { searchCitizensAuthorized, updateCitizenStatus } = require('../../services/citizenService');
const { writeAudit } = require('../../services/auditService');
const { createNotification } = require('../../services/notificationService');
const { PERSON_STATUS, AUDIT_ACTIONS } = require('../../utils/constants');
const { AppError } = require('../../middleware/errorMiddleware');

async function searchCitizens(req, res, next) {
  try {
    const hasQuery = ['fullName', 'registrationId', 'householdId', 'nationalId', 'dob', 'phone', 'status']
      .some((key) => req.query[key]);
    if (!hasQuery) {
      return res.json({ success: true, citizens: [], message: 'Enter at least one search field' });
    }
    const citizens = await searchCitizensAuthorized(req.query);
    res.json({ success: true, citizens });
  } catch (error) {
    next(error);
  }
}

async function getCitizen(req, res, next) {
  try {
    const citizen = await Citizen.findById(req.params.id)
      .select('+nationalId +citizenshipNumber +specialAssistanceNotes')
      .populate('household')
      .populate('currentCamp', 'name campId district location')
      .populate({
        path: 'household',
        populate: { path: 'members.citizen', select: 'fullName registrationId disasterStatus currentCamp lastKnownLocation' },
      });
    if (!citizen) throw new AppError('Citizen not found', 404);
    const history = await PersonStatusHistory.find({ citizen: citizen._id })
      .populate('camp', 'name campId')
      .populate('official', 'fullName role')
      .sort({ createdAt: -1 })
      .limit(30);
    res.json({ success: true, citizen, history });
  } catch (error) {
    next(error);
  }
}

async function updateStatus(req, res, next) {
  try {
    const { status, campId, location, notes } = req.body;
    if (!status || !Object.values(PERSON_STATUS).includes(status)) {
      throw new AppError('A valid person status is required', 400);
    }

    let resolvedCamp = campId;
    if (req.user.role === 'camp_official') {
      resolvedCamp = campId || req.user.campOfficial?.assignedCamp?._id || req.user.campOfficial?.assignedCamp;
    }

    const citizen = await updateCitizenStatus({
      citizenId: req.params.id,
      newStatus: status,
      campId: resolvedCamp,
      official: req.user,
      location,
      notes,
    });

    const action = status === PERSON_STATUS.FOUND
      ? AUDIT_ACTIONS.PERSON_MARKED_FOUND
      : status === PERSON_STATUS.MISSING
        ? AUDIT_ACTIONS.PERSON_MARKED_MISSING
        : status === PERSON_STATUS.TRANSFERRED
          ? AUDIT_ACTIONS.PERSON_TRANSFERRED
          : AUDIT_ACTIONS.PERSON_STATUS_UPDATED;

    await writeAudit({
      user: req.user,
      action,
      entityType: 'Citizen',
      entityId: citizen.registrationId,
      metadata: { status, location, notes, campId: resolvedCamp },
      ip: req.ip,
    });

    if (citizen.household) {
      const household = await Household.findById(citizen.household).populate('members.citizen', 'user fullName');
      const others = (household?.members || [])
        .map((member) => member.citizen)
        .filter((member) => member && String(member._id) !== String(citizen._id) && member.user)
        .map((member) => member.user);
      if (others.length) {
        await createNotification({
          user: others[0],
          title: 'Family member status updated',
          body: `${citizen.fullName} is now recorded as ${status}${location ? ` at ${location}` : ''}.`,
          type: status === PERSON_STATUS.FOUND ? 'family_member_found' : 'person_status_updated',
          relatedModel: 'Citizen',
          relatedId: citizen._id,
        });
        for (let i = 1; i < others.length; i += 1) {
          await createNotification({
            user: others[i],
            title: 'Family member status updated',
            body: `${citizen.fullName} is now recorded as ${status}${location ? ` at ${location}` : ''}.`,
            type: status === PERSON_STATUS.FOUND ? 'family_member_found' : 'person_status_updated',
          });
        }
      }
    }

    const updated = await Citizen.findById(citizen._id)
      .populate('household', 'householdId')
      .populate('currentCamp', 'name campId district');
    res.json({ success: true, citizen: updated });
  } catch (error) {
    next(error);
  }
}

module.exports = { searchCitizens, getCitizen, updateStatus };
