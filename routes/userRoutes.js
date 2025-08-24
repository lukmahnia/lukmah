const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { ensureAuthenticated } = require('../middleware/auth');

// لوحة تحكم المستخدم
router.get('/dashboard', ensureAuthenticated, userController.getDashboard);

// ملف المستخدم
router.get('/profile', ensureAuthenticated, userController.getProfile);

// تحديث ملف المستخدم
router.post('/profile', ensureAuthenticated, userController.updateProfile);

// عناوين المستخدم
router.get('/addresses', ensureAuthenticated, userController.getAddresses);

// إضافة عنوان جديد
router.post('/addresses', ensureAuthenticated, userController.addAddress);

// تحديث عنوان
router.post('/addresses/:id', ensureAuthenticated, userController.updateAddress);

// جلب عنوان بواسطة المعرف
router.get('/addresses/:id', ensureAuthenticated, userController.getAddressById);


// حذف عنوان
router.delete('/addresses/:id', ensureAuthenticated, userController.deleteAddress);

// سلة التسوق
router.get('/cart', ensureAuthenticated, userController.getCart);

// إضافة عنصر إلى السلة
router.post('/cart', ensureAuthenticated, userController.addToCart);

// تحديث كمية عنصر في السلة
router.put('/cart/:id', ensureAuthenticated, userController.updateCartItem);

// حذف عنصر من السلة
router.delete('/cart/:id', ensureAuthenticated, userController.removeFromCart);

// طلبات المستخدم
router.get('/orders', ensureAuthenticated, userController.getOrders);

// تفاصيل طلب
router.get('/orders/:id', ensureAuthenticated, userController.getOrderDetails);

// إلغاء طلب
router.put('/orders/:id/cancel', ensureAuthenticated, userController.cancelOrder);

// اشتراكات المستخدم
router.get('/subscriptions', ensureAuthenticated, userController.getSubscriptions);

// إضافة اشتراك جديد
router.post('/subscriptions', ensureAuthenticated, userController.addSubscription);

// عرض خطط الاشتراك
router.get('/subscriptions/plans', ensureAuthenticated, userController.getSubscriptionPlans);

// عرض توصيلات الاشتراك
router.get('/subscriptions/:id/deliveries', ensureAuthenticated, userController.getSubscriptionDeliveries);

// تقييم طلب
router.post('/orders/:id/review', ensureAuthenticated, userController.reviewOrder);

module.exports = router;