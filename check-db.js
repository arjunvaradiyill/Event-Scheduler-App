const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://arjunvaradiyil203:tfo9H1kuuSQzZtq7@evento.bfhcdzc.mongodb.net/eventplanning';

// Define the Event schema (copy from the model file)
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
  startTime: {
    type: String,
    required: [true, 'Event start time is required'],
  },
  endTime: {
    type: String,
    required: [true, 'Event end time is required'],
  },
  location: {
    type: String,
    required: [true, 'Event location is required'],
    trim: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Event creator is required'],
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

async function checkDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if Event model exists and what fields it has
    const Event = mongoose.model('Event', eventSchema);
    console.log('Event model fields:', Object.keys(Event.schema.paths));

    // Check existing events
    const events = await Event.find({}).limit(5);
    console.log('Sample events:', events.map(e => ({
      _id: e._id,
      title: e.title,
      hasTime: !!e.time,
      hasStartTime: !!e.startTime,
      hasOrganizer: !!e.organizer,
      hasCreatedBy: !!e.createdBy
    })));

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

checkDatabase(); 