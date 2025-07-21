import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/app/lib/db';
import User from '@/app/models/User';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const count = await User.countDocuments({});

    return NextResponse.json({
      count,
    });
  } catch (error) {
    console.error('Get users count error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 