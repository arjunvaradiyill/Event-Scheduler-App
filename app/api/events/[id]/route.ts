import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserFromRequest } from '@/app/lib/auth';
import { EventService } from '@/app/lib/services/eventService';

const updateEventSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  date: z.string().min(1, 'Date is required').optional(),
  startTime: z.string().min(1, 'Start time is required').optional(),
  endTime: z.string().min(1, 'End time is required').optional(),
  location: z.string().min(1, 'Location is required').optional(),
  category: z.string().min(1, 'Category is required').optional(),
  maxAttendees: z.number().optional(),
  price: z.number().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  requirements: z.string().optional(),
  image: z.string().optional(),
  status: z.enum(['upcoming', 'ongoing', 'completed', 'cancelled']).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const event = await EventService.getEventById(params.id);

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ event });
  } catch (error) {
    console.error('Get event error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = updateEventSchema.parse(body);

    const updatedEvent = await EventService.updateEvent(params.id, validatedData, user.userId, user.role);

    return NextResponse.json({
      message: 'Event updated successfully',
      event: updatedEvent,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes('Event time conflict')) {
      return NextResponse.json(
        { 
          error: 'Event time conflict',
          details: error.message
        },
        { status: 409 }
      );
    }

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    if (error instanceof Error && error.message.includes('Event not found')) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    console.error('Update event error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await EventService.deleteEvent(params.id, user.userId, user.role);

    return NextResponse.json({
      message: 'Event deleted successfully',
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    if (error instanceof Error && error.message.includes('Event not found')) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    console.error('Delete event error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 