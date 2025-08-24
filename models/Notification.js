const db = require('../config/db');

class Notification {
  static create(notificationData) {
    return new Promise((resolve, reject) => {
      const { message, related_order_id, user_id } = notificationData;
      const query = `INSERT INTO Notifications (message, related_order_id, user_id) VALUES (?, ?, ?)`;
      
      db.run(query, [message, related_order_id, user_id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...notificationData });
        }
      });
    });
  }

  static findById(id) {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM Notifications WHERE id = ?`;
      
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
      const query = `SELECT * FROM Notifications WHERE user_id = ? ORDER BY created_at DESC`;
      
      db.all(query, [userId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static getUnreadByUser(userId) {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM Notifications WHERE user_id = ? AND is_read = 0 ORDER BY created_at DESC`;
      
      db.all(query, [userId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static markAsRead(id) {
    return new Promise((resolve, reject) => {
      const query = `UPDATE Notifications SET is_read = 1 WHERE id = ?`;
      
      db.run(query, [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
    });
  }

  static markAllAsRead(userId) {
    return new Promise((resolve, reject) => {
      const query = `UPDATE Notifications SET is_read = 1 WHERE user_id = ?`;
      
      db.run(query, [userId], function(err) {
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
      const query = `DELETE FROM Notifications WHERE id = ?`;
      
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

module.exports = Notification;