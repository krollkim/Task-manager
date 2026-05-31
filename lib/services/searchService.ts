import dbConnect from '../db';
import Task from '../../server/models/mongoDB/Task';
import Note from '../../server/models/mongoDB/Note';
import Meeting from '../../server/models/mongoDB/Meeting';
import Message from '../../server/models/mongoDB/Message';
import type { SearchResult, SearchResults } from '../../app/types/types';

/**
 * Search across all collections using MongoDB text search
 * Requires text indexes on all collections
 */
export async function searchAll(
  userId: string,
  query: string,
  types: string[] = ['task', 'note', 'meeting', 'message'],
  limit: number = 10
): Promise<SearchResults> {
  await dbConnect();

  const results: SearchResults = {};

  try {
    // Search tasks
    if (types.includes('task')) {
      const tasks = await Task.find(
        {
          $text: { $search: query },
          userId,
        },
        { score: { $meta: 'textScore' } }
      )
        .sort({ score: { $meta: 'textScore' } })
        .limit(limit)
        .lean();

      results.tasks = tasks.map((task: any) => ({
        _id: task._id,
        title: task.task,
        type: 'task' as const,
        score: task.score,
        snippet: task.description ? task.description.substring(0, 100) : '',
      }));
    }

    // Search notes
    if (types.includes('note')) {
      const notes = await Note.find(
        {
          $text: { $search: query },
          userId,
        },
        { score: { $meta: 'textScore' } }
      )
        .sort({ score: { $meta: 'textScore' } })
        .limit(limit)
        .lean();

      results.notes = notes.map((note: any) => ({
        _id: note._id,
        title: note.title,
        type: 'note' as const,
        score: note.score,
        snippet: note.content ? note.content.substring(0, 100) : '',
      }));
    }

    // Search meetings
    if (types.includes('meeting')) {
      const meetings = await Meeting.find(
        {
          $text: { $search: query },
          userId,
        },
        { score: { $meta: 'textScore' } }
      )
        .sort({ score: { $meta: 'textScore' } })
        .limit(limit)
        .lean();

      results.meetings = meetings.map((meeting: any) => ({
        _id: meeting._id,
        title: meeting.title,
        type: 'meeting' as const,
        score: meeting.score,
        snippet: meeting.description ? meeting.description.substring(0, 100) : '',
      }));
    }

    // Search messages (no userId filter - messages are public in general chat)
    if (types.includes('message')) {
      const messages = await Message.find(
        {
          $text: { $search: query },
        },
        { score: { $meta: 'textScore' } }
      )
        .sort({ score: { $meta: 'textScore' } })
        .limit(limit)
        .lean();

      results.messages = messages.map((message: any) => ({
        _id: message._id,
        text: message.text,
        title: `${message.senderName}: ${message.text.substring(0, 50)}`,
        type: 'message' as const,
        score: message.score,
        snippet: message.text ? message.text.substring(0, 100) : '',
      }));
    }

    return results;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Search failed';
    throw new Error(`Search error: ${message}`);
  }
}
