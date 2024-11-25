const express = require('express');
const cors = require('cors');
const chalk = require("chalk");
const taskRouter = require('./routes/taskRouter');
const connectToDb = require('./DB/dbService');

const app = express();
app.use(cors());
app.use(express.json());

connectToDb();

app.use('/tasks', taskRouter);

app.use("/task",)
app.get('/', (req, res) => res.send("ok"));
app.listen(5000, () => console.log('Server running on port 5000'));
