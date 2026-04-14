import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server as SocketIO } from 'socket.io';
// const chalk = require("chalk");
import TaskRouter from './routes/TaskRouter.js';
import NoteRouter from './routes/NoteRouter.js';
import MeetingRouter from './routes/MeetingRouter.js';
import AgendaRouter from './routes/AgendaRouter.js';
import SearchRouter from './routes/SearchRouter.js';
import MessageRouter from './routes/MessageRouter.js';
import authRouter from './routes/Auth.js';
import {connectToDb} from './DB/dbService.js';
import { initChat } from './sockets/chatHandler.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new SocketIO(httpServer, {
  cors: { origin: ['http://localhost:3000','http://localhost:3001','http://localhost:3002'], credentials: true }
});
initChat(io);
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'], // כתובת הקלאיינט
  credentials: true, // מאפשר שליחת cookies
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 200
}));
app.use(express.json());
app.use(cookieParser());

// Handle preflight requests
app.options('*', cors());

connectToDb();

// Log all routes for debugging
app.use((req, res, next) => {
    console.log(`📍 ${req.method} ${req.url} - Headers: ${JSON.stringify(req.headers.cookie || 'no-cookie')}`);
    next();
});

app.use('/tasks', TaskRouter);
app.use('/notes', NoteRouter);
app.use('/meetings', MeetingRouter);
app.use('/agenda', AgendaRouter);
app.use('/search', SearchRouter);
app.use('/messages', MessageRouter);
app.use('/', authRouter);

app.get('/', (req, res) => res.send("ok"));
const PORT = process.env.PORT || 5001;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
