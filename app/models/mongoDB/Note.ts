import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

interface INote extends Document {
  _id: string;
  title: string;
  content?: string;
  pinned?: boolean;
  date?: Date;
  userId: string;
  createdAt: Date;
  linkedTaskId?: string;
  linkedMeetingId?: string;
  tags?: string[];
  linkedMessageId?: string;
}

const noteSchema = new Schema<INote>({
  _id: { type: String, required: true, default: uuidv4 },
  title: { type: String, required: [true, 'Note title is required'] },
  content: { type: String, default: '' },
  pinned: { type: Boolean, default: false },
  date: { type: Date },
  userId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  linkedTaskId: { type: String, default: null },
  linkedMeetingId: { type: String, default: null },
  tags: { type: [String], default: [] },
  linkedMessageId: { type: String, default: null },
});

noteSchema.index({ title: 'text', content: 'text' });

export default mongoose.models.Note || mongoose.model<INote>('Note', noteSchema);
