const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');
const adminController = require('../controllers/admin/adminController');
const citizenAdminController = require('../controllers/admin/citizenAdminController');
const verificationController = require('../controllers/admin/verificationController');
const disasterController = require('../controllers/disaster/disasterController');
const campController = require('../controllers/camp/campController');
const campOfficialController = require('../controllers/camp/campOfficialController');
const unregisteredController = require('../controllers/unregistered/unregisteredController');
const donationController = require('../controllers/donation/donationController');
const inventoryController = require('../controllers/camp/inventoryController');
const auditLogController = require('../controllers/admin/auditLogController');
const householdController = require('../controllers/citizen/householdController');
const reliefController = require('../controllers/relief/reliefController');
const shipmentController = require('../controllers/relief/shipmentController');
const resourceController = require('../controllers/resource/resourceController');
const transferController = require('../controllers/resource/transferController');
const victimController = require('../controllers/victim/victimController');

const router = express.Router();

router.use(protect, adminOnly);

router.get('/dashboard', adminController.dashboard);
router.get('/command-center', reliefController.commandCenter);
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);
router.get('/reports', adminController.reports);

router.get('/citizens', citizenAdminController.listCitizens);
router.get('/citizens/search', citizenAdminController.search);
router.get('/citizens/:id', citizenAdminController.citizenDetails);
router.put('/citizens/:id', citizenAdminController.updateCitizen);
router.get('/documents/:docId', citizenAdminController.serveDocument);

router.get('/verification', verificationController.queue);
router.put('/verification/:id', verificationController.decide);

router.get('/households', citizenAdminController.listHouseholds);
router.post('/households/members', householdController.addMember);

router.get('/disasters', disasterController.list);
router.post('/disasters', disasterController.create);
router.put('/disasters/:id', disasterController.update);

router.get('/camps', campController.listCamps);
router.post('/camps', campController.create);
router.put('/camps/:id', campController.update);

router.get('/officials', campOfficialController.listOfficials);
router.post('/officials', campOfficialController.createOfficial);
router.put('/officials/:id', campOfficialController.updateOfficial);

router.get('/unregistered', unregisteredController.list);
router.put('/unregistered/:id/match-citizen', unregisteredController.matchCitizen);
router.put('/unregistered/:id/match-household', unregisteredController.matchHousehold);
router.put('/unregistered/:id/verify', unregisteredController.verify);
router.post('/unregistered/:id/convert', unregisteredController.convertToCitizen);

router.get('/donations', donationController.listDonations);
router.put('/donations/:id/status', donationController.updateStatus);

router.get('/inventory/:campId', inventoryController.listInventory);
router.put('/inventory/:campId', inventoryController.updateItem);

router.get('/relief-needs', reliefController.listNeeds);
router.get('/relief-requests', reliefController.listRequests);
router.put('/relief-requests/:id/verify', reliefController.verifyRequest);
router.get('/allocations', reliefController.listAllocations);
router.post('/allocations', reliefController.recommendAllocation);
router.put('/allocations/:id/confirm', reliefController.confirmAllocation);
router.get('/shipments', shipmentController.list);
router.post('/shipments', shipmentController.create);
router.put('/shipments/:id/dispatch', shipmentController.dispatch);
router.put('/shipments/:id/receive', shipmentController.receive);
router.get('/resources', resourceController.listResources);
router.post('/resources', resourceController.createResource);
router.get('/readiness', resourceController.readiness);
router.get('/supply-demand', reliefController.supplyDemand);
router.get('/resource-transfers', transferController.list);
router.get('/resource-transfers/recommendations', transferController.recommend);
router.post('/resource-transfers', transferController.create);
router.put('/resource-transfers/:id', transferController.update);
router.get('/deliveries', donationController.listDeliveries);
router.put('/donations/:id/receive', donationController.verifyReceipt);

router.get('/victims', victimController.adminList);
router.put('/victims/:id/review', victimController.review);

router.get('/audit-logs', auditLogController.list);

module.exports = router;
