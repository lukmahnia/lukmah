// التحقق من أن المستخدم مسجل الدخول
function ensureAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    
    req.flash('error', 'يجب تسجيل الدخول للوصول إلى هذه الصفحة');
    res.redirect('/login');
}

// التحقق من أن المستخدم مدير
function ensureAdmin(req, res, next) {
    if (req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    
    req.flash('error', 'غير مصرح لك بالوصول إلى هذه الصفحة');
    res.redirect('/login');
}

// التحقق من أن المستخدم موظف
function ensureStaff(req, res, next) {
    if (req.session.user && (req.session.user.role === 'admin' || req.session.user.role === 'staff')) {
        return next();
    }
    
    req.flash('error', 'غير مصرح لك بالوصول إلى هذه الصفحة');
    res.redirect('/login');
}

module.exports = {
    ensureAuthenticated,
    ensureAdmin,
    ensureStaff
};