const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly, officialOrAdmin } = require('../middleware/roleMiddleware');
const campController = require('../controllers/camp/campController');

const router = express.Router();

router.get('/', campController.listCamps);
router.get('/:id', campController.campDetails);
router.get('/:id/population', protect, officialOrAdmin, campController.population);
router.post('/', protect, adminOnly, campController.create);
router.put('/:id', protect, adminOnly, campController.update);

module.exports = router;
