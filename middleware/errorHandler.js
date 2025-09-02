const multer = require('multer');

// معالجة الأخطاء 404
function notFound(req, res, next) {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
}

// معالجة الأخطاء العامة
function errorHandler(err, req, res, next) {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);

    if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: err.message });
    }

    // إذا كان الطلب يتوقع JSON (API call)
    if (req.accepts('json')) {
        res.json({
            message: err.message,
            stack: process.env.NODE_ENV === 'production' ? null : err.stack,
        });
    } else {
        // وإلا، اعرض صفحة الخطأ HTML
        res.render('error', {
            message: err.message,
            stack: process.env.NODE_ENV === 'production' ? null : err.stack,
        });
    }
}

module.exports = {
    notFound,
    errorHandler
};