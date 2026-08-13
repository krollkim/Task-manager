import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

interface ITask extends Document {
  _id?: string;
  task: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
  estimateMinutes?: number;
  spentMinutes?: number;
  userId: string;
  createdAt: Date;
  linkedMeetingId?: string;
  linkedNoteIds?: string[];
  tags?: string[];
  linkedMessageId?: string;
  teamId?: string;
}

const taskSchema = new Schema<ITask>({
  _id: { type: String, required: true, default: uuidv4 },
  task: { type: String, required: [true, 'Task is required and must be a non-empty string'] },
  description: { type: String, default: '' },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'done'],
    default: 'todo',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  dueDate: { type: Date },
  estimateMinutes: { type: Number, min: 0 },
  spentMinutes: { type: Number, min: 0, default: 0 },
  userId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  linkedMeetingId: { type: String, default: null },
  linkedNoteIds: { type: [String], default: [] },
  tags: { type: [String], default: [] },
  linkedMessageId: { type: String, default: null },
  teamId: { type: String, default: null },
});

taskSchema.index({ task: 'text', description: 'text' });

export default mongoose.models.Task || mongoose.model<ITask>('Task', taskSchema);
