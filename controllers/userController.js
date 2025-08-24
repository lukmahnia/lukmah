const User = require('../models/User');
const Address = require('../models/Address');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const UserSubscription = require('../models/UserSubscription');
const UserReview = require('../models/UserReview');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const SubscriptionDelivery = require('../models/SubscriptionDelivery');
const OrderStatusHistory = require('../models/OrderStatusHistory');
const Setting = require('../models/Setting');

const userController = {
    getDashboard: async (req, res) => {
        try {
            const userId = req.session.user.id;
            const user = await User.findById(userId);
            const recentOrders = await Order.findByUser(userId, 5, 0);
            const activeSubscriptions = await UserSubscription.getActiveByUser(userId);
            const addresses = await User.getAddresses(userId);

            // Calculate counts
            const activeOrdersCount = recentOrders.filter(o => o.status === 'Pending' || o.status === 'Preparing' || o.status === 'Ready').length;
            const activeSubscriptionsCount = activeSubscriptions.length;
            const addressesCount = addresses.length;
            
            res.render('user/dashboard', {
                user,
                recentOrders,
                activeSubscriptions,
                activeOrdersCount,
                activeSubscriptionsCount,
                addressesCount
            });
        } catch (err) {
            console.error(err);
            res.status(500).send('حدث خطأ أثناء تحميل لوحة التحكم');
        }
    },

    getProfile: async (req, res) => {
        try {
            const userId = req.session.user.id;
            const user = await User.findById(userId);
            
            res.render('user/profile', { user });
        } catch (err) {
            console.error(err);
            res.status(500).send('حدث خطأ أثناء تحميل الملف الشخصي');
        }
    },

    updateProfile: async (req, res) => {
        try {
            const userId = req.session.user.id;
            const { name, phone } = req.body;
            
            await User.update(userId, { name, phone });
            
            req.session.user.name = name;
            req.session.user.phone = phone;
            
            res.redirect('/user/profile');
        } catch (err) {
            console.error(err);
            res.status(500).send('حدث خطأ أثناء تحديث الملف الشخصي');
        }
    },

    getAddresses: async (req, res) => {
        try {
            const userId = req.session.user.id;
            const addresses = await User.getAddresses(userId);
            
            res.render('user/addresses', { addresses });
        } catch (err) {
            console.error(err);
            res.status(500).send('حدث خطأ أثناء تحميل العناوين');
        }
    },

    addAddress: async (req, res) => {
        try {
            const userId = req.session.user.id;
            const { street, city, state, zip_code, details } = req.body;
            
            await Address.create({
                user_id: userId,
                street,
                city,
                state,
                zip_code,
                details
            });
            
            res.redirect('/user/addresses');
        } catch (err) {
            console.error(err);
            res.status(500).send('حدث خطأ أثناء إضافة العنوان');
        }
    },

    updateAddress: async (req, res) => {
        try {
            const addressId = req.params.id;
            const { street, city, state, zip_code, details } = req.body;
            
            await Address.update(addressId, {
                street,
                city,
                state,
                zip_code,
                details
            });
            
            res.redirect('/user/addresses');
        } catch (err) {
            console.error(err);
            res.status(500).send('حدث خطأ أثناء تحديث العنوان');
        }
    },

    deleteAddress: async (req, res) => {
        try {
            const addressId = req.params.id;
            
            await Address.delete(addressId);
            
            res.redirect('/user/addresses');
        } catch (err) {
            console.error(err);
            res.status(500).send('حدث خطأ أثناء حذف العنوان');
        }
    },

    getAddressById: async (req, res) => {
        try {
            const addressId = req.params.id;
            const userId = req.session.user.id;

            const address = await Address.findById(addressId);

            if (!address || address.user_id !== userId) {
                return res.status(404).json({ success: false, message: 'العنوان غير موجود' });
            }

            res.json(address);
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'حدث خطأ أثناء تحميل بيانات العنوان' });
        }
    },

    getCart: async (req, res) => {
     try {
        const userId = req.session.user.id;
        const cartItems = await Cart.getByUser(userId);
        
        // حساب المجموع
        let subtotal = 0;
        cartItems.forEach(item => {
            subtotal += item.price * item.quantity;
        });
        
        // إضافة رسوم التوصيل والضريبة
        const settings = await Setting.getAll();
        const deliveryFee = parseFloat(settings.delivery_fee) || 0;
        const taxRate = parseFloat(settings.tax_rate) || 0;
        const tax = subtotal * taxRate;
        const total = subtotal + deliveryFee + tax;
        
        res.render('user/cart', { 
            cartItems, 
            subtotal,
            deliveryFee,
            tax,
            total
        });
     } catch (err) {
        console.error(err);
        req.flash('error_msg', 'حدث خطأ أثناء تحميل سلة التسوق');
        res.redirect('/menu');
     }
   },

    addToCart: async (req, res) => {
        try {
            const userId = req.session.user.id;
            const { menu_item_id, quantity = 1 } = req.body;
            
            // التحقق من وجود العنصر في السلة
            const existingItem = await Cart.findByUserAndItem(userId, menu_item_id);
            
            if (existingItem) {
                // تحديث الكمية
                await Cart.update(existingItem.id, {
                    quantity: existingItem.quantity + quantity
                });
            } else {
                // إضافة عنصر جديد
                await Cart.create({
                    user_id: userId,
                    menu_item_id,
                    quantity
                });
            }
            
            res.redirect('/cart');
        } catch (err) {
            console.error(err);
            res.status(500).send('حدث خطأ أثناء إضافة العنصر إلى السلة');
        }
    },

    updateCartItem: async (req, res) => {
        try {
            const cartItemId = req.params.id;
            const { quantity } = req.body;
            
            await Cart.update(cartItemId, { quantity });
            
            res.redirect('/cart');
        } catch (err) {
            console.error(err);
            res.status(500).send('حدث خطأ أثناء تحديث عنصر السلة');
        }
    },

    removeFromCart: async (req, res) => {
        try {
            const cartItemId = req.params.id;
            
            await Cart.delete(cartItemId);
            
            res.redirect('/cart');
        } catch (err) {
            console.error(err);
            res.status(500).send('حدث خطأ أثناء حذف عنصر من السلة');
        }
    },

    getOrders: async (req, res) => {
        try {
            const userId = req.session.user.id;
            const statusFilter = req.query.status || 'all';
            const currentPage = parseInt(req.query.page) || 1;
            const limit = 10; // 10 orders per page
            const offset = (currentPage - 1) * limit;

            let orders;
            let totalOrders;

            if (statusFilter === 'all') {
                orders = await Order.findByUser(userId, limit, offset);
                totalOrders = await Order.countByUser(userId);
            } else {
                orders = await Order.findByUserAndStatus(userId, statusFilter, limit, offset);
                totalOrders = await Order.countByUserAndStatus(userId, statusFilter);
            }

            const totalPages = Math.ceil(totalOrders / limit);
            
            res.render('user/orders', { 
                orders, 
                statusFilter, 
                totalPages, 
                currentPage 
            });
        } catch (err) {
            console.error(err);
            res.status(500).send('حدث خطأ أثناء تحميل الطلبات');
        }
    },

    getOrderDetails: async (req, res) => {
        try {
            const orderId = req.params.id;
            const userId = req.session.user.id;
            
            const order = await Order.findById(orderId);
            
            if (!order || order.user_id !== userId) {
                return res.status(404).send('الطلب غير موجود');
            }
            
            const orderItems = await Order.getItems(orderId);
            const statusHistory = await OrderStatusHistory.getByOrder(orderId);

            if (order.subtotal === null || order.subtotal === undefined) {
                // For old orders, calculate the values
                let subtotal = 0;
                orderItems.forEach(item => {
                    subtotal += item.price * item.quantity;
                });
                order.subtotal = subtotal;

                const settings = await Setting.getAll();
                const deliveryFee = parseFloat(settings.delivery_fee) || 0;
                const taxRate = parseFloat(settings.tax_rate) || 0;
                const tax = subtotal * taxRate;
                
                order.delivery_fee = deliveryFee;
                order.tax = tax;
                // total_amount will be wrong for old orders, but this is the best we can do without a migration script
            }

            res.render('user/order-details', {
                order,
                orderItems,
                statusHistory
            });
        } catch (err) {
            console.error(err);
            res.status(500).send('حدث خطأ أثناء تحميل تفاصيل الطلب');
        }
    },

    cancelOrder: async (req, res) => {
        try {
            const orderId = req.params.id;
            const userId = req.session.user.id;
            
            const order = await Order.findById(orderId);
            
            if (!order || order.user_id !== userId) {
                return res.status(404).send('الطلب غير موجود');
            }
            
            // التحقق من إمكانية الإلغاء
            if (order.status !== 'Pending') {
                return res.status(400).send('لا يمكن إلغاء الطلب في هذه المرحلة');
            }
            
            await Order.updateStatus(orderId, 'Cancelled');
            
            res.redirect('/user/orders');
        } catch (err) {
            console.error(err);
            res.status(500).send('حدث خطأ أثناء إلغاء الطلب');
        }
    },

    getSubscriptions: async (req, res) => {
        try {
            const userId = req.session.user.id;
            const subscriptions = await UserSubscription.getByUser(userId);
            
            res.render('user/subscriptions', { subscriptions });
        } catch (err) {
            console.error(err);
            res.status(500).send('حدث خطأ أثناء تحميل الاشتراكات');
        }
    },

        getSubscriptionPlans: async (req, res) => {
        try {
            const plans = await SubscriptionPlan.getAll();
            res.render('user/subscription-plans', { plans, title: 'خطط الاشتراك', activePage: 'subscriptions' });
        } catch (err) {
            console.error(err);
            res.status(500).send('حدث خطأ أثناء تحميل خطط الاشتراك');
        }
    },

    getSubscriptionDeliveries: async (req, res) => {
        try {
            const subscriptionId = req.params.id;
            const deliveries = await SubscriptionDelivery.getBySubscription(subscriptionId);
            res.json({ deliveries });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'حدث خطأ أثناء تحميل التوصيلات' });
        }
    },

    addSubscription: async (req, res) => {
        try {
            const userId = req.session.user.id;
            const { plan_id, start_date } = req.body;
            
            const plan = await SubscriptionPlan.findById(plan_id);
            
            if (!plan) {
                return res.status(404).send('خطة الاشتراك غير موجودة');
            }
            
            const endDate = new Date(start_date);
            endDate.setDate(endDate.getDate() + plan.duration_days);
            
            await UserSubscription.create({
                user_id: userId,
                plan_id,
                start_date,
                end_date: endDate.toISOString().split('T')[0],
                status: 'active'
            });
            
            res.redirect('/user/subscriptions');
        } catch (err) {
            console.error(err);
            res.status(500).send('حدث خطأ أثناء إضافة الاشتراك');
        }
    },

    reviewOrder: async (req, res) => {
        try {
            const orderId = req.params.id;
            const userId = req.session.user.id;
            const { rating, comment } = req.body;

            const order = await Order.findById(orderId);

            if (!order || order.user_id !== userId) {
                return res.status(404).json({ success: false, message: 'الطلب غير موجود' });
            }

            if (order.status !== 'Delivered') {
                return res.status(400).json({ success: false, message: 'لا يمكن تقييم طلب لم يتم توصيله' });
            }

            if (order.reviewed) {
                return res.status(400).json({ success: false, message: 'لقد قمت بتقييم هذا الطلب بالفعل' });
            }

            await UserReview.create({
                user_id: userId,
                order_id: orderId,
                rating,
                comment
            });

            await Order.update(orderId, { reviewed: true });

            res.json({ success: true });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'حدث خطأ أثناء إضافة التقييم' });
        }
    }
};

module.exports = userController;