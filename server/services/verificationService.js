const Citizen = require('../models/Citizen');
const IdentityDocument = require('../models/IdentityDocument');
const { VERIFICATION_STATUS } = require('../utils/constants');
const { calculateAge } = require('../utils/validators');
const { writeAudit } = require('./auditService');
const { createNotification } = require('./notificationService');
const { AppError } = require('../middleware/errorMiddleware');

function documentRequirements(dateOfBirth) {
  const age = calculateAge(dateOfBirth);
  if (age === null) {
    return { age: null, required: [], under16: false };
  }
  if (age < 16) {
    return {
      age,
      under16: true,
      required: ['Birth Certificate', 'Recent Photograph'],
    };
  }
  return {
    age,
    under16: false,
    required: ['Citizenship Certificate or National ID', 'Recent Photograph'],
  };
}

async function reviewCitizen({ citizenId, decision, notes, admin, ip }) {
  const citizen = await Citizen.findById(citizenId);
  if (!citizen) throw new AppError('Citizen not found', 404);

  const allowed = {
    approve: VERIFICATION_STATUS.VERIFIED,
    reject: VERIFICATION_STATUS.REJECTED,
    resubmit: VERIFICATION_STATUS.RESUBMISSION,
  };

  if (!allowed[decision]) {
    throw new AppError('Invalid verification decision', 400);
  }

  citizen.verificationStatus = allowed[decision];
  citizen.verificationNotes = notes || '';
  citizen.verifiedAt = decision === 'approve' ? new Date() : undefined;
  citizen.verifiedBy = admin._id;
  await citizen.save();

  await IdentityDocument.updateMany(
    { citizen: citizen._id },
    {
      reviewStatus: allowed[decision],
      reviewNotes: notes || '',
      reviewedBy: admin._id,
      reviewedAt: new Date(),
    }
  );

  const actionMap = {
    approve: 'Citizen verified',
    reject: 'Citizen rejected',
    resubmit: 'Citizen resubmission requested',
  };

  await writeAudit({
    user: admin,
    action: actionMap[decision],
    entityType: 'Citizen',
    entityId: citizen.registrationId,
    metadata: { notes, decision },
    ip,
  });

  if (citizen.user) {
    const titles = {
      approve: 'Identity verification completed',
      reject: 'Identity verification rejected',
      resubmit: 'Additional documents required',
    };
    const types = {
      approve: 'verification_completed',
      reject: 'verification_rejected',
      resubmit: 'verification_resubmission',
    };
    await createNotification({
      user: citizen.user,
      title: titles[decision],
      body: notes || titles[decision],
      type: types[decision],
      relatedModel: 'Citizen',
      relatedId: citizen._id,
    });
  }

  return citizen;
}

module.exports = { documentRequirements, reviewCitizen };
