const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { ensureAuthenticated, ensureAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Dashboard
router.get('/dashboard', ensureAuthenticated, ensureAdmin, adminController.getDashboard);

// User Management
router.get('/users', ensureAuthenticated, ensureAdmin, adminController.getUsers);
router.get('/api/users/:id', ensureAuthenticated, ensureAdmin, adminController.getUserData);
router.get('/users/:id', ensureAuthenticated, ensureAdmin, adminController.getUserDetails);
router.put('/users/:id', ensureAuthenticated, ensureAdmin, adminController.updateUser);
router.delete('/users/:id', ensureAuthenticated, ensureAdmin, adminController.deleteUser);

// Menu Management
router.get('/menu', ensureAuthenticated, ensureAdmin, adminController.getMenu);
router.post('/menu/categories', ensureAuthenticated, ensureAdmin, upload.single('image'), adminController.addCategory);
router.get('/menu/categories/:id', ensureAuthenticated, ensureAdmin, adminController.getCategory);
router.put('/menu/categories/:id', ensureAuthenticated, ensureAdmin, upload.single('image'), adminController.updateCategory);
router.delete('/menu/categories/:id', ensureAuthenticated, ensureAdmin, adminController.deleteCategory);
router.post('/menu/items', ensureAuthenticated, ensureAdmin, upload.single('image'), adminController.addMenuItem);
router.put('/menu/items/:id', ensureAuthenticated, ensureAdmin, upload.single('image'), adminController.updateMenuItem);
router.delete('/menu/items/:id', ensureAuthenticated, ensureAdmin, adminController.deleteMenuItem);
router.get('/menu/items/:id', ensureAuthenticated, ensureAdmin, adminController.getMenuItem);

// Daily Meals Management
router.get('/daily-meals', ensureAuthenticated, ensureAdmin, adminController.getDailyMeals);
router.get('/daily-meals/:id', ensureAuthenticated, ensureAdmin, adminController.getDailyMealDetails);
router.put('/daily-meals/:id', ensureAuthenticated, ensureAdmin, adminController.updateDailyMeal);
router.post('/daily-meals/:id/items', ensureAuthenticated, ensureAdmin, adminController.addDailyMealItem);
router.delete('/daily-meals/:id/items/:itemId', ensureAuthenticated, ensureAdmin, adminController.removeDailyMealItem);


// Order Management
router.get('/orders', ensureAuthenticated, ensureAdmin, adminController.getOrders);
router.get('/orders/:id', ensureAuthenticated, ensureAdmin, adminController.getOrderDetails);
router.put('/orders/:id/status', ensureAuthenticated, ensureAdmin, adminController.updateOrderStatus);

// Subscription Management
router.get('/subscriptions', ensureAuthenticated, ensureAdmin, adminController.getSubscriptions);
router.get('/subscriptions/:id', ensureAuthenticated, ensureAdmin, adminController.getSubscriptionDetails);

router.post('/subscriptions/plans', ensureAuthenticated, ensureAdmin, adminController.addSubscriptionPlan);
router.get('/subscriptions/plans/:id', ensureAuthenticated, ensureAdmin, adminController.getSubscriptionPlan);
router.put('/subscriptions/plans/:id', ensureAuthenticated, ensureAdmin, adminController.updateSubscriptionPlan);
router.delete('/subscriptions/plans/:id', ensureAuthenticated, ensureAdmin, adminController.deleteSubscriptionPlan);

// Promotions
router.get('/promotions', ensureAuthenticated, ensureAdmin, adminController.getPromotions);
router.post('/promotions', ensureAuthenticated, ensureAdmin, upload.single('image'), adminController.addPromotion);
router.get('/promotions/:id', ensureAuthenticated, ensureAdmin, adminController.getPromotion);
router.put('/promotions/:id', ensureAuthenticated, ensureAdmin, upload.single('image'), adminController.updatePromotion);
router.delete('/promotions/:id', ensureAuthenticated, ensureAdmin, adminController.deletePromotion);



// Delivery Companies
router.get('/delivery-companies', ensureAuthenticated, ensureAdmin, adminController.getDeliveryCompanies);
router.post('/delivery-companies', ensureAuthenticated, ensureAdmin, adminController.addDeliveryCompany);
router.put('/delivery-companies/:id', ensureAuthenticated, ensureAdmin, adminController.updateDeliveryCompany);
router.delete('/delivery-companies/:id', ensureAuthenticated, ensureAdmin, adminController.deleteDeliveryCompany);

// Payment Gateways
router.get('/payment-gateways', ensureAuthenticated, ensureAdmin, adminController.getPaymentGateways);
router.post('/payment-gateways', ensureAuthenticated, ensureAdmin, adminController.addPaymentGateway);
router.put('/payment-gateways/:id', ensureAuthenticated, ensureAdmin, adminController.updatePaymentGateway);
router.delete('/payment-gateways/:id', ensureAuthenticated, ensureAdmin, adminController.deletePaymentGateway);

// Reports
router.get('/reports', ensureAuthenticated, ensureAdmin, adminController.getReports);
router.get('/reports/sales', ensureAuthenticated, ensureAdmin, adminController.getSalesReport);
router.get('/reports/items', ensureAuthenticated, ensureAdmin, adminController.getItemsReport);
router.get('/reports/customers', ensureAuthenticated, ensureAdmin, adminController.getCustomersReport);

// Settings
router.get('/settings', ensureAuthenticated, ensureAdmin, adminController.getSettings);
router.post('/settings', ensureAuthenticated, ensureAdmin, adminController.updateSettings);

module.exports = router;