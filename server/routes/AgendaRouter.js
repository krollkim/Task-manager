import express from 'express';
import auth from '../middlewares/auth.js';
import Task from '../models/mongoDB/Task.js';
import Note from '../models/mongoDB/Note.js';
import Meeting from '../models/mongoDB/Meeting.js';

const router = express.Router();

// GET /agenda?date=YYYY-MM-DD
// Returns { tasks[], notes[], meetings[] } for the given day.
// All dates are treated as UTC to stay timezone-neutral.
router.get('/', auth, async (req, res) => {
    try {
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({ error: 'date query parameter is required (YYYY-MM-DD).' });
        }

        const parsed = new Date(date + 'T00:00:00.000Z');
        if (isNaN(parsed.getTime())) {
            return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD.' });
        }

        const startOfDay = new Date(date + 'T00:00:00.000Z');
        const endOfDay = new Date(date + 'T23:59:59.999Z');

        const userId = req.user.id;
        const dayRange = { $gte: startOfDay, $lte: endOfDay };

        const [tasks, notes, meetings] = await Promise.all([
            Task.find({ userId, dueDate: dayRange }),
            Note.find({ userId, date: dayRange }),
            Meeting.find({ userId, date: dayRange }),
        ]);

        return res.status(200).json({ tasks, notes, meetings });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// GET /agenda/month?year=YYYY&month=M
// Returns an array of { date, label, agenda: { tasks, notes, meetings } }
// for every calendar day in the given month that has at least one item.
router.get('/month', auth, async (req, res) => {
    try {
        const year  = parseInt(req.query.year,  10);
        const month = parseInt(req.query.month, 10); // 1-based

        if (!req.query.year || !req.query.month || isNaN(year) || isNaN(month) || month < 1 || month > 12) {
            return res.status(400).json({ error: 'year and month query parameters are required and must be valid (month is 1-based, 1–12).' });
        }

        const startOfMonth = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
        const endOfMonth   = new Date(Date.UTC(year, month,     0, 23, 59, 59, 999));

        const userId    = req.user.id;
        const monthRange = { $gte: startOfMonth, $lte: endOfMonth };

        const [tasks, notes, meetings] = await Promise.all([
            Task.find({ userId, dueDate: monthRange }),
            Note.find({ userId, date:    monthRange }),
            Meeting.find({ userId, date: monthRange }),
        ]);

        // Build a map keyed by UTC date string (YYYY-MM-DD) for each day with items
        const dayMap = new Map();

        const getKey = (d) => {
            const date = new Date(d);
            const y = date.getUTCFullYear();
            const m = String(date.getUTCMonth() + 1).padStart(2, '0');
            const day = String(date.getUTCDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
        };

        const ensureDay = (key) => {
            if (!dayMap.has(key)) {
                const [y, m, d] = key.split('-').map(Number);
                const dateObj = new Date(Date.UTC(y, m - 1, d));
                const label = dateObj.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
                dayMap.set(key, { date: dateObj, label, agenda: { tasks: [], notes: [], meetings: [] } });
            }
            return dayMap.get(key);
        };

        for (const task of tasks) {
            if (task.dueDate) {
                ensureDay(getKey(task.dueDate)).agenda.tasks.push(task);
            }
        }
        for (const note of notes) {
            if (note.date) {
                ensureDay(getKey(note.date)).agenda.notes.push(note);
            }
        }
        for (const meeting of meetings) {
            if (meeting.date) {
                ensureDay(getKey(meeting.date)).agenda.meetings.push(meeting);
            }
        }

        // Sort days ascending and return as array
        const result = Array.from(dayMap.values()).sort((a, b) => a.date - b.date);

        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

export default router;
