const VictimApplication = require('../../models/VictimApplication');
const { VICTIM_STATUS } = VictimApplication;
const { generateVictimId } = require('../../utils/generateId');
const { writeAudit } = require('../../services/auditService');
const { createNotification } = require('../../services/notificationService');
const { required } = require('../../utils/validators');
const { AppError } = require('../../middleware/errorMiddleware');

function publicCard(doc) {
  const remaining = Math.max(0, (doc.amountNeededNPR || 0) - (doc.amountRaisedNPR || 0));
  const percent = doc.amountNeededNPR
    ? Math.min(100, Math.round(((doc.amountRaisedNPR || 0) / doc.amountNeededNPR) * 100))
    : 0;
  return {
    id: doc._id,
    applicationId: doc.applicationId,
    displayName: doc.displayName,
    district: doc.district,
    municipality: doc.municipality,
    ward: doc.ward,
    householdSize: doc.householdSize,
    category: doc.category,
    story: doc.story,
    amountNeededNPR: doc.amountNeededNPR,
    amountRaisedNPR: doc.amountRaisedNPR || 0,
    remainingNPR: remaining,
    percentRaised: percent,
    photoUrl: doc.photoUrl || '/rahat-motive.jpg',
    status: doc.status,
    createdAt: doc.createdAt,
  };
}

function displayNameFrom(fullName, requested) {
  if (requested && requested.trim()) return requested.trim();
  const parts = String(fullName || '').trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

async function apply(req, res, next) {
  try {
    const missing = required(['fullName', 'district', 'municipality', 'story', 'amountNeededNPR'], req.body);
    if (missing.length) throw new AppError(`Missing required fields: ${missing.join(', ')}`, 400);
    const amountNeededNPR = Number(req.body.amountNeededNPR);
    if (!amountNeededNPR || amountNeededNPR < 100) throw new AppError('Requested amount must be at least NPR 100', 400);

    let application;
    for (let attempt = 0; attempt < 8; attempt += 1) {
      try {
        application = await VictimApplication.create({
          applicationId: await generateVictimId(),
          applicant: req.user?._id,
          fullName: req.body.fullName.trim(),
          displayName: displayNameFrom(req.body.fullName, req.body.displayName),
          phone: req.body.phone || '',
          email: req.body.email || req.user?.email || '',
          district: req.body.district.trim(),
          municipality: req.body.municipality.trim(),
          ward: req.body.ward || '',
          householdSize: Number(req.body.householdSize) || 1,
          category: req.body.category || 'Other',
          story: req.body.story.trim(),
          amountNeededNPR,
          photoUrl: req.body.photoUrl || '/rahat-motive.jpg',
          status: VICTIM_STATUS.PENDING,
          isPublic: false,
        });
        break;
      } catch (error) {
        if (error.code !== 11000 || attempt === 7) throw error;
      }
    }

    if (req.user) {
      await writeAudit({
        user: req.user,
        action: 'Victim application submitted',
        entityType: 'VictimApplication',
        entityId: application.applicationId,
      });
    }

    res.status(201).json({
      success: true,
      applicationId: application.applicationId,
      message: 'Your application was received. It will appear on the homepage only after an administrator verifies it.',
    });
  } catch (error) {
    next(error);
  }
}

async function listPublic(req, res, next) {
  try {
    const rows = await VictimApplication.find({
      isPublic: true,
      status: { $in: [VICTIM_STATUS.APPROVED, VICTIM_STATUS.FULFILLED] },
    }).sort({ createdAt: -1 });
    res.json({ success: true, victims: rows.map(publicCard) });
  } catch (error) {
    next(error);
  }
}

async function publicDetails(req, res, next) {
  try {
    const mongoose = require('mongoose');
    const filter = mongoose.Types.ObjectId.isValid(req.params.id)
      ? { $or: [{ _id: req.params.id }, { applicationId: req.params.id }] }
      : { applicationId: req.params.id };
    const row = await VictimApplication.findOne({ ...filter, isPublic: true });
    if (!row) throw new AppError('This support request is not published.', 404);
    res.json({ success: true, victim: publicCard(row) });
  } catch (error) {
    next(error);
  }
}

async function myApplications(req, res, next) {
  try {
    const rows = await VictimApplication.find({ applicant: req.user._id })
      .select('+phone +email')
      .sort({ createdAt: -1 });
    res.json({ success: true, applications: rows });
  } catch (error) {
    next(error);
  }
}

async function adminList(req, res, next) {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const rows = await VictimApplication.find(filter)
      .select('+phone +email')
      .populate('applicant', 'fullName email')
      .sort({ createdAt: -1 });
    res.json({ success: true, applications: rows });
  } catch (error) {
    next(error);
  }
}

async function review(req, res, next) {
  try {
    const decision = req.body.decision;
    if (!['Approved', 'Rejected'].includes(decision)) {
      throw new AppError('Decision must be Approved or Rejected', 400);
    }
    const application = await VictimApplication.findById(req.params.id).select('+email');
    if (!application) throw new AppError('Application not found', 404);

    application.status = decision;
    application.isPublic = decision === 'Approved';
    application.reviewNotes = req.body.reviewNotes || '';
    application.reviewedBy = req.user._id;
    application.reviewedAt = new Date();
    await application.save();

    await writeAudit({
      user: req.user,
      action: `Victim application ${decision.toLowerCase()}`,
      entityType: 'VictimApplication',
      entityId: application.applicationId,
    });

    if (application.applicant) {
      await createNotification({
        user: application.applicant,
        title: decision === 'Approved' ? 'Your support request is now public' : 'Your support request was not approved',
        body: decision === 'Approved'
          ? 'Administrators verified your request. Donors can now support you from the RAHAT homepage.'
          : (application.reviewNotes || 'An administrator reviewed your request and did not publish it.'),
        type: decision === 'Approved' ? 'verification_completed' : 'verification_rejected',
        relatedModel: 'VictimApplication',
        relatedId: application._id,
      });
    }

    res.json({ success: true, application });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  apply,
  listPublic,
  publicDetails,
  myApplications,
  adminList,
  review,
};
