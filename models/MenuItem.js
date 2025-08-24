const db = require('../config/db');

class MenuItem {
  static create(itemData) {
    return new Promise((resolve, reject) => {
      const { category_id, name, description, price, image_url, calories, is_subscription_item } = itemData;
      const query = `INSERT INTO MenuItems (category_id, name, description, price, image_url, calories, is_subscription_item) VALUES (?, ?, ?, ?, ?, ?, ?)`;
      
      db.run(query, [category_id, name, description, price, image_url, calories, is_subscription_item], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...itemData });
        }
      });
    });
  }

  static findById(id) {
    return new Promise((resolve, reject) => {
      const query = `SELECT mi.*, c.name as category_name 
                    FROM MenuItems mi 
                    JOIN Categories c ON mi.category_id = c.id 
                    WHERE mi.id = ?`;
      
      db.get(query, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  static findByCategory(categoryId) {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM MenuItems WHERE category_id = ? AND is_available = 1`;
      
      db.all(query, [categoryId], (err, rows) => {
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
        const query = `SELECT mi.*, c.name as category_name 
                    FROM MenuItems mi 
                    JOIN Categories c ON mi.category_id = c.id
                    ORDER BY mi.name`; // أضف الترتيب حسب الاسم
        
        db.all(query, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

  static update(id, itemData) {
    return new Promise((resolve, reject) => {
      const { category_id, name, description, price, image_url, calories, is_available, is_subscription_item } = itemData;
      const query = `UPDATE MenuItems 
                    SET category_id = ?, name = ?, description = ?, price = ?, image_url = ?, 
                        calories = ?, is_available = ?, is_subscription_item = ? 
                    WHERE id = ?`;
      
      db.run(query, [category_id, name, description, price, image_url, calories, is_available, is_subscription_item, id], function(err) {
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
      const query = `DELETE FROM MenuItems WHERE id = ?`;
      
      db.run(query, [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
    });
  }

  static search(query) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT mi.*, c.name as category_name 
                  FROM MenuItems mi 
                  JOIN Categories c ON mi.category_id = c.id 
                  WHERE mi.name LIKE ? OR mi.description LIKE ? 
                  AND mi.is_available = 1`;
      
      db.all(sql, [`%${query}%`, `%${query}%`], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
}

module.exports = MenuItem;