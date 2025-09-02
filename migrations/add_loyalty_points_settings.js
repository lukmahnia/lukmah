const db = require('../config/db');

async function up() {
  try {
    await db.run(`INSERT INTO Settings (key, value) VALUES ('loyalty_points_enabled', 'true')`);
    await db.run(`INSERT INTO Settings (key, value) VALUES ('loyalty_points_conversion_rate', '10')`);
    console.log('Loyalty points settings added successfully.');
  } catch (err) {
    console.error('Error adding loyalty points settings:', err);
  }
}

up();
