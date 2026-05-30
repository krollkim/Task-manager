import express from 'express';
import auth from '../middlewares/auth.js';
import Task from '../models/mongoDB/Task.js';
import Note from '../models/mongoDB/Note.js';
import Meeting from '../models/mongoDB/Meeting.js';
import { expandInRange, toDateStr } from '../utils/rruleExpander.js';

const router = express.Router();

// GET /agenda?date=YYYY-MM-DD
router.get('/', auth, async (req, res) => {
    try {
        const { date } = req.query;
        if (!date) return res.status(400).json({ error: 'date query parameter is required (YYYY-MM-DD).' });

        const parsed = new Date(date + 'T00:00:00.000Z');
        if (isNaN(parsed.getTime())) return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD.' });

        const startOfDay = new Date(date + 'T00:00:00.000Z');
        const endOfDay   = new Date(date + 'T23:59:59.999Z');
        const userId     = req.user.id;
        const dayRange   = { $gte: startOfDay, $lte: endOfDay };

        const [tasks, notes, regularMeetings, recurringBases] = await Promise.all([
            Task.find({ userId, dueDate: dayRange }),
            Note.find({ userId, date: dayRange }),
            // Exclude recurring bases — they appear only via expansion
            Meeting.find({ userId, date: dayRange, isRecurringBase: { $ne: true } }),
            Meeting.find({ userId, isRecurringBase: true }),
        ]);

        const virtualMeetings = recurringBases.flatMap(m => expandInRange(m, startOfDay, endOfDay));
        const meetings = [...regularMeetings, ...virtualMeetings];

        return res.status(200).json({ tasks, notes, meetings });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// GET /agenda/month?year=YYYY&month=M  (month is 1-based)
router.get('/month', auth, async (req, res) => {
    try {
        const year  = parseInt(req.query.year,  10);
        const month = parseInt(req.query.month, 10);

        if (!req.query.year || !req.query.month || isNaN(year) || isNaN(month) || month < 1 || month > 12) {
            return res.status(400).json({ error: 'year and month are required (month is 1-based, 1–12).' });
        }

        const startOfMonth = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
        const endOfMonth   = new Date(Date.UTC(year, month,     0, 23, 59, 59, 999));
        const userId       = req.user.id;
        const monthRange   = { $gte: startOfMonth, $lte: endOfMonth };

        const [tasks, notes, regularMeetings, recurringBases] = await Promise.all([
            Task.find({ userId, dueDate: monthRange }),
            Note.find({ userId, date: monthRange }),
            Meeting.find({ userId, date: monthRange, isRecurringBase: { $ne: true } }),
            Meeting.find({ userId, isRecurringBase: true }),
        ]);

        // Expand recurring meetings across the whole month in one pass
        const virtualMeetings = recurringBases.flatMap(m => expandInRange(m, startOfMonth, endOfMonth));
        const allMeetings = [...regularMeetings, ...virtualMeetings];

        // Build day map keyed by YYYY-MM-DD
        const dayMap = new Map();

        const ensureDay = (key) => {
            if (!dayMap.has(key)) {
                const [y, m, d] = key.split('-').map(Number);
                const dateObj = new Date(Date.UTC(y, m - 1, d));
                const label   = dateObj.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
                dayMap.set(key, { date: dateObj, label, agenda: { tasks: [], notes: [], meetings: [] } });
            }
            return dayMap.get(key);
        };

        for (const task    of tasks)       { if (task.dueDate) ensureDay(toDateStr(new Date(task.dueDate))).agenda.tasks.push(task); }
        for (const note    of notes)       { if (note.date)    ensureDay(toDateStr(new Date(note.date))).agenda.notes.push(note); }
        for (const meeting of allMeetings) { if (meeting.date) ensureDay(toDateStr(new Date(meeting.date))).agenda.meetings.push(meeting); }

        const result = Array.from(dayMap.values()).sort((a, b) => a.date - b.date);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

export default router;
