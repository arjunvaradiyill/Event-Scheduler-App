const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://arjunvaradiyil203:tfo9H1kuuSQzZtq7@evento.bfhcdzc.mongodb.net/eventplanning';

async function checkEvents() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get the Event model
    const Event = mongoose.models.Event || mongoose.model('Event', new mongoose.Schema({}));
    
    const events = await Event.find({});
    console.log(`Found ${events.length} events in database`);
    
    for (const event of events) {
      console.log(`Event: ${event.title}`);
      console.log(`  Date: ${event.date}`);
      console.log(`  Date type: ${typeof event.date}`);
      console.log(`  Date instanceof Date: ${event.date instanceof Date}`);
      
      if (!event.date) {
        console.log(`  ❌ MISSING DATE`);
      } else if (event.date instanceof Date) {
        console.log(`  ✅ Valid Date object`);
      } else {
        console.log(`  ⚠️  Date is not a Date object`);
      }
      console.log('---');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkEvents(); 