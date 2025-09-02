
const db = require('./config/db');
const User = require('./models/User');
const Address = require('./models/Address');
const Category = require('./models/Category');
const MenuItem = require('./models/MenuItem');
const Order = require('./models/Order');
const OrderItem = require('./models/OrderItem');
const DailyMeal = require('./models/DailyMeal');
const DailyMealItem = require('./models/DailyMealItem');
const Cart = require('./models/Cart');
const UserReview = require('./models/UserReview');
const DeliveryCompany = require('./models/DeliveryCompany');
const DeliveryCompanyRating = require('./models/DeliveryCompanyRating');
const SubscriptionPlan = require('./models/SubscriptionPlan');
const UserSubscription = require('./models/UserSubscription');
const SubscriptionDelivery = require('./models/SubscriptionDelivery');
const GiftCard = require('./models/GiftCard');
const Promotion = require('./models/Promotion');
const PaymentGateway = require('./models/PaymentGateway');
const Setting = require('./models/Setting');
const BusinessHours = require('./models/BusinessHours');
const Notification = require('./models/Notification');
const ActivityLog = require('./models/ActivityLog');
const OrderStatusHistory = require('./models/OrderStatusHistory');
const UserOTP = require('./models/UserOTP');

async function seed() {
  try {
    console.log('Waiting for database to be ready...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    // User 0
    const user = await User.create({ name: 'يوسف', phone: '782030088', password: '909080' });
    console.log('User created:', user);

    // Address 1
    const address = await Address.create({ user_id: user.id, street: '16 Main St', city: 'صنعاء', state: 'معين', zip_code: '12345', details: 'N/A' });
    console.log('Address created:', address);

    // Category 2
    const category = await Category.create({ name: 'Test Category', description: 'Test Description', image_url: 'http://example.com/image.jpg' });
    console.log('Category created:', category);

    // MenuItem 3
    const menuItem = await MenuItem.create({ category_id: category.id, name: 'Test Item', description: 'Test Item Description', price: 9.99, image_url: 'http://example.com/item.jpg', calories: 500, is_subscription_item: false });
    console.log('MenuItem created:', menuItem);

    // DailyMeal 4
    const dailyMeal = await DailyMeal.create({ name: 'Test Meal', day_of_week: 1, description: 'Test Meal Description' });
    console.log('DailyMeal created:', dailyMeal);

    // DailyMealItem 5
    const dailyMealItem = await DailyMealItem.create({ daily_meal_id: dailyMeal.id, menu_item_id: menuItem.id });
    console.log('DailyMealItem created:', dailyMealItem);

    // Order 6
    const order = await Order.create({ user_id: user.id, address_id: address.id, total_amount: 9.99, order_type: 'delivery', payment_method: 'cod', scheduled_time: null, discount_id: null, subtotal: 9.99, delivery_fee: 2.50, tax: 0.80, discount_amount: 0 });
    console.log('Order created:', order);

    // OrderItem 7
    const orderItem = await OrderItem.create({ order_id: order.id, menu_item_id: menuItem.id, quantity: 1, price_per_item: 9.99 });
    console.log('OrderItem created:', orderItem);

    // Cart 8
    const cart = await Cart.create({ user_id: user.id, menu_item_id: menuItem.id, quantity: 1 });
    console.log('Cart created:', cart);

    // UserReview 9
    const userReview = await UserReview.create({ user_id: user.id, menu_item_id: menuItem.id, order_id: order.id, rating: 5, comment: 'Great!' });
    console.log('UserReview created:', userReview);

    // DeliveryCompany 10
    const deliveryCompany = await DeliveryCompany.create({ name: 'Test Delivery', api_details: '{}' });
    console.log('DeliveryCompany created:', deliveryCompany);

    // DeliveryCompanyRating  11
    const deliveryCompanyRating = await DeliveryCompanyRating.create({ delivery_company_id: deliveryCompany.id, user_id: user.id, rating: 5, comment: 'Fast delivery!' });
    console.log('DeliveryCompanyRating created:', deliveryCompanyRating);

    // SubscriptionPlan 12
    const subscriptionPlan = await SubscriptionPlan.create({ name: 'Test Plan', description: 'Test Plan Description', price: 49.99, duration_days: 30, meals_per_day: 1 });
    console.log('SubscriptionPlan created:', subscriptionPlan);

    // UserSubscription  13
    const userSubscription = await UserSubscription.create({ user_id: user.id, plan_id: subscriptionPlan.id, start_date: new Date(), end_date: new Date(new Date().setDate(new Date().getDate() + 30)), status: 'active' });
    console.log('UserSubscription created:', userSubscription);

    // SubscriptionDelivery 14
    const subscriptionDelivery = await SubscriptionDelivery.create({ subscription_id: userSubscription.id, delivery_date: new Date(), status: 'scheduled', menu_item_id: menuItem.id });
    console.log('SubscriptionDelivery created:', subscriptionDelivery);

    // GiftCard  15
    const giftCard = await GiftCard.create({ code: 'TESTGIFT', balance: 50, expiry_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), is_active: true });
    console.log('GiftCard created:', giftCard);

    // Promotion 16
    const promotion = await Promotion.create({ code: 'TESTPROMO', description: 'Test Promo', discount_type: 'percentage', value: 10, start_date: new Date(), end_date: new Date(new Date().setDate(new Date().getDate() + 7)), is_active: true });
    console.log('Promotion created:', promotion);

    // PaymentGateway  17
    const paymentGateway = await PaymentGateway.create({ name: 'Test Gateway', api_key: 'test_key', is_enabled: true });
    console.log('PaymentGateway created:', paymentGateway);

    

    // BusinessHours  19
    const businessHours = await BusinessHours.create({ day_of_week: 1, open_time: '09:00', close_time: '18:00', is_closed: false });
    console.log('BusinessHours created:', businessHours);

    // Notification  20
    const notification = await Notification.create({ user_id: user.id, message: 'Test Notification', is_read: false });
    console.log('Notification created:', notification);

    // ActivityLog 21
    const activityLog = await ActivityLog.create({ user_id: user.id, action: 'test_action', details: 'Test details' });
    console.log('ActivityLog created:', activityLog);

    // OrderStatusHistory 22
    const orderStatusHistory = await OrderStatusHistory.create({ order_id: order.id, status: 'pending' });
    console.log('OrderStatusHistory created:', orderStatusHistory);

    // UserOTP 23
    const userOTP = await UserOTP.create({ phone: user.phone, otp_code: '123456', expires_at: new Date(new Date().getTime() + 10 * 60000) });
    console.log('UserOTP created:', userOTP);

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    db.close();
  }
}

seed();
