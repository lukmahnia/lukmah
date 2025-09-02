const db = require('./config/db');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function updatePassword() {
  try {
    console.log('Waiting for database to be ready...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    const plainPassword = 'password';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const result = await User.updatePassword(3, hashedPassword);
    console.log('User password updated:', result);
  } catch (error) {
    console.error('Error updating user password:', error);
  } finally {
    db.close();
  }
}

updatePassword();