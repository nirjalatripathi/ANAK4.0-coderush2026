const express = require('express');
const publicController = require('../controllers/public/publicController');

const router = express.Router();

router.get('/stats', publicController.stats);
router.get('/impact-stories', publicController.impactStories);
router.get('/constants', publicController.constants);
router.post('/contact', publicController.contact);

module.exports = router;
