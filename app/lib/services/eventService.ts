import dbConnect from '../db';
import EventModel from '../../models/Event';
import { IEvent } from '../../models/Event';

export interface EventFilters {
  category?: string;
  status?: string;
  date?: string;
  page?: number;
  limit?: number;
}

export interface EventCreateData {
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  category: string;
  maxAttendees?: number;
  price?: number;
  contactEmail?: string;
  contactPhone?: string;
  requirements?: string;
  image?: string;
}

export interface EventUpdateData extends Partial<EventCreateData> {
  status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

export class EventService {
  static async getEvents(filters: EventFilters = {}) {
    await dbConnect();

    const { category, status, date, page = 1, limit = 10 } = filters;
    const filter: any = {};
    
    if (category) filter.category = category;
    if (status) filter.status = status;
    
    // Filter by date if provided
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      
      filter.date = {
        $gte: startDate,
        $lt: endDate
      };
    }

    const events = await EventModel.find(filter)
      .populate('createdBy', 'name email')
      .sort({ date: 1, startTime: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await EventModel.countDocuments(filter);

    return {
      events,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  static async getEventById(id: string) {
    await dbConnect();

    const event = await EventModel.findById(id)
      .populate('createdBy', 'name email')
      .populate('attendees', 'name email');

    return event;
  }

  static async createEvent(data: EventCreateData, creatorId: string) {
    await dbConnect();

    // Check for overlapping events
    const eventDate = new Date(data.date);
    const eventStartTime = data.startTime;
    const eventEndTime = data.endTime;
    
    // Convert times to minutes for easier comparison
    const [startHours, startMinutes] = eventStartTime.split(':').map(Number);
    const [endHours, endMinutes] = eventEndTime.split(':').map(Number);
    const eventStartMinutes = startHours * 60 + startMinutes;
    const eventEndMinutes = endHours * 60 + endMinutes;
    
    // Find overlapping events on the same date
    const overlappingEvents = await EventModel.find({
      date: {
        $gte: new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate()),
        $lt: new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate() + 1)
      },
      createdBy: creatorId
    });

    // Check for time conflicts
    for (const existingEvent of overlappingEvents) {
      const [existingStartHours, existingStartMinutes] = existingEvent.startTime.split(':').map(Number);
      const [existingEndHours, existingEndMinutes] = existingEvent.endTime.split(':').map(Number);
      const existingStartMinutesTotal = existingStartHours * 60 + existingStartMinutes;
      const existingEndMinutesTotal = existingEndHours * 60 + existingEndMinutes;
      
      // Check if events overlap
      if (
        (eventStartMinutes < existingEndMinutesTotal && eventEndMinutes > existingStartMinutesTotal) ||
        (existingStartMinutesTotal < eventEndMinutes && existingEndMinutesTotal > eventStartMinutes)
      ) {
        throw new Error(`Event time conflict: You already have an event scheduled from ${existingEvent.startTime} to ${existingEvent.endTime} on ${new Date(existingEvent.date).toLocaleDateString()}. Please choose a different time.`);
      }
    }

    const event = new EventModel({
      ...data,
      createdBy: creatorId,
      date: eventDate,
    });

    await event.save();

    const populatedEvent = await EventModel.findById(event._id)
      .populate('createdBy', 'name email');

    return populatedEvent;
  }

  static async updateEvent(id: string, data: EventUpdateData, userId: string, userRole: string) {
    await dbConnect();

    const event = await EventModel.findById(id);
    if (!event) {
      throw new Error('Event not found');
    }

    // Check if user is creator or admin
    if (event.createdBy.toString() !== userId && userRole !== 'admin') {
      throw new Error('Forbidden: Only the creator or admin can update this event');
    }

    // Check for overlapping events if date or time is being updated
    if (data.date || data.startTime || data.endTime) {
      const eventDate = data.date ? new Date(data.date) : new Date(event.date);
      const eventStartTime = data.startTime || event.startTime;
      const eventEndTime = data.endTime || event.endTime;
      
      const [startHours, startMinutes] = eventStartTime.split(':').map(Number);
      const [endHours, endMinutes] = eventEndTime.split(':').map(Number);
      const eventStartMinutes = startHours * 60 + startMinutes;
      const eventEndMinutes = endHours * 60 + endMinutes;
      
      // Find overlapping events on the same date (excluding current event)
      const overlappingEvents = await EventModel.find({
        _id: { $ne: id },
        date: {
          $gte: new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate()),
          $lt: new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate() + 1)
        },
        createdBy: event.createdBy
      });

      // Check for time conflicts
      for (const existingEvent of overlappingEvents) {
        const [existingStartHours, existingStartMinutes] = existingEvent.startTime.split(':').map(Number);
        const [existingEndHours, existingEndMinutes] = existingEvent.endTime.split(':').map(Number);
        const existingStartMinutesTotal = existingStartHours * 60 + existingStartMinutes;
        const existingEndMinutesTotal = existingEndHours * 60 + existingEndMinutes;
        
        if (
          (eventStartMinutes < existingEndMinutesTotal && eventEndMinutes > existingStartMinutesTotal) ||
          (existingStartMinutesTotal < eventEndMinutes && existingEndMinutesTotal > eventStartMinutes)
        ) {
          throw new Error(`Event time conflict: You already have an event scheduled from ${existingEvent.startTime} to ${existingEvent.endTime} on ${new Date(existingEvent.date).toLocaleDateString()}. Please choose a different time.`);
        }
      }
    }

    // Convert date string to Date object if provided
    if (data.date) {
      data.date = new Date(data.date);
    }

    const updatedEvent = await EventModel.findByIdAndUpdate(
      id,
      data,
      { new: true }
    ).populate('createdBy', 'name email');

    return updatedEvent;
  }

  static async deleteEvent(id: string, userId: string, userRole: string) {
    await dbConnect();

    const event = await EventModel.findById(id);
    if (!event) {
      throw new Error('Event not found');
    }

    // Check if user is creator or admin
    if (event.createdBy.toString() !== userId && userRole !== 'admin') {
      throw new Error('Forbidden: Only the creator or admin can delete this event');
    }

    await EventModel.findByIdAndDelete(id);
  }

  static async getEventsByDay() {
    await dbConnect();

    const events = await EventModel.find()
      .populate('createdBy', 'name email')
      .sort({ date: 1, startTime: 1 });

    // Group events by date
    const groupedEvents: { [date: string]: IEvent[] } = {};
    
    events.forEach(event => {
      const dateKey = new Date(event.date).toLocaleDateString();
      if (!groupedEvents[dateKey]) {
        groupedEvents[dateKey] = [];
      }
      groupedEvents[dateKey].push(event);
    });

    // Sort events within each date by start time
    Object.keys(groupedEvents).forEach(dateKey => {
      groupedEvents[dateKey].sort((a, b) => {
        const timeA = a.startTime.split(':').map(Number);
        const timeB = b.startTime.split(':').map(Number);
        const minutesA = timeA[0] * 60 + timeA[1];
        const minutesB = timeB[0] * 60 + timeB[1];
        return minutesA - minutesB;
      });
    });

    return groupedEvents;
  }
} 