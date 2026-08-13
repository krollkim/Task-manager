import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getAuthenticatedUser, respondUnauthorized } from '@/lib/auth';
import User from '@/models/mongoDB/User';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const user = await getAuthenticatedUser(request);
    if (!user) {
      return respondUnauthorized();
    }

    const userData = await User.findById(user.id).select('-password');
    if (!userData) {
      return respondUnauthorized();
    }

    return NextResponse.json(
      { user: { id: userData._id, name: userData.name, email: userData.email } },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
