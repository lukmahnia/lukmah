const db = require('../config/db');

class Cart {
  static create(cartData) {
    return new Promise((resolve, reject) => {
      const { user_id, menu_item_id, quantity } = cartData;
      const query = `INSERT INTO Cart (user_id, menu_item_id, quantity) VALUES (?, ?, ?)`;
      
      db.run(query, [user_id, menu_item_id, quantity], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...cartData });
        }
      });
    });
  }

  static getByUser(userId) {
    return new Promise((resolve, reject) => {
      const query = `SELECT c.*, mi.name, mi.price, mi.image_url 
                    FROM Cart c
                    JOIN MenuItems mi ON c.menu_item_id = mi.id
                    WHERE c.user_id = ?`;
      
      db.all(query, [userId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static findByUserAndItem(userId, itemId) {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM Cart WHERE user_id = ? AND menu_item_id = ?`;
      
      db.get(query, [userId, itemId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  static update(id, cartData) {
    return new Promise((resolve, reject) => {
      const { quantity } = cartData;
      const query = `UPDATE Cart SET quantity = ? WHERE id = ?`;
      
      db.run(query, [quantity, id], function(err) {
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
      const query = `DELETE FROM Cart WHERE id = ?`;
      
      db.run(query, [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
    });
  }

  static clearByUser(userId) {
    return new Promise((resolve, reject) => {
      const query = `DELETE FROM Cart WHERE user_id = ?`;
      
      db.run(query, [userId], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
    });
  }
}

module.exports = Cart;