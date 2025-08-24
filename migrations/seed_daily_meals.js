const db = require('../config/db');
const MenuItem = require('../models/MenuItem');
const DailyMeal = require('../models/DailyMeal');
const DailyMealItem = require('../models/DailyMealItem');

const seedDailyMeals = async () => {
  try {
    const menuItems = await MenuItem.getAll();

    if (menuItems.length < 7) {
      console.log('Not enough menu items to create daily meals.');
      return;
    }

    const daysOfWeek = [
      { day: 0, name: 'وجبة يوم الأحد' },
      { day: 1, name: 'وجبة يوم الإثنين' },
      { day: 2, name: 'وجبة يوم الثلاثاء' },
      { day: 3, name: 'وجبة يوم الأربعاء' },
      { day: 4, name: 'وجبة يوم الخميس' },
      { day: 5, name: 'وجبة يوم الجمعة' },
      { day: 6, name: 'وجبة يوم السبت' },
    ];

    for (const dayInfo of daysOfWeek) {
      const meal = await DailyMeal.create({
        name: dayInfo.name,
        day_of_week: dayInfo.day,
        description: `مجموعة مختارة من الأطباق ليوم ${dayInfo.name}`
      });

      // Add 3 random items to each meal
      for (let i = 0; i < 3; i++) {
        const randomItem = menuItems[Math.floor(Math.random() * menuItems.length)];
        await DailyMealItem.create({
          daily_meal_id: meal.id,
          menu_item_id: randomItem.id
        });
      }
    }

    console.log('Successfully seeded daily meals.');

  } catch (err) {
    console.error('Error seeding daily meals:', err);
  } finally {
    db.close();
  }
};

seedDailyMeals();
