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
    
    res.render('error', {
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
}

module.exports = {
    notFound,
    errorHandler
};