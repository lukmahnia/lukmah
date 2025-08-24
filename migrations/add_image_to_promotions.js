
const db = require('../config/db');

db.serialize(() => {
  db.run(`ALTER TABLE Promotions ADD COLUMN image_url TEXT`, (err) => {
    if (err) {
      console.error('Error adding image column to Promotions table:', err.message);
    } else {
      console.log('Image column added to Promotions table.');
    }
  });
});
