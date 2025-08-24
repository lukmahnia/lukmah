const db = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
  static create(userData) {
    return new Promise((resolve, reject) => {
      const { name, phone, password, role = 'customer' } = userData;
      const query = `INSERT INTO Users (name, phone, password, role) VALUES (?, ?, ?, ?)`;
      
      db.run(query, [name, phone, password, role], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...userData });
        }
      });
    });
  }

  static findByPhone(phone) {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM Users WHERE phone = ?`;
      
      db.get(query, [phone], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  static findById(id) {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM Users WHERE id = ?`;
      
      db.get(query, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  static update(id, userData) {
    return new Promise((resolve, reject) => {
      const { name, phone } = userData;
      const query = `UPDATE Users SET name = ?, phone = ? WHERE id = ?`;
      
      db.run(query, [name, phone, id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
    });
  }

  static getAll() {
    return new Promise((resolve, reject) => {
      const query = `SELECT id, name, phone, role, loyalty_points, created_at FROM Users`;
      
      db.all(query, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static getAddresses(userId) {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM Addresses WHERE user_id = ?`;
      
      db.all(query, [userId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static getTodayNewCustomers() {
    return new Promise((resolve, reject) => {
      const query = `SELECT COUNT(*) as count FROM Users 
                    WHERE DATE(created_at) = DATE('now')`;
      
      db.get(query, [], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row.count);
        }
      });
    });
  }

  static getCustomersReport() {
    return new Promise((resolve, reject) => {
      const query = `SELECT 
                    COUNT(*) as totalCustomers,
                    SUM(CASE WHEN DATE(created_at) = DATE('now') THEN 1 ELSE 0 END) as newToday,
                    SUM(CASE WHEN DATE(created_at) >= DATE('now', '-7 days') THEN 1 ELSE 0 END) as newThisWeek,
                    SUM(CASE WHEN DATE(created_at) >= DATE('now', '-30 days') THEN 1 ELSE 0 END) as newThisMonth
                    FROM Users`;
      
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

module.exports = User;