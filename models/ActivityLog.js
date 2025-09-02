const db = require('../config/db');

class ActivityLog {
  static create(logData) {
    return new Promise((resolve, reject) => {
      const { user_id, action, details } = logData;
      const query = `INSERT INTO ActivityLog (user_id, action, details) VALUES (?, ?, ?)`;
      
      db.run(query, [user_id, action, details], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...logData });
        }
      });
    });
  }

  static findById(id) {
    return new Promise((resolve, reject) => {
      const query = `SELECT al.*, u.name as user_name 
                    FROM ActivityLog al
                    JOIN Users u ON al.user_id = u.id
                    WHERE al.id = ?`;
      
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
      const query = `SELECT * FROM ActivityLog WHERE user_id = ? ORDER BY created_at DESC`;
      
      db.all(query, [userId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static getAll(limit = 100) {
    return new Promise((resolve, reject) => {
      const query = `SELECT al.*, u.name as user_name 
                    FROM ActivityLog al
                    JOIN Users u ON al.user_id = u.id
                    ORDER BY al.created_at DESC
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

  static delete(id) {
    return new Promise((resolve, reject) => {
      const query = `DELETE FROM ActivityLog WHERE id = ?`;
      
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

module.exports = ActivityLog;
