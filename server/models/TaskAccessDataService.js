const Task = require("./mongoDB/Task");
const { handleError } = require('../utils/handleErrors');
const uuid = require('uuid');

const DB = process.env.DB || "MONGODB";

// Function to get all tasks from MongoDB
const getTasks = async () => {
  if (DB === "MONGODB") {
    try {
      const tasks = await Task.find();
      return Promise.resolve(tasks);
    } catch (error) {
      error.status = 404;
      return handleError(error);
    }
  }
  return Promise.resolve("get tasks not in mongodb");
};

// Function to get a single task by ID
const getTask = async (taskId) => {
  if (DB === "MONGODB") {
    try {
      const task = await Task.findById(taskId);
      if (!task) throw new Error("Could not find this task in the database");
      return Promise.resolve(task);
    } catch (error) {
      error.status = 404;
      return handleError(error);
    }
  }
  return Promise.resolve("get task not in mongodb");
};

// Function to create a new task in MongoDB
const createTask = async (taskData) => {
  if (DB === "MONGODB") {
    try {
      taskData.id = uuid.v4();
      let task = new Task(taskData);
      task = await task.save();
      return Promise.resolve(task);
    } catch (error) {
      error.status = 400;
      return handleError(error);
    }
  }
  return Promise.resolve("create task not in mongodb");
};

// Function to delete task by id
const deleteTask = async (taskId) => {
  if (DB === "MONGODB") {
      try {
          const deletedTask = await Task.findByIdAndDelete(taskId);
          return deletedTask;
      } catch (error) {
          error.status = 400;
          return handleError(error);
      }
  }
  return "delete task not in mongodb";
};


module.exports = { getTasks, getTask, createTask, deleteTask };
