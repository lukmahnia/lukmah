const db = require('../config/db');

class DeliveryCompany {
  static create(companyData) {
    return new Promise((resolve, reject) => {
      const { name, api_details } = companyData;
      const query = `INSERT INTO DeliveryCompanies (name, api_details) VALUES (?, ?)`;
      
      db.run(query, [name, api_details], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...companyData });
        }
      });
    });
  }

  static findById(id) {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM DeliveryCompanies WHERE id = ?`;
      
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
      const query = `SELECT * FROM DeliveryCompanies ORDER BY created_at DESC`;
      
      db.all(query, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static update(id, companyData) {
    return new Promise((resolve, reject) => {
      const { name, api_details } = companyData;
      const query = `UPDATE DeliveryCompanies SET name = ?, api_details = ? WHERE id = ?`;
      
      db.run(query, [name, api_details, id], function(err) {
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
      const query = `DELETE FROM DeliveryCompanies WHERE id = ?`;
      
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

module.exports = DeliveryCompany;