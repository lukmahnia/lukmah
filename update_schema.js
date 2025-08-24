const db = require('./config/db');

db.serialize(() => {
  db.run("ALTER TABLE Orders ADD COLUMN subtotal REAL", (err) => {
    if (err) {
      if (err.message.includes('duplicate column name')) {
        console.log('Column subtotal already exists in Orders table.');
      } else {
        console.error('Error adding column subtotal to Orders table:', err.message);
      }
    } else {
      console.log('Column subtotal added to Orders table successfully.');
    }
  });

  db.run("ALTER TABLE Orders ADD COLUMN delivery_fee REAL", (err) => {
    if (err) {
      if (err.message.includes('duplicate column name')) {
        console.log('Column delivery_fee already exists in Orders table.');
      } else {
        console.error('Error adding column delivery_fee to Orders table:', err.message);
      }
    } else {
      console.log('Column delivery_fee added to Orders table successfully.');
    }
  });

  db.run("ALTER TABLE Orders ADD COLUMN tax REAL", (err) => {
    if (err) {
      if (err.message.includes('duplicate column name')) {
        console.log('Column tax already exists in Orders table.');
      } else {
        console.error('Error adding column tax to Orders table:', err.message);
      }
    } else {
      console.log('Column tax added to Orders table successfully.');
    }
  });

  db.run("ALTER TABLE Orders ADD COLUMN discount_amount REAL", (err) => {
    if (err) {
      if (err.message.includes('duplicate column name')) {
        console.log('Column discount_amount already exists in Orders table.');
      } else {
        console.error('Error adding column discount_amount to Orders table:', err.message);
      }
    } else {
      console.log('Column discount_amount added to Orders table successfully.');
    }
  });

  db.close((err) => {
    if (err) {
      console.error('Error closing the database connection:', err.message);
    } else {
      console.log('Database connection closed.');
    }
  });
});