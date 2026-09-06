const express = require('express');
const { optionalAuth, protect } = require('../middleware/authMiddleware');
const { victimEvidenceUpload } = require('../middleware/uploadMiddleware');
const victimController = require('../controllers/victim/victimController');

const router = express.Router();

router.get('/', victimController.listPublic);
router.get('/mine', protect, victimController.myApplications);
router.post('/apply', optionalAuth, victimEvidenceUpload.single('evidence'), victimController.apply);
router.get('/:id', victimController.publicDetails);

module.exports = router;
