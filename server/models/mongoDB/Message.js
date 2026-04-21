import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const messageSchema = new mongoose.Schema({
  _id:           { type: String, default: uuidv4 },
  roomId:        { type: String, required: true, default: 'general' },
  senderId:      { type: String, required: true },
  senderName:    { type: String, required: true },
  text:          { type: String, required: true, trim: true, maxlength: 2000 },
  linkedItemId:  { type: String, default: null },
  linkedItemType:{ type: String, enum: ['task', 'note', 'meeting', null], default: null },
  createdAt:     { type: Date, default: Date.now },
});

messageSchema.index({ text: 'text', senderName: 'text' });

export default mongoose.model('Message', messageSchema);
