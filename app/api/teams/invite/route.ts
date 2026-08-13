import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getAuthenticatedUser, respondUnauthorized } from '@/lib/auth';
import Invite from '@/models/mongoDB/Invite';
import { v4 as uuidv4 } from 'uuid';

// POST /api/teams/invite
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const user = await getAuthenticatedUser(request);
    if (!user) return respondUnauthorized();

    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      );
    }

    const existing = await Invite.findOne({
      email: email.toLowerCase().trim(),
      status: 'pending',
    });

    if (existing && existing.expiresAt > new Date()) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3003';
      const inviteUrl = `${appUrl}/join/${existing.token}`;
      return NextResponse.json({ invite: existing, inviteUrl }, { status: 200 });
    }

    const token = uuidv4();
    const invite = await Invite.create({
      _id: uuidv4(),
      email: email.toLowerCase().trim(),
      token,
      invitedBy: user.id,
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3003';
    const inviteUrl = `${appUrl}/join/${invite.token}`;

    return NextResponse.json({ invite, inviteUrl }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
