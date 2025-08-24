const db = require('../config/db');

class GiftCard {
  static create(cardData) {
    return new Promise((resolve, reject) => {
      const { code, user_id, balance, is_active, expires_at } = cardData;
      const query = `INSERT INTO GiftCards (code, user_id, balance, is_active, expires_at) VALUES (?, ?, ?, ?, ?)`;
      
      db.run(query, [code, user_id, balance, is_active, expires_at], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...cardData });
        }
      });
    });
  }

  static findById(id) {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM GiftCards WHERE id = ?`;
      
      db.get(query, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  static findByCode(code) {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM GiftCards WHERE code = ?`;
      
      db.get(query, [code], (err, row) => {
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
      const query = `SELECT * FROM GiftCards WHERE user_id = ? ORDER BY created_at DESC`;
      
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
      const query = `SELECT gc.*, u.name as user_name 
                    FROM GiftCards gc
                    LEFT JOIN Users u ON gc.user_id = u.id
                    ORDER BY gc.created_at DESC`;
      
      db.all(query, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static update(id, cardData) {
    return new Promise((resolve, reject) => {
      const { user_id, balance, is_active, expires_at } = cardData;
      const query = `UPDATE GiftCards SET user_id = ?, balance = ?, is_active = ?, expires_at = ? WHERE id = ?`;
      
      db.run(query, [user_id, balance, is_active, expires_at, id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
    });
  }

  static updateBalance(id, amount) {
    return new Promise((resolve, reject) => {
      const query = `UPDATE GiftCards SET balance = balance + ? WHERE id = ?`;
      
      db.run(query, [amount, id], function(err) {
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
      const query = `DELETE FROM GiftCards WHERE id = ?`;
      
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

module.exports = GiftCard;