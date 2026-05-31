import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/search
 * Global search across tasks, notes, meetings, and messages
 *
 * Query params:
 * - q: search query (min 2 chars)
 * - types: comma-separated list of types to search (task,note,meeting,message)
 * - limit: max results per type (default 10)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q')?.trim();
    const typesParam = searchParams.get('types');
    const limitParam = searchParams.get('limit');

    // Validate query length
    if (!query || query.length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: 'Search query must be at least 2 characters',
        },
        { status: 400 }
      );
    }

    const limit = limitParam ? parseInt(limitParam, 10) : 10;
    const types = typesParam
      ? typesParam.split(',').map((t) => t.trim())
      : ['task', 'note', 'meeting', 'message'];

    // TODO: Implement MongoDB text search
    // const results = {
    //   tasks: await Task.find({ $text: { $search: query } }).limit(limit),
    //   notes: await Note.find({ $text: { $search: query } }).limit(limit),
    //   meetings: await Meeting.find({ $text: { $search: query } }).limit(limit),
    //   messages: await Message.find({ $text: { $search: query } }).limit(limit),
    // };

    const results = {
      tasks: types.includes('task') ? [] : undefined,
      notes: types.includes('note') ? [] : undefined,
      meetings: types.includes('meeting') ? [] : undefined,
      messages: types.includes('message') ? [] : undefined,
    };

    return NextResponse.json(
      {
        success: true,
        data: results,
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Search failed';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
