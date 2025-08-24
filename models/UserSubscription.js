const db = require('../config/db');

class UserSubscription {
  static create(subscriptionData) {
    return new Promise((resolve, reject) => {
      const { user_id, plan_id, start_date, end_date, status } = subscriptionData;
      const query = `INSERT INTO UserSubscriptions (user_id, plan_id, start_date, end_date, status) VALUES (?, ?, ?, ?, ?)`;
      
      db.run(query, [user_id, plan_id, start_date, end_date, status], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...subscriptionData });
        }
      });
    });
  }

  static findById(id) {
    return new Promise((resolve, reject) => {
      const query = `SELECT us.*, sp.name as plan_name, sp.meals_per_day 
                    FROM UserSubscriptions us
                    JOIN SubscriptionPlans sp ON us.plan_id = sp.id
                    WHERE us.id = ?`;
      
      db.get(query, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  static getByUser(userId) {
    return new Promise((resolve, reject) => {
      const query = `SELECT us.*, sp.name as plan_name, sp.meals_per_day 
                    FROM UserSubscriptions us
                    JOIN SubscriptionPlans sp ON us.plan_id = sp.id
                    WHERE us.user_id = ? 
                    ORDER BY us.created_at DESC`;
      
      db.all(query, [userId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static getActiveByUser(userId) {
    return new Promise((resolve, reject) => {
      const query = `SELECT us.*, sp.name as plan_name, sp.meals_per_day 
                    FROM UserSubscriptions us
                    JOIN SubscriptionPlans sp ON us.plan_id = sp.id
                    WHERE us.user_id = ? AND us.status = 'active' 
                    AND us.end_date >= DATE('now')
                    ORDER BY us.created_at DESC`;
      
      db.all(query, [userId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static getAll() {
    return new Promise((resolve, reject) => {
        const query = `SELECT us.*, u.name as user_name, sp.name as plan_name 
                    FROM UserSubscriptions us
                    JOIN Users u ON us.user_id = u.id
                    JOIN SubscriptionPlans sp ON us.plan_id = sp.id
                    ORDER BY us.created_at DESC`; // أضف الترتيب حسب تاريخ الإنشاء
        
        db.all(query, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
  }

  static update(id, subscriptionData) {
    return new Promise((resolve, reject) => {
      const { start_date, end_date, status } = subscriptionData;
      const query = `UPDATE UserSubscriptions SET start_date = ?, end_date = ?, status = ? WHERE id = ?`;
      
      db.run(query, [start_date, end_date, status, id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
    });
  }

  static delete(id) {
    return new Promise((resolve, reject) => {
      const query = `DELETE FROM UserSubscriptions WHERE id = ?`;
      
      db.run(query, [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
    });
  }

  static getActiveCount() {
    return new Promise((resolve, reject) => {
      const query = `SELECT COUNT(*) as count FROM UserSubscriptions 
                    WHERE status = 'active' AND end_date >= DATE('now')`;
      
      db.get(query, [], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row.count);
        }
      });
    });
  }

  static getDeliveries(subscriptionId) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT sd.*, mi.name as item_name 
            FROM SubscriptionDeliveries sd
            LEFT JOIN MenuItems mi ON sd.menu_item_id = mi.id
            WHERE sd.subscription_id = ?
            ORDER BY sd.delivery_date
        `;
        db.all(query, [subscriptionId], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
  }
}

module.exports = UserSubscription;