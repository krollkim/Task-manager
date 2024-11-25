const express = require('express');
const { getTasks, createTask, getTask } = require('../models/TaskAccessDataService');
const { handleError } = require('../utils/handleErrors');
const router = express.Router();

// Route to get all tasks
router.get('/', async (req, res) => {
    try {
       res.send("ok")
    } catch (error) {
        return handleError(res, error.status || 500, error.message);
    }
});

router.get('/task', async (req, res) => {
    try {
        const tasks = await getTask();
        return res.status(200).json(tasks);
    } catch (error) {
        return handleError(res, error.status || 500, error.message);
    }
});

// Route to create a new task
router.post('/', async (req, res) => {
    try {
        const { task } = req.body;

        if (!task || typeof task.task !== 'string' || task.task.trim() === '') {
            return handleError(res, 400, 'Task is required and must be a non-empty string.');
        }

        const taskData = { task: task.task.trim() };

        const newTask = await createTask(taskData);
        return res.status(201).json(newTask);
    } catch (error) {
        return handleError(res, error.status || 500, error.message);
    }
});

module.exports = router;
