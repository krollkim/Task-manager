const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const getMeetings = async () => {
  try {
    const response = await fetch(`${API_URL}/api/meetings`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Error fetching meetings');
    return response.json();
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Error fetching meetings'
    );
  }
};

export const getMeeting = async (id: string) => {
  try {
    const response = await fetch(`${API_URL}/api/meetings/${id}`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Error fetching meeting');
    return response.json();
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Error fetching meeting'
    );
  }
};

export const addMeeting = async (meeting: {
  title: string;
  date: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  rrule?: string | null;
}) => {
  try {
    const response = await fetch(`${API_URL}/api/meetings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(meeting),
    });
    if (!response.ok) throw new Error('Error adding meeting');
    return response.json();
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Error adding meeting'
    );
  }
};

export const editMeeting = async (
  id: string,
  updatedMeeting: {
    title?: string;
    date?: string;
    description?: string;
    startTime?: string;
    endTime?: string;
    rrule?: string | null;
  }
) => {
  try {
    const response = await fetch(`${API_URL}/api/meetings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(updatedMeeting),
    });
    if (!response.ok) throw new Error('Error editing meeting');
    return response.json();
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Error editing meeting'
    );
  }
};

export const deleteMeeting = async (id: string) => {
  try {
    const response = await fetch(`${API_URL}/api/meetings/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Error deleting meeting');
    return response.json();
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Error deleting meeting'
    );
  }
};

/**
 * Scoped edit/delete for recurring meetings.
 * @param {string} baseId   - The _id of the isRecurringBase meeting
 * @param {{ scope: 'this'|'following', action: 'edit'|'delete', date: string, data?: object }} params
 */
export const editRecurringMeeting = async (
  baseId: string,
  params: {
    scope: 'this' | 'following' | 'all';
    action: 'edit' | 'delete';
    date: string;
    data?: {
      title?: string;
      description?: string;
      startTime?: string;
      endTime?: string;
      rrule?: string | null;
    };
  }
) => {
  try {
    const response = await fetch(
      `${API_URL}/api/meetings/${baseId}/recurring`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(params),
      }
    );
    if (!response.ok) throw new Error('Error editing recurring meeting');
    return response.json();
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : 'Error editing recurring meeting'
    );
  }
};
