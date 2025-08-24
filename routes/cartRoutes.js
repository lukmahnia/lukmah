const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth');
const cartController = require('../controllers/cartController');

// عرض سلة التسوق
router.get('/', ensureAuthenticated, cartController.getCart);

// إضافة عنصر إلى السلة
router.post('/', ensureAuthenticated, cartController.addToCart);

// تحديث كمية عنصر في السلة
router.put('/:id', ensureAuthenticated, cartController.updateCartItem);

// حذف عنصر من السلة
router.delete('/:id', ensureAuthenticated, cartController.removeFromCart);

// تفريغ السلة
router.delete('/clear', ensureAuthenticated, cartController.clearCart);

module.exports = router;