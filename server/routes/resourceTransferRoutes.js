const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { officialOrAdmin, localOrAdmin } = require('../middleware/roleMiddleware');
const transferController = require('../controllers/resource/transferController');

const router = express.Router();

router.get('/recommendations', protect, officialOrAdmin, transferController.recommend);
router.get('/', protect, officialOrAdmin, transferController.list);
router.post('/', protect, localOrAdmin, transferController.create);
router.put('/:id', protect, officialOrAdmin, transferController.update);

module.exports = router;
