import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const inviteSchema = new mongoose.Schema({
  _id:         { type: String, default: uuidv4 },
  email:       { type: String, required: true, lowercase: true, trim: true },
  token:       { type: String, required: true, default: uuidv4, unique: true },
  invitedBy:   { type: String, required: true },   // User._id
  workspaceId: { type: String, default: 'default' },
  status:      { type: String, enum: ['pending', 'accepted', 'expired'], default: 'pending' },
  expiresAt:   { type: Date, default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }, // 7 days
  createdAt:   { type: Date, default: Date.now },
});

export default mongoose.model('Invite', inviteSchema);
