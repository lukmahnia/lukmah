const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const bodyParser = require('body-parser');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const methodOverride = require('method-override');
const http = require('http');
const socketIo = require('socket.io');

// استيراد المسارات
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const cartRoutes = require('./routes/cartRoutes');

// استيراد النماذج
const Cart = require('./models/Cart');
const Category = require('./models/Category');
const MenuItem = require('./models/MenuItem');
const UserReview = require('./models/UserReview');
const Promotion = require('./models/Promotion');

// تهيئة التطبيق
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// إعدادات الجلسة
app.use(session({
    secret: 'restaurant_app_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 } // ساعة واحدة
}));

// إعدادات Flash messages
app.use(flash());

// إعدادات محرك القوالب
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// إعدادات الملفات العامة
app.use(express.static(path.join(__dirname, 'public')));

// إعدادات Body Parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Use method-override
app.use(methodOverride('_method'));

// Middleware to attach io to req
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Middleware لتمرير عدد عناصر السلة
app.use(async (req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.session.user || null;
    res.locals.activePage = req.path.split('/')[1] || 'home';
    
    // حساب عدد عناصر السلة للمستخدم المسجل دخوله
    if (req.session.user) {
        try {
            const cartItems = await Cart.getByUser(req.session.user.id);
            res.locals.cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
        } catch (err) {
            console.error('Error fetching cart count:', err);
            res.locals.cartItemCount = 0;
        }
    } else {
        res.locals.cartItemCount = 0;
    }
    
    next();
});

const Setting = require('./models/Setting');

// Middleware to fetch settings
app.use(async (req, res, next) => {
    try {
        res.locals.settings = await Setting.getAll();
        next();
    } catch (err) {
        console.error('Error fetching settings:', err);
        res.locals.settings = {}; // Provide an empty object in case of error
        next();
    }
});

// استخدام المسارات
app.use('/', authRoutes);
app.use('/user', userRoutes);
app.use('/menu', menuRoutes);
app.use('/order', orderRoutes);
app.use('/admin', adminRoutes);
app.use('/cart', cartRoutes);

// المسارات الإضافية
app.get('/about', (req, res) => {
    res.render('about', {
        title: 'من نحن',
        activePage: 'about'
    });
});

app.get('/contact', (req, res) => {
    res.render('contact', {
        title: 'اتصل بنا',
        activePage: 'contact'
    });
});

// الصفحة الرئيسية
app.get('/', async (req, res) => {
    try {
        // جلب البيانات المطلوبة للصفحة الرئيسية
        const categories = await Category.getAll();
        
        // جلب بعض العناصر لكل فئة
        const featuredItems = [];
        for (const category of categories.slice(0, 4)) {
            const items = await MenuItem.findByCategory(category.id);
            featuredItems.push(...items.slice(0, 2));
        }
        
        // جلب بعض التقييمات
        const reviews = await UserReview.getRecentReviews(6);

        // جلب العروض الخاصة
        const promotions = await Promotion.getAllActive();
        
        res.render('home', {
            title: 'مطعم لقمة هنية',
            activePage: 'home',
            categories,
            featuredItems,
            reviews,
            promotions
        });
    } catch (err) {
        console.error('Error loading home page:', err);
        res.status(500).send('حدث خطأ أثناء تحميل الصفحة الرئيسية');
    }
});

// معالجة الأخطاء
app.use(notFound);
app.use(errorHandler);

// Socket.io connection
io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

// بدء الخادم
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
