import { NextRequest, NextResponse } from 'next/server';
import { getTeamMembers } from '@/lib/services/teamService';

// TODO: Use extractUserId when auth is implemented
// import { extractUserId } from '@/lib/auth';

/**
 * GET /api/teams/members
 * Fetch team members for a workspace
 *
 * Query params:
 * - workspaceId: workspace ID (default: 'default')
 *
 * Returns:
 * {
 *   success: boolean,
 *   data: TeamMember[]
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

    // TODO: Verify user belongs to workspace
    // const membership = await TeamMember.findOne({ userId, workspaceId });
    // if (!membership) {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }

    // Fetch team members
    const members = await getTeamMembers(workspaceId);

    return NextResponse.json(
      {
        success: true,
        data: members,
        meta: {
          total: members.length,
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
