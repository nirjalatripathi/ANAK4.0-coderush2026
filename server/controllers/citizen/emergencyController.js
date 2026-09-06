const EmergencyReport = require('../../models/EmergencyReport');
const { generateEmergencyId } = require('../../utils/generateId');
const { required } = require('../../utils/validators');
const { AppError } = require('../../middleware/errorMiddleware');

async function createReport(req, res, next) {
  try {
    const missing = required(['description'], req.body);
    if (missing.length) throw new AppError('Please describe the emergency', 400);

    const reporterType = req.body.reporterType || (req.user?.role === 'camp_official' ? 'camp_official' : req.user ? 'citizen' : 'third_party');

    const report = await EmergencyReport.create({
      reportId: await generateEmergencyId(),
      reporterType,
      reporter: req.user?._id,
      reporterName: req.body.reporterName || req.user?.fullName || '',
      reporterPhone: req.body.reporterPhone || '',
      onBehalfOfCitizen: req.body.onBehalfOfCitizen || undefined,
      onBehalfOfUnregistered: req.body.onBehalfOfUnregistered || undefined,
      onBehalfOfName: req.body.onBehalfOfName || '',
      camp: req.body.camp || req.user?.campOfficial?.assignedCamp || undefined,
      location: req.body.location || '',
      district: req.body.district || '',
      description: req.body.description,
      urgency: req.body.urgency || 'High',
    });

    res.status(201).json({ success: true, report });
  } catch (error) {
    next(error);
  }
}

async function listReports(req, res, next) {
  try {
    const filter = {};
    if (req.user.role === 'citizen') {
      filter.reporter = req.user._id;
    } else if (req.user.role === 'camp_official') {
      const campId = req.user.campOfficial?.assignedCamp?._id || req.user.campOfficial?.assignedCamp;
      filter.$or = [{ camp: campId }, { reporter: req.user._id }];
    }
    if (req.query.status) filter.status = req.query.status;

    const reports = await EmergencyReport.find(filter)
      .populate('camp', 'name campId district')
      .populate('onBehalfOfCitizen', 'fullName registrationId')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ success: true, reports });
  } catch (error) {
    next(error);
  }
}

async function updateReport(req, res, next) {
  try {
    const report = await EmergencyReport.findById(req.params.id);
    if (!report) throw new AppError('Emergency report not found', 404);
    if (req.user.role === 'citizen') throw new AppError('Citizens cannot update emergency case status', 403);
    if (req.body.status) report.status = req.body.status;
    if (req.body.resolutionNotes !== undefined) report.resolutionNotes = req.body.resolutionNotes;
    report.assignedTo = req.user._id;
    await report.save();
    res.json({ success: true, report });
  } catch (error) {
    next(error);
  }
}

module.exports = { createReport, listReports, updateReport };
