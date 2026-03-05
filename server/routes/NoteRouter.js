import express from 'express';
import { getNotes, createNote, getNote, deleteNote, editNote } from '../models/NoteAccessDataService.js';
import { handleError } from '../utils/handleErrors.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

// Route to get all notes
router.get('/', auth, async (req, res) => {
    try {
        const notes = await getNotes(req.user.id);
        return res.status(200).json(notes);
    } catch (error) {
        return handleError(res, error.status || 500, error.message);
    }
});

// Route to get note by id
router.get('/:id', auth, async (req, res) => {
    try {
        const id = req.params.id;
        const note = await getNote(id, req.user.id);
        return res.status(200).json(note);
    } catch (error) {
        return handleError(res, error.status || 500, error.message);
    }
});

// Route to create a new note
router.post('/', auth, async (req, res) => {
    try {
        const note = req.body;

        if (!note || typeof note.title !== 'string' || note.title.trim() === '') {
            return handleError(res, 400, 'Note title is required and must be a non-empty string.');
        }

        const noteData = {
            title: note.title.trim(),
            content: note.content || '',
            pinned: note.pinned || false,
            userId: req.user.id
        };

        if (note.date) noteData.date = note.date;

        const newNote = await createNote(noteData);
        return res.send(newNote);
    } catch (error) {
        return handleError(res, error.status || 500, error.message);
    }
});

// Route to edit a note
router.patch('/:id', auth, async (req, res) => {
    try {
        const id = req.params.id;
        const updatedData = req.body;
        const editedNote = await editNote(id, updatedData, req.user.id);
        return res.status(200).json(editedNote);
    } catch (error) {
        return handleError(res, error.status || 500, error.message);
    }
});

// Route to delete note by id
router.delete("/:id", auth, async (req, res) => {
    try {
      const id = req.params.id;  
      if (!id) {
        return handleError(res, 400, "Note ID is required");
      }
  
      const deletedNote = await deleteNote(id, req.user.id);
      return res.status(200).json({
        message: "Note deleted successfully",
        note: deletedNote,
      });
    } catch (error) {
      return handleError(res, error.status || 500, error.message);
    }
});

export default router;