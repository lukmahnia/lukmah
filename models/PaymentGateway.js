const db = require('../config/db');

class PaymentGateway {
  static create(gatewayData) {
    return new Promise((resolve, reject) => {
      const { name, api_keys, is_active } = gatewayData;
      const query = `INSERT INTO PaymentGateways (name, api_keys, is_active) VALUES (?, ?, ?)`;
      
      db.run(query, [name, api_keys, is_active], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...gatewayData });
        }
      });
    });
  }

  static findById(id) {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM PaymentGateways WHERE id = ?`;
      
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
      const query = `SELECT * FROM PaymentGateways ORDER BY created_at DESC`;
      
      db.all(query, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static getActive() {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM PaymentGateways WHERE is_active = 1`;
      
      db.all(query, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static update(id, gatewayData) {
    return new Promise((resolve, reject) => {
      const { name, api_keys, is_active } = gatewayData;
      const query = `UPDATE PaymentGateways SET name = ?, api_keys = ?, is_active = ? WHERE id = ?`;
      
      db.run(query, [name, api_keys, is_active, id], function(err) {
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
      const query = `DELETE FROM PaymentGateways WHERE id = ?`;
      
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

module.exports = PaymentGateway;