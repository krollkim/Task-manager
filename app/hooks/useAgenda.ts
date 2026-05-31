'use client';

import { useState, useEffect } from 'react';

/**
 * useAgenda Hook
 * TODO: Implement with Zustand store and axios
 *
 * Fetches agenda data for day/week/month views
 * Supports multiple view modes and automatic refetch
 *
 * Usage:
 * const { agenda, loading, isEmpty, refetch } = useAgenda(selectedDate, 'day');
 */

export interface AgendaData {
  meetings: any[];
  tasks: any[];
  notes: any[];
}

export function useAgenda(selectedDate: Date, view: 'day' | 'week' | 'month' = 'day') {
  const [agenda, setAgenda] = useState<AgendaData>({
    meetings: [],
    tasks: [],
    notes: [],
  });
  const [loading, setLoading] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  // TODO: Integrate with Zustand store
  // const { agenda: storedAgenda, setAgenda } = useAppStore();

  const refetch = async () => {
    setLoading(true);
    try {
      // TODO: Implement API call based on view
      // const response = await axios.get(`/api/agenda/${view}`, {
      //   params: {
      //     date: selectedDate.toISOString(),
      //     year: view === 'month' ? selectedDate.getFullYear() : undefined,
      //     month: view === 'month' ? selectedDate.getMonth() + 1 : undefined,
      //   },
      // });
      // setAgenda(response.data);
      // setIsEmpty(response.data.meetings.length === 0 && ...);
    } catch (error) {
      console.error('Failed to fetch agenda:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, [selectedDate, view]);

  return {
    agenda,
    loading,
    isEmpty,
    refetch,
  };
}
