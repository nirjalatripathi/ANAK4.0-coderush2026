const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { officialOrAdmin, localOrAdmin } = require('../middleware/roleMiddleware');
const safeZoneController = require('../controllers/safeZone/safeZoneController');

const router = express.Router();

router.get('/', safeZoneController.list);
router.get('/map', safeZoneController.mapData);
router.get('/:id', safeZoneController.details);
router.post('/', protect, localOrAdmin, safeZoneController.create);
router.put('/:id/declare', protect, localOrAdmin, safeZoneController.declare);
router.post('/:id/check-in', protect, officialOrAdmin, safeZoneController.doCheckIn);
router.post('/transfer', protect, officialOrAdmin, safeZoneController.transfer);

module.exports = router;
