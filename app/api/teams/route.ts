import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/teams
 * Fetch all teams for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Extract user from auth session
    // const userId = extractUserId(request.headers);
    // if (!userId) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // TODO: Query MongoDB for teams
    // const teams = await Team.find({ members: userId });

    const teams = [];

    return NextResponse.json(
      {
        success: true,
        data: teams,
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
