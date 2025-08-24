const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { ensureAuthenticated } = require('../middleware/auth');

// صفحة الدفع
router.get('/checkout', ensureAuthenticated, orderController.getCheckoutPage);

// إنشاء طلب جديد
router.post('/', ensureAuthenticated, orderController.createOrder);

// تطبيق كود خصم
router.post('/apply-promo', ensureAuthenticated, orderController.applyPromoCode);

// دفع الطلب
router.post('/checkout', ensureAuthenticated, orderController.checkout);

// تتبع حالة الطلب
router.get('/track/:id', ensureAuthenticated, orderController.trackOrder);

// صفحة تأكيد الطلب
router.get('/:id', ensureAuthenticated, orderController.getOrderById);

module.exports = router;