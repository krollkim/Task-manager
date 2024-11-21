const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Task = require('./models/Task');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/task_manager', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

app.post('/tasks', async (req, res) => {
    const { task } = req.body; 
    const newTask = new Task({ task });

    try {
        await newTask.save();
        res.status(201).json(newTask);
    } catch (error) {
        res.status(400).json({ message: 'Error creating task', error });
    }
});

app.get('/', (req, res) => res.send('Hello from Express! (ma server)'));
app.listen(5000, () => console.log('Server running on port 5000'));