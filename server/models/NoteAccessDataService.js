import Note from "./mongoDB/Note.js";
import { v4 as uuidv4 } from 'uuid';

const DB = process.env.DB || "MONGODB";

// Function to get all notes from MongoDB
const getNotes = async (userId) => {
  if (DB === "MONGODB") {
    try {
      const notes = await Note.find({ userId });
      return Promise.resolve(notes);
    } catch (error) {
      error.status = 404;
      throw error;
    }
  }
  return Promise.resolve("get notes not in mongodb");
};

// Function to get a single note by ID
const getNote = async (noteId, userId) => {
  if (DB === "MONGODB") {
    try {
      const note = await Note.findOne({ _id: noteId, userId });
      if (!note) throw new Error("Could not find this note in the database");
      return Promise.resolve(note);
    } catch (error) {
      error.status = 404;
      throw error;
    }
  }
  return Promise.resolve("get note not in mongodb");
};

// Function to create a new note in MongoDB
const createNote = async (noteData) => {
  if (DB === "MONGODB") {
    try {
      let note = new Note(noteData);
      note = await note.save();
      return Promise.resolve(note);
    } catch (error) {
      error.status = 400;
      throw error;
    }
  }
  return Promise.resolve("create note not in mongodb");
};

// Function to delete note by id
const deleteNote = async (id, userId) => {
  if (DB === "MONGODB") {
    try {
      const deletedNote = await Note.findOneAndDelete({ _id: id, userId });
      if (!deletedNote) {
        const error = new Error("Note not found");
        error.status = 404;
        throw error;
      }
      return deletedNote;
    } catch (error) {
      throw error;
    }
  }
  throw new Error("delete note not in mongodb");
};

// Function to edit a note
const editNote = async (noteId, updatedData, userId) => {
  if (DB === "MONGODB") {
    try {
      const editedNote = await Note.findOne({ _id: noteId, userId });
      if (!editedNote) {
        throw new Error("Note not found");
      }
      editedNote.title = updatedData.title || editedNote.title;
      editedNote.content = updatedData.content || editedNote.content;
      editedNote.pinned = updatedData.pinned !== undefined ? updatedData.pinned : editedNote.pinned;
      await editedNote.save();
      return editedNote.toObject();
    } catch (error) {
      error.status = 400;
      throw error;
    }
  }
  return "edit note not available in mongodb";
};

export { getNotes, getNote, createNote, deleteNote, editNote };