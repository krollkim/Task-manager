import express from 'express';
import { getMeetings, createMeeting, getMeeting, deleteMeeting, editMeeting } from '../models/MeetingAccessDataService.js';
import { handleError } from '../utils/handleErrors.js';
import auth from '../middlewares/auth.js';
import Meeting from '../models/mongoDB/Meeting.js';
import { extractRrulePart, buildRrule } from '../utils/rruleExpander.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Get all meetings
router.get('/', auth, async (req, res) => {
    try {
        const meetings = await getMeetings(req.user.id);
        return res.status(200).json(meetings);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// Get meeting by id
router.get('/:id', auth, async (req, res) => {
    try {
        const id = req.params.id;
        const meeting = await getMeeting(id, req.user.id);
        return res.status(200).json(meeting);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// Create a new meeting
router.post('/', auth, async (req, res) => {
    try {
        const meeting = req.body;

        if (!meeting || typeof meeting.title !== 'string' || meeting.title.trim() === '') {
            return res.status(400).json({ error: 'Meeting title is required and must be a non-empty string.' });
        }

        if (!meeting.date) {
            return res.status(400).json({ error: 'Meeting date is required.' });
        }

        const meetingData = {
            title: meeting.title.trim(),
            description: meeting.description || '',
            date: meeting.date,
            userId: req.user.id
        };

        if (meeting.startTime) meetingData.startTime = meeting.startTime;
        if (meeting.endTime)   meetingData.endTime   = meeting.endTime;
        if (meeting.rrule)     { meetingData.rrule = meeting.rrule; meetingData.isRecurringBase = true; }

        const newMeeting = await createMeeting(meetingData);
        return res.send(newMeeting);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// Edit a meeting
router.patch('/:id', auth, async (req, res) => {
    try {
        const id = req.params.id;
        const updatedData = req.body;
        const editedMeeting = await editMeeting(id, updatedData, req.user.id);
        return res.status(200).json(editedMeeting);
    } catch (error) {
        return handleError(res, error.status || 500, error.message);
    }
});

// Delete a meeting
router.delete('/:id', auth, async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) {
            return handleError(res, 400, "Meeting ID is required");
        }

        const deletedMeeting = await deleteMeeting(id, req.user.id);
        return res.status(200).json({
            message: "Meeting deleted successfully",
            meeting: deletedMeeting,
        });
    } catch (error) {
        return handleError(res, error.status || 500, error.message);
    }
});

// PATCH /meetings/:id/recurring — scoped edit for recurring series
// :id = the BASE meeting _id (even when editing a virtual instance, send the base _id)
// Body: { scope: 'this'|'following', action: 'edit'|'delete', date: 'YYYY-MM-DD', data?: {...} }
router.patch('/:id/recurring', auth, async (req, res) => {
    try {
        const { scope, action, date, data } = req.body;
        if (!scope || !action || !date) {
            return handleError(res, 400, 'scope, action, and date are required');
        }

        const base = await Meeting.findOne({ _id: req.params.id, userId: req.user.id });
        if (!base) return handleError(res, 404, 'Meeting not found');

        const occurrenceDate = new Date(date + 'T00:00:00.000Z');

        // ── scope: 'this' ─────────────────────────────────────────────────────
        if (scope === 'this') {
            // Always add this date to exceptedDates on the base
            if (!base.exceptedDates.includes(date)) {
                base.exceptedDates.push(date);
                await base.save();
            }

            if (action === 'edit') {
                const exception = await Meeting.create({
                    _id:            uuidv4(),
                    userId:         req.user.id,
                    title:          (data?.title || base.title).trim(),
                    description:    data?.description ?? base.description,
                    date:           occurrenceDate,
                    startTime:      data?.startTime ?? base.startTime,
                    endTime:        data?.endTime   ?? base.endTime,
                    recurringId:    base._id,
                    isRecurringBase: false,
                });
                return res.status(201).json({ exception, base });
            }
            // action === 'delete': exceptedDates already updated above
            return res.status(200).json({ base });
        }

        // ── scope: 'following' ────────────────────────────────────────────────
        if (scope === 'following') {
            // Truncate base: add UNTIL = day before occurrenceDate
            const dayBefore  = new Date(occurrenceDate.getTime() - 24 * 60 * 60 * 1000);
            const untilStr   = dayBefore.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
            const rrulePart  = base.rrule || '';
            const stripped   = rrulePart.replace(/;?UNTIL=[^;\n\r]+/g, '');

            if (stripped.includes('RRULE:')) {
                base.rrule = stripped.replace(/^(RRULE:[^\n]*)/, `$1;UNTIL=${untilStr}`);
            } else if (stripped) {
                base.rrule = stripped + `;UNTIL=${untilStr}`;
            }
            await base.save();

            if (action === 'edit') {
                const baseFreq   = extractRrulePart(base.rrule);
                const newFreq    = data?.rruleFreq || baseFreq;
                const newRrule   = buildRrule(newFreq, occurrenceDate);

                const newBase = await Meeting.create({
                    _id:            uuidv4(),
                    userId:         req.user.id,
                    title:          (data?.title || base.title).trim(),
                    description:    data?.description ?? base.description,
                    date:           occurrenceDate,
                    startTime:      data?.startTime ?? base.startTime,
                    endTime:        data?.endTime   ?? base.endTime,
                    rrule:          newRrule,
                    isRecurringBase: true,
                    recurringId:    base._id,
                });
                return res.status(201).json({ truncated: base, newBase });
            }
            // action === 'delete': truncation alone is the delete
            return res.status(200).json({ truncated: base });
        }

        return handleError(res, 400, 'scope must be "this" or "following"');
    } catch (err) {
        return handleError(res, 500, err.message);
    }
});

export default router;
