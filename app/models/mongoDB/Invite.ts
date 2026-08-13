import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

interface IInvite extends Document {
  _id: string;
  email: string;
  token: string;
  invitedBy: string;
  workspaceId?: string;
  status: 'pending' | 'accepted' | 'expired';
  expiresAt: Date;
  createdAt: Date;
}

const inviteSchema = new Schema<IInvite>({
  _id: { type: String, default: uuidv4 },
  email: { type: String, required: true, lowercase: true, trim: true },
  token: { type: String, required: true, default: uuidv4, unique: true },
  invitedBy: { type: String, required: true },
  workspaceId: { type: String, default: 'default' },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'expired'],
    default: 'pending',
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Invite || mongoose.model<IInvite>('Invite', inviteSchema);
