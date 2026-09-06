const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { officialOrAdmin, adminOnly } = require('../middleware/roleMiddleware');
const { unregisteredUpload } = require('../middleware/uploadMiddleware');
const unregisteredController = require('../controllers/unregistered/unregisteredController');

const router = express.Router();

router.use(protect, officialOrAdmin);
router.get('/', unregisteredController.list);
router.get('/:id', unregisteredController.details);
router.post('/', unregisteredUpload.single('photo'), unregisteredController.create);
router.put('/:id/match-citizen', adminOnly, unregisteredController.matchCitizen);
router.put('/:id/match-household', adminOnly, unregisteredController.matchHousehold);
router.put('/:id/verify', adminOnly, unregisteredController.verify);
router.post('/:id/convert', adminOnly, unregisteredController.convertToCitizen);

module.exports = router;
