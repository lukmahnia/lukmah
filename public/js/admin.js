// رسوم بيانية للوحة تحكم المدير
document.addEventListener('DOMContentLoaded', function() {
    // رسم بياني للمبيعات
    const salesCtx = document.getElementById('salesChart');
    if (salesCtx) {
        const salesChart = new Chart(salesCtx, {
            type: 'line',
            data: {
                labels: ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'],
                datasets: [{
                    label: 'المبيعات',
                    data: [12000, 19000, 15000, 25000, 22000, 30000, 28000],
                    backgroundColor: 'rgba(78, 115, 223, 0.05)',
                    borderColor: 'rgba(78, 115, 223, 1)',
                    pointBackgroundColor: 'rgba(78, 115, 223, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(78, 115, 223, 1)',
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value.toLocaleString() + ' ريال';
                            }
                        }
                    }
                }
            }
        });
    }

    // رسم بياني لتوزيع المبيعات حسب الفئات
    const categoriesCtx = document.getElementById('categoriesChart');
    if (categoriesCtx) {
        const categoriesChart = new Chart(categoriesCtx, {
            type: 'doughnut',
            data: {
                labels: ['الرئيسيات', 'المشروبات', 'الحلويات', 'المقبلات', 'السلطات'],
                datasets: [{
                    data: [45, 25, 15, 10, 5],
                    backgroundColor: [
                        'rgba(78, 115, 223, 0.8)',
                        'rgba(28, 200, 138, 0.8)',
                        'rgba(54, 185, 204, 0.8)',
                        'rgba(246, 194, 62, 0.8)',
                        'rgba(231, 74, 59, 0.8)'
                    ],
                    hoverBackgroundColor: [
                        'rgba(78, 115, 223, 1)',
                        'rgba(28, 200, 138, 1)',
                        'rgba(54, 185, 204, 1)',
                        'rgba(246, 194, 62, 1)',
                        'rgba(231, 74, 59, 1)'
                    ],
                    hoverBorderColor: "rgba(234, 236, 244, 1)",
                }]
            },
            options: {
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            font: {
                                size: 12
                            }
                        }
                    }
                }
            }
        });
    }
});
// وظائف إدارة القائمة


function editCategory(id) {
    fetch(`/admin/menu/categories/${id}`)
    .then(response => response.json())
    .then(data => {
        document.getElementById('editCategoryForm').action = `/admin/menu/categories/${id}?_method=PUT`;
        document.getElementById('editCategoryId').value = data.id;
        document.getElementById('editCategoryName').value = data.name;
        document.getElementById('editCategoryDescription').value = data.description || '';
        document.getElementById('currentCategoryImage').src = data.image_url || '/images/default-category.jpg';
        
        const form = document.getElementById('editCategoryForm');
        form.action = `/admin/menu/categories/${id}?_method=PUT`;

        const modal = new bootstrap.Modal(document.getElementById('editCategoryModal'));
        modal.show();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('حدث خطأ أثناء تحميل بيانات الفئة');
    });
}

function deleteCategory(id) {
    if (confirm('هل أنت متأكد من حذف هذه الفئة؟')) {
        fetch(`/admin/menu/categories/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('تم حذف الفئة بنجاح');
                location.reload();
            } else {
                alert('حدث خطأ أثناء حذف الفئة: ' + (data.message || 'خطأ غير معروف'));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('حدث خطأ أثناء حذف الفئة');
        });
    }
}

function saveItem() {
    const formData = new FormData();
    formData.append('category_id', document.getElementById('itemCategory').value);
    formData.append('name', document.getElementById('itemName').value);
    formData.append('description', document.getElementById('itemDescription').value);
    formData.append('price', document.getElementById('itemPrice').value);
    formData.append('calories', document.getElementById('itemCalories').value);
    formData.append('image_url', document.getElementById('itemImage').value);
    formData.append('is_available', document.getElementById('itemAvailable').checked ? 1 : 0);
    formData.append('is_subscription_item', document.getElementById('itemSubscription').checked ? 1 : 0);
    
    const imageFile = document.getElementById('itemImageFile').files[0];
    if (imageFile) {
        formData.append('image', imageFile);
    }
    
    fetch('/admin/menu/items', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('تم حفظ العنصر بنجاح');
            location.reload();
        } else {
            alert('حدث خطأ أثناء حفظ العنصر: ' + (data.message || 'خطأ غير معروف'));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('حدث خطأ أثناء حفظ العنصر');
    });
}

function filterByCategory() {
    const categoryId = document.getElementById('categoryFilter').value;
    window.location.href = `/admin/menu?category=${categoryId}`;
}

function filterByAvailability() {
    const availability = document.getElementById('availabilityFilter').value;
    const url = new URL(window.location);
    if (availability) {
        url.searchParams.set('availability', availability);
    } else {
        url.searchParams.delete('availability');
    }
    window.location.href = url.toString();
}

function searchItems() {
    const searchTerm = document.getElementById('searchInput').value;
    const url = new URL(window.location);
    if (searchTerm) {
        url.searchParams.set('search', searchTerm);
    } else {
        url.searchParams.delete('search');
    }
    window.location.href = url.toString();
}

// وظائف إدارة الطلبات
function updateOrderStatus(orderId, status) {
    fetch(`/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('تم تحديث حالة الطلب بنجاح');
            location.reload();
        } else {
            alert('حدث خطأ أثناء تحديث حالة الطلب: ' + (data.message || 'خطأ غير معروف'));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('حدث خطأ أثناء تحديث حالة الطلب');
    });
}

// وظائف إدارة المستخدمين
function editUser(userId) {
    fetch(`/admin/users/${userId}`)
    .then(response => response.json())
    .then(data => {
        document.getElementById('edit_user_id').value = data.id;
        document.getElementById('edit_name').value = data.name;
        document.getElementById('edit_phone').value = data.phone;
        document.getElementById('edit_role').value = data.role;
        document.getElementById('edit_loyalty_points').value = data.loyalty_points || 0;
        
        const modal = new bootstrap.Modal(document.getElementById('editUserModal'));
        modal.show();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('حدث خطأ أثناء تحميل بيانات المستخدم');
    });
}

function updateUser() {
    const form = document.getElementById('editUserForm');
    const formData = new FormData(form);
    const userId = document.getElementById('edit_user_id').value;
    
    fetch(`/admin/users/${userId}`, {
        method: 'PUT',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('تم تحديث المستخدم بنجاح');
            location.reload();
        } else {
            alert('حدث خطأ أثناء تحديث المستخدم: ' + (data.message || 'خطأ غير معروف'));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('حدث خطأ أثناء تحديث المستخدم');
    });
}

function deleteUser(userId) {
    if (confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
        fetch(`/admin/users/${userId}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('تم حذف المستخدم بنجاح');
                location.reload();
            } else {
                alert('حدث خطأ أثناء حذف المستخدم: ' + (data.message || 'خطأ غير معروف'));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('حدث خطأ أثناء حذف المستخدم');
        });
    }
}


// وظائف إدارة الاشتراكات
function savePlan() {
    const name = document.getElementById('planName').value;
    const plan_type = document.getElementById('planType').value;
    const duration_days = document.getElementById('durationDays').value;
    const meals_per_day = document.getElementById('mealsPerDay').value;
    const price = document.getElementById('planPrice').value;
    
    fetch('/admin/subscriptions/plans', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, plan_type, duration_days, meals_per_day, price })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('تم حفظ خطة الاشتراك بنجاح');
            location.reload();
        } else {
            alert('حدث خطأ أثناء حفظ خطة الاشتراك: ' + (data.message || 'خطأ غير معروف'));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('حدث خطأ أثناء حفظ خطة الاشتراك');
    });
}

function editPlan(id) {
    fetch(`/admin/subscriptions/plans/${id}`)
    .then(response => response.json())
    .then(data => {
        document.getElementById('edit')
     }
  }
