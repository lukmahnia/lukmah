const db = require('../config/db');

db.serialize(() => {
  db.run(`ALTER TABLE Promotions RENAME COLUMN image TO image_url`, (err) => {
    if (err) {
      console.error('Error renaming column:', err.message);
    } else {
      console.log('Column renamed to image_url in Promotions table.');
    }
  });
});
