import Task from './mongoDB/Task';
import { v4 as uuidv4 } from 'uuid';

const getTasks = async (userId: string) => {
  try {
    const tasks = await Task.find({ userId });
    return tasks;
  } catch (error: any) {
    error.status = 404;
    throw error;
  }
};

const getTask = async (taskId: string, userId: string) => {
  try {
    const task = await Task.findOne({ _id: taskId, userId });
    if (!task) throw new Error('Could not find this task in the database');
    return task;
  } catch (error: any) {
    error.status = 404;
    throw error;
  }
};

const createTask = async (taskData: any) => {
  try {
    const task = new Task(taskData);
    await task.save();
    return task;
  } catch (error: any) {
    error.status = 400;
    throw error;
  }
};

const deleteTask = async (id: string, userId: string) => {
  try {
    const deletedTask = await Task.findOneAndDelete({ _id: id, userId });
    if (!deletedTask) {
      const error: any = new Error('Task not found');
      error.status = 404;
      throw error;
    }
    return deletedTask;
  } catch (error) {
    throw error;
  }
};

const editTask = async (taskId: string, updatedData: any, userId: string) => {
  try {
    const editedTask = await Task.findOne({ _id: taskId, userId });
    if (!editedTask) {
      throw new Error('Task not found');
    }

    editedTask.task = updatedData.task || editedTask.task;
    editedTask.status = updatedData.status || editedTask.status;
    editedTask.description = updatedData.description !== undefined ? updatedData.description : editedTask.description;

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
    throw error;
  }
};

export { getTasks, getTask, createTask, deleteTask, editTask };
