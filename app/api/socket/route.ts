import { NextRequest, NextResponse } from 'next/server';

/**
 * WebSocket API Route Stub
 *
 * Socket.io requires a separate HTTP server (cannot run directly on Next.js API routes).
 *
 * In the migration:
 * - Next.js API routes handle REST calls (tasks, notes, meetings, search, etc.)
 * - Express server continues running on port 5001 for Socket.io
 * - In production (Vercel), consider using a separate WebSocket service
 *
 * TODO: Implement Socket.io with Next.js using:
 * - Option A: next-socket.io package
 * - Option B: Separate WebSocket service (AWS API Gateway, Heroku)
 * - Option C: Keep Express running separately for socket.io
 */

export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      error: 'WebSocket not available via HTTP. Use socket.io-client to connect.',
      info: 'Socket.io server running on separate port (5001 in development)',
    },
    { status: 400 }
  );
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      error: 'WebSocket not available via HTTP. Use socket.io-client to connect.',
      info: 'Socket.io server running on separate port (5001 in development)',
    },
    { status: 400 }
  );
}
