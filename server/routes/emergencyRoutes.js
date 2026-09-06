const express = require('express');
const { optionalAuth, protect } = require('../middleware/authMiddleware');
const { officialOrAdmin } = require('../middleware/roleMiddleware');
const emergencyController = require('../controllers/citizen/emergencyController');

const router = express.Router();

router.post('/', optionalAuth, emergencyController.createReport);
router.get('/', protect, emergencyController.listReports);
router.put('/:id', protect, officialOrAdmin, emergencyController.updateReport);

module.exports = router;
