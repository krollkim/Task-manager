import { useState, useEffect, useCallback } from 'react';
import { getAgenda } from '../services/AgendaServices';
import { AgendaData, AgendaView, WeekAgendaDay } from '../types/types';

const PRIORITY_ORDER: Record<string, number> = {
    urgent: 0, high: 1, medium: 2, low: 3,
};

function sortAgenda(data: AgendaData): AgendaData {
    const meetings = [...data.meetings].sort((a, b) => {
        const aHas = !!a.startTime;
        const bHas = !!b.startTime;
        if (!aHas && !bHas) return 0;
        if (!aHas) return 1;
        if (!bHas) return -1;
        return a.startTime!.localeCompare(b.startTime!);
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

function getMonthDays(date: Date): Date[] {
    const year = date.getFullYear();
    const month = date.getMonth();
    const total = new Date(year, month + 1, 0).getDate();
    const days: Date[] = [];
    for (let d = 1; d <= total; d++) days.push(new Date(year, month, d));
    return days;
}

function getWeekDays(date: Date): Date[] {
    const d = new Date(date);
    const day = d.getDay();
    // Monday = start of week (day 0 = Sunday → offset 6, else offset day-1)
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate() + mondayOffset);

    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
        days.push(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i));
    }
    return days;
}

function formatDayLabel(date: Date): string {
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    });
}

export const useAgenda = (selectedDate: Date, agendaView: AgendaView = 'day') => {
    const [agenda, setAgenda] = useState<AgendaData>({
        tasks: [],
        notes: [],
        meetings: []
    });
    const [weekAgenda, setWeekAgenda] = useState<WeekAgendaDay[]>([]);
    const [monthAgenda, setMonthAgenda] = useState<WeekAgendaDay[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchDayAgenda = useCallback(async (date: Date) => {
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

    const fetchWeekAgenda = useCallback(async (date: Date) => {
        try {
            setLoading(true);
            setError(null);
            const days = getWeekDays(date);
            const results = await Promise.all(days.map(d => getAgenda(d)));

            const week: WeekAgendaDay[] = days.map((d, i) => ({
                date: d,
                label: formatDayLabel(d),
                agenda: sortAgenda({
                    tasks: results[i].tasks || [],
                    notes: results[i].notes || [],
                    meetings: results[i].meetings || [],
                }),
            }));

            setWeekAgenda(week);
        } catch (err) {
            console.error('Error fetching week agenda:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch week agenda');
            setWeekAgenda([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchMonthAgenda = useCallback(async (date: Date) => {
        try {
            setLoading(true);
            setError(null);
            const days = getMonthDays(date);
            const results = await Promise.all(days.map(d => getAgenda(d)));
            setMonthAgenda(days.map((d, i) => ({
                date: d,
                label: formatDayLabel(d),
                agenda: sortAgenda({
                    tasks: results[i].tasks || [],
                    notes: results[i].notes || [],
                    meetings: results[i].meetings || [],
                }),
            })));
        } catch (err) {
            console.error('Error fetching month agenda:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch month agenda');
            setMonthAgenda([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (agendaView === 'day') {
            fetchDayAgenda(selectedDate);
        } else if (agendaView === 'week') {
            fetchWeekAgenda(selectedDate);
        } else {
            fetchMonthAgenda(selectedDate);
        }
    }, [selectedDate, agendaView, fetchDayAgenda, fetchWeekAgenda, fetchMonthAgenda]);

    const refetch = useCallback(() => {
        if (agendaView === 'day') {
            fetchDayAgenda(selectedDate);
        } else if (agendaView === 'week') {
            fetchWeekAgenda(selectedDate);
        } else {
            fetchMonthAgenda(selectedDate);
        }
    }, [selectedDate, agendaView, fetchDayAgenda, fetchWeekAgenda, fetchMonthAgenda]);

    const isEmpty = agendaView === 'day'
        ? (agenda.tasks.length === 0 && agenda.notes.length === 0 && agenda.meetings.length === 0)
        : agendaView === 'week'
        ? (weekAgenda.length > 0 && weekAgenda.every(d =>
            d.agenda.tasks.length === 0 && d.agenda.notes.length === 0 && d.agenda.meetings.length === 0
        ))
        : (monthAgenda.length > 0 && monthAgenda.every(d =>
            d.agenda.tasks.length === 0 && d.agenda.notes.length === 0 && d.agenda.meetings.length === 0
        ));

    return {
        agenda,
        weekAgenda,
        monthAgenda,
        loading,
        error,
        isEmpty,
        refetch
    };
};
