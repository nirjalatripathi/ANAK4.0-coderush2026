const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { ROLES } = require('../utils/constants');
const householdController = require('../controllers/citizen/householdController');

const router = express.Router();

router.use(protect, authorize(ROLES.CITIZEN, ROLES.ADMIN));
router.get('/me', householdController.getMyHousehold);
router.post('/', householdController.createHousehold);
router.put('/me', householdController.updateHousehold);
router.post('/members', householdController.addMember);
router.delete('/members', householdController.removeMember);

module.exports = router;
