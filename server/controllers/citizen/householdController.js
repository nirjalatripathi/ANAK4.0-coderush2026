const Household = require('../../models/Household');
const Citizen = require('../../models/Citizen');
const { generateHouseholdId } = require('../../utils/generateId');
const { validateRelationship } = require('../../utils/validators');
const { writeAudit } = require('../../services/auditService');
const { AppError } = require('../../middleware/errorMiddleware');

async function getMyHousehold(req, res, next) {
  try {
    const citizen = await Citizen.findOne({ user: req.user._id });
    if (!citizen?.household) {
      return res.json({ success: true, household: null });
    }
    const household = await Household.findById(citizen.household)
      .populate('headOfHousehold', 'fullName registrationId disasterStatus photoUrl verificationStatus')
      .populate('members.citizen', 'fullName registrationId disasterStatus photoUrl dateOfBirth gender currentCamp lastKnownLocation statusUpdatedAt verificationStatus isVulnerable vulnerabilityTypes');
    res.json({ success: true, household });
  } catch (error) {
    next(error);
  }
}

async function createHousehold(req, res, next) {
  try {
    const citizen = await Citizen.findOne({ user: req.user._id });
    if (!citizen) throw new AppError('Citizen profile not found', 404);
    if (citizen.household) throw new AppError('You already belong to a household', 409);

    const household = await Household.create({
      householdId: await generateHouseholdId(),
      headOfHousehold: citizen._id,
      permanentAddress: req.body.permanentAddress || citizen.permanentAddress,
      currentAddress: req.body.currentAddress || citizen.currentAddress,
      emergencyContact: req.body.emergencyContact || citizen.emergencyContact,
      members: [{ citizen: citizen._id, relationship: 'Head of Household' }],
      memberCount: 1,
    });
    citizen.household = household._id;
    citizen.relationshipToHead = 'Head of Household';
    await citizen.save();
    res.status(201).json({ success: true, household });
  } catch (error) {
    next(error);
  }
}

async function updateHousehold(req, res, next) {
  try {
    const citizen = await Citizen.findOne({ user: req.user._id });
    const household = await Household.findById(citizen?.household);
    if (!household) throw new AppError('Household not found', 404);
    if (String(household.headOfHousehold) !== String(citizen._id) && req.user.role !== 'admin') {
      throw new AppError('Only the head of household can update this record', 403);
    }
    if (req.body.permanentAddress) household.permanentAddress = req.body.permanentAddress;
    if (req.body.currentAddress) household.currentAddress = req.body.currentAddress;
    if (req.body.emergencyContact) household.emergencyContact = req.body.emergencyContact;
    await household.save();
    res.json({ success: true, household });
  } catch (error) {
    next(error);
  }
}

async function addMember(req, res, next) {
  try {
    const actor = req.user.role === 'admin'
      ? null
      : await Citizen.findOne({ user: req.user._id });
    const household = await Household.findById(req.body.householdId || actor?.household);
    if (!household) throw new AppError('Household not found', 404);

    if (req.user.role !== 'admin' && String(household.headOfHousehold) !== String(actor._id)) {
      throw new AppError('Only the head of household or an administrator can add members', 403);
    }

    const member = await Citizen.findOne({
      $or: [
        { _id: req.body.citizenId },
        { registrationId: req.body.registrationId },
      ],
    });
    if (!member) throw new AppError('Citizen not found', 404);
    if (member.household && String(member.household) !== String(household._id)) {
      throw new AppError('This person already belongs to another household', 409);
    }

    const relationship = req.body.relationship;
    if (!validateRelationship(relationship) && relationship !== 'Head of Household') {
      throw new AppError('Select a valid family relationship', 400);
    }

    if (!household.members.some((item) => String(item.citizen) === String(member._id))) {
      household.members.push({ citizen: member._id, relationship });
    }
    household.syncMemberCount();
    await household.save();

    member.household = household._id;
    member.relationshipToHead = relationship;
    await member.save();

    await writeAudit({
      user: req.user,
      action: 'Household updated',
      entityType: 'Household',
      entityId: household.householdId,
      metadata: { added: member.registrationId, relationship },
      ip: req.ip,
    });

    const populated = await Household.findById(household._id).populate('members.citizen', 'fullName registrationId disasterStatus');
    res.json({ success: true, household: populated });
  } catch (error) {
    next(error);
  }
}

async function removeMember(req, res, next) {
  try {
    const actor = req.user.role === 'admin' ? null : await Citizen.findOne({ user: req.user._id });
    const household = await Household.findById(req.body.householdId || actor?.household);
    if (!household) throw new AppError('Household not found', 404);
    if (req.user.role !== 'admin' && String(household.headOfHousehold) !== String(actor._id)) {
      throw new AppError('Only the head of household or an administrator can remove members', 403);
    }

    const memberId = req.body.citizenId;
    if (String(household.headOfHousehold) === String(memberId)) {
      throw new AppError('The head of household cannot be removed', 400);
    }

    household.members = household.members.filter((item) => String(item.citizen) !== String(memberId));
    household.syncMemberCount();
    await household.save();
    await Citizen.findByIdAndUpdate(memberId, { $unset: { household: 1 }, relationshipToHead: '' });
    res.json({ success: true, household });
  } catch (error) {
    next(error);
  }
}

module.exports = { getMyHousehold, createHousehold, updateHousehold, addMember, removeMember };
