import jwt from 'jsonwebtoken';
import User from '../models/mongoDB/User.js';
import Task from '../models/mongoDB/Task.js';
import Note from '../models/mongoDB/Note.js';
import Message from '../models/mongoDB/Message.js';
import * as presence from './presenceHandler.js';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

export const initChat = (io) => {
  io.on('connection', async (socket) => {
    // 1. Authenticate via cookie
    try {
      const cookieHeader = socket.handshake.headers.cookie || '';
      const tokenMatch = cookieHeader.match(/token=([^;]+)/);
      if (!tokenMatch) return socket.disconnect();
      const decoded = jwt.verify(tokenMatch[1], JWT_SECRET);
      const user = await User.findById(decoded.id).lean();
      if (!user) return socket.disconnect();

      const userData = { userId: String(user._id), name: user.name, avatar: user.avatar || null };
      presence.addUser(socket.id, userData);

      // Send current presence list to this socket
      socket.emit('presence:list', presence.getOnlineUsers());
      // Notify others
      socket.broadcast.emit('presence:join', userData);

      // chat:send
      socket.on('chat:send', async ({ roomId = 'general', text }) => {
        if (!text || typeof text !== 'string' || text.trim().length === 0) return;
        const safeText = text.trim().slice(0, 2000);
        const msg = await Message.create({
          _id: uuidv4(),
          roomId,
          senderId: userData.userId,
          senderName: userData.name,
          text: safeText,
        });
        io.to(roomId).emit('chat:message', msg);
      });

      // chat:convert
      socket.on('chat:convert', async ({ messageId, type }) => {
        if (!['task', 'note'].includes(type)) return;
        const msg = await Message.findById(messageId);
        if (!msg || msg.linkedItemId) return; // already converted
        let created;
        if (type === 'task') {
          created = await Task.create({ _id: uuidv4(), task: msg.text.slice(0, 120), userId: userData.userId, linkedMessageId: messageId });
        } else {
          created = await Note.create({ _id: uuidv4(), title: msg.text.slice(0, 120), content: '', userId: userData.userId, linkedMessageId: messageId });
        }
        await Message.findByIdAndUpdate(messageId, { linkedItemId: created._id, linkedItemType: type });
        io.to(msg.roomId).emit('task:converted', { messageId, item: created, itemType: type });
      });

      // Join general room
      socket.join('general');

      // Disconnect
      socket.on('disconnect', () => {
        const removed = presence.removeUser(socket.id);
        if (removed) socket.broadcast.emit('presence:leave', { userId: removed.userId });
      });

    } catch (err) {
      console.error('Socket auth error:', err.message);
      socket.disconnect();
    }
  });
};
