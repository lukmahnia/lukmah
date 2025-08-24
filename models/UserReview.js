const db = require('../config/db');

class UserReview {
  static create(reviewData) {
    return new Promise((resolve, reject) => {
      const { user_id, menu_item_id, order_id, rating, comment } = reviewData;
      let query;
      let params;

      if (menu_item_id) {
        query = `INSERT INTO UserReviews (user_id, menu_item_id, order_id, rating, comment) VALUES (?, ?, ?, ?, ?)`;
        params = [user_id, menu_item_id, order_id, rating, comment];
      } else {
        query = `INSERT INTO UserReviews (user_id, order_id, rating, comment) VALUES (?, ?, ?, ?)`;
        params = [user_id, order_id, rating, comment];
      }
      
      db.run(query, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...reviewData });
        }
      });
    });
  }

  static findById(id) {
    return new Promise((resolve, reject) => {
      const query = `SELECT ur.*, u.name as user_name, mi.name as item_name 
                    FROM UserReviews ur
                    JOIN Users u ON ur.user_id = u.id
                    JOIN MenuItems mi ON ur.menu_item_id = mi.id
                    WHERE ur.id = ?`;
      
      db.get(query, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  static getByMenuItem(itemId) {
    return new Promise((resolve, reject) => {
      const query = `SELECT ur.*, u.name as user_name 
                    FROM UserReviews ur
                    JOIN Users u ON ur.user_id = u.id
                    WHERE ur.menu_item_id = ? 
                    ORDER BY ur.created_at DESC`;
      
      db.all(query, [itemId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static getByOrder(orderId) {
    return new Promise((resolve, reject) => {
      const query = `SELECT ur.*, u.name as user_name, mi.name as item_name 
                    FROM UserReviews ur
                    JOIN Users u ON ur.user_id = u.id
                    JOIN MenuItems mi ON ur.menu_item_id = mi.id
                    WHERE ur.order_id = ? 
                    ORDER BY ur.created_at DESC`;
      
      db.all(query, [orderId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static getByUser(userId) {
    return new Promise((resolve, reject) => {
      const query = `SELECT ur.*, mi.name as item_name 
                    FROM UserReviews ur
                    JOIN MenuItems mi ON ur.menu_item_id = mi.id
                    WHERE ur.user_id = ? 
                    ORDER BY ur.created_at DESC`;
      
      db.all(query, [userId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static getRecentReviews(limit = 6) {
    return new Promise((resolve, reject) => {
        const query = `SELECT ur.*, u.name as user_name, mi.name as item_name
                    FROM UserReviews ur
                    JOIN Users u ON ur.user_id = u.id
                    LEFT JOIN MenuItems mi ON ur.menu_item_id = mi.id
                    ORDER BY ur.created_at DESC
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

  static update(id, reviewData) {
    return new Promise((resolve, reject) => {
      const { rating, comment } = reviewData;
      const query = `UPDATE UserReviews SET rating = ?, comment = ? WHERE id = ?`;
      
      db.run(query, [rating, comment, id], function(err) {
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
      const query = `DELETE FROM UserReviews WHERE id = ?`;
      
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

module.exports = UserReview;