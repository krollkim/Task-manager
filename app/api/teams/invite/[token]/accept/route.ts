import { NextRequest, NextResponse } from 'next/server';
import { acceptInvite } from '@/lib/services/teamService';

// TODO: Use extractUserId when auth is implemented
// import { extractUserId } from '@/lib/auth';

/**
 * POST /api/teams/invite/[token]/accept
 * Accept a team invite and add user to team
 *
 * Params: { token }
 * Returns: { success, data: { workspaceId, role, message } }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid invite token',
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

    // Accept invite
    const result = await acceptInvite(token, userId);

    return NextResponse.json(
      {
        success: true,
        data: {
          message: 'Invite accepted successfully',
          workspaceId: result.workspaceId,
          role: result.role,
          userId,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    // Determine appropriate status code
    let status = 500;
    if (message.includes('not found')) {
      status = 404;
    } else if (message.includes('expired')) {
      status = 410;
    } else if (message.includes('pending')) {
      status = 400;
    }

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status }
    );
  }
}
