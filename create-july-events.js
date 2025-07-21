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

async function createJulyEvents() {
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

    // Sample events for July 10-30, 2025
    const julyEvents = [
      {
        title: "Summer Team Retreat",
        description: "Annual team building and planning session for the upcoming quarter.",
        date: new Date("2025-07-10"),
        time: "09:00",
        duration: 480,
        location: "Mountain Resort",
        category: "Retreat",
        status: "upcoming",
        organizer: users[0]._id,
        attendees: [],
        maxAttendees: 50
      },
      {
        title: "Product Strategy Meeting",
        description: "Quarterly product roadmap review and strategic planning session.",
        date: new Date("2025-07-11"),
        time: "14:00",
        duration: 180,
        location: "Conference Room A",
        category: "Strategy",
        status: "upcoming",
        organizer: users[0]._id,
        attendees: [],
        maxAttendees: 20
      },
      {
        title: "Client Workshop",
        description: "Interactive workshop with key clients to gather feedback and requirements.",
        date: new Date("2025-07-12"),
        time: "10:00",
        duration: 300,
        location: "Client Center",
        category: "Workshop",
        status: "upcoming",
        organizer: users[1] ? users[1]._id : users[0]._id,
        attendees: [],
        maxAttendees: 30
      },
      {
        title: "Technical Training",
        description: "Advanced technical training session for development team.",
        date: new Date("2025-07-14"),
        time: "13:00",
        duration: 240,
        location: "Training Lab",
        category: "Training",
        status: "upcoming",
        organizer: users[0]._id,
        attendees: [],
        maxAttendees: 25
      },
      {
        title: "Marketing Campaign Launch",
        description: "Launch of the new summer marketing campaign with stakeholders.",
        date: new Date("2025-07-15"),
        time: "11:00",
        duration: 120,
        location: "Marketing Office",
        category: "Marketing",
        status: "upcoming",
        organizer: users[1] ? users[1]._id : users[0]._id,
        attendees: [],
        maxAttendees: 15
      },
      {
        title: "Board Meeting",
        description: "Monthly board meeting to review company performance and strategic initiatives.",
        date: new Date("2025-07-16"),
        time: "15:00",
        duration: 180,
        location: "Board Room",
        category: "Meeting",
        status: "upcoming",
        organizer: users[0]._id,
        attendees: [],
        maxAttendees: 12
      },
      {
        title: "Design Sprint",
        description: "5-day design sprint to create new product features and improvements.",
        date: new Date("2025-07-17"),
        time: "09:00",
        duration: 480,
        location: "Design Studio",
        category: "Design",
        status: "upcoming",
        organizer: users[1] ? users[1]._id : users[0]._id,
        attendees: [],
        maxAttendees: 8
      },
      {
        title: "Sales Training",
        description: "Comprehensive sales training for the new product line.",
        date: new Date("2025-07-18"),
        time: "14:00",
        duration: 300,
        location: "Sales Training Center",
        category: "Training",
        status: "upcoming",
        organizer: users[0]._id,
        attendees: [],
        maxAttendees: 20
      },
      {
        title: "Customer Success Summit",
        description: "Annual customer success summit with key clients and partners.",
        date: new Date("2025-07-21"),
        time: "10:00",
        duration: 360,
        location: "Grand Hotel",
        category: "Summit",
        status: "upcoming",
        organizer: users[1] ? users[1]._id : users[0]._id,
        attendees: [],
        maxAttendees: 100
      },
      {
        title: "Code Review Session",
        description: "Weekly code review session for the development team.",
        date: new Date("2025-07-22"),
        time: "16:00",
        duration: 90,
        location: "Development Lab",
        category: "Technical",
        status: "upcoming",
        organizer: users[0]._id,
        attendees: [],
        maxAttendees: 15
      },
      {
        title: "HR Policy Review",
        description: "Review and update company HR policies and procedures.",
        date: new Date("2025-07-23"),
        time: "13:00",
        duration: 150,
        location: "HR Office",
        category: "HR",
        status: "upcoming",
        organizer: users[1] ? users[1]._id : users[0]._id,
        attendees: [],
        maxAttendees: 10
      },
      {
        title: "Financial Planning Workshop",
        description: "Annual financial planning and budgeting workshop.",
        date: new Date("2025-07-24"),
        time: "09:00",
        duration: 240,
        location: "Finance Department",
        category: "Finance",
        status: "upcoming",
        organizer: users[0]._id,
        attendees: [],
        maxAttendees: 12
      },
      {
        title: "Innovation Lab",
        description: "Creative innovation session to generate new product ideas.",
        date: new Date("2025-07-25"),
        time: "14:00",
        duration: 180,
        location: "Innovation Center",
        category: "Innovation",
        status: "upcoming",
        organizer: users[1] ? users[1]._id : users[0]._id,
        attendees: [],
        maxAttendees: 20
      },
      {
        title: "Team Building Activity",
        description: "Fun team building activities to strengthen team bonds.",
        date: new Date("2025-07-28"),
        time: "15:00",
        duration: 120,
        location: "Recreation Center",
        category: "Team Building",
        status: "upcoming",
        organizer: users[0]._id,
        attendees: [],
        maxAttendees: 40
      },
      {
        title: "Quarterly Review",
        description: "End of quarter performance review and planning session.",
        date: new Date("2025-07-29"),
        time: "10:00",
        duration: 300,
        location: "Conference Center",
        category: "Review",
        status: "upcoming",
        organizer: users[1] ? users[1]._id : users[0]._id,
        attendees: [],
        maxAttendees: 25
      },
      {
        title: "Project Closure Meeting",
        description: "Final project closure meeting and lessons learned session.",
        date: new Date("2025-07-30"),
        time: "16:00",
        duration: 90,
        location: "Project Room",
        category: "Project",
        status: "upcoming",
        organizer: users[0]._id,
        attendees: [],
        maxAttendees: 15
      }
    ];

    // Add events one by one
    for (const eventData of julyEvents) {
      const event = new Event(eventData);
      await event.save();
      console.log(`Created event: ${event.title} on ${event.date.toISOString().split('T')[0]} at ${event.time}`);
    }

    console.log(`Successfully created ${julyEvents.length} events for July 2025!`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

createJulyEvents(); 