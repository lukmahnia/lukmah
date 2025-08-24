const db = require('../config/db');

class OrderItem {
  static create(itemData) {
    return new Promise((resolve, reject) => {
      const { order_id, menu_item_id, quantity, price_per_item } = itemData;
      const query = `INSERT INTO OrderItems (order_id, menu_item_id, quantity, price_per_item) VALUES (?, ?, ?, ?)`;
      
      db.run(query, [order_id, menu_item_id, quantity, price_per_item], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...itemData });
        }
      });
    });
  }

  static getByOrder(orderId) {
    return new Promise((resolve, reject) => {
      const query = `SELECT oi.*, mi.name, mi.image_url 
                    FROM OrderItems oi
                    JOIN MenuItems mi ON oi.menu_item_id = mi.id
                    WHERE oi.order_id = ?`;
      
      db.all(query, [orderId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static getTopSellingItems(limit = 10) {
    return new Promise((resolve, reject) => {
      const query = `SELECT mi.id, mi.name, mi.price, c.name as category, 
                           SUM(oi.quantity) as quantity, SUM(oi.quantity * oi.price_per_item) as total
                    FROM OrderItems oi
                    JOIN MenuItems mi ON oi.menu_item_id = mi.id
                    JOIN Categories c ON mi.category_id = c.id
                    GROUP BY mi.id
                    ORDER BY quantity DESC
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

  static getItemsReport() {
    return new Promise((resolve, reject) => {
      const query = `SELECT mi.id, mi.name, mi.price, c.name as category, 
                           COUNT(oi.id) as orderCount, SUM(oi.quantity) as quantitySold, 
                           SUM(oi.quantity * oi.price_per_item) as revenue
                    FROM MenuItems mi
                    LEFT JOIN OrderItems oi ON mi.id = oi.menu_item_id
                    LEFT JOIN Categories c ON mi.category_id = c.id
                    GROUP BY mi.id
                    ORDER BY revenue DESC`;
      
      db.all(query, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
}

module.exports = OrderItem;