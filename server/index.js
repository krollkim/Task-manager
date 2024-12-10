import express from 'express';
import cors from 'cors';
// const chalk = require("chalk");
import taskRouter from './routes/taskRouter.js';
import {connectToDb} from './DB/dbService.js';

const app = express();
app.use(cors());
app.use(express.json());

connectToDb();

app.use('/tasks', taskRouter);

app.get('/', (req, res) => res.send("ok"));
app.listen(5000, () => console.log('Server running on port 5000'));
