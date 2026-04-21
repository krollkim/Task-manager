import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const teamMemberSchema = new mongoose.Schema({
  _id:         { type: String, default: uuidv4 },
  userId:      { type: String, required: true },
  workspaceId: { type: String, required: true, default: 'default' },
  role:        { type: String, enum: ['owner', 'member'], default: 'member' },
  joinedAt:    { type: Date, default: Date.now },
});

teamMemberSchema.index({ userId: 1, workspaceId: 1 }, { unique: true });

export default mongoose.model('TeamMember', teamMemberSchema);
