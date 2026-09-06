const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly, localOrAdmin } = require('../middleware/roleMiddleware');
const disasterController = require('../controllers/disaster/disasterController');

const router = express.Router();

router.get('/', disasterController.list);
router.get('/active', disasterController.active);
router.get('/:id', disasterController.details);
router.post('/', protect, localOrAdmin, disasterController.create);
router.put('/:id', protect, localOrAdmin, disasterController.update);

module.exports = router;
