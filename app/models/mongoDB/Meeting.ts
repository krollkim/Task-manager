import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

interface IMeeting extends Document {
  _id: string;
  title: string;
  description?: string;
  date: Date;
  startTime?: string;
  endTime?: string;
  userId: string;
  createdAt: Date;
  linkedTaskIds?: string[];
  linkedNoteIds?: string[];
  tags?: string[];
  rrule?: string;
  recurringId?: string;
  isRecurringBase?: boolean;
  exceptedDates?: string[];
}

const meetingSchema = new Schema<IMeeting>({
  _id: { type: String, required: true, default: uuidv4 },
  title: { type: String, required: [true, 'Meeting title is required'] },
  description: { type: String, default: '' },
  date: { type: Date, required: [true, 'Meeting date is required'] },
  startTime: { type: String },
  endTime: { type: String },
  userId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  linkedTaskIds: { type: [String], default: [] },
  linkedNoteIds: { type: [String], default: [] },
  tags: { type: [String], default: [] },
  rrule: { type: String, default: null },
  recurringId: { type: String, default: null },
  isRecurringBase: { type: Boolean, default: false },
  exceptedDates: { type: [String], default: [] },
});

meetingSchema.index({ title: 'text', description: 'text' });

export default mongoose.models.Meeting || mongoose.model<IMeeting>('Meeting', meetingSchema);
