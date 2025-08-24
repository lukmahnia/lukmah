const db = require('../config/db');

class SubscriptionPlan {
  static create(planData) {
    return new Promise((resolve, reject) => {
      const { name, plan_type, duration_days, meals_per_day, price } = planData;
      const query = `INSERT INTO SubscriptionPlans (name, plan_type, duration_days, meals_per_day, price) VALUES (?, ?, ?, ?, ?)`;
      
      db.run(query, [name, plan_type, duration_days, meals_per_day, price], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...planData });
        }
      });
    });
  }

  static findById(id) {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM SubscriptionPlans WHERE id = ?`;
      
      db.get(query, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  static getAll() {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM SubscriptionPlans ORDER BY created_at DESC`;
      
      db.all(query, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static update(id, planData) {
    return new Promise((resolve, reject) => {
      const { name, plan_type, duration_days, meals_per_day, price } = planData;
      const query = `UPDATE SubscriptionPlans SET name = ?, plan_type = ?, duration_days = ?, meals_per_day = ?, price = ? WHERE id = ?`;
      
      db.run(query, [name, plan_type, duration_days, meals_per_day, price, id], function(err) {
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
      const query = `DELETE FROM SubscriptionPlans WHERE id = ?`;
      
      db.run(query, [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
    });
  }
}

module.exports = SubscriptionPlan;