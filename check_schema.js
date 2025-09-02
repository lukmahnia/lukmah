const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('lq.sqlite');

db.serialize(() => {
  db.each("SELECT sql FROM sqlite_master WHERE type='table' AND name='Promotions'", (err, row) => {
    if (err) {
      console.error(err.message);
    }
    console.log(row.sql);
  });
});

db.close();