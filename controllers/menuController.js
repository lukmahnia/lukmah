const MenuItem = require('../models/MenuItem');
const Category = require('../models/Category');
const UserReview = require('../models/UserReview');
const DailyMeal = require('../models/DailyMeal');
const DailyMealItem = require('../models/DailyMealItem');

const menuController = {
    getAllCategories: async (req, res) => {
        try {
            const categories = await Category.getAll();
            
            res.render('menu/categories', { categories });
        } catch (err) {
            console.error(err);
            res.status(500).send('حدث خطأ أثناء تحميل الفئات');
        }
    },

    getCategoryItems: async (req, res) => {
        try {
            const categoryId = req.params.id;
            const category = await Category.findById(categoryId);
            
            if (!category) {
                return res.status(404).send('الفئة غير موجودة');
            }
            
            const items = await MenuItem.findByCategory(categoryId);
            
            res.render('menu/category-items', { category, items });
        } catch (err) {
            console.error(err);
            res.status(500).send('حدث خطأ أثناء تحميل عناصر الفئة');
        }
    },

    searchItems: async (req, res) => {
        try {
            const { q } = req.query;
            
            if (!q) {
                return res.redirect('/menu');
            }
            
            const items = await MenuItem.search(q);
            
            res.render('menu/search-results', { items, query: q });
        } catch (err) {
            console.error(err);
            res.status(500).send('حدث خطأ أثناء البحث في القائمة');
        }
    },

    getItemDetails: async (req, res) => {
        try {
            const itemId = req.params.id;
            const item = await MenuItem.findById(itemId);
            
            if (!item) {
                return res.status(404).send('العنصر غير موجود');
            }
            
            // الحصول على تقييمات العنصر
            const reviews = await UserReview.getByMenuItem(itemId);
            
            res.render('menu/item-details', { item, reviews });
        } catch (err) {
            console.error(err);
            res.status(500).send('حدث خطأ أثناء تحميل تفاصيل العنصر');
        }
    },

    getMealOfTheDay: async (req, res) => {
        try {
            const today = new Date();
            const dayOfWeek = today.getDay(); // Sunday = 0, Monday = 1, etc.

            const meal = await DailyMeal.findByDay(dayOfWeek);

            if (!meal) {
                // Handle case where no meal is set for today
                return res.render('menu/meal-of-the-day', { meal: null, items: [] });
            }

            const items = await DailyMealItem.getByMealId(meal.id);

            res.render('menu/meal-of-the-day', { meal, items });
        } catch (err) {
            console.error(err);
            res.status(500).send('حدث خطأ أثناء تحميل وجبة اليوم');
        }
    }
};

module.exports = menuController;