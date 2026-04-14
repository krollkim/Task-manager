import express from 'express';
import auth from '../middlewares/auth.js';
import Message from '../models/mongoDB/Message.js';
import { handleError } from '../utils/handleErrors.js';

const router = express.Router();

// GET /messages?roomId=general&limit=50&before=<ISO>
router.get('/', auth, async (req, res) => {
  try {
    const roomId = req.query.roomId || 'general';
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const query = { roomId };
    if (req.query.before) {
      const before = new Date(req.query.before);
      if (!isNaN(before)) query.createdAt = { $lt: before };
    }
    const messages = await Message.find(query).sort({ createdAt: 1 }).limit(limit).lean();
    return res.status(200).json(messages);
  } catch (err) {
    return handleError(res, 500, err.message);
  }
});

export default router;
