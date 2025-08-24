const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');

// عرض جميع الفئات
router.get('/', menuController.getAllCategories);

// عرض عناصر فئة معينة
router.get('/category/:id', menuController.getCategoryItems);

// البحث في القائمة
router.get('/search', menuController.searchItems);

// تفاصيل عنصر معين
router.get('/item/:id', menuController.getItemDetails);

// وجبة اليوم
router.get('/meal-of-the-day', menuController.getMealOfTheDay);

module.exports = router;