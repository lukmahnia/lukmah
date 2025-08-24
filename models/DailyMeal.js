const db = require('../config/db');

class DailyMeal {
  static create(mealData) {
    return new Promise((resolve, reject) => {
      const { name, day_of_week, description } = mealData;
      const query = `INSERT INTO DailyMeals (name, day_of_week, description) VALUES (?, ?, ?)`;
      
      db.run(query, [name, day_of_week, description], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...mealData });
        }
      });
    });
  }

  static findById(id) {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM DailyMeals WHERE id = ?`;
      
      db.get(query, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  static findByDay(dayOfWeek) {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM DailyMeals WHERE day_of_week = ?`;
      
      db.get(query, [dayOfWeek], (err, row) => {
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
        const query = `SELECT * FROM DailyMeals ORDER BY day_of_week`;
        
        db.all(query, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
  }

  static update(id, mealData) {
    return new Promise((resolve, reject) => {
      const { name, description } = mealData;
      const query = `UPDATE DailyMeals SET name = ?, description = ? WHERE id = ?`;
      
      db.run(query, [name, description, id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
    });
  }

}

module.exports = DailyMeal;
