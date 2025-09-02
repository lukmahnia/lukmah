const db = require('../config/db');

class Promotion {
  static create(promoData) {
    return new Promise((resolve, reject) => {
      const { code, description, discount_type, value, valid_from, valid_until, is_active, image_url } = promoData;
      const query = `INSERT INTO Promotions (code, description, discount_type, value, valid_from, valid_until, is_active, image_url) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
      
      db.run(query, [code, description, discount_type, value, valid_from, valid_until, is_active, image_url], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...promoData });
        }
      });
    });
  }

  static findByCode(code) {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM Promotions WHERE code = ?`;
      
      db.get(query, [code], (err, row) => {
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
      const query = `SELECT * FROM Promotions WHERE id = ?`;
      
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
        const query = `SELECT * FROM Promotions ORDER BY created_at DESC`; // أضف الترتيب حسب تاريخ الإنشاء
        
        db.all(query, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
         });
     });
  }

  static getAllActive() {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM Promotions WHERE is_active = 1 AND valid_from <= DATE('now') AND valid_until >= DATE('now') ORDER BY created_at DESC`;
      db.all(query, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static update(id, promoData) {
    return new Promise((resolve, reject) => {
      const { code, description, discount_type, value, valid_from, valid_until, is_active, image_url } = promoData;
      const query = `UPDATE Promotions 
                    SET code = ?, description = ?, discount_type = ?, value = ?, 
                        valid_from = ?, valid_until = ?, is_active = ?, image_url = ? 
                    WHERE id = ?`;
      
      db.run(query, [code, description, discount_type, value, valid_from, valid_until, is_active, image_url, id], function(err) {
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
      const query = `DELETE FROM Promotions WHERE id = ?`;
      
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

module.exports = Promotion;