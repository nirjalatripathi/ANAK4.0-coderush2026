const express = require('express');
const { optionalAuth, protect } = require('../middleware/authMiddleware');
const { officialOrAdmin, donorOrAdmin } = require('../middleware/roleMiddleware');
const donationController = require('../controllers/donation/donationController');

const router = express.Router();

router.get('/', optionalAuth, donationController.listDonations);
router.post('/', protect, donorOrAdmin, donationController.createPledge);
router.put('/:id/status', protect, officialOrAdmin, donationController.updateStatus);
router.put('/:id/receive', protect, officialOrAdmin, donationController.verifyReceipt);
router.get('/deliveries', protect, officialOrAdmin, donationController.listDeliveries);

module.exports = router;
