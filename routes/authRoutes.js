const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// صفحة تسجيل الدخول
router.get('/login', authController.getLoginPage);

// معالجة تسجيل الدخول
router.post('/login', authController.login);

// صفحة التسجيل
router.get('/register', authController.getRegisterPage);

// معالجة التسجيل
router.post('/register', authController.register);

// تسجيل الخروج
router.get('/logout', authController.logout);

// طلب رمز OTP
router.post('/request-otp', authController.requestOTP);

// التحقق من OTP
router.post('/verify-otp', authController.verifyOTP);

module.exports = router;