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

export default router;
