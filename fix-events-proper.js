const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://arjunvaradiyil203:tfo9H1kuuSQzZtq7@evento.bfhcdzc.mongodb.net/eventplanning';

// Define the Event schema properly
const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    trim: true,
  },
  date: {
    type: Date,
    required: [true, 'Event date is required'],
  },
  time: {
    type: String,
    required: [true, 'Event time is required'],
  },
  duration: {
    type: Number,
    default: 120,
    min: [15, 'Event duration must be at least 15 minutes'],
    max: [1440, 'Event duration cannot exceed 24 hours'],
  },
  location: {
    type: String,
    required: [true, 'Event location is required'],
    trim: true,
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Event organizer is required'],
  },
  attendees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  maxAttendees: {
    type: Number,
    min: 1,
  },
  category: {
    type: String,
    required: [true, 'Event category is required'],
    trim: true,
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming',
  },
  image: {
    type: String,
  },
  price: {
    type: Number,
    min: 0,
  },
  contactEmail: {
    type: String,
    trim: true,
  },
  contactPhone: {
    type: String,
    trim: true,
  },
  requirements: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

async function fixEventsProper() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get the User model
    const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({}));
    
    // Create Event model with proper schema
    const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);

    // Find existing users to use as organizers
    const users = await User.find({});
    console.log(`Found ${users.length} users in database`);

    if (users.length === 0) {
      console.log('No users found. Please create users first.');
      return;
    }

    // Delete all existing events
    await Event.deleteMany({});
    console.log('Deleted all existing events');

    // Sample events data
    const sampleEvents = [
      {
        title: "Team Building Workshop",
        description: "Interactive team building activities to improve collaboration and communication skills.",
        date: new Date("2024-07-15"),
        time: "09:00",
        duration: 180,
        location: "Conference Room A",
        category: "Workshop",
        status: "upcoming",
        organizer: users[0]._id,
        attendees: [],
        maxAttendees: 20
      },
      {
        title: "Product Launch Meeting",
        description: "Final preparations and strategy discussion for the new product launch.",
        date: new Date("2024-07-16"),
        time: "14:30",
        duration: 120,
        location: "Board Room",
        category: "Meeting",
        status: "upcoming",
        organizer: users[0]._id,
        attendees: [],
        maxAttendees: 15
      },
      {
        title: "Client Presentation",
        description: "Present quarterly results and future plans to key clients.",
        date: new Date("2024-07-17"),
        time: "10:00",
        duration: 90,
        location: "Auditorium",
        category: "Presentation",
        status: "upcoming",
        organizer: users[1] ? users[1]._id : users[0]._id,
        attendees: [],
        maxAttendees: 50
      },
      {
        title: "Code Review Session",
        description: "Review recent code changes and discuss best practices.",
        date: new Date("2024-07-18"),
        time: "16:00",
        duration: 60,
        location: "Development Lab",
        category: "Technical",
        status: "upcoming",
        organizer: users[0]._id,
        attendees: [],
        maxAttendees: 10
      },
      {
        title: "Marketing Strategy Meeting",
        description: "Plan upcoming marketing campaigns and discuss budget allocation.",
        date: new Date("2024-07-19"),
        time: "11:00",
        duration: 150,
        location: "Marketing Office",
        category: "Meeting",
        status: "upcoming",
        organizer: users[1] ? users[1]._id : users[0]._id,
        attendees: [],
        maxAttendees: 12
      }
    ];

    // Add sample events one by one to ensure proper creation
    for (const eventData of sampleEvents) {
      const event = new Event(eventData);
      await event.save();
      console.log(`Created event: ${event.title} on ${event.date.toISOString().split('T')[0]} at ${event.time}`);
    }

    console.log('All events created successfully!');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

fixEventsProper(); 