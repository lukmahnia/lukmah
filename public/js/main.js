// وظائف عامة للتطبيق
document.addEventListener('DOMContentLoaded', function() {
    // تفعيل التلميحات
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    });
    
    // تفعيل النوافذ المنبثقة
    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
    var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl)
    });
});

// دالة لتنسيق العملة
function formatCurrency(amount) {
    return new Intl.NumberFormat('ar-SA', {
        style: 'currency',
        currency: 'SAR',
        minimumFractionDigits: 2
    }).format(amount);
}

// دالة لتنسيق التاريخ
function formatDate(date) {
    return new Date(date).toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// دالة لتنسيق الوقت
function formatTime(date) {
    return new Date(date).toLocaleTimeString('ar-SA', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// دالة لإظهار رسالة نجاح
function showSuccessMessage(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success alert-dismissible fade show';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const container = document.querySelector('.container');
    container.insertBefore(alertDiv, container.firstChild);
    
    // إخفاء الرسالة بعد 5 ثواني
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// دالة لإظهار رسالة خطأ
function showErrorMessage(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const container = document.querySelector('.container');
    container.insertBefore(alertDiv, container.firstChild);
    
    // إخفاء الرسالة بعد 5 ثواني
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// دالة لتأكيد الإجراء
function confirmAction(message) {
    return confirm(message);
}