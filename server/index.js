import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
// const chalk = require("chalk");
import taskRouter from './routes/taskRouter.js';
import authRouter from './routes/Auth.js';
import {connectToDb} from './DB/dbService.js';

dotenv.config();

const app = express();
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

app.use('/tasks', taskRouter);
app.use('/', authRouter);

app.get('/', (req, res) => res.send("ok"));
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
