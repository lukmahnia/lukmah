const db = require('../config/db');

db.serialize(() => {
  db.run("ALTER TABLE Addresses ADD COLUMN is_default BOOLEAN DEFAULT 0", (err) => {
    if (err) {
      console.error("Error adding is_default column to Addresses table:", err.message);
    } else {
      console.log("Column is_default added to Addresses table.");
    }
  });
});
