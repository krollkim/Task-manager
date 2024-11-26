const express = require('express');
const { getTasks, createTask, getTask, deleteTask } = require('../models/TaskAccessDataService');
const { handleError } = require('../utils/handleErrors');
const router = express.Router();

// Route to get all tasks
router.get('/', async (req, res) => {
    try {
        const tasks = await getTasks();
        return res.status(200).json(tasks);
    } catch (error) {
        return handleError(res, error.status || 500, error.message);
    }
});

// Route to get task by id
router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id;

        const tasks = await getTask(id);
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
        return res.send(newTask);
    } catch (error) {
        return handleError(res, error.status || 500, error.message);
    }
});

// Route to delete task by id
router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id;

        const deletedTask = await deleteTask(id);
        if (!deletedTask) {
            return res.status(404).json({ message: 'Task not found' });
        }
        return res.send({ message: 'Task deleted successfully', task: deletedTask });
    } catch (error) {
        return handleError(res, error.status || 500, error.message);
    }
});



module.exports = router;
