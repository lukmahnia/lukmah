const db = require('../config/db');

db.serialize(() => {
  db.run(`
    CREATE TABLE DailyMeals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(255) NOT NULL,
      day_of_week INTEGER NOT NULL UNIQUE,
      description TEXT
    )
  `, (err) => {
    if (err) {
      console.error("Error creating DailyMeals table:", err.message);
    } else {
      console.log("DailyMeals table created.");
    }
  });

  db.run(`
    CREATE TABLE DailyMealItems (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      daily_meal_id INTEGER NOT NULL,
      menu_item_id INTEGER NOT NULL,
      FOREIGN KEY (daily_meal_id) REFERENCES DailyMeals(id) ON DELETE CASCADE,
      FOREIGN KEY (menu_item_id) REFERENCES MenuItems(id) ON DELETE CASCADE
    )
  `, (err) => {
    if (err) {
      console.error("Error creating DailyMealItems table:", err.message);
    } else {
      console.log("DailyMealItems table created.");
    }
  });
});
