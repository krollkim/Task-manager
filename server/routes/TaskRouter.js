import express from 'express';
import { getTasks, createTask, getTask, deleteTask, editTask } from '../models/TaskAccessDataService.js';
import { handleError } from '../utils/handleErrors.js';
import Task from '../models/mongoDB/Task.js';


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
        const task = req.body;

        if (!task || typeof task.task !== 'string' || task.task.trim() === '') {
            return handleError(res, 400, 'Task is required and must be a non-empty string.');
        }

        const taskData = { 
            task: task.task.trim(),
            description: task.description || '',
            status: task.status || 'todo'
        };

        const newTask = await createTask(taskData);
        return res.send(newTask);
    } catch (error) {
        return handleError(res, error.status || 500, error.message);
    }
});

// Route to edit a new task
router.patch('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const updatedData = req.body;
        console.log("PATCH request received with id:", id, "and data:", updatedData);
        const editedTask = await editTask(id, updatedData);

        return res.status(200).json(editedTask);
    } catch (error) {
        return handleError(res, error.status || 500, error.message);
    }
});

// Route to delete task by id
router.delete("/:id", async (req, res) => {
    try {
      const id = req.params.id;  
      if (!id) {
        return handleError(res, 400, "Task ID is required");
      }
  
      const deletedTask = await deleteTask(id);
      return res.status(200).json({
        message: "Task deleted successfully",
        task: deletedTask,
      });
    } catch (error) {
      console.error("Error in DELETE route:", error);
      return handleError(res, error.status || 500, error.message);
    }
  });
  



export default router;
