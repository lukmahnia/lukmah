const db = require('../config/db');

class Address {
  static create(addressData) {
    return new Promise((resolve, reject) => {
      const { user_id, street, city, state, zip_code, details } = addressData;
      const query = `INSERT INTO Addresses (user_id, street, city, state, zip_code, details) VALUES (?, ?, ?, ?, ?, ?)`;
      
      db.run(query, [user_id, street, city, state, zip_code, details], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...addressData });
        }
      });
    });
  }

  static findById(id) {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM Addresses WHERE id = ?`;
      
      db.get(query, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  static update(id, addressData) {
    return new Promise((resolve, reject) => {
      const { street, city, state, zip_code, details } = addressData;
      const query = `UPDATE Addresses SET street = ?, city = ?, state = ?, zip_code = ?, details = ? WHERE id = ?`;
      
      db.run(query, [street, city, state, zip_code, details, id], function(err) {
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
      const query = `DELETE FROM Addresses WHERE id = ?`;
      
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

module.exports = Address;
