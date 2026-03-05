import express from 'express';
import { getMeetings, createMeeting, getMeeting, deleteMeeting, editMeeting } from '../models/MeetingAccessDataService.js';
import { handleError } from '../utils/handleErrors.js';
import auth from '../middlewares/auth.js';

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
        if (meeting.endTime) meetingData.endTime = meeting.endTime;

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

export default router;
