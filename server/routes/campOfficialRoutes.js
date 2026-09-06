const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly, officialOrAdmin } = require('../middleware/roleMiddleware');
const campOfficialController = require('../controllers/camp/campOfficialController');
const campPeopleController = require('../controllers/camp/campPeopleController');

const router = express.Router();

router.get('/me', protect, officialOrAdmin, campOfficialController.myAssignment);
router.get('/search', protect, officialOrAdmin, campPeopleController.searchCitizens);
router.get('/citizens/:id', protect, officialOrAdmin, campPeopleController.getCitizen);
router.put('/citizens/:id/status', protect, officialOrAdmin, campPeopleController.updateStatus);

router.get('/', protect, adminOnly, campOfficialController.listOfficials);
router.post('/', protect, adminOnly, campOfficialController.createOfficial);
router.put('/:id', protect, adminOnly, campOfficialController.updateOfficial);

module.exports = router;
