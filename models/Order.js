const db = require('../config/db');

class Order {
  static create(orderData) {
    return new Promise((resolve, reject) => {
      const { user_id, address_id, total_amount, order_type, payment_method, scheduled_time, discount_id, subtotal, delivery_fee, tax, discount_amount } = orderData;
      const query = `INSERT INTO Orders (user_id, address_id, total_amount, order_type, payment_method, scheduled_time, discount_id, subtotal, delivery_fee, tax, discount_amount) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      
      db.run(query, [user_id, address_id, total_amount, order_type, payment_method, scheduled_time, discount_id, subtotal, delivery_fee, tax, discount_amount], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...orderData });
        }
      });
    });
  }

  static findById(id) {
    return new Promise((resolve, reject) => {
      const query = `SELECT o.*, u.name as customerName, u.phone as customerPhone, 
                            a.street, a.city, a.state, a.zip_code, a.details as addressDetails,
                            p.code as promoCode
                    FROM Orders o
                    JOIN Users u ON o.user_id = u.id
                    JOIN Addresses a ON o.address_id = a.id
                    LEFT JOIN Promotions p ON o.discount_id = p.id
                    WHERE o.id = ?`;
      
      db.get(query, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  static findByUser(userId, limit, offset) {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM Orders WHERE user_id = ? ORDER BY order_date DESC LIMIT ? OFFSET ?`;
      
      db.all(query, [userId, limit, offset], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static findByUserAndStatus(userId, status, limit, offset) {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM Orders WHERE user_id = ? AND status = ? ORDER BY order_date DESC LIMIT ? OFFSET ?`;
      
      db.all(query, [userId, status, limit, offset], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static countByUser(userId) {
    return new Promise((resolve, reject) => {
      const query = `SELECT COUNT(*) as count FROM Orders WHERE user_id = ?`;
      
      db.get(query, [userId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row.count);
        }
      });
    });
  }

  static countByUserAndStatus(userId, status) {
    return new Promise((resolve, reject) => {
      const query = `SELECT COUNT(*) as count FROM Orders WHERE user_id = ? AND status = ?`;
      
      db.get(query, [userId, status], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row.count);
        }
      });
    });
  }

  static getAll(limit = 50) {
    return new Promise((resolve, reject) => {
      const query = `SELECT o.*, u.name as customerName 
                    FROM Orders o
                    JOIN Users u ON o.user_id = u.id
                    ORDER BY o.order_date DESC
                    LIMIT ?`;
      
      db.all(query, [limit], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static getFiltered(status, dateFrom, dateTo) {
    return new Promise((resolve, reject) => {
      let query = `SELECT o.*, u.name as customerName 
                    FROM Orders o
                    JOIN Users u ON o.user_id = u.id
                    WHERE 1=1`;
      
      const params = [];
      
      if (status) {
        query += ` AND o.status = ?`;
        params.push(status);
      }
      
      if (dateFrom) {
        query += ` AND DATE(o.order_date) >= DATE(?)`;
        params.push(dateFrom);
      }
      
      if (dateTo) {
        query += ` AND DATE(o.order_date) <= DATE(?)`;
        params.push(dateTo);
      }
      
      query += ` ORDER BY o.order_date DESC`;
      
      db.all(query, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static updateStatus(id, status) {
    return new Promise((resolve, reject) => {
      const query = `UPDATE Orders SET status = ? WHERE id = ?`;
      
      db.run(query, [status, id], function(err) {
        if (err) {
          reject(err);
        } else {
          // إضافة سجل لتغيير الحالة
          db.run(`INSERT INTO OrderStatusHistory (order_id, status) VALUES (?, ?)`, [id, status], (err) => {
            if (err) {
              console.error('Error adding status history:', err);
            }
          });
          
          resolve({ changes: this.changes });
        }
      });
    });
  }

  static updatePaymentStatus(id, status) {
    return new Promise((resolve, reject) => {
      const query = `UPDATE Orders SET payment_status = ? WHERE id = ?`;
      
      db.run(query, [status, id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
    });
  }

  static update(id, orderData) {
    return new Promise((resolve, reject) => {
      let updates = [];
      let params = [];
      for (const key in orderData) {
        updates.push(`${key} = ?`);
        params.push(orderData[key]);
      }
      params.push(id);

      const query = `UPDATE Orders SET ${updates.join(', ')} WHERE id = ?`;

      db.run(query, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
    });
  }

  static getItems(orderId) {
    return new Promise((resolve, reject) => {
      const query = `SELECT oi.*, mi.name, mi.image_url 
                    FROM OrderItems oi
                    JOIN MenuItems mi ON oi.menu_item_id = mi.id
                    WHERE oi.order_id = ?`;
      
      db.all(query, [orderId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static getTodayOrders() {
    return new Promise((resolve, reject) => {
      const query = `SELECT COUNT(*) as count FROM Orders 
                    WHERE DATE(order_date) = DATE('now')`;
      
      db.get(query, [], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row.count);
        }
      });
    });
  }

  static getTodayRevenue() {
    return new Promise((resolve, reject) => {
      const query = `SELECT SUM(total_amount) as total FROM Orders 
                    WHERE DATE(order_date) = DATE('now') AND status != 'Cancelled'`;
      
      db.get(query, [], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row.total || 0);
        }
      });
    });
  }

  static getDailySalesReport() {
    return new Promise((resolve, reject) => {
      const query = `SELECT 
                    DATE(order_date) as date,
                    COUNT(*) as orders,
                    SUM(total_amount) as revenue
                    FROM Orders 
                    WHERE DATE(order_date) >= DATE('now', '-7 days')
                    AND status != 'Cancelled'
                    GROUP BY DATE(order_date)
                    ORDER BY date`;
      
      db.all(query, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static getWeeklySalesReport() {
    return new Promise((resolve, reject) => {
      const query = `SELECT 
                    strftime('%Y-%W', order_date) as week,
                    COUNT(*) as orders,
                    SUM(total_amount) as revenue
                    FROM Orders 
                    WHERE DATE(order_date) >= DATE('now', '-12 weeks')
                    AND status != 'Cancelled'
                    GROUP BY strftime('%Y-%W', order_date)
                    ORDER BY week`;
      
      db.all(query, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static getMonthlySalesReport() {
    return new Promise((resolve, reject) => {
      const query = `SELECT 
                    strftime('%Y-%m', order_date) as month,
                    COUNT(*) as orders,
                    SUM(total_amount) as revenue
                    FROM Orders 
                    WHERE DATE(order_date) >= DATE('now', '-12 months')
                    AND status != 'Cancelled'
                    GROUP BY strftime('%Y-%m', order_date)
                    ORDER BY month`;
      
      db.all(query, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static getOverallSalesReport() {
    return new Promise((resolve, reject) => {
      const query = `SELECT 
                    COUNT(*) as totalOrders,
                    SUM(total_amount) as totalRevenue,
                    AVG(total_amount) as avgOrderValue
                    FROM Orders 
                    WHERE status != 'Cancelled'`;
      
      db.get(query, [], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  static getDailyReport() {
    return new Promise((resolve, reject) => {
      const query = `SELECT 
                    COUNT(*) as totalOrders,
                    SUM(total_amount) as totalRevenue,
                    SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pendingOrders,
                    SUM(CASE WHEN status = 'Preparing' THEN 1 ELSE 0 END) as preparingOrders,
                    SUM(CASE WHEN status = 'Ready' THEN 1 ELSE 0 END) as readyOrders,
                    SUM(CASE WHEN status = 'Delivered' THEN 1 ELSE 0 END) as deliveredOrders,
                    SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) as cancelledOrders
                    FROM Orders 
                    WHERE DATE(order_date) = DATE('now')`;
      
      db.get(query, [], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  static getWeeklyReport() {
    return new Promise((resolve, reject) => {
      const query = `SELECT 
                    COUNT(*) as totalOrders,
                    SUM(total_amount) as totalRevenue,
                    SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pendingOrders,
                    SUM(CASE WHEN status = 'Preparing' THEN 1 ELSE 0 END) as preparingOrders,
                    SUM(CASE WHEN status = 'Ready' THEN 1 ELSE 0 END) as readyOrders,
                    SUM(CASE WHEN status = 'Delivered' THEN 1 ELSE 0 END) as deliveredOrders,
                    SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) as cancelledOrders
                    FROM Orders 
                    WHERE DATE(order_date) >= DATE('now', '-7 days')`;
      
      db.get(query, [], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  static getMonthlyReport() {
    return new Promise((resolve, reject) => {
      const query = `SELECT 
                    COUNT(*) as totalOrders,
                    SUM(total_amount) as totalRevenue,
                    SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pendingOrders,
                    SUM(CASE WHEN status = 'Preparing' THEN 1 ELSE 0 END) as preparingOrders,
                    SUM(CASE WHEN status = 'Ready' THEN 1 ELSE 0 END) as readyOrders,
                    SUM(CASE WHEN status = 'Delivered' THEN 1 ELSE 0 END) as deliveredOrders,
                    SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) as cancelledOrders
                    FROM Orders 
                    WHERE DATE(order_date) >= DATE('now', '-30 days')`;
      
      db.get(query, [], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  static getOverallReport() {
    return new Promise((resolve, reject) => {
      const query = `SELECT 
                    COUNT(*) as totalOrders,
                    SUM(total_amount) as totalRevenue,
                    SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pendingOrders,
                    SUM(CASE WHEN status = 'Preparing' THEN 1 ELSE 0 END) as preparingOrders,
                    SUM(CASE WHEN status = 'Ready' THEN 1 ELSE 0 END) as readyOrders,
                    SUM(CASE WHEN status = 'Delivered' THEN 1 ELSE 0 END) as deliveredOrders,
                    SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) as cancelledOrders
                    FROM Orders`;
      
      db.get(query, [], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }
}

module.exports = Order;