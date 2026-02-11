import Task from "./mongoDB/Task.js";
import { handleError } from '../utils/handleErrors.js';
import { v4 as uuidv4 } from 'uuid';

const DB = process.env.DB || "MONGODB";

// Function to get all tasks from MongoDB
const getTasks = async (userId) => {
  if (DB === "MONGODB") {
    try {
      const tasks = await Task.find({ userId });
      return Promise.resolve(tasks);
    } catch (error) {
      error.status = 404;
      throw error;
    }
  }
  return Promise.resolve("get tasks not in mongodb");
};

// Function to get a single task by ID
const getTask = async (taskId, userId) => {
  if (DB === "MONGODB") {
    try {
      const task = await Task.findOne({ _id: taskId, userId });
      if (!task) throw new Error("Could not find this task in the database");
      return Promise.resolve(task);
    } catch (error) {
      error.status = 404;
      throw error;
    }
  }
  return Promise.resolve("get task not in mongodb");
};

// Function to create a new task in MongoDB
const createTask = async (taskData) => {
  if (DB === "MONGODB") {
    try {
      taskData.id = uuidv4();
      let task = new Task(taskData);
      task = await task.save();
      return Promise.resolve(task);
    } catch (error) {
      error.status = 400;
      throw error;
    }
  }
  return Promise.resolve("create task not in mongodb");
};

// Function to delete task by id
const deleteTask = async (id, userId) => {
  console.log("Deleting task with ID:", id, "for user:", userId);
  if (DB === "MONGODB") {
    try {
      const deletedTask = await Task.findOneAndDelete({ _id: id, userId });
      console.log("Result of deletion:", deletedTask);
      if (!deletedTask) {
        const error = new Error("Task not found");
        error.status = 404;
        throw error;
      }
      return deletedTask;
    } catch (error) {
      console.error("Error in deleteTask:", error);
      throw error;
    }
  }
  throw new Error("delete task not in mongodb");
};



const editTask = async (taskId, updatedData, userId) => {
  if (DB === "MONGODB") {
    try {
      console.log("editTask called with taskId:", taskId, "for user:", userId);
      const editedTask = await Task.findOne({ _id: taskId, userId });
      if (!editedTask) {
        console.log("Task not found in the database.");
        throw new Error("Task not found");
      }
      console.log("Task found:", editedTask);
      editedTask.task = updatedData.task || editedTask.task;
      editedTask.status = updatedData.status || editedTask.status;
      editedTask.description = updatedData.description !== undefined ? updatedData.description : editedTask.description;

      // Update new fields: priority, dueDate, estimateMinutes, spentMinutes
      if (updatedData.priority !== undefined) {
        editedTask.priority = updatedData.priority;
      }
      if (updatedData.dueDate !== undefined) {
        editedTask.dueDate = updatedData.dueDate;
      }
      if (updatedData.estimateMinutes !== undefined) {
        editedTask.estimateMinutes = updatedData.estimateMinutes;
      }
      if (updatedData.spentMinutes !== undefined) {
        editedTask.spentMinutes = updatedData.spentMinutes;
      }

      await editedTask.save();
      return editedTask.toObject();
    } catch (error) {
      console.error("Error in editTask:", error.message);
      error.status = 400;
      throw error;
    }
  }
  return "edit task not available in mongodb";
};

export { getTasks, getTask, createTask, deleteTask, editTask };
