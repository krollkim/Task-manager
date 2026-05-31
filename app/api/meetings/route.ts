import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { getAllMeetings, createMeeting } from '@/lib/services/meetingService'
import { extractUserId } from '@/lib/auth'

/**
 * GET /api/meetings
 * Fetch all meetings for the authenticated user, optionally filtered by teamId
 * Query params: ?teamId=<optional>
 */
export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const userId = extractUserId(request.headers)
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Extract optional teamId from query params
    const { searchParams } = new URL(request.url)
    const teamId = searchParams.get('teamId')

    const meetings = await getAllMeetings(userId, teamId)

    return NextResponse.json(
      {
        success: true,
        data: meetings,
      },
      { status: 200 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[GET /api/meetings]', message)
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/meetings
 * Create a new meeting
 * Body: { title, description?, date, startTime?, endTime?, rrule?, teamId? }
 */
export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const userId = extractUserId(request.headers)
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate required fields
    if (!body.title || typeof body.title !== 'string' || body.title.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Meeting title is required and must be a non-empty string.' },
        { status: 400 }
      )
    }

    if (!body.date) {
      return NextResponse.json(
        { success: false, error: 'Meeting date is required.' },
        { status: 400 }
      )
    }

    const newMeeting = await createMeeting(userId, body)

    return NextResponse.json(
      {
        success: true,
        data: newMeeting,
      },
      { status: 201 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[POST /api/meetings]', message)
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    )
  }
}
