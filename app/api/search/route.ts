import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getAuthenticatedUser, respondUnauthorized } from '@/lib/auth';
import Task from '@/models/mongoDB/Task';
import Note from '@/models/mongoDB/Note';
import Meeting from '@/models/mongoDB/Meeting';
import Message from '@/models/mongoDB/Message';

const VALID_TYPES = ['tasks', 'notes', 'meetings', 'messages'];
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

// GET /api/search?q=<query>&types=tasks,meetings,notes&limit=20
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const user = await getAuthenticatedUser(request);
    if (!user) return respondUnauthorized();

    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').trim();

    const rawTypes = searchParams.get('types') ? searchParams.get('types')!.split(',').map(t => t.trim()) : VALID_TYPES;
    const types = rawTypes.filter(t => VALID_TYPES.includes(t));

    const rawLimit = parseInt(searchParams.get('limit') || '', 10);
    const limit = isNaN(rawLimit) || rawLimit < 1 ? DEFAULT_LIMIT : Math.min(rawLimit, MAX_LIMIT);

    if (q.length < 2) {
      return NextResponse.json({ tasks: [], notes: [], meetings: [], messages: [], total: 0 }, { status: 200 });
    }

    const userId = user.id;
    const textQuery = { $text: { $search: q } };
    const textProjection = { score: { $meta: 'textScore' } };
    const textSort = { score: { $meta: 'textScore' } };

    const queryPromises = [];
    const typeOrder = [];

    if (types.includes('tasks')) {
      queryPromises.push(
        Task.find({ ...textQuery, userId }, textProjection)
          .sort(textSort)
          .limit(limit)
          .lean()
      );
      typeOrder.push('tasks');
    }

    if (types.includes('notes')) {
      queryPromises.push(
        Note.find({ ...textQuery, userId }, textProjection)
          .sort(textSort)
          .limit(limit)
          .lean()
      );
      typeOrder.push('notes');
    }

    if (types.includes('meetings')) {
      queryPromises.push(
        Meeting.find({ ...textQuery, userId }, textProjection)
          .sort(textSort)
          .limit(limit)
          .lean()
      );
      typeOrder.push('meetings');
    }

    if (types.includes('messages')) {
      queryPromises.push(
        Message.find(textQuery, textProjection)
          .sort(textSort)
          .limit(limit)
          .lean()
      );
      typeOrder.push('messages');
    }

    const rawResults = await Promise.all(queryPromises);

    const grouped: Record<string, any[]> = { tasks: [], notes: [], meetings: [], messages: [] };

    rawResults.forEach((docs, idx) => {
      const type = typeOrder[idx];
      grouped[type] = docs.map(doc => {
        let snippet = '';
        if (type === 'tasks') {
          snippet = (doc.description || doc.task || '').slice(0, 100);
        } else if (type === 'notes') {
          snippet = (doc.content || doc.title || '').slice(0, 100);
        } else if (type === 'meetings') {
          snippet = (doc.description || doc.title || '').slice(0, 100);
        } else if (type === 'messages') {
          snippet = (doc.text || '').slice(0, 100);
        }
        return { ...doc, type: type.slice(0, -1), snippet };
      });
    });

    const allItems = [
      ...grouped.tasks,
      ...grouped.notes,
      ...grouped.meetings,
      ...grouped.messages,
    ].sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, limit);

    const response: Record<string, any> = { tasks: [], notes: [], meetings: [], messages: [], total: 0 };
    for (const item of allItems) {
      const bucket = item.type === 'message' ? 'messages' : item.type + 's';
      if (response[bucket]) {
        response[bucket].push(item);
      }
    }
    response.total = allItems.length;

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
