import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { updateRecurringMeeting } from '@/lib/services/meetingService'
import { extractUserId } from '@/lib/auth'

/**
 * PATCH /api/meetings/[id]/recurring
 * Handle scope-aware edit/delete for recurring meeting series
 *
 * Body: {
 *   scope: 'this' | 'following' | 'all',
 *   action: 'edit' | 'delete',
 *   date: 'YYYY-MM-DD' (the occurrence date),
 *   data?: { title, description, startTime, endTime, rruleFreq, ... }
 * }
 *
 * Response:
 * - scope 'this' + action 'edit': { base, exception }
 * - scope 'this' + action 'delete': { base }
 * - scope 'following' + action 'edit': { truncated, newBase }
 * - scope 'following' + action 'delete': { truncated }
 * - scope 'all' + action 'edit': { base }
 * - scope 'all' + action 'delete': { base }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect()

    const { id: baseId } = params
    const body = await request.json()

    if (!baseId) {
      return NextResponse.json(
        { success: false, error: 'Base meeting ID is required' },
        { status: 400 }
      )
    }

    const userId = extractUserId(request.headers)
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Validate required fields
    const { scope, action, date, data } = body

    if (!scope || !action || !date) {
      return NextResponse.json(
        { success: false, error: 'scope, action, and date are required' },
        { status: 400 }
      )
    }

    if (!['this', 'following', 'all'].includes(scope)) {
      return NextResponse.json(
        { success: false, error: 'scope must be "this", "following", or "all"' },
        { status: 400 }
      )
    }

    if (!['edit', 'delete'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'action must be "edit" or "delete"' },
        { status: 400 }
      )
    }

    const result = await updateRecurringMeeting(
      baseId,
      userId,
      scope as 'this' | 'following' | 'all',
      action as 'edit' | 'delete',
      { date, ...data }
    )

    // Determine status code based on action
    const statusCode = action === 'edit' ? 201 : 200

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: statusCode }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[PATCH /api/meetings/[id]/recurring]', message)

    // Return 404 for not found errors
    if (message.includes('not found')) {
      return NextResponse.json(
        { success: false, error: message },
        { status: 404 }
      )
    }

    // Return 400 for validation errors
    if (message.includes('scope') || message.includes('Invalid')) {
      return NextResponse.json(
        { success: false, error: message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    )
  }
}
