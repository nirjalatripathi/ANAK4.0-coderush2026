const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');
const notificationController = require('../controllers/notification/notificationController');

const router = express.Router();

router.use(protect);
router.get('/', notificationController.list);
router.put('/read-all', notificationController.readAll);
router.put('/:id/read', notificationController.readOne);
router.post('/announce', adminOnly, notificationController.announce);

module.exports = router;
