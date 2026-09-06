const express = require('express');
const authController = require('../controllers/auth/authController');
const { adminLogin } = require('../controllers/auth/adminAuthController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', authController.register);
router.post('/register-donor', authController.registerDonor);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', protect, authController.me);
router.post('/forgot-password', authController.forgotPassword);
router.post('/admin/login', adminLogin);

module.exports = router;
