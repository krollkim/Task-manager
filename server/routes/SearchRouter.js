import express from 'express';
import auth from '../middlewares/auth.js';
import Task from '../models/mongoDB/Task.js';
import Note from '../models/mongoDB/Note.js';
import Meeting from '../models/mongoDB/Meeting.js';
import { handleError } from '../utils/handleErrors.js';

const router = express.Router();

const VALID_TYPES = ['tasks', 'notes', 'meetings'];
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

// GET /search?q=<query>&types=tasks,meetings,notes&limit=20
router.get('/', auth, async (req, res) => {
    try {
        const q = (req.query.q || '').trim();

        // Parse types — default to all three
        const rawTypes = req.query.types ? req.query.types.split(',').map(t => t.trim()) : VALID_TYPES;
        const types = rawTypes.filter(t => VALID_TYPES.includes(t));

        // Parse limit — default 20, max 50
        const rawLimit = parseInt(req.query.limit, 10);
        const limit = isNaN(rawLimit) || rawLimit < 1 ? DEFAULT_LIMIT : Math.min(rawLimit, MAX_LIMIT);

        // Short-circuit for queries that are too short
        if (q.length < 2) {
            return res.status(200).json({ tasks: [], notes: [], meetings: [], total: 0 });
        }

        const userId = req.user.id;
        const textQuery = { $text: { $search: q } };
        const textProjection = { score: { $meta: 'textScore' } };
        const textSort = { score: { $meta: 'textScore' } };

        // Build parallel queries only for requested types
        const queryPromises = [];
        const typeOrder = [];

        if (types.includes('tasks')) {
            queryPromises.push(
                Task.find({ ...textQuery, userId }, textProjection)
                    .sort(textSort)
                    .limit(limit)
                    .lean()
            );
            typeOrder.push('tasks');
        }

        if (types.includes('notes')) {
            queryPromises.push(
                Note.find({ ...textQuery, userId }, textProjection)
                    .sort(textSort)
                    .limit(limit)
                    .lean()
            );
            typeOrder.push('notes');
        }

        if (types.includes('meetings')) {
            queryPromises.push(
                Meeting.find({ ...textQuery, userId }, textProjection)
                    .sort(textSort)
                    .limit(limit)
                    .lean()
            );
            typeOrder.push('meetings');
        }

        const rawResults = await Promise.all(queryPromises);

        // Map raw results back to their type buckets and add snippet + type fields
        const grouped = { tasks: [], notes: [], meetings: [] };

        rawResults.forEach((docs, idx) => {
            const type = typeOrder[idx];
            grouped[type] = docs.map(doc => {
                let snippet = '';
                if (type === 'tasks') {
                    snippet = (doc.description || doc.task || '').slice(0, 100);
                } else if (type === 'notes') {
                    snippet = (doc.content || doc.title || '').slice(0, 100);
                } else if (type === 'meetings') {
                    snippet = (doc.description || doc.title || '').slice(0, 100);
                }
                return { ...doc, type: type.slice(0, -1), snippet }; // 'tasks'->'task', etc.
            });
        });

        // Merge all results, sort by textScore descending, slice to limit
        const allItems = [
            ...grouped.tasks,
            ...grouped.notes,
            ...grouped.meetings,
        ].sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, limit);

        // Re-bucket the merged+sorted items back into grouped response
        const response = { tasks: [], notes: [], meetings: [], total: 0 };
        for (const item of allItems) {
            const bucket = item.type + 's'; // 'task'->'tasks', etc.
            if (response[bucket]) {
                response[bucket].push(item);
            }
        }
        response.total = allItems.length;

        return res.status(200).json(response);
    } catch (error) {
        return handleError(res, 500, error.message);
    }
});

export default router;
