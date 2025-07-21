import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserFromRequest } from '@/app/lib/auth';
import { EventService } from '@/app/lib/services/eventService';

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  location: z.string().min(1, 'Location is required'),
  category: z.string().min(1, 'Category is required'),
  maxAttendees: z.number().optional(),
  price: z.number().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  requirements: z.string().optional(),
  image: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const date = searchParams.get('date');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const filters = {
      category: category || undefined,
      status: status || undefined,
      date: date || undefined,
      page,
      limit,
    };

    const result = await EventService.getEvents(filters);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Get events error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('Received event data:', body);
    
    try {
      const validatedData = eventSchema.parse(body);
      console.log('Validated event data:', validatedData);

      const event = await EventService.createEvent(validatedData, user.userId);

      return NextResponse.json({
        message: 'Event created successfully',
        event,
      }, { status: 201 });
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        console.log('Zod validation error:', validationError.errors);
        return NextResponse.json(
          { error: 'Validation error', details: validationError.errors },
          { status: 400 }
        );
      }
      throw validationError;
    }
  } catch (error) {
    console.error('Create event error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Event time conflict')) {
        return NextResponse.json(
          { 
            error: 'Event time conflict',
            details: error.message
          },
          { status: 409 }
        );
      }
      
      if (error.message.includes('Event validation failed')) {
        return NextResponse.json(
          { 
            error: 'Event validation failed',
            details: error.message
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 