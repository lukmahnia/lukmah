const db = require('../config/db');

class DailyMealItem {
  static create(itemData) {
    return new Promise((resolve, reject) => {
      const { daily_meal_id, menu_item_id } = itemData;
      const query = `INSERT INTO DailyMealItems (daily_meal_id, menu_item_id) VALUES (?, ?)`;
      
      db.run(query, [daily_meal_id, menu_item_id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...itemData });
        }
      });
    });
  }

  static getByMealId(dailyMealId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT mi.* 
        FROM DailyMealItems dmi
        JOIN MenuItems mi ON dmi.menu_item_id = mi.id
        WHERE dmi.daily_meal_id = ?
      `;
      
      db.all(query, [dailyMealId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static delete(dailyMealId, menuItemId) {
    return new Promise((resolve, reject) => {
      const query = `DELETE FROM DailyMealItems WHERE daily_meal_id = ? AND menu_item_id = ?`;
      
      db.run(query, [dailyMealId, menuItemId], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
    });
  }
}

module.exports = DailyMealItem;
