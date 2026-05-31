import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/teams/members
 * Fetch team members for a specific team
 *
 * Query params:
 * - teamId: the team to fetch members for
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const teamId = searchParams.get('teamId');

    if (!teamId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Team ID is required',
        },
        { status: 400 }
      );
    }

    // TODO: Extract user from auth session
    // const userId = extractUserId(request.headers);
    // if (!userId) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // TODO: Verify user belongs to team
    // const membership = await TeamMember.findOne({ userId, teamId });
    // if (!membership) {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }

    // TODO: Fetch team members
    // const members = await TeamMember.find({ teamId }).populate('userId');

    const members = [];

    return NextResponse.json(
      {
        success: true,
        data: members,
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
