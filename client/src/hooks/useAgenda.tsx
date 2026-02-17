import { useState, useEffect, useCallback } from 'react';
import { getAgenda } from '../services/AgendaServices';
import { AgendaData } from '../types/types';

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
            setAgenda({
                tasks: data.tasks || [],
                notes: data.notes || [],
                meetings: data.meetings || []
            });
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
