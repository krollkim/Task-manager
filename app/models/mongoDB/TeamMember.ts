import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

interface ITeamMember extends Document {
  _id: string;
  userId: string;
  workspaceId: string;
  role: 'owner' | 'member';
  joinedAt: Date;
}

const teamMemberSchema = new Schema<ITeamMember>({
  _id: { type: String, default: uuidv4 },
  userId: { type: String, required: true },
  workspaceId: { type: String, required: true, default: 'default' },
  role: {
    type: String,
    enum: ['owner', 'member'],
    default: 'member',
  },
  joinedAt: { type: Date, default: Date.now },
});

teamMemberSchema.index({ userId: 1, workspaceId: 1 }, { unique: true });

export default mongoose.models.TeamMember || mongoose.model<ITeamMember>('TeamMember', teamMemberSchema);
