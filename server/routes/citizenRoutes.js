const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { profileUpload, identityUpload } = require('../middleware/uploadMiddleware');
const { ROLES } = require('../utils/constants');
const citizenController = require('../controllers/citizen/citizenController');

const router = express.Router();

router.use(protect, authorize(ROLES.CITIZEN, ROLES.ADMIN));
router.get('/me', citizenController.getProfile);
router.put('/me', profileUpload.single('photo'), citizenController.updateProfile);
router.get('/me/documents', citizenController.myDocuments);
router.post('/me/documents', identityUpload.array('documents', 6), citizenController.uploadDocuments);

module.exports = router;
