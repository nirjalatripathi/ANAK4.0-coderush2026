const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { localOrAdmin } = require('../middleware/roleMiddleware');
const resourceController = require('../controllers/resource/resourceController');

const router = express.Router();

router.get('/', resourceController.listResources);
router.get('/governments', resourceController.listGovernments);
router.get('/warehouses', resourceController.listWarehouses);
router.get('/readiness', resourceController.readiness);
router.post('/', protect, localOrAdmin, resourceController.createResource);
router.put('/:id', protect, localOrAdmin, resourceController.updateResource);

module.exports = router;
