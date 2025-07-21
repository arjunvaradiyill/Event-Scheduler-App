import mongoose from 'mongoose';

export interface IEvent extends mongoose.Document {
  title: string;
  description: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  createdBy: mongoose.Types.ObjectId;
  attendees: mongoose.Types.ObjectId[];
  maxAttendees?: number;
  category: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  image?: string;
  price?: number;
  contactEmail?: string;
  contactPhone?: string;
  requirements?: string;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new mongoose.Schema<IEvent>({
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

// Index for better query performance
eventSchema.index({ date: 1, status: 1 });
eventSchema.index({ createdBy: 1 });
eventSchema.index({ category: 1 });

// Force recompilation by deleting existing model if it exists
if (mongoose.models.Event) {
  delete mongoose.models.Event;
}

export default mongoose.model<IEvent>('Event', eventSchema); 