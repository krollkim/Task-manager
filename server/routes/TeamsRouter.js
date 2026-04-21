import express from 'express';
import auth from '../middlewares/auth.js';
import Invite from '../models/mongoDB/Invite.js';
import TeamMember from '../models/mongoDB/TeamMember.js';
import { handleError } from '../utils/handleErrors.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// POST /teams/invite
// Body: { email: string }
// Returns: { invite: { id, email, token, expiresAt }, inviteUrl: string }
router.post('/invite', auth, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return handleError(res, 400, 'Valid email address is required');
    }

    // Check if a pending invite already exists for this email
    const existing = await Invite.findOne({ email: email.toLowerCase().trim(), status: 'pending' });
    if (existing && existing.expiresAt > new Date()) {
      // Return the existing invite rather than creating a duplicate
      const inviteUrl = `${process.env.APP_URL || 'http://localhost:3000'}/join/${existing.token}`;
      return res.status(200).json({ invite: existing, inviteUrl });
    }

    const token = uuidv4();
    const invite = await Invite.create({
      _id: uuidv4(),
      email: email.toLowerCase().trim(),
      token,
      invitedBy: req.user.id,
    });

    const inviteUrl = `${process.env.APP_URL || 'http://localhost:3000'}/join/${invite.token}`;
    return res.status(201).json({ invite, inviteUrl });
  } catch (err) {
    return handleError(res, 500, err.message);
  }
});

// GET /teams/invite/:token — validate a token (used by frontend on /join/:token route)
router.get('/invite/:token', async (req, res) => {
  try {
    const invite = await Invite.findOne({ token: req.params.token, status: 'pending' });
    if (!invite || invite.expiresAt < new Date()) {
      return handleError(res, 404, 'Invite link is invalid or has expired');
    }
    return res.status(200).json({ email: invite.email, workspaceId: invite.workspaceId });
  } catch (err) {
    return handleError(res, 500, err.message);
  }
});

// POST /teams/invite/:token/accept — logged-in user accepts an invite
router.post('/invite/:token/accept', auth, async (req, res) => {
  try {
    const invite = await Invite.findOne({ token: req.params.token, status: 'pending' });
    if (!invite || invite.expiresAt < new Date()) {
      return handleError(res, 404, 'Invite link is invalid or has expired');
    }

    // Mark invite accepted
    invite.status = 'accepted';
    await invite.save();

    // Create TeamMember record (upsert — idempotent if accepted twice)
    const existing = await TeamMember.findOne({ userId: req.user.id, workspaceId: invite.workspaceId });
    if (!existing) {
      await TeamMember.create({
        _id: uuidv4(),
        userId: req.user.id,
        workspaceId: invite.workspaceId,
        role: 'member',
      });
    }

    return res.status(200).json({ success: true, workspaceId: invite.workspaceId });
  } catch (err) {
    return handleError(res, 500, err.message);
  }
});

export default router;
