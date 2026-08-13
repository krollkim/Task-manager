import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getAuthenticatedUser, respondUnauthorized } from '@/lib/auth';
import Invite from '@/models/mongoDB/Invite';
import TeamMember from '@/models/mongoDB/TeamMember';
import { v4 as uuidv4 } from 'uuid';

// GET /api/teams/invite/[token]
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    await connectDB();

    const invite = await Invite.findOne({
      token: params.token,
      status: 'pending',
    });

    if (!invite || invite.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Invite link is invalid or has expired' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { email: invite.email, workspaceId: invite.workspaceId },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/teams/invite/[token]/accept
export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    await connectDB();

    const user = await getAuthenticatedUser(request);
    if (!user) return respondUnauthorized();

    const invite = await Invite.findOne({
      token: params.token,
      status: 'pending',
    });

    if (!invite || invite.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Invite link is invalid or has expired' },
        { status: 404 }
      );
    }

    invite.status = 'accepted';
    await invite.save();

    const existing = await TeamMember.findOne({
      userId: user.id,
      workspaceId: invite.workspaceId,
    });

    if (!existing) {
      await TeamMember.create({
        _id: uuidv4(),
        userId: user.id,
        workspaceId: invite.workspaceId,
        role: 'member',
      });
    }

    return NextResponse.json(
      { success: true, workspaceId: invite.workspaceId },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
