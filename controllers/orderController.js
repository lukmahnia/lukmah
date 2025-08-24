const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Cart = require('../models/Cart');
const Promotion = require('../models/Promotion');
const User = require('../models/User');
const Address = require('../models/Address');
const Notification = require('../models/Notification');
const OrderStatusHistory = require('../models/OrderStatusHistory');
const Setting = require('../models/Setting');

const orderController = {
    getCheckoutPage: async (req, res) => {
        try {
            const userId = req.session.user.id;
            const cartItems = await Cart.getByUser(userId);
            if (cartItems.length === 0) {
                req.flash('error_msg', 'سلة التسوق فارغة');
                return res.redirect('/cart');
            }

            const addresses = await User.getAddresses(userId);
            const defaultAddress = addresses.find(a => a.is_default) || (addresses.length > 0 ? addresses[0] : null);

            let subtotal = 0;
            cartItems.forEach(item => {
                subtotal += item.price * item.quantity;
            });

            const settings = await Setting.getAll();
            const deliveryFee = parseFloat(settings.delivery_fee) || 0;
            const taxRate = parseFloat(settings.tax_rate) || 0;

            const tax = subtotal * taxRate;
            const total = subtotal + deliveryFee + tax;

            res.render('user/checkout', { 
                cartItems, 
                subtotal, 
                deliveryFee, 
                tax, 
                total, 
                addresses,
                defaultAddress
            });
        } catch (err) {
            console.error(err);
            req.flash('error_msg', 'حدث خطأ أثناء الانتقال إلى الدفع');
            res.redirect('/cart');
        }
    },
    createOrder: async (req, res) => {
        console.log('Creating order with body:', req.body);
        try {
            const userId = req.session.user.id;
            const { address_id, order_type, payment_method, scheduled_time, promo_code } = req.body;
            
            console.log('User ID:', userId);
            console.log('Address ID:', address_id);

            // الحصول على عناصر السلة
            const cartItems = await Cart.getByUser(userId);
            console.log('Cart items:', cartItems);
            
            if (cartItems.length === 0) {
                console.log('Cart is empty');
                return res.status(400).send('السلة فارغة');
            }
            
            // حساب المجموع
            let subtotal = 0;
            cartItems.forEach(item => {
                subtotal += item.price * item.quantity;
            });

            const settings = await Setting.getAll();
            const deliveryFee = parseFloat(settings.delivery_fee) || 0;
            const taxRate = parseFloat(settings.tax_rate) || 0;

            const tax = subtotal * taxRate;
            let totalAmount = subtotal + deliveryFee + tax;
            
            console.log('Subtotal:', subtotal);
            console.log('Delivery Fee:', deliveryFee);
            console.log('Tax:', tax);
            console.log('Total amount:', totalAmount);
            
            let discountId = null;
            let discountAmount = 0;
            
            // تطبيق كود الخصم إذا وجد
            if (promo_code) {
                console.log('Applying promo code:', promo_code);
                const promotion = await Promotion.findByCode(promo_code);
                
                if (promotion && promotion.is_active) {
                    const now = new Date();
                    const validFrom = new Date(promotion.valid_from);
                    const validUntil = new Date(promotion.valid_until);
                    
                    if (now >= validFrom && now <= validUntil) {
                        if (promotion.discount_type === 'percentage') {
                            discountAmount = totalAmount * (promotion.value / 100);
                            totalAmount -= discountAmount;
                        } else {
                            discountAmount = promotion.value;
                            totalAmount -= discountAmount;
                        }
                        
                        discountId = promotion.id;
                        console.log('Promo code applied. New total:', totalAmount);
                    }
                }
            }
            
            // إنشاء الطلب
            console.log('Creating order in database...');
            const order = await Order.create({
                user_id: userId,
                address_id,
                total_amount: totalAmount,
                subtotal: subtotal,
                delivery_fee: deliveryFee,
                tax: tax,
                discount_amount: discountAmount,
                order_type,
                payment_method,
                scheduled_time,
                discount_id: discountId
            });
            console.log('Order created:', order);
            
            // إضافة عناصر الطلب
            console.log('Adding order items...');
            for (const item of cartItems) {
                await OrderItem.create({
                    order_id: order.id,
                    menu_item_id: item.menu_item_id,
                    quantity: item.quantity,
                    price_per_item: item.price
                });
            }
            console.log('Order items added.');
            
            // تفريغ السلة
            console.log('Clearing cart...');
            await Cart.clearByUser(userId);
            console.log('Cart cleared.');
            
            // إضافة إشعار للمستخدم
            console.log('Creating notification...');
            await Notification.create({
                message: 'تم استلام طلبك بنجاح',
                related_order_id: order.id
            });
            console.log('Notification created.');
            
            res.redirect(`/user/orders/${order.id}`);
        } catch (err) {
            console.error('Error creating order:', err);
            res.status(500).send('حدث خطأ أثناء إنشاء الطلب');
        }
    },

    applyPromoCode: async (req, res) => {
        try {
            const { promo_code } = req.body;
            
            const promotion = await Promotion.findByCode(promo_code);
            
            if (!promotion) {
                return res.status(404).json({ success: false, message: 'كود الخصم غير موجود' });
            }
            
            if (!promotion.is_active) {
                return res.status(400).json({ success: false, message: 'كود الخصم غير نشط' });
            }
            
            const now = new Date();
            const validFrom = new Date(promotion.valid_from);
            const validUntil = new Date(promotion.valid_until);
            
            if (now < validFrom || now > validUntil) {
                return res.status(400).json({ success: false, message: 'كود الخصم منتهي الصلاحية' });
            }
            
            res.json({
                success: true,
                promotion: {
                    id: promotion.id,
                    code: promotion.code,
                    description: promotion.description,
                    discount_type: promotion.discount_type,
                    value: promotion.value
                }
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'حدث خطأ أثناء تطبيق كود الخصم' });
        }
    },

    checkout: async (req, res) => {
        try {
            const orderId = req.params.id;
            const userId = req.session.user.id;
            
            const order = await Order.findById(orderId);
            
            if (!order || order.user_id !== userId) {
                return res.status(404).send('الطلب غير موجود');
            }
            
            // معالجة الدفع حسب طريقة الدفع
            if (order.payment_method === 'cash') {
                // الدفع عند الاستلام
                await Order.updatePaymentStatus(orderId, 'pending');
            } else if (order.payment_method === 'credit_card') {
                // معالجة الدفع بالبطاقة
                // هنا سيتم دمج مع بوابة الدفع
                await Order.updatePaymentStatus(orderId, 'paid');
            } else if (order.payment_method === 'wallet') {
                // الدفع من المحفظة
                const user = await User.findById(userId);
                
                if (user.wallet_balance < order.total_amount) {
                    return res.status(400).send('رصيد المحفظة غير كافٍ');
                }
                
                // خصم المبلغ من المحفظة
                await User.updateWallet(userId, -order.total_amount);
                await Order.updatePaymentStatus(orderId, 'paid');
            }
            
            res.redirect(`/orders/${orderId}`);
        } catch (err) {
            console.error(err);
            res.status(500).send('حدث خطأ أثناء معالجة الدفع');
        }
    },

    trackOrder: async (req, res) => {
        try {
            const orderId = req.params.id;
            const userId = req.session.user.id;
            
            const order = await Order.findById(orderId);
            
            if (!order || order.user_id !== userId) {
                return res.status(404).send('الطلب غير موجود');
            }
            
            const statusHistory = await OrderStatusHistory.getByOrder(orderId);
            
            res.render('order/track', {
                order,
                statusHistory
            });
        } catch (err) {
            console.error(err);
            res.status(500).send('حدث خطأ أثناء تتبع الطلب');
        }
    },

    getOrderById: async (req, res) => {
        try {
            const orderId = req.params.id;
            const userId = req.session.user.id;

            const order = await Order.findById(orderId);

            if (!order || order.user_id !== userId) {
                return res.status(404).send('الطلب غير موجود');
            }

            const orderItems = await OrderItem.getByOrder(orderId);
            const statusHistory = await OrderStatusHistory.getByOrder(orderId);

            let subtotal = 0;
            orderItems.forEach(item => {
                subtotal += item.price_per_item * item.quantity;
            });

            const settings = await Setting.getAll();
            const deliveryFee = parseFloat(settings.delivery_fee) || 0;
            const taxRate = parseFloat(settings.tax_rate) || 0;

            const tax = subtotal * taxRate;
            const total = subtotal + deliveryFee + tax;

            // Add calculated fields to the order object
            order.subtotal = subtotal;
            order.delivery_fee = deliveryFee;
            order.tax = tax;
            order.total_amount = total;

            res.render('user/order-details', {
                order,
                orderItems,
                statusHistory
            });
        } catch (err) {
            console.error(err);
            res.status(500).send('حدث خطأ أثناء عرض تفاصيل الطلب');
        }
    }
};

module.exports = orderController;