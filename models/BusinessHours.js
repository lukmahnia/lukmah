const db = require('../config/db');

class BusinessHours {
  static create(hoursData) {
    return new Promise((resolve, reject) => {
      const { day_of_week, open_time, close_time, is_open } = hoursData;
      const query = `INSERT INTO BusinessHours (day_of_week, open_time, close_time, is_open) VALUES (?, ?, ?, ?)`;
      
      db.run(query, [day_of_week, open_time, close_time, is_open], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...hoursData });
        }
      });
    });
  }

  static findById(id) {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM BusinessHours WHERE id = ?`;
      
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
      const query = `SELECT * FROM BusinessHours ORDER BY day_of_week`;
      
      db.all(query, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static update(id, hoursData) {
    return new Promise((resolve, reject) => {
      const { day_of_week, open_time, close_time, is_open } = hoursData;
      const query = `UPDATE BusinessHours SET day_of_week = ?, open_time = ?, close_time = ?, is_open = ? WHERE id = ?`;
      
      db.run(query, [day_of_week, open_time, close_time, is_open, id], function(err) {
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
      const query = `DELETE FROM BusinessHours WHERE id = ?`;
      
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

module.exports = BusinessHours;