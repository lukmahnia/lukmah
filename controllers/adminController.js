const User = require('../models/User');
const MenuItem = require('../models/MenuItem');
const Category = require('../models/Category');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Promotion = require('../models/Promotion');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const UserSubscription = require('../models/UserSubscription');
const DeliveryCompany = require('../models/DeliveryCompany');
const PaymentGateway = require('../models/PaymentGateway');
const BusinessHours = require('../models/BusinessHours');
const ActivityLog = require('../models/ActivityLog');
const OrderStatusHistory = require('../models/OrderStatusHistory');
const Setting = require('../models/Setting');
const DailyMeal = require('../models/DailyMeal');
const DailyMealItem = require('../models/DailyMealItem');

const adminController = {
    getDashboard: async (req, res) => {
        try {
            const todayOrders = await Order.getTodayOrders();
            const todayRevenue = await Order.getTodayRevenue();
            const newCustomers = await User.getTodayNewCustomers();
            const activeSubscriptions = await UserSubscription.getActiveCount();
            const recentOrders = await Order.getAll(10);
            const topSellingItems = await OrderItem.getTopSellingItems(10);
            
            res.render('admin/dashboard', {
                stats: {
                    todayOrders,
                    todayRevenue,
                    newCustomers,
                    activeSubscriptions
                },
                recentOrders,
                topSellingItems
            });
        } catch (err) {
            console.error(err);
            req.flash('error_msg', 'حدث خطأ أثناء تحميل لوحة التحكم');
            res.render('admin/dashboard', {
                stats: {},
                recentOrders: [],
                topSellingItems: []
            });
        }
    },

    getUsers: async (req, res) => {
        try {
            const users = await User.getAll();
            res.render('admin/users', { users });
        } catch (err) {
            console.error(err);
            req.flash('error_msg', 'حدث خطأ أثناء تحميل المستخدمين');
            res.render('admin/users', { users: [] });
        }
    },

    getUserDetails: async (req, res) => {
        try {
            const userId = req.params.id;
            const user = await User.findById(userId);

            if (!user) {
                req.flash('error_msg', 'المستخدم غير موجود');
                return res.redirect('/admin/users');
            }

            const addresses = await User.getAddresses(userId);
            const orders = await Order.findByUser(userId, 10, 0);
            const subscriptions = await UserSubscription.getByUser(userId);

            res.render('admin/user-details', { user, addresses, orders, subscriptions });
        } catch (err) {
            console.error('Error in getUserDetails:', err);
            req.flash('error_msg', 'حدث خطأ أثناء تحميل بيانات المستخدم');
            res.redirect('/admin/users');
        }
    },

    updateUser: async (req, res) => {
        try {
            const userId = req.params.id;
            const { name, phone, role, loyalty_points } = req.body;
            await User.update(userId, { name, phone, role, loyalty_points });
            req.flash('success_msg', 'تم تحديث المستخدم بنجاح');
            res.redirect('/admin/users');
        } catch (err) {
            console.error(err);
            req.flash('error_msg', 'حدث خطأ أثناء تحديث المستخدم');
            res.redirect('/admin/users');
        }
    },

    deleteUser: async (req, res) => {
        try {
            const userId = req.params.id;
            await User.delete(userId);
            req.flash('success_msg', 'تم حذف المستخدم بنجاح');
            res.redirect('/admin/users');
        } catch (err) {
            console.error(err);
            req.flash('error_msg', 'حدث خطأ أثناء حذف المستخدم');
            res.redirect('/admin/users');
        }
    },

    getMenu: async (req, res) => {
        try {
            const categories = await Category.getAll();
            const menuItems = await MenuItem.getAll();
            res.render('admin/menu', { categories, menuItems });
        } catch (err) {
            console.error(err);
            req.flash('error_msg', 'حدث خطأ أثناء تحميل القائمة');
            res.render('admin/menu', { categories: [], menuItems: [] });
        }
    },

    addCategory: async (req, res) => {
        try {
            const { name, description } = req.body;
            let imageUrl = '/images/default-category.jpg'; // Default image
            if (req.file) {
                imageUrl = `/images/${req.file.filename}`;
            }
            await Category.create({ name, description, image_url: imageUrl });
            req.flash('success_msg', 'تمت إضافة الفئة بنجاح');
            res.redirect('/admin/menu');
        } catch (err) {
            console.error(err);
            req.flash('error_msg', 'حدث خطأ أثناء تحديث الفئة');
            res.redirect('/admin/menu');
        }
    },

    getCategory: async (req, res) => {
        try {
            const category = await Category.findById(req.params.id);
            if (!category) {
                return res.status(404).json({ success: false, message: 'الفئة غير موجودة' });
            }
            res.json(category);
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'حدث خطأ أثناء تحميل بيانات الفئة' });
        }
    },

    updateCategory: async (req, res) => {
        try {
            const categoryId = req.params.id;
            const { name, description } = req.body;
            let imageUrl;
            if (req.file) {
                imageUrl = `/images/${req.file.filename}`;
            }
            const category = await Category.findById(categoryId);
            await Category.update(categoryId, { name, description, image_url: imageUrl || category.image_url });
            req.flash('success_msg', 'تم تحديث الفئة بنجاح');
            res.redirect('/admin/menu');
        } catch (err) {
            console.error(err);
            req.flash('error_msg', 'حدث خطأ أثناء تحديث الفئة');
            res.redirect('/admin/menu');
        }
    },

    deleteCategory: async (req, res) => {
        try {
            const categoryId = req.params.id;
            await Category.delete(categoryId);
            req.flash('success_msg', 'تم حذف الفئة بنجاح');
            res.redirect('/admin/menu');
        } catch (err) {
            console.error(err);
            req.flash('error_msg', 'حدث خطأ أثناء حذف الفئة');
            res.redirect('/admin/menu');
        }
    },

    addMenuItem: async (req, res) => {
        try {
            const { category_id, name, description, price, image_url, calories, is_available, is_subscription_item } = req.body;
            let imageUrl = image_url;
            if (req.file) {
                imageUrl = `/images/${req.file.filename}`;
            }
            await MenuItem.create({
                category_id, name, description, price,
                image_url: imageUrl, calories,
                is_available: is_available ? 1 : 0,
                is_subscription_item: is_subscription_item ? 1 : 0
            });
            req.flash('success_msg', 'تمت إضافة عنصر القائمة بنجاح');
            res.redirect('/admin/menu');
        } catch (err) {
            console.error(err);
            req.flash('error_msg', 'حدث خطأ أثناء إضافة عنصر القائمة');
            res.redirect('/admin/menu');
        }
    },

    updateMenuItem: async (req, res) => {
        try {
            const itemId = req.params.id;
            const { category_id, name, description, price, image_url, calories, is_available, is_subscription_item } = req.body;
            let imageUrl = image_url;
            if (req.file) {
                imageUrl = `/images/${req.file.filename}`;
            }
            await MenuItem.update(itemId, {
                category_id, name, description, price,
                image_url: imageUrl, calories,
                is_available: is_available ? 1 : 0,
                is_subscription_item: is_subscription_item ? 1 : 0
            });
            req.flash('success_msg', 'تم تحديث عنصر القائمة بنجاح');
            res.redirect('/admin/menu');
        } catch (err) {
            console.error(err);
            req.flash('error_msg', 'حدث خطأ أثناء تحديث عنصر القائمة');
            res.redirect('/admin/menu');
        }
    },

    deleteMenuItem: async (req, res) => {
        try {
            const itemId = req.params.id;
            await MenuItem.delete(itemId);
            req.flash('success_msg', 'تم حذف عنصر القائمة بنجاح');
            res.redirect('/admin/menu');
        } catch (err) {
            console.error(err);
            req.flash('error_msg', 'حدث خطأ أثناء حذف عنصر القائمة');
            res.redirect('/admin/menu');
        }
    },

    getMenuItem: async (req, res) => {
        try {
            const itemId = req.params.id;
            const item = await MenuItem.findById(itemId);
            if (!item) {
                return res.status(404).json({ success: false, message: 'العنصر غير موجود' });
            }
            res.json(item);
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'حدث خطأ أثناء تحميل بيانات العنصر' });
        }
    },

    getOrders: async (req, res) => {
        try {
            const { status, date_from, date_to } = req.query;
            let orders;
            if (status || date_from || date_to) {
                orders = await Order.getFiltered(status, date_from, date_to);
            } else {
                orders = await Order.getAll(100);
            }
            res.render('admin/orders', { orders, filters: { status, date_from, date_to } });
        } catch (err) {
            console.error(err);
            req.flash('error_msg', 'حدث خطأ أثناء تحميل الطلبات');
            res.render('admin/orders', { orders: [], filters: {} });
        }
    },

    getOrderDetails: async (req, res) => {
        try {
            const orderId = req.params.id;
            const order = await Order.findById(orderId);
            if (!order) {
                req.flash('error_msg', 'الطلب غير موجود');
                return res.redirect('/admin/orders');
            }
            const orderItems = await Order.getItems(orderId);
            const statusHistory = await OrderStatusHistory.getByOrder(orderId);

            let subtotal = 0;
            orderItems.forEach(item => {
                subtotal += item.price_per_item * item.quantity;
            });

            const settings = await Setting.getAll();

            const deliveryFee = parseFloat(settings.delivery_fee) || 0;
            const taxRate = parseFloat(settings.tax_rate) || 0;
            const tax = subtotal * taxRate;
            const discountAmount = order.discount_id ? (await Promotion.findById(order.discount_id)).value : 0;
            const total = subtotal + deliveryFee + tax - discountAmount;

            res.render('admin/order-details', { 
                order, 
                orderItems, 
                statusHistory,
                subtotal,
                deliveryFee,
                tax,
                discountAmount,
                total
            });
        } catch (err) {
            console.error(err);
            req.flash('error_msg', 'حدث خطأ أثناء تحميل تفاصيل الطلب');
            res.redirect('/admin/orders');
        }
    },

    updateOrderStatus: async (req, res) => {
        try {
            const orderId = req.params.id;
            const { status } = req.body;
            await Order.updateStatus(orderId, status);
            // const order = await Order.findById(orderId);
            // await Notification.create({
            //     user_id: order.user_id,
            //     message: `تم تحديث حالة طلبك #${orderId} إلى: ${status}`,
            //     related_order_id: orderId
            // });
            res.json({ success: true, message: 'تم تحديث حالة الطلب بنجاح' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'حدث خطأ أثناء تحديث حالة الطلب' });
        }
    },

    getSubscriptions: async (req, res) => {
        try {
            const plans = await SubscriptionPlan.getAll();
            const userSubscriptions = await UserSubscription.getAll();
            res.render('admin/subscriptions', { plans, userSubscriptions });
        } catch (err) {
            console.error(err);
            req.flash('error_msg', 'حدث خطأ أثناء تحميل الاشتراكات');
            res.render('admin/subscriptions', { plans: [], userSubscriptions: [] });
        }
    },

    addSubscriptionPlan: async (req, res) => {
        try {
            const { name, plan_type, duration_days, meals_per_day, price } = req.body;
            await SubscriptionPlan.create({ name, plan_type, duration_days, meals_per_day, price });
            res.json({ success: true, message: 'تمت إضافة خطة الاشتراك بنجاح' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'حدث خطأ أثناء إضافة خطة الاشتراك' });
        }
    },

    updateSubscriptionPlan: async (req, res) => {
        try {
            const planId = req.params.id;
            const { name, plan_type, duration_days, meals_per_day, price } = req.body;
            await SubscriptionPlan.update(planId, { name, plan_type, duration_days, meals_per_day, price });
            res.json({ success: true, message: 'تم تحديث خطة الاشتراك بنجاح' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'حدث خطأ أثناء تحديث خطة الاشتراك' });
        }
    },

    getSubscriptionPlan: async (req, res) => {
        try {
            const planId = req.params.id;
            const plan = await SubscriptionPlan.findById(planId);
            if (!plan) {
                return res.status(404).json({ success: false, message: 'خطة الاشتراك غير موجودة' });
            }
            res.json({ success: true, plan });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'حدث خطأ أثناء تحميل بيانات خطة الاشتراك' });
        }
    },

    deleteSubscriptionPlan: async (req, res) => {
        try {
            const planId = req.params.id;
            await SubscriptionPlan.delete(planId);
            res.json({ success: true, message: 'تم حذف خطة الاشتراك بنجاح' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'حدث خطأ أثناء حذف خطة الاشتراك' });
        }
    },

    getSubscriptionDetails: async (req, res) => {
        try {
            const subscriptionId = req.params.id;
            const subscription = await UserSubscription.findById(subscriptionId);
    
            if (!subscription) {
                return res.status(404).json({ success: false, message: 'الاشتراك غير موجود' });
            }
    
            const plan = await SubscriptionPlan.findById(subscription.plan_id);
            const user = await User.findById(subscription.user_id);
            const deliveries = await UserSubscription.getDeliveries(subscriptionId);
    
            res.json({
                ...subscription,
                user_name: user.name,
                plan_name: plan.name,
                duration_days: plan.duration_days,
                meals_per_day: plan.meals_per_day,
                price: plan.price,
                deliveries
            });
        } catch (err) {
            console.error('Error in getSubscriptionDetails:', err);
            res.status(500).json({ success: false, message: 'حدث خطأ أثناء تحميل تفاصيل الاشتراك' });
        }
    },

    getPromotions: async (req, res) => {
        try {
            const promotions = await Promotion.getAll();
            res.render('admin/promotions', { promotions });
        } catch (err) {
            console.error(err);
            req.flash('error_msg', 'حدث خطأ أثناء تحميل العروض الترويجية');
            res.render('admin/promotions', { promotions: [] });
        }
    },

    addPromotion: async (req, res) => {
        try {
            console.log('req.body:', req.body);
            console.log('req.file:', req.file);
            const { code, description, discount_type, value, valid_from, valid_until, is_active } = req.body;
            let image_url = null;
            if (req.file) {
                image_url = `/images/${req.file.filename}`;
            }
            await Promotion.create({
                code, description, discount_type, value, valid_from, valid_until,
                is_active: is_active ? 1 : 0,
                image_url
            });
            res.json({ success: true, message: 'تمت إضافة العرض الترويجي بنجاح' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'حدث خطأ أثناء إضافة العرض الترويجي' });
        }
    },

    updatePromotion: async (req, res) => {
        try {
            console.log('req.body:', req.body);
            console.log('req.file:', req.file);
            const promoId = req.params.id;
            const { code, description, discount_type, value, valid_from, valid_until, is_active } = req.body;
            const promotion = await Promotion.findById(promoId);
            let image_url = promotion.image_url;
            if (req.file) {
                image_url = `/images/${req.file.filename}`;
            }
            await Promotion.update(promoId, {
                code, description, discount_type, value, valid_from, valid_until,
                is_active: is_active ? 1 : 0,
                image_url
            });
            res.json({ success: true, message: 'تم تحديث العرض الترويجي بنجاح' });
        } catch (err) {
            console.error('Error in updatePromotion:', err);
            res.status(500).json({ success: false, message: 'حدث خطأ أثناء تحديث العرض الترويجي' });
        }
    },

    getPromotion: async (req, res) => {
        try {
            const promoId = req.params.id;
            const promotion = await Promotion.findById(promoId);
            if (!promotion) {
                return res.status(404).json({ success: false, message: 'العرض الترويجي غير موجود' });
            }
            res.json(promotion);
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'حدث خطأ أثناء تحميل بيانات العرض الترويجي' });
        }
    },

    deletePromotion: async (req, res) => {
        try {
            const promoId = req.params.id;
            await Promotion.delete(promoId);
            res.json({ success: true, message: 'تم حذف العرض الترويجي بنجاح' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'حدث خطأ أثناء حذف العرض الترويجي' });
        }
    },

    getDeliveryCompanies: async (req, res) => {
        try {
            const companies = await DeliveryCompany.getAll();
            res.render('admin/delivery-companies', { companies });
        } catch (err) {
            console.error(err);
            req.flash('error_msg', 'حدث خطأ أثناء تحميل شركات التوصيل');
            res.render('admin/delivery-companies', { companies: [] });
        }
    },

    addDeliveryCompany: async (req, res) => {
        try {
            const { name, api_details } = req.body;
            await DeliveryCompany.create({ name, api_details });
            req.flash('success_msg', 'تمت إضافة شركة التوصيل بنجاح');
            res.redirect('/admin/delivery-companies');
        } catch (err) {
            console.error(err);
            req.flash('error_msg', 'حدث خطأ أثناء إضافة شركة التوصيل');
            res.redirect('/admin/delivery-companies');
        }
    },

    updateDeliveryCompany: async (req, res) => {
        try {
            const companyId = req.params.id;
            const { name, api_details } = req.body;
            await DeliveryCompany.update(companyId, { name, api_details });
            req.flash('success_msg', 'تم تحديث شركة التوصيل بنجاح');
            res.redirect('/admin/delivery-companies');
        } catch (err) {
            console.error(err);
            req.flash('error_msg', 'حدث خطأ أثناء تحديث شركة التوصيل');
            res.redirect('/admin/delivery-companies');
        }
    },

    deleteDeliveryCompany: async (req, res) => {
        try {
            const companyId = req.params.id;
            await DeliveryCompany.delete(companyId);
            req.flash('success_msg', 'تم حذف شركة التوصيل بنجاح');
            res.redirect('/admin/delivery-companies');
        } catch (err) {
            console.error(err);
            req.flash('error_msg', 'حدث خطأ أثناء حذف شركة التوصيل');
            res.redirect('/admin/delivery-companies');
        }
    },

    getPaymentGateways: async (req, res) => {
        try {
            const gateways = await PaymentGateway.getAll();
            res.render('admin/payment-gateways', { gateways });
        } catch (err) {
            console.error(err);
            req.flash('error_msg', 'حدث خطأ أثناء تحميل بوابات الدفع');
            res.render('admin/payment-gateways', { gateways: [] });
        }
    },

    addPaymentGateway: async (req, res) => {
        try {
            const { name, api_keys, is_active } = req.body;
            await PaymentGateway.create({ name, api_keys, is_active: is_active ? 1 : 0 });
            req.flash('success_msg', 'تمت إضافة بوابة الدفع بنجاح');
            res.redirect('/admin/payment-gateways');
        } catch (err) {
            console.error(err);
            req.flash('error_msg', 'حدث خطأ أثناء إضافة بوابة الدفع');
            res.redirect('/admin/payment-gateways');
        }
    },

    updatePaymentGateway: async (req, res) => {
        try {
            const gatewayId = req.params.id;
            const { name, api_keys, is_active } = req.body;
            await PaymentGateway.update(gatewayId, { name, api_keys, is_active: is_active ? 1 : 0 });
            req.flash('success_msg', 'تم تحديث بوابة الدفع بنجاح');
            res.redirect('/admin/payment-gateways');
        } catch (err) {
            console.error(err);
            req.flash('error_msg', 'حدث خطأ أثناء تحديث بوابة الدفع');
            res.redirect('/admin/payment-gateways');
        }
    },

    deletePaymentGateway: async (req, res) => {
        try {
            const gatewayId = req.params.id;
            await PaymentGateway.delete(gatewayId);
            req.flash('success_msg', 'تم حذف بوابة الدفع بنجاح');
            res.redirect('/admin/payment-gateways');
        } catch (err) {
            console.error(err);
            req.flash('error_msg', 'حدث خطأ أثناء حذف بوابة الدفع');
            res.redirect('/admin/payment-gateways');
        }
    },
    
    getReports: async (req, res) => {
        try {
            res.render('admin/reports');
        } catch (err) {
            console.error(err);
            req.flash('error_msg', 'حدث خطأ أثناء تحميل صفحة التقارير');
            res.render('admin/reports');
        }
    },

    getSalesReport: async (req, res) => {
        try {
            const period = req.query.period || 'daily';
            let reportData;

            switch (period) {
                case 'daily':
                    reportData = await Order.getDailySalesReport();
                    break;
                case 'weekly':
                    reportData = await Order.getWeeklySalesReport();
                    break;
                case 'monthly':
                    reportData = await Order.getMonthlySalesReport();
                    break;
                case 'overall':
                    reportData = await Order.getOverallSalesReport();
                    break;
                default:
                    reportData = await Order.getDailySalesReport();
            }

            // For sales report, we need labels and values for the chart
            let labels = [];
            let values = [];
            let totalRevenue = 0;
            let totalOrders = 0;
            let avgOrderValue = 0;
            let conversionRate = 0; // Placeholder for now

            if (period === 'overall') {
                totalRevenue = reportData.totalRevenue || 0;
                totalOrders = reportData.totalOrders || 0;
                avgOrderValue = reportData.avgOrderValue || 0;
            } else {
                if (reportData && reportData.length > 0) {
                    labels = reportData.map(item => item.date || item.week || item.month);
                    values = reportData.map(item => item.revenue);
                    totalRevenue = values.reduce((sum, val) => sum + val, 0);
                    totalOrders = reportData.reduce((sum, val) => sum + val.orders, 0);
                    avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
                } else {
                    // No data for the period
                    labels = [];
                    values = [];
                    totalRevenue = 0;
                    totalOrders = 0;
                    avgOrderValue = 0;
                }
            }

            res.json({
                totalRevenue: totalRevenue,
                totalOrders: totalOrders,
                avgOrderValue: avgOrderValue,
                labels: labels,
                values: values
            });

        } catch (err) {
            console.error('Error in getSalesReport:', err);
            res.status(500).json({ success: false, message: 'حدث خطأ أثناء تحميل تقرير المبيعات' });
        }
    },

    getItemsReport: async (req, res) => {
        try {
            const rawItems = await OrderItem.getTopSellingItems();
            const itemsReport = rawItems.map(item => ({
                name: item.name,
                category: item.category,
                price: item.price,
                quantitySold: item.quantity, // Map 'quantity' to 'quantitySold'
                revenue: item.total // Map 'total' to 'revenue'
            }));
            res.json(itemsReport);
        } catch (err) {
            console.error('Error in getItemsReport:', err);
            res.status(500).json({ success: false, message: 'حدث خطأ أثناء تحميل تقرير المنتجات' });
        }
    },

    getCustomersReport: async (req, res) => {
        try {
            const customerStats = await User.getCustomersReport();
            // Assuming customerStats contains totalCustomers, newThisMonth, etc.
            // You might need to calculate returningCustomers and inactiveCustomers based on your data
            const totalCustomers = customerStats.totalCustomers || 0;
            const newThisMonth = customerStats.newThisMonth || 0;
            const activeCustomers = 0; // Placeholder, needs actual logic
            const returningCustomers = 0; // Placeholder, needs actual logic
            const inactiveCustomers = 0; // Placeholder, needs actual logic

            res.json({
                totalCustomers: totalCustomers,
                newThisMonth: newThisMonth,
                activeCustomers: activeCustomers,
                returningCustomers: returningCustomers,
                inactiveCustomers: inactiveCustomers
            });
        } catch (err) {
            console.error('Error in getCustomersReport:', err);
            res.status(500).json({ success: false, message: 'حدث خطأ أثناء تحميل تقرير العملاء' });
        }
    },

    getSettings: async (req, res) => {
        try {
            const businessHours = await BusinessHours.getAll();
            const settingsFromDB = await Setting.getAll();

            const defaultSettings = {
                restaurant_name: 'اسم المطعم الافتراضي',
                phone_number: '123456789',
                email: 'info@example.com',
                currency: 'SAR',
                min_order_amount: '50',
                default_preparation_time: '20',
                discount_value: '0',
                tax_rate: '0.15',
                delivery_fee: '10',
                notification_new_order: 'true',
                notification_order_status: 'true',
                notification_promotion: 'true',
                notification_subscription: 'true',
                facebook_url: '',
                twitter_url: '',
                instagram_url: '',
                linkedin_url: '',
                youtube_url: ''
            };

            const settings = { ...defaultSettings, ...settingsFromDB };

            const generalSettings = {};
            const notificationsSettings = {};

            for (const key in settings) {
                if (key.startsWith('notification_')) {
                    notificationsSettings[key] = settings[key];
                } else {
                    generalSettings[key] = settings[key];
                }
            }

            res.render('admin/settings', { 
                businessHours, 
                settings: {
                    general: generalSettings,
                    notifications: notificationsSettings
                }
            });
        } catch (err) {
            console.error(err);
            req.flash('error_msg', 'حدث خطأ أثناء تحميل الإعدادات');
            res.render('admin/settings', { businessHours: [], settings: { general: {}, notifications: {} } });
        }
    },

    updateSettings: async (req, res) => {
        try {
            const { businessHours, generalSettings, notificationsSettings } = req.body;

            // Update Business Hours
            if (businessHours) {
                for (const hour of businessHours) {
                    await BusinessHours.update(hour.id, {
                        day_of_week: hour.day_of_week,
                        open_time: hour.open_time,
                        close_time: hour.close_time,
                        is_open: hour.is_open
                    });
                }
            }

            // Update General Settings
            if (generalSettings) {
                await Setting.bulkUpdate(generalSettings);
            }

            // Update Notifications Settings
            if (notificationsSettings) {
                await Setting.bulkUpdate(notificationsSettings);
            }

            res.json({ success: true, message: 'تم تحديث الإعدادات بنجاح' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'حدث خطأ أثناء تحديث الإعدادات' });
        }
    },

    getDailyMeals: async (req, res) => {
        try {
            const dailyMeals = await DailyMeal.getAll();
            res.render('admin/daily-meals', { dailyMeals });
        } catch (err) {
            console.error(err);
            req.flash('error_msg', 'حدث خطأ أثناء تحميل الوجبات اليومية');
            res.redirect('/admin/dashboard');
        }
    },

    getDailyMealDetails: async (req, res) => {
        try {
            const mealId = req.params.id;
            const meal = await DailyMeal.findById(mealId);
            if (!meal) {
                req.flash('error_msg', 'الوجبة اليومية غير موجودة');
                return res.redirect('/admin/daily-meals');
            }
            const mealItems = await DailyMealItem.getByMealId(mealId);
            const allItems = await MenuItem.getAll();
            res.render('admin/edit-daily-meal', { meal, mealItems, allItems });
        } catch (err) {
            console.error(err);
            req.flash('error_msg', 'حدث خطأ أثناء تحميل تفاصيل الوجبة اليومية');
            res.redirect('/admin/daily-meals');
        }
    },

    updateDailyMeal: async (req, res) => {
        try {
            const mealId = req.params.id;
            const { name, description } = req.body;
            await DailyMeal.update(mealId, { name, description });
            req.flash('success_msg', 'تم تحديث الوجبة اليومية بنجاح');
            res.redirect(`/admin/daily-meals/${mealId}`);
        } catch (err) {
            console.error(err);
            req.flash('error_msg', 'حدث خطأ أثناء تحديث الوجبة اليومية');
            res.redirect(`/admin/daily-meals/${mealId}`);
        }
    },

    addDailyMealItem: async (req, res) => {
        try {
            const mealId = req.params.id;
            const { menuItemId } = req.body;
            await DailyMealItem.create({ daily_meal_id: mealId, menu_item_id: menuItemId });
            req.flash('success_msg', 'تمت إضافة العنصر إلى الوجبة بنجاح');
            res.redirect(`/admin/daily-meals/${mealId}`);
        } catch (err) {
            console.error(err);
            req.flash('error_msg', 'حدث خطأ أثناء إضافة العنصر إلى الوجبة');
            res.redirect(`/admin/daily-meals/${mealId}`);
        }
    },

    removeDailyMealItem: async (req, res) => {
        try {
            const { id, itemId } = req.params;
            await DailyMealItem.delete(id, itemId);
            req.flash('success_msg', 'تم حذف العنصر من الوجبة بنجاح');
            res.redirect(`/admin/daily-meals/${id}`);
        } catch (err) {
            console.error(err);
            req.flash('error_msg', 'حدث خطأ أثناء حذف العنصر من الوجبة');
            res.redirect(`/admin/daily-meals/${id}`);
        }
    }
};

module.exports = adminController;