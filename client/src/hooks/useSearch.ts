import { useEffect, useRef } from 'react';
import axios from 'axios';
import { useAppStore } from '../store/useAppStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001',
  withCredentials: true,
});

const DEBOUNCE_MS = 300;
const MIN_CHARS = 2;

export function useSearch() {
  const searchQuery = useAppStore((s) => s.searchQuery);
  const setSearchResults = useAppStore((s) => s.setSearchResults);
  const setSearchLoading = useAppStore((s) => s.setSearchLoading);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (searchQuery.length < MIN_CHARS) {
      setSearchResults(null);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);

    timerRef.current = setTimeout(async () => {
      try {
        const { data } = await api.get('/search', {
          params: { q: searchQuery, types: 'tasks,notes,meetings,messages', limit: 20 },
        });
        setSearchResults(data);
      } catch {
        setSearchResults(null);
      } finally {
        setSearchLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [searchQuery, setSearchResults, setSearchLoading]);
}
