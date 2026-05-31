import { NextRequest, NextResponse } from 'next/server';
import { searchAll } from '@/lib/services/searchService';
import { extractUserId } from '@/lib/auth';

/**
 * GET /api/search
 * Global search across tasks, notes, meetings, and messages
 *
 * Query params:
 * - q: search query (min 2 chars)
 * - types: comma-separated list of types to search (task,note,meeting,message)
 * - limit: max results per type (default 10)
 *
 * Returns:
 * {
 *   success: boolean,
 *   data: {
 *     tasks?: SearchResult[],
 *     notes?: SearchResult[],
 *     meetings?: SearchResult[],
 *     messages?: SearchResult[]
 *   }
 * }
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

    // TODO: Replace with actual auth session
    // For now, using placeholder userId; replace with extractUserId(request.headers)
    const userId = 'placeholder-user-id';

    const limit = limitParam ? Math.min(parseInt(limitParam, 10), 50) : 10;
    const types = typesParam
      ? typesParam.split(',').map((t) => t.trim().toLowerCase())
      : ['task', 'note', 'meeting', 'message'];

    // Validate types
    const validTypes = ['task', 'note', 'meeting', 'message'];
    const filteredTypes = types.filter((t) => validTypes.includes(t));

    if (filteredTypes.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid search types',
        },
        { status: 400 }
      );
    }

    // Perform search
    const results = await searchAll(userId, query, filteredTypes, limit);

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
