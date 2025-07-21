const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://arjunvaradiyil203:tfo9H1kuuSQzZtq7@evento.bfhcdzc.mongodb.net/eventplanning';

async function addSampleEvents() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get the User model to find organizer IDs
    const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({}));
    const Event = mongoose.models.Event || mongoose.model('Event', new mongoose.Schema({}));

    // Find existing users to use as organizers
    const users = await User.find({});
    console.log(`Found ${users.length} users in database`);

    if (users.length === 0) {
      console.log('No users found. Please create users first.');
      return;
    }

    // Sample events data with proper Date objects and organizer ObjectIds
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
        organizer: users[0]._id, // Use first user as organizer
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
        organizer: users[1] ? users[1]._id : users[0]._id, // Use second user if available
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
      },
      {
        title: "Training Session",
        description: "New employee onboarding and system training.",
        date: new Date("2024-07-20"),
        time: "13:00",
        duration: 240,
        location: "Training Room",
        category: "Training",
        status: "upcoming",
        organizer: users[0]._id,
        attendees: [],
        maxAttendees: 25
      },
      {
        title: "Project Kickoff",
        description: "Launch of new project with team introductions and timeline discussion.",
        date: new Date("2024-07-22"),
        time: "09:30",
        duration: 120,
        location: "Project Room",
        category: "Project",
        status: "upcoming",
        organizer: users[1] ? users[1]._id : users[0]._id,
        attendees: [],
        maxAttendees: 18
      },
      {
        title: "Quarterly Review",
        description: "Review Q3 performance and set Q4 goals.",
        date: new Date("2024-07-23"),
        time: "15:00",
        duration: 180,
        location: "Conference Center",
        category: "Review",
        status: "upcoming",
        organizer: users[0]._id,
        attendees: [],
        maxAttendees: 30
      },
      {
        title: "Design Workshop",
        description: "Creative design workshop focusing on user experience improvements.",
        date: new Date("2024-07-24"),
        time: "10:00",
        duration: 300,
        location: "Design Studio",
        category: "Workshop",
        status: "upcoming",
        organizer: users[1] ? users[1]._id : users[0]._id,
        attendees: [],
        maxAttendees: 15
      },
      {
        title: "All Hands Meeting",
        description: "Company-wide meeting to discuss recent developments and future plans.",
        date: new Date("2024-07-25"),
        time: "14:00",
        duration: 90,
        location: "Main Hall",
        category: "Company",
        status: "upcoming",
        organizer: users[0]._id,
        attendees: [],
        maxAttendees: 100
      }
    ];

    // Add sample events
    const result = await Event.insertMany(sampleEvents);
    console.log(`Successfully added ${result.length} sample events:`);
    
    result.forEach(event => {
      console.log(`- ${event.title} on ${event.date.toISOString().split('T')[0]} at ${event.time}`);
    });

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

addSampleEvents(); 