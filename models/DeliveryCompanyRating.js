const db = require('../config/db');

class DeliveryCompanyRating {
  static create(ratingData) {
    return new Promise((resolve, reject) => {
      const { delivery_company_id, user_id, rating, comment } = ratingData;
      const query = `INSERT INTO DeliveryCompanyRatings (delivery_company_id, user_id, rating, comment) VALUES (?, ?, ?, ?)`;
      
      db.run(query, [delivery_company_id, user_id, rating, comment], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...ratingData });
        }
      });
    });
  }

  static findById(id) {
    return new Promise((resolve, reject) => {
      const query = `SELECT dcr.*, u.name as user_name, dc.name as company_name 
                    FROM DeliveryCompanyRatings dcr
                    JOIN Users u ON dcr.user_id = u.id
                    JOIN DeliveryCompanies dc ON dcr.delivery_company_id = dc.id
                    WHERE dcr.id = ?`;
      
      db.get(query, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  static getByCompany(companyId) {
    return new Promise((resolve, reject) => {
      const query = `SELECT dcr.*, u.name as user_name 
                    FROM DeliveryCompanyRatings dcr
                    JOIN Users u ON dcr.user_id = u.id
                    WHERE dcr.delivery_company_id = ? 
                    ORDER BY dcr.created_at DESC`;
      
      db.all(query, [companyId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static getByUser(userId) {
    return new Promise((resolve, reject) => {
      const query = `SELECT dcr.*, dc.name as company_name 
                    FROM DeliveryCompanyRatings dcr
                    JOIN DeliveryCompanies dc ON dcr.delivery_company_id = dc.id
                    WHERE dcr.user_id = ? 
                    ORDER BY dcr.created_at DESC`;
      
      db.all(query, [userId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static getAverageRating(companyId) {
    return new Promise((resolve, reject) => {
      const query = `SELECT AVG(rating) as averageRating, COUNT(*) as ratingCount 
                    FROM DeliveryCompanyRatings 
                    WHERE delivery_company_id = ?`;
      
      db.get(query, [companyId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  static update(id, ratingData) {
    return new Promise((resolve, reject) => {
      const { rating, comment } = ratingData;
      const query = `UPDATE DeliveryCompanyRatings SET rating = ?, comment = ? WHERE id = ?`;
      
      db.run(query, [rating, comment, id], function(err) {
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
      const query = `DELETE FROM DeliveryCompanyRatings WHERE id = ?`;
      
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

module.exports = DeliveryCompanyRating;