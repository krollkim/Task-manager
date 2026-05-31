import mongoose from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { Meeting } from '@/types/types'
import { expandInRange, toDateStr, extractRrulePart, buildRrule } from '@/lib/rruleExpander'

/**
 * Get or create the Meeting model
 * Ensures Mongoose doesn't throw "Cannot overwrite model once compiled" error
 */
function getMeetingModel() {
  if (mongoose.models.Meeting) {
    return mongoose.models.Meeting
  }

  const meetingSchema = new mongoose.Schema({
    _id: {
      type: String,
      required: true,
      default: uuidv4,
    },
    title: {
      type: String,
      required: [true, 'Meeting title is required'],
    },
    description: {
      type: String,
      default: '',
    },
    date: {
      type: Date,
      required: [true, 'Meeting date is required'],
    },
    startTime: {
      type: String,
      required: false,
    },
    endTime: {
      type: String,
      required: false,
    },
    userId: {
      type: String,
      required: true,
    },
    teamId: {
      type: String,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    linkedTaskIds: { type: [String], default: [] },
    linkedNoteIds: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    rrule: { type: String, default: null },
    recurringId: { type: String, default: null },
    isRecurringBase: { type: Boolean, default: false },
    exceptedDates: { type: [String], default: [] },
  })

  meetingSchema.index({ title: 'text', description: 'text' })

  return mongoose.model('Meeting', meetingSchema)
}

/**
 * Get all meetings for a user, optionally filtered by teamId
 */
export async function getAllMeetings(
  userId: string,
  teamId?: string | null
): Promise<Meeting[]> {
  const Meeting = getMeetingModel()

  const query: any = {
    userId,
    isRecurringBase: { $ne: true }, // Exclude base recurring meetings from results
  }

  if (teamId) {
    query.teamId = teamId
  }

  const meetings = await Meeting.find(query).sort({ date: 1 })
  return meetings.map(doc => ({
    ...doc.toObject(),
    date: doc.date.toISOString(),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt || doc.createdAt,
  }))
}

/**
 * Get a single meeting by ID with authorization
 */
export async function getMeetingById(
  id: string,
  userId: string
): Promise<Meeting | null> {
  const Meeting = getMeetingModel()

  const meeting = await Meeting.findOne({ _id: id, userId })
  if (!meeting) {
    return null
  }

  return {
    ...meeting.toObject(),
    date: meeting.date.toISOString(),
    createdAt: meeting.createdAt,
    updatedAt: meeting.updatedAt || meeting.createdAt,
  }
}

/**
 * Create a new meeting
 */
export async function createMeeting(
  userId: string,
  data: Partial<Meeting>
): Promise<Meeting> {
  const Meeting = getMeetingModel()

  if (!data.title || typeof data.title !== 'string' || data.title.trim() === '') {
    throw new Error('Meeting title is required and must be a non-empty string.')
  }

  if (!data.date) {
    throw new Error('Meeting date is required.')
  }

  const meetingData = {
    _id: uuidv4(),
    title: data.title.trim(),
    description: data.description || '',
    date: new Date(data.date),
    userId,
    teamId: data.teamId || null,
    startTime: data.startTime,
    endTime: data.endTime,
    rrule: data.rrule,
    isRecurringBase: !!data.rrule,
    createdAt: new Date(),
  }

  const newMeeting = await Meeting.create(meetingData)

  return {
    ...newMeeting.toObject(),
    date: newMeeting.date.toISOString(),
    createdAt: newMeeting.createdAt,
    updatedAt: newMeeting.updatedAt || newMeeting.createdAt,
  }
}

/**
 * Update a meeting (non-recurring edit)
 */
export async function updateMeeting(
  id: string,
  userId: string,
  data: Partial<Meeting>
): Promise<Meeting> {
  const Meeting = getMeetingModel()

  // Verify ownership
  const meeting = await Meeting.findOne({ _id: id, userId })
  if (!meeting) {
    throw new Error('Meeting not found')
  }

  // Update allowed fields
  if (data.title !== undefined) {
    if (typeof data.title !== 'string' || data.title.trim() === '') {
      throw new Error('Meeting title must be a non-empty string.')
    }
    meeting.title = data.title.trim()
  }

  if (data.description !== undefined) {
    meeting.description = data.description
  }

  if (data.date !== undefined) {
    meeting.date = new Date(data.date)
  }

  if (data.startTime !== undefined) {
    meeting.startTime = data.startTime
  }

  if (data.endTime !== undefined) {
    meeting.endTime = data.endTime
  }

  if (data.teamId !== undefined) {
    meeting.teamId = data.teamId || null
  }

  if (data.linkedTaskIds !== undefined) {
    meeting.linkedTaskIds = data.linkedTaskIds
  }

  if (data.linkedNoteIds !== undefined) {
    meeting.linkedNoteIds = data.linkedNoteIds
  }

  if (data.tags !== undefined) {
    meeting.tags = data.tags
  }

  await meeting.save()

  return {
    ...meeting.toObject(),
    date: meeting.date.toISOString(),
    createdAt: meeting.createdAt,
    updatedAt: meeting.updatedAt || meeting.createdAt,
  }
}

/**
 * Delete a meeting
 */
export async function deleteMeeting(id: string, userId: string): Promise<boolean> {
  const Meeting = getMeetingModel()

  const result = await Meeting.findOneAndDelete({ _id: id, userId })
  return !!result
}

/**
 * Update a recurring meeting with scope handling
 * scope: 'this' | 'following' | 'all'
 * action: 'edit' | 'delete'
 */
export async function updateRecurringMeeting(
  baseId: string,
  userId: string,
  scope: 'this' | 'following' | 'all',
  action: 'edit' | 'delete',
  data: any
): Promise<{ base?: Meeting; exception?: Meeting; truncated?: Meeting; newBase?: Meeting }> {
  const Meeting = getMeetingModel()

  // Get the base meeting
  const base = await Meeting.findOne({ _id: baseId, userId })
  if (!base) {
    throw new Error('Meeting not found')
  }

  const occurrenceDate = new Date(data.date + 'T00:00:00.000Z')
  const dateStr = toDateStr(occurrenceDate)

  // ── scope: 'this' ─────────────────────────────────────────────────────
  if (scope === 'this') {
    // Always add this date to exceptedDates on the base
    if (!base.exceptedDates.includes(dateStr)) {
      base.exceptedDates.push(dateStr)
      await base.save()
    }

    if (action === 'edit') {
      const exception = await Meeting.create({
        _id: uuidv4(),
        userId,
        title: (data?.title || base.title).trim(),
        description: data?.description ?? base.description,
        date: occurrenceDate,
        startTime: data?.startTime ?? base.startTime,
        endTime: data?.endTime ?? base.endTime,
        recurringId: base._id,
        isRecurringBase: false,
        createdAt: new Date(),
      })

      return {
        base: {
          ...base.toObject(),
          date: base.date.toISOString(),
          createdAt: base.createdAt,
        },
        exception: {
          ...exception.toObject(),
          date: exception.date.toISOString(),
          createdAt: exception.createdAt,
        },
      }
    }

    // action === 'delete': exceptedDates already updated above
    return {
      base: {
        ...base.toObject(),
        date: base.date.toISOString(),
        createdAt: base.createdAt,
      },
    }
  }

  // ── scope: 'following' ────────────────────────────────────────────────
  if (scope === 'following') {
    // Truncate base: add UNTIL = day before occurrenceDate
    const dayBefore = new Date(occurrenceDate.getTime() - 24 * 60 * 60 * 1000)
    const untilStr = dayBefore.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
    const rrulePart = base.rrule || ''
    const stripped = rrulePart.replace(/;?UNTIL=[^;\n\r]+/g, '')

    if (stripped.includes('RRULE:')) {
      base.rrule = stripped.replace(/^(RRULE:[^\n]*)/, `$1;UNTIL=${untilStr}`)
    } else if (stripped) {
      base.rrule = stripped + `;UNTIL=${untilStr}`
    }

    await base.save()

    if (action === 'edit') {
      const baseFreq = extractRrulePart(base.rrule)
      const newFreq = data?.rruleFreq || baseFreq
      const newRrule = buildRrule(newFreq, occurrenceDate)

      const newBase = await Meeting.create({
        _id: uuidv4(),
        userId,
        title: (data?.title || base.title).trim(),
        description: data?.description ?? base.description,
        date: occurrenceDate,
        startTime: data?.startTime ?? base.startTime,
        endTime: data?.endTime ?? base.endTime,
        rrule: newRrule,
        isRecurringBase: true,
        recurringId: base._id,
        createdAt: new Date(),
      })

      return {
        truncated: {
          ...base.toObject(),
          date: base.date.toISOString(),
          createdAt: base.createdAt,
        },
        newBase: {
          ...newBase.toObject(),
          date: newBase.date.toISOString(),
          createdAt: newBase.createdAt,
        },
      }
    }

    // action === 'delete': truncation alone is the delete
    return {
      truncated: {
        ...base.toObject(),
        date: base.date.toISOString(),
        createdAt: base.createdAt,
      },
    }
  }

  // ── scope: 'all' ─────────────────────────────────────────────────────
  if (scope === 'all') {
    if (action === 'edit') {
      // Update the base meeting
      const updated = await updateMeeting(baseId, userId, data)
      return { base: updated }
    }

    // action === 'delete': delete base + all exceptions
    const exceptions = await Meeting.deleteMany({ recurringId: baseId })
    await Meeting.deleteOne({ _id: baseId })
    return { base: { ...base.toObject(), date: base.date.toISOString() } }
  }

  throw new Error('Invalid scope. Must be "this", "following", or "all".')
}
