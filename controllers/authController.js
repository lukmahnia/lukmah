const User = require('../models/User');
const UserOTP = require('../models/UserOTP');
const bcrypt = require('bcryptjs');
const { generateOTP, sendOTP } = require('../utils/otpService');

const authController = {
    getLoginPage: (req, res) => {
        res.render('auth/login', { error: null });
    },

    login: async (req, res) => {
        const { phone, password } = req.body;
        
        try {
            const user = await User.findByPhone(phone);
            
            if (!user) {
                return res.render('auth/login', { error: 'رقم الهاتف غير مسجل' });
            }
            
            const isMatch = await bcrypt.compare(password, user.password);
            
            if (!isMatch) {
                return res.render('auth/login', { error: 'كلمة المرور غير صحيحة' });
            }
            
            req.session.user = {
                id: user.id,
                name: user.name,
                phone: user.phone,
                role: user.role
            };
            
            if (user.role === 'admin') {
                return res.redirect('/admin/dashboard');
            } else if (user.role === 'staff') {
                return res.redirect('/staff/dashboard');
            } else {
                return res.redirect('/user/dashboard');
            }
        } catch (err) {
            console.error(err);
            res.render('auth/login', { error: 'حدث خطأ أثناء تسجيل الدخول' });
        }
    },

    getRegisterPage: (req, res) => {
        res.render('auth/register', { error: null });
    },

    register: async (req, res) => {
        const { name, phone, password, confirmPassword } = req.body;
        
        if (password !== confirmPassword) {
            return res.render('auth/register', { error: 'كلمتا المرور غير متطابقتين' });
        }
        
        try {
            const existingUser = await User.findByPhone(phone);
            
            if (existingUser) {
                return res.render('auth/register', { error: 'رقم الهاتف مسجل بالفعل' });
            }
            
            const hashedPassword = await bcrypt.hash(password, 10);
            
            const newUser = await User.create({
                name,
                phone,
                password: hashedPassword,
                role: 'customer'
            });
            
            req.session.user = {
                id: newUser.id,
                name: newUser.name,
                phone: newUser.phone,
                role: newUser.role
            };
            
            res.redirect('/dashboard');
        } catch (err) {
            console.error(err);
            res.render('auth/register', { error: 'حدث خطأ أثناء التسجيل' });
        }
    },

    logout: (req, res) => {
        req.session.destroy();
        res.redirect('/');
    },

    requestOTP: async (req, res) => {
        const { phone } = req.body;
        
        try {
            const user = await User.findByPhone(phone);
            
            if (!user) {
                return res.status(404).json({ success: false, message: 'رقم الهاتف غير مسجل' });
            }
            
            const otp = generateOTP();
            const expiresAt = new Date(Date.now() + 5 * 60000); // 5 دقائق
            
            await UserOTP.create({
                phone,
                otp_code: otp,
                expires_at: expiresAt
            });
            
            // في بيئة الإنتاج، أرسل OTP عبر SMS
            // هنا سنطبع OTP في وحدة التحكم للتطوير
            console.log(`OTP for ${phone}: ${otp}`);
            
            res.json({ success: true, message: 'تم إرسال رمز التحقق' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'حدث خطأ أثناء طلب رمز التحقق' });
        }
    },

    verifyOTP: async (req, res) => {
        const { phone, otp } = req.body;
        
        try {
            const otpRecord = await UserOTP.findByPhone(phone);
            
            if (!otpRecord) {
                return res.status(404).json({ success: false, message: 'لم يتم العثور على رمز تحقق' });
            }
            
            if (otpRecord.otp_code !== otp) {
                return res.status(400).json({ success: false, message: 'رمز التحقق غير صحيح' });
            }
            
            if (new Date() > new Date(otpRecord.expires_at)) {
                return res.status(400).json({ success: false, message: 'رمز التحقق منتهي الصلاحية' });
            }
            
            const user = await User.findByPhone(phone);
            
            req.session.user = {
                id: user.id,
                name: user.name,
                phone: user.phone,
                role: user.role
            };
            
            res.json({ success: true, message: 'تم التحقق بنجاح' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'حدث خطأ أثناء التحقق' });
        }
    }
};

module.exports = authController;