import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import {
  getMeetingById,
  updateMeeting,
  deleteMeeting,
} from '@/lib/services/meetingService'
import { extractUserId } from '@/lib/auth'

/**
 * GET /api/meetings/[id]
 * Fetch a single meeting by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect()

    const { id } = params

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Meeting ID is required' },
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

    const meeting = await getMeetingById(id, userId)
    if (!meeting) {
      return NextResponse.json(
        { success: false, error: 'Meeting not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: meeting,
      },
      { status: 200 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[GET /api/meetings/[id]]', message)
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
 * PATCH /api/meetings/[id]
 * Update a meeting (non-recurring edit)
 * Body: { title?, description?, date?, startTime?, endTime?, ...otherFields }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect()

    const { id } = params
    const body = await request.json()

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Meeting ID is required' },
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

    const updatedMeeting = await updateMeeting(id, userId, body)

    return NextResponse.json(
      {
        success: true,
        data: updatedMeeting,
      },
      { status: 200 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[PATCH /api/meetings/[id]]', message)

    // Return 404 for not found errors
    if (message.includes('not found') || message.includes('not found')) {
      return NextResponse.json(
        { success: false, error: message },
        { status: 404 }
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

/**
 * DELETE /api/meetings/[id]
 * Delete a meeting
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect()

    const { id } = params

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Meeting ID is required' },
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

    const deleted = await deleteMeeting(id, userId)
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Meeting not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: { _id: id },
        message: 'Meeting deleted successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[DELETE /api/meetings/[id]]', message)
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    )
  }
}
