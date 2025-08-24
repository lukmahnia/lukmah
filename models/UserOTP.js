const db = require('../config/db');

class UserOTP {
  static create(otpData) {
    return new Promise((resolve, reject) => {
      const { phone, otp_code, expires_at } = otpData;
      const query = `INSERT INTO User_OTPs (phone, otp_code, expires_at) VALUES (?, ?, ?)`;
      
      db.run(query, [phone, otp_code, expires_at], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...otpData });
        }
      });
    });
  }

  static findByPhone(phone) {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM User_OTPs WHERE phone = ? ORDER BY created_at DESC LIMIT 1`;
      
      db.get(query, [phone], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  static deleteByPhone(phone) {
    return new Promise((resolve, reject) => {
      const query = `DELETE FROM User_OTPs WHERE phone = ?`;
      
      db.run(query, [phone], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
    });
  }
}

module.exports = UserOTP;