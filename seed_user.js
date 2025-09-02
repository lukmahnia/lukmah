const db = require('./config/db');
const User = require('./models/User');

async function seedUser() {
  try {
    console.log('Waiting for database to be ready...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Create a new user
    const user = await User.create({ name: 'Test User', phone: '1234567890', password: 'password', role: 'customer' });
    console.log('User created:', user);
  } catch (error) {
    console.error('Error seeding user:', error);
  } finally {
    db.close();
  }
}

seedUser();