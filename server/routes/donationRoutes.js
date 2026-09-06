const express = require('express');
const { optionalAuth, protect } = require('../middleware/authMiddleware');
const { officialOrAdmin, donorOrAdmin, adminOnly } = require('../middleware/roleMiddleware');
const donationController = require('../controllers/donation/donationController');

const router = express.Router();

router.get('/', optionalAuth, donationController.listDonations);
router.get('/recommend', donationController.recommend);
router.get('/deliveries', protect, officialOrAdmin, donationController.listDeliveries);
router.post('/khalti/initiate', optionalAuth, donationController.initiateKhalti);
router.get('/khalti/verify', donationController.verifyKhalti);
router.post('/khalti/verify', donationController.verifyKhalti);
router.get('/khalti/status', donationController.checkKhaltiStatus);
router.post('/khalti/status', donationController.checkKhaltiStatus);
router.post('/khalti/sandbox-confirm', donationController.confirmSandboxKhalti);
router.get('/:id', protect, donationController.donationDetails);
router.post('/', protect, donorOrAdmin, donationController.createPledge);
router.post('/money', protect, donorOrAdmin, donationController.createMoneyDonation);
router.post('/physical', protect, donorOrAdmin, donationController.createPhysicalDonation);
router.put('/:id/status', protect, officialOrAdmin, donationController.updateStatus);
router.put('/:id/receive', protect, officialOrAdmin, donationController.verifyReceipt);
router.put('/:id/verify-payment', protect, adminOnly, donationController.verifyMoney);
router.post('/:id/allocate', protect, adminOnly, donationController.allocate);
router.post('/:id/impact', protect, adminOnly, donationController.completeImpact);

module.exports = router;
