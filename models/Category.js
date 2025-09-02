const db = require('../config/db');

class Category {
  static create(categoryData) {
    return new Promise((resolve, reject) => {
      const { name, description, image_url } = categoryData;
      const query = `INSERT INTO Categories (name, description, image_url) VALUES (?, ?, ?)`;
      
      db.run(query, [name, description, image_url], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...categoryData });
        }
      });
    });
  }

  static findById(id) {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM Categories WHERE id = ?`;
      
      db.get(query, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  static findByName(name) {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM Categories WHERE name = ?`;
      
      db.get(query, [name], (err, row) => {
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
        const query = `SELECT c.*, COUNT(mi.id) as itemCount 
                    FROM Categories c
                    LEFT JOIN MenuItems mi ON c.id = mi.category_id
                    GROUP BY c.id
                    ORDER BY c.name`; // أضف الترتيب حسب الاسم
        
        db.all(query, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
  }

  static update(id, categoryData) {
    return new Promise((resolve, reject) => {
      const { name, description, image_url } = categoryData;
      const query = `UPDATE Categories SET name = ?, description = ?, image_url = ? WHERE id = ?`;
      
      db.run(query, [name, description, image_url, id], function(err) {
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
      const query = `DELETE FROM Categories WHERE id = ?`;
      
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

module.exports = Category;
