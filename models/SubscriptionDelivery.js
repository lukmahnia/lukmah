const db = require('../config/db');

class SubscriptionDelivery {
  static create(deliveryData) {
    return new Promise((resolve, reject) => {
      const { subscription_id, delivery_date, menu_item_id, delivery_time_slot, status } = deliveryData;
      const query = `INSERT INTO SubscriptionDeliveries (subscription_id, delivery_date, menu_item_id, delivery_time_slot, status) 
                    VALUES (?, ?, ?, ?, ?)`;
      
      db.run(query, [subscription_id, delivery_date, menu_item_id, delivery_time_slot, status], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...deliveryData });
        }
      });
    });
  }

  static findById(id) {
    return new Promise((resolve, reject) => {
      const query = `SELECT sd.*, mi.name as item_name 
                    FROM SubscriptionDeliveries sd
                    JOIN MenuItems mi ON sd.menu_item_id = mi.id
                    WHERE sd.id = ?`;
      
      db.get(query, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  static getBySubscription(subscriptionId) {
    return new Promise((resolve, reject) => {
      const query = `SELECT sd.*, mi.name as item_name 
                    FROM SubscriptionDeliveries sd
                    JOIN MenuItems mi ON sd.menu_item_id = mi.id
                    WHERE sd.subscription_id = ? 
                    ORDER BY sd.delivery_date`;
      
      db.all(query, [subscriptionId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static update(id, deliveryData) {
    return new Promise((resolve, reject) => {
      const { delivery_date, menu_item_id, delivery_time_slot, status } = deliveryData;
      const query = `UPDATE SubscriptionDeliveries 
                    SET delivery_date = ?, menu_item_id = ?, delivery_time_slot = ?, status = ? 
                    WHERE id = ?`;
      
      db.run(query, [delivery_date, menu_item_id, delivery_time_slot, status, id], function(err) {
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
      const query = `DELETE FROM SubscriptionDeliveries WHERE id = ?`;
      
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

module.exports = SubscriptionDelivery;