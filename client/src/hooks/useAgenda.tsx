import { useState, useEffect, useCallback } from 'react';
import { getAgenda } from '../services/AgendaServices';
import { AgendaData } from '../types/types';

const PRIORITY_ORDER: Record<string, number> = {
    urgent: 0, high: 1, medium: 2, low: 3,
};

function sortAgenda(data: AgendaData): AgendaData {
    const meetings = [...data.meetings].sort((a, b) => {
        if (!a.startTime && !b.startTime) return 0;
        if (!a.startTime) return 1;
        if (!b.startTime) return -1;
        return a.startTime.localeCompare(b.startTime);
    });

    const tasks = [...data.tasks].sort((a, b) => {
        const aPri = a.priority ? (PRIORITY_ORDER[a.priority] ?? 4) : 4;
        const bPri = b.priority ? (PRIORITY_ORDER[b.priority] ?? 4) : 4;
        return aPri - bPri;
    });

    const notes = [...data.notes].sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return { meetings, tasks, notes };
}

export const useAgenda = (selectedDate: Date) => {
    const [agenda, setAgenda] = useState<AgendaData>({
        tasks: [],
        notes: [],
        meetings: []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAgenda = useCallback(async (date: Date) => {
        try {
            setLoading(true);
            setError(null);
            const data = await getAgenda(date);
            setAgenda(sortAgenda({
                tasks: data.tasks || [],
                notes: data.notes || [],
                meetings: data.meetings || []
            }));
        } catch (err) {
            console.error('Error fetching agenda:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch agenda');
            setAgenda({ tasks: [], notes: [], meetings: [] });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAgenda(selectedDate);
    }, [selectedDate, fetchAgenda]);

    const refetch = useCallback(() => {
        fetchAgenda(selectedDate);
    }, [selectedDate, fetchAgenda]);

    const isEmpty = agenda.tasks.length === 0
        && agenda.notes.length === 0
        && agenda.meetings.length === 0;

    return {
        agenda,
        loading,
        error,
        isEmpty,
        refetch
    };
};
