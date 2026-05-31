import dbConnect from '@/lib/db';

/**
 * Task service for database operations
 * Handles all CRUD operations for tasks with authorization checks
 */

export interface TaskData {
  _id?: string;
  title: string;
  description?: string;
  status?: 'todo' | 'in-progress' | 'done';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  estimateMinutes?: number;
  spentMinutes?: number;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
  linkedMeetingId?: string | null;
  linkedNoteIds?: string[];
  tags?: string[];
  linkedMessageId?: string | null;
  teamId?: string | null;
}

/**
 * Get all tasks for a user
 */
export async function getAllTasks(userId: string): Promise<TaskData[]> {
  try {
    await dbConnect();

    // Import Task model dynamically
    // eslint-disable-next-line global-require
    const Task = require('../models/Task').default;

    const tasks = await Task.find({ userId }).sort({ createdAt: -1 });

    return tasks.map((doc: any) => ({
      _id: doc._id,
      title: doc.task,
      description: doc.description || '',
      status: doc.status || 'todo',
      priority: doc.priority || 'medium',
      dueDate: doc.dueDate ? doc.dueDate.toISOString().split('T')[0] : undefined,
      estimateMinutes: doc.estimateMinutes,
      spentMinutes: doc.spentMinutes || 0,
      userId: doc.userId,
      createdAt: doc.createdAt.toISOString(),
      linkedMeetingId: doc.linkedMeetingId || null,
      linkedNoteIds: doc.linkedNoteIds || [],
      tags: doc.tags || [],
      linkedMessageId: doc.linkedMessageId || null,
      teamId: doc.teamId || null,
    }));
  } catch (error) {
    throw new Error(
      `Failed to fetch tasks: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Get a single task by ID with authorization check
 */
export async function getTaskById(id: string, userId: string): Promise<TaskData | null> {
  try {
    await dbConnect();

    // eslint-disable-next-line global-require
    const Task = require('../models/Task').default;

    const task = await Task.findById(id);

    if (!task) {
      return null;
    }

    // Verify ownership
    if (task.userId !== userId) {
      throw new Error('Unauthorized: You do not own this task');
    }

    return {
      _id: task._id,
      title: task.task,
      description: task.description || '',
      status: task.status || 'todo',
      priority: task.priority || 'medium',
      dueDate: task.dueDate ? task.dueDate.toISOString().split('T')[0] : undefined,
      estimateMinutes: task.estimateMinutes,
      spentMinutes: task.spentMinutes || 0,
      userId: task.userId,
      createdAt: task.createdAt.toISOString(),
      linkedMeetingId: task.linkedMeetingId || null,
      linkedNoteIds: task.linkedNoteIds || [],
      tags: task.tags || [],
      linkedMessageId: task.linkedMessageId || null,
      teamId: task.teamId || null,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      throw error;
    }
    throw new Error(
      `Failed to fetch task: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Create a new task
 */
export async function createTask(userId: string, data: Partial<TaskData>): Promise<TaskData> {
  try {
    // Validate required fields
    if (!data.title || typeof data.title !== 'string' || data.title.trim() === '') {
      throw new Error('Task title is required and must be a non-empty string');
    }

    await dbConnect();

    // eslint-disable-next-line global-require
    const Task = require('../models/Task').default;

    const taskData = {
      task: data.title.trim(),
      description: data.description || '',
      status: data.status || 'todo',
      priority: data.priority || 'medium',
      userId,
      ...(data.dueDate && { dueDate: new Date(data.dueDate) }),
      ...(data.estimateMinutes !== undefined && { estimateMinutes: data.estimateMinutes }),
      linkedMeetingId: data.linkedMeetingId || null,
      linkedNoteIds: data.linkedNoteIds || [],
      tags: data.tags || [],
      linkedMessageId: data.linkedMessageId || null,
      teamId: data.teamId || null,
    };

    const task = new Task(taskData);
    await task.save();

    return {
      _id: task._id,
      title: task.task,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.toISOString().split('T')[0] : undefined,
      estimateMinutes: task.estimateMinutes,
      spentMinutes: task.spentMinutes || 0,
      userId: task.userId,
      createdAt: task.createdAt.toISOString(),
      linkedMeetingId: task.linkedMeetingId || null,
      linkedNoteIds: task.linkedNoteIds || [],
      tags: task.tags || [],
      linkedMessageId: task.linkedMessageId || null,
      teamId: task.teamId || null,
    };
  } catch (error) {
    throw new Error(
      `Failed to create task: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Update a task with authorization check
 */
export async function updateTask(
  id: string,
  userId: string,
  data: Partial<TaskData>
): Promise<TaskData> {
  try {
    if (!id) {
      throw new Error('Task ID is required');
    }

    await dbConnect();

    // eslint-disable-next-line global-require
    const Task = require('../models/Task').default;

    const task = await Task.findById(id);

    if (!task) {
      throw new Error('Task not found');
    }

    // Verify ownership
    if (task.userId !== userId) {
      throw new Error('Unauthorized: You do not own this task');
    }

    // Update allowed fields
    if (data.title !== undefined) {
      if (!data.title || typeof data.title !== 'string' || data.title.trim() === '') {
        throw new Error('Task title must be a non-empty string');
      }
      task.task = data.title.trim();
    }

    if (data.description !== undefined) {
      task.description = data.description;
    }

    if (data.status !== undefined) {
      if (!['todo', 'in-progress', 'done'].includes(data.status)) {
        throw new Error('Invalid status value');
      }
      task.status = data.status;
    }

    if (data.priority !== undefined) {
      if (!['low', 'medium', 'high', 'urgent'].includes(data.priority)) {
        throw new Error('Invalid priority value');
      }
      task.priority = data.priority;
    }

    if (data.dueDate !== undefined) {
      task.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    }

    if (data.estimateMinutes !== undefined) {
      task.estimateMinutes = data.estimateMinutes;
    }

    if (data.spentMinutes !== undefined) {
      task.spentMinutes = data.spentMinutes;
    }

    if (data.linkedMeetingId !== undefined) {
      task.linkedMeetingId = data.linkedMeetingId;
    }

    if (data.linkedNoteIds !== undefined) {
      task.linkedNoteIds = data.linkedNoteIds;
    }

    if (data.tags !== undefined) {
      task.tags = data.tags;
    }

    if (data.linkedMessageId !== undefined) {
      task.linkedMessageId = data.linkedMessageId;
    }

    if (data.teamId !== undefined) {
      task.teamId = data.teamId;
    }

    await task.save();

    return {
      _id: task._id,
      title: task.task,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.toISOString().split('T')[0] : undefined,
      estimateMinutes: task.estimateMinutes,
      spentMinutes: task.spentMinutes,
      userId: task.userId,
      createdAt: task.createdAt.toISOString(),
      linkedMeetingId: task.linkedMeetingId || null,
      linkedNoteIds: task.linkedNoteIds || [],
      tags: task.tags || [],
      linkedMessageId: task.linkedMessageId || null,
      teamId: task.teamId || null,
    };
  } catch (error) {
    throw new Error(
      `Failed to update task: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Delete a task with authorization check
 */
export async function deleteTask(id: string, userId: string): Promise<boolean> {
  try {
    if (!id) {
      throw new Error('Task ID is required');
    }

    await dbConnect();

    // eslint-disable-next-line global-require
    const Task = require('../models/Task').default;

    const task = await Task.findById(id);

    if (!task) {
      throw new Error('Task not found');
    }

    // Verify ownership
    if (task.userId !== userId) {
      throw new Error('Unauthorized: You do not own this task');
    }

    await Task.deleteOne({ _id: id });
    return true;
  } catch (error) {
    throw new Error(
      `Failed to delete task: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Quick reschedule a task (update only dueDate)
 */
export async function quickReschedule(
  id: string,
  userId: string,
  dueDate: string
): Promise<TaskData> {
  try {
    if (!id) {
      throw new Error('Task ID is required');
    }

    if (!dueDate || typeof dueDate !== 'string') {
      throw new Error('dueDate is required and must be a string (ISO format)');
    }

    await dbConnect();

    // eslint-disable-next-line global-require
    const Task = require('../models/Task').default;

    const task = await Task.findById(id);

    if (!task) {
      throw new Error('Task not found');
    }

    // Verify ownership
    if (task.userId !== userId) {
      throw new Error('Unauthorized: You do not own this task');
    }

    task.dueDate = new Date(dueDate);
    await task.save();

    return {
      _id: task._id,
      title: task.task,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.toISOString().split('T')[0] : undefined,
      estimateMinutes: task.estimateMinutes,
      spentMinutes: task.spentMinutes,
      userId: task.userId,
      createdAt: task.createdAt.toISOString(),
      linkedMeetingId: task.linkedMeetingId || null,
      linkedNoteIds: task.linkedNoteIds || [],
      tags: task.tags || [],
      linkedMessageId: task.linkedMessageId || null,
      teamId: task.teamId || null,
    };
  } catch (error) {
    throw new Error(
      `Failed to reschedule task: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
