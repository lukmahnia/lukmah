const db = require('../config/db');

class OrderStatusHistory {
  static create(historyData) {
    return new Promise((resolve, reject) => {
      const { order_id, status } = historyData;
      const query = `INSERT INTO OrderStatusHistory (order_id, status) VALUES (?, ?)`;
      
      db.run(query, [order_id, status], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...historyData });
        }
      });
    });
  }

  static getByOrder(orderId) {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM OrderStatusHistory WHERE order_id = ? ORDER BY changed_at ASC`;
      
      db.all(query, [orderId], (err, rows) => {
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
      const query = `DELETE FROM OrderStatusHistory WHERE id = ?`;
      
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

module.exports = OrderStatusHistory;