import { NextRequest, NextResponse } from 'next/server';
import { createInvite } from '@/lib/services/teamService';

// TODO: Use extractUserId when auth is implemented
// import { extractUserId } from '@/lib/auth';

/**
 * POST /api/teams/invite
 * Create an invite link for a workspace
 *
 * Body: { email, workspaceId? }
 * Returns: { success, data: { inviteUrl, email, token } }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, workspaceId } = body;

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Email is required',
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email format',
        },
        { status: 400 }
      );
    }

    // TODO: Extract user from auth session
    // const userId = extractUserId(request.headers);
    // if (!userId) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Placeholder userId; replace with actual auth
    const userId = 'placeholder-user-id';

    // Create invite
    const { token, inviteUrl } = await createInvite(
      userId,
      email,
      workspaceId || 'default'
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          inviteUrl,
          email,
          token,
          expiresIn: '7 days',
        },
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
