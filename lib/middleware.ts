import { NextRequest, NextResponse } from 'next/server';
import { extractUserId } from './auth';

/**
 * Auth middleware stub for Next.js API routes
 * TODO: Implement proper auth middleware with NextAuth.js
 */
export async function withAuth(
  request: NextRequest,
  handler: (request: NextRequest, userId: string) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    // Extract user ID from headers or session
    const userId = extractUserId(request.headers);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    // Call handler with authenticated user
    return handler(request, userId);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Auth error';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 401 }
    );
  }
}

/**
 * Error response helper
 */
export function errorResponse(message: string, status: number = 500) {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status }
  );
}

/**
 * Success response helper
 */
export function successResponse<T>(data: T, status: number = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
}
