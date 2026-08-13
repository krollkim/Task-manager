import Note from './mongoDB/Note';

const getNotes = async (userId: string) => {
  try {
    const notes = await Note.find({ userId });
    return notes;
  } catch (error: any) {
    error.status = 404;
    throw error;
  }
};

const getNote = async (noteId: string, userId: string) => {
  try {
    const note = await Note.findOne({ _id: noteId, userId });
    if (!note) throw new Error('Could not find this note in the database');
    return note;
  } catch (error: any) {
    error.status = 404;
    throw error;
  }
};

const createNote = async (noteData: any) => {
  try {
    const note = new Note(noteData);
    await note.save();
    return note;
  } catch (error: any) {
    error.status = 400;
    throw error;
  }
};

const deleteNote = async (id: string, userId: string) => {
  try {
    const deletedNote = await Note.findOneAndDelete({ _id: id, userId });
    if (!deletedNote) {
      const error: any = new Error('Note not found');
      error.status = 404;
      throw error;
    }
    return deletedNote;
  } catch (error) {
    throw error;
  }
};

const editNote = async (noteId: string, updatedData: any, userId: string) => {
  try {
    const editedNote = await Note.findOne({ _id: noteId, userId });
    if (!editedNote) {
      throw new Error('Note not found');
    }

    editedNote.title = updatedData.title || editedNote.title;
    editedNote.content = updatedData.content || editedNote.content;
    editedNote.pinned = updatedData.pinned !== undefined ? updatedData.pinned : editedNote.pinned;
    if (updatedData.date !== undefined) editedNote.date = updatedData.date;

    await editedNote.save();
    return editedNote.toObject();
  } catch (error) {
    throw error;
  }
};

export { getNotes, getNote, createNote, deleteNote, editNote };
