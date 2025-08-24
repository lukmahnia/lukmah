// Import the sqlite3 module. Use 'verbose()' to get more detailed error messages.
// (استيراد مكتبة sqlite3. نستخدم verbose() للحصول على رسائل خطأ تفصيلية)
const sqlite3 = require('sqlite3').verbose();
// Define the single database file name as requested.
// (تحديد اسم ملف قاعدة البيانات الوحيد كما هو مطلوب)
const DB_SOURCE = "lq.sqlite";
// Connect to the SQLite database. The file is created if it does not exist.
// (الاتصال بقاعدة بيانات SQLite. سيتم إنشاء الملف إذا لم يكن موجوداً)
const db = new sqlite3.Database(DB_SOURCE, (err) => {
    if (err) {
        // Cannot open database
        console.error(err.message);
        throw err;
    } else {
        console.log(`Connected to the single database: ${DB_SOURCE}`);
        
        // Use serialize to ensure all commands run in order.
        // (استخدام serialize لضمان تنفيذ جميع الأوامر بالترتيب)
        db.serialize(() => {
            console.log('Creating all tables in one go...');
            // --- ALL TABLES ARE CREATED HERE ---
            // --- يتم إنشاء جميع الجداول هنا ---
            
              // 1 Users (المستخدمون): لتخزين معلومات العملاء والموظفين.
            db.run(`CREATE TABLE IF NOT EXISTS Users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                phone TEXT NOT NULL UNIQUE,
                password TEXT,
                email TEXT,
                role TEXT NOT NULL DEFAULT 'customer',
                loyalty_points INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`);
           // 2 User_OTPs (رموز التحقق): لتأمين عملية الدخول برقم الجوال.
            db.run(`CREATE TABLE IF NOT EXISTS User_OTPs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                phone TEXT NOT NULL,
                otp_code TEXT NOT NULL,
                expires_at TIMESTAMP NOT NULL
            )`);
             // 3- Addresses (عناوين المستخدمين): لحفظ عناوين التوصيل للعملاء.
            db.run(`CREATE TABLE IF NOT EXISTS Addresses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                street TEXT NOT NULL,
                city TEXT NOT NULL,
                state TEXT,
                phone_2 TEXT,
                details TEXT,
                is_default BOOLEAN DEFAULT 1,
                FOREIGN KEY (user_id) REFERENCES Users (id) ON DELETE CASCADE
            )`);
             //  4-   Categories (فئات الطعام): لتصنيف قوائم الطعام.
            db.run(`CREATE TABLE IF NOT EXISTS Categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                description TEXT
            )`);
              //  5-  MenuItems (عناصر قائمة الطعام): تفاصيل كل طبق أو منتج.
            db.run(`CREATE TABLE IF NOT EXISTS MenuItems (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                category_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                description TEXT,
                price REAL NOT NULL,
                image_url TEXT,
                is_available BOOLEAN DEFAULT 1,
                calories INTEGER,
                is_subscription_item BOOLEAN DEFAULT 0,
                FOREIGN KEY (category_id) REFERENCES Categories (id)
            )`);
            // --- يتم إنشاء جميع الجداول هنا ---            
           // 6-  جدول Promotions
         db.run(`CREATE TABLE IF NOT EXISTS Promotions (
	    id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT NOT NULL UNIQUE,
	    description TEXT,
 	    discount_type TEXT NOT NULL,
	    value REAL NOT NULL,
	    valid_from TIMESTAMP,
	    valid_until TIMESTAMP,
 	    is_active BOOLEAN DEFAULT 1,
 	    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	)`);
            //  7-    --- يتم إنشاء جميع الجداول هنا ---
                        db.run(`CREATE TABLE IF NOT EXISTS Orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                address_id INTEGER NOT NULL,
                total_amount REAL NOT NULL,
                subtotal REAL,
                delivery_fee REAL,
                tax REAL,
                discount_amount REAL,
                status TEXT NOT NULL DEFAULT 'Pending',
                order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                order_type TEXT NOT NULL DEFAULT 'delivery',
                payment_method TEXT NOT NULL,
                payment_status TEXT NOT NULL DEFAULT 'pending',
                scheduled_time TIMESTAMP,
                delivered_at TIMESTAMP,
                discount_id INTEGER,
                reviewed BOOLEAN DEFAULT 0,
                FOREIGN KEY (user_id) REFERENCES Users (id),
                FOREIGN KEY (address_id) REFERENCES Addresses (id),
                FOREIGN KEY (discount_id) REFERENCES Promotions (id)
            )`);
            // 8-   --- يتم إنشاء جميع الجداول هنا ---
            db.run(`CREATE TABLE IF NOT EXISTS OrderItems (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id INTEGER NOT NULL,
                menu_item_id INTEGER NOT NULL,
                quantity INTEGER NOT NULL,
                price_per_item REAL NOT NULL,
                FOREIGN KEY (order_id) REFERENCES Orders (id) ON DELETE CASCADE,
                FOREIGN KEY (menu_item_id) REFERENCES MenuItems (id)
            )`);
            // 9-   --- يتم إنشاء جميع الجداول هنا ---
            db.run(`CREATE TABLE IF NOT EXISTS BusinessHours (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                day_of_week INTEGER NOT NULL,
                open_time TEXT NOT NULL,
                close_time TEXT NOT NULL,
                is_open BOOLEAN DEFAULT 1
            )`);
            // --- يتم إنشاء جميع الجداول هنا ---
           //  10 - جدول SubscriptionPlans
	 db.run(`CREATE TABLE IF NOT EXISTS SubscriptionPlans (
	    id INTEGER PRIMARY KEY AUTOINCREMENT,
	    name TEXT NOT NULL,
	    plan_type TEXT,
	    duration_days INTEGER NOT NULL,
	    meals_per_day INTEGER NOT NULL,
	    price REAL NOT NULL,
	    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	)`);	

            // 11-   جدول UserSubscriptions
	  db.run(`CREATE TABLE IF NOT EXISTS UserSubscriptions (
	     id INTEGER PRIMARY KEY AUTOINCREMENT,
	     user_id INTEGER NOT NULL,
	     plan_id INTEGER NOT NULL,
	     start_date DATE NOT NULL,
	     end_date DATE NOT NULL,
 	     status TEXT NOT NULL DEFAULT 'active',
	     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 	     FOREIGN KEY (user_id) REFERENCES Users (id),
  	     FOREIGN KEY (plan_id) REFERENCES SubscriptionPlans (id)
	 )`);

            // 12   --- يتم إنشاء جميع الجداول هنا ---
            db.run(`CREATE TABLE IF NOT EXISTS SubscriptionDeliveries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                subscription_id INTEGER NOT NULL,
                delivery_date DATE NOT NULL,
                menu_item_id INTEGER NOT NULL,
                delivery_time_slot TEXT,
                status TEXT NOT NULL DEFAULT 'scheduled',
                FOREIGN KEY (subscription_id) REFERENCES UserSubscriptions (id),
                FOREIGN KEY (menu_item_id) REFERENCES MenuItems (id)
            )`);
            //   13-    --- يتم إنشاء جميع الجداول هنا ---            
            db.run(`CREATE TABLE IF NOT EXISTS Notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                message TEXT NOT NULL,
                related_order_id INTEGER,
                user_id INTEGER,
                is_read BOOLEAN DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES user (id)
                FOREIGN KEY (related_order_id) REFERENCES Orders (id)
            )`);
            // 14-   --- يتم إنشاء جميع الجداول هنا ---
            db.run(`CREATE TABLE IF NOT EXISTS DeliveryCompanies (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                api_details TEXT
            )`);

            // --- يتم إنشاء جميع الجداول هنا ---
              // 15-    إنشاء جدول Basket
            db.run(`CREATE TABLE IF NOT EXISTS Cart (
               id INTEGER PRIMARY KEY AUTOINCREMENT,
               user_id INTEGER NOT NULL,
               menu_item_id INTEGER NOT NULL,
               quantity INTEGER NOT NULL DEFAULT 1,
               added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
               FOREIGN KEY (user_id) REFERENCES Users (id) ON DELETE CASCADE,
               FOREIGN KEY (menu_item_id) REFERENCES MenuItems (id)
             )`, (err) => {
               if (err) {
               console.error("حدث خطأ أثناء إنشاء جدول السلة:", err.message);
                } else {
                  console.log("تم إنشاء جدول السلة بنجاح.");
                     }
                });

            // --- يتم إنشاء جميع الجداول هنا ---
        //  16-   جدول تقييمات المستخدمين (UserReviews)
        db.run(`CREATE TABLE IF NOT EXISTS UserReviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        menu_item_id INTEGER,
        order_id INTEGER,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Users (id) ON DELETE CASCADE,
        FOREIGN KEY (menu_item_id) REFERENCES MenuItems (id),
        FOREIGN KEY (order_id) REFERENCES Orders (id)
    )`, (err) => {
        if (err) {
            console.error("Error creating UserReviews table:", err.message);
        } else {
        console.log("UserReviews table created successfully.");
      }
    });

           // جدول سجل النشاطات (ActivityLog)
           //  17-    --- يتم إنشاء جميع الجداول هنا ---
      db.run(`CREATE TABLE IF NOT EXISTS ActivityLog (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
         user_id INTEGER NOT NULL,
        action TEXT NOT NULL,
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Users (id) ON DELETE CASCADE
    )`, (err) => {
        if (err) {
            console.error("Error creating ActivityLog table:", err.message);
        } else {
            console.log("ActivityLog table created successfully.");
        }
    });
            // --- يتم إنشاء جميع الجداول هنا ---
       //  18-  جدول كوبونات الهدايا (GiftCards
    db.run(`CREATE TABLE IF NOT EXISTS GiftCards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT NOT NULL UNIQUE,
        user_id INTEGER,
        balance REAL NOT NULL CHECK (balance >= 0),
        is_active BOOLEAN DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Users (id) ON DELETE SET NULL
    )`, (err) => {
        if (err) {
            console.error("Error creating GiftCards table:", err.message);
        } else {
            console.log("GiftCards table created successfully.");
        }
    });
            // --- يتم إنشاء جميع الجداول هنا ---
       //   جدول حالات الطلبات (OrderStatusHistory)
       //  19- 	تبع التغييرات في حالة الطلبات بمرور الوقت
    db.run(`CREATE TABLE IF NOT EXISTS OrderStatusHistory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
         status TEXT NOT NULL,
        changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES Orders (id) ON DELETE CASCADE
    )`, (err) => {
        if (err) {
            console.error("Error creating OrderStatusHistory table:", err.message);
        } else {
            console.log("OrderStatusHistory table created successfully.");
        }
    });
            // --- يتم إنشاء جميع الجداول هنا ---
       //    جدول تقييم شركات التوصيل (DeliveryCompanyRatings)
       //  20-  	لغرض: تقييم شركات التوصيل بناءً على تجارب العملاء.
     db.run(`CREATE TABLE IF NOT EXISTS DeliveryCompanyRatings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        delivery_company_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (delivery_company_id) REFERENCES DeliveryCompanies (id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES Users (id) ON DELETE CASCADE
    )`, (err) => {
        if (err) {
            console.error("Error creating DeliveryCompanyRatings table:", err.message);
        } else {
            console.log("DeliveryCompanyRatings table created successfully.");
        }
    });

              // 21  DailyMeals    جدول الطعام اليومي.
            db.run(`CREATE TABLE IF NOT EXISTS DailyMeals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(255) NOT NULL,
                day_of_week INTEGER NOT NULL UNIQUE,
                description TEXT
            )`);

              // 22  DailyMealItems    جدول عناصر الطعام اليومي.
            db.run(`CREATE TABLE IF NOT EXISTS DailyMeals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                daily_meal_id INTEGER NOT NULL,
                menu_item_id INTEGER NOT NULL,
                FOREIGN KEY (daily_meal_id) REFERENCES DailyMeals(id) ON DELETE CASCADE,
                FOREIGN KEY (menu_item_id) REFERENCES MenuItems(id) ON DELETE CASCADE
            )`);

            // 23-   --- يتم إنشاء جميع الجداول هنا ---
            db.run(`CREATE TABLE IF NOT EXISTS Settings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                key TEXT NOT NULL UNIQUE,
                value TEXT NOT NULL
            )`, (err) => {
                if (err) {
                    console.error("Error creating Settings table:", err.message);
                } else {
                    console.log("Settings table created successfully.");
                    // Insert default values
                    db.run(`INSERT OR IGNORE INTO Settings (key, value) VALUES ('tax_rate', '0.15')`);
                    db.run(`INSERT OR IGNORE INTO Settings (key, value) VALUES ('delivery_fee', '10')`);
                    db.run(`INSERT OR IGNORE INTO Settings (key, value) VALUES ('restaurant_name', 'اسم المطعم الافتراضي')`);
                    db.run(`INSERT OR IGNORE INTO Settings (key, value) VALUES ('phone_number', '123456789')`);
                    db.run(`INSERT OR IGNORE INTO Settings (key, value) VALUES ('email', 'info@example.com')`);
                    db.run(`INSERT OR IGNORE INTO Settings (key, value) VALUES ('currency', 'SAR')`);
                    db.run(`INSERT OR IGNORE INTO Settings (key, value) VALUES ('min_order_amount', '50')`);
                    db.run(`INSERT OR IGNORE INTO Settings (key, value) VALUES ('default_preparation_time', '20')`);
                    db.run(`INSERT OR IGNORE INTO Settings (key, value) VALUES ('discount_value', '0')`);
                    db.run(`INSERT OR IGNORE INTO Settings (key, value) VALUES ('notification_new_order', 'true')`);
                    db.run(`INSERT OR IGNORE INTO Settings (key, value) VALUES ('notification_order_status', 'true')`);
                    db.run(`INSERT OR IGNORE INTO Settings (key, value) VALUES ('notification_promotion', 'true')`);
                    db.run(`INSERT OR IGNORE INTO Settings (key, value) VALUES ('notification_subscription', 'true')`);
                    db.run(`INSERT OR IGNORE INTO Settings (key, value) VALUES ('facebook_url', 'https://www.facebook.com/profile.php?id=61576371444269')`);

                    db.run(`INSERT OR IGNORE INTO Settings (key, value) VALUES ('twitter_url', 'https://x.com/')`);

                    db.run(`INSERT OR IGNORE INTO Settings (key, value) VALUES ('instagram_url', 'https://www.instagram.com/lqmh4135/?fbclid=IwY2xjawMR8HlleHRuA2FlbQIxMABicmlkETE2eGJHYldlRG55bHJWZDRzAR7sErdwOQaWXk5qXPVyr8BI8AgARqkzwBgLG5uom3DDL4kfBfZoUo8Dg0dhEA_aem_AwLLsLxDXk9q22Brw2ENqw#')`);

                    db.run(`INSERT OR IGNORE INTO Settings (key, value) VALUES ('whatsapp_url', 'https://wa.me/967782030088?text=مرحبا')`);
                }
            });

            // 24-   --- يتم إنشاء جميع الجداول هنا ---
            db.run(`CREATE TABLE IF NOT EXISTS PaymentGateways (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                api_keys TEXT,
                is_active BOOLEAN DEFAULT 1
            )`, (err) => {
                if (err) {
                    // Handle final error
                    console.error("An error occurred during table creation:", err.message);
                } else {
                    console.log("All tables are created and ready in 'lq.sqlite'.");
                }
            });
        });
    }
});
// Export the database connection object for use in other parts of your application.
// (تصدير كائن الاتصال بقاعدة البيانات لاستخدامه في أجزاء أخرى من تطبيقك)
module.exports = db;