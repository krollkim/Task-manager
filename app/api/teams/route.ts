import { NextRequest, NextResponse } from 'next/server';
import { getTeamMembers, getPendingInvites } from '@/lib/services/teamService';

/**
 * GET /api/teams
 * Fetch team info and members for the authenticated user
 *
 * Query params:
 * - workspaceId: workspace ID (default: 'default')
 *
 * Returns:
 * {
 *   success: boolean,
 *   data: {
 *     members: TeamMember[],
 *     pendingInvites: Invite[]
 *   }
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const workspaceId = searchParams.get('workspaceId') || 'default';

    // TODO: Extract user from auth session
    // const userId = extractUserId(request.headers);
    // if (!userId) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Fetch team members and pending invites
    const [members, pendingInvites] = await Promise.all([
      getTeamMembers(workspaceId),
      getPendingInvites(workspaceId),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: {
          members,
          pendingInvites,
          workspaceId,
        },
      },
      { status: 200 }
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
