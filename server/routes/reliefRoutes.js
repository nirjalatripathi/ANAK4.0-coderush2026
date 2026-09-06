const express = require('express');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { officialOrAdmin, localOrAdmin } = require('../middleware/roleMiddleware');
const reliefController = require('../controllers/relief/reliefController');
const shipmentController = require('../controllers/relief/shipmentController');

const router = express.Router();

router.get('/needs', optionalAuth, reliefController.listNeeds);
router.get('/match', reliefController.matchNeeds);
router.get('/supply-demand', reliefController.supplyDemand);
router.get('/command-center', protect, localOrAdmin, reliefController.commandCenter);
router.get('/requests', protect, officialOrAdmin, reliefController.listRequests);
router.post('/requests', protect, officialOrAdmin, reliefController.createRequest);
router.put('/requests/:id/verify', protect, localOrAdmin, reliefController.verifyRequest);
router.get('/allocations', protect, localOrAdmin, reliefController.listAllocations);
router.post('/allocations', protect, localOrAdmin, reliefController.recommendAllocation);
router.put('/allocations/:id/confirm', protect, localOrAdmin, reliefController.confirmAllocation);

router.get('/shipments', shipmentController.list);
router.post('/shipments', protect, officialOrAdmin, shipmentController.create);
router.put('/shipments/:id/dispatch', protect, officialOrAdmin, shipmentController.dispatch);
router.put('/shipments/:id/receive', protect, officialOrAdmin, shipmentController.receive);
router.post('/distributions', protect, officialOrAdmin, shipmentController.distribute);
router.get('/distributions', protect, officialOrAdmin, shipmentController.listDistributions);

module.exports = router;
