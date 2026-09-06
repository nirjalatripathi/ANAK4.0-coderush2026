const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { officialOrAdmin } = require('../middleware/roleMiddleware');
const inventoryController = require('../controllers/camp/inventoryController');

const router = express.Router();

router.get('/needs', inventoryController.listNeeds);
router.get('/:campId', protect, officialOrAdmin, inventoryController.listInventory);
router.put('/:campId', protect, officialOrAdmin, inventoryController.updateItem);
router.post('/:campId/refresh', protect, officialOrAdmin, inventoryController.refreshNeeds);

module.exports = router;
