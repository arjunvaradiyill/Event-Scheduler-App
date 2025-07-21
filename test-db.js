const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://arjunvaradiyil203:tfo9H1kuuSQzZtq7@evento.bfhcdzc.mongodb.net/eventplanning';

async function testDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Check if User model exists
    const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({}));
    
    const users = await User.find({});
    console.log('Users in database:', users.length);
    
    for (const user of users) {
      console.log('User document:', JSON.stringify(user.toObject(), null, 2));
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

testDB(); 