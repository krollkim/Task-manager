'use client';

import { useState, useCallback, useEffect } from 'react';

/**
 * useSearch Hook
 * TODO: Implement with Zustand store and debounced axios
 *
 * Performs global search across tasks, notes, meetings, and messages
 * Includes debouncing to prevent excessive API calls
 *
 * Usage:
 * const { results, loading, search } = useSearch();
 * search('my query');
 */

export interface SearchResults {
  tasks: any[];
  notes: any[];
  meetings: any[];
  messages: any[];
}

const DEBOUNCE_DELAY = 300;
const MIN_QUERY_LENGTH = 2;

export function useSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults>({
    tasks: [],
    notes: [],
    meetings: [],
    messages: [],
  });
  const [loading, setLoading] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // TODO: Integrate with Zustand store
  // const { searchResults, setSearchResults } = useAppStore();

  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (searchQuery.length < MIN_QUERY_LENGTH) {
        setResults({
          tasks: [],
          notes: [],
          meetings: [],
          messages: [],
        });
        return;
      }

      setLoading(true);
      try {
        // TODO: Implement API call
        // const response = await axios.get('/api/search', {
        //   params: {
        //     q: searchQuery,
        //     limit: 20,
        //   },
        // });
        // setResults(response.data);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const search = useCallback(
    (newQuery: string) => {
      setQuery(newQuery);

      // Clear previous debounce timer
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      // Set new debounce timer
      const timer = setTimeout(() => {
        performSearch(newQuery);
      }, DEBOUNCE_DELAY);

      setDebounceTimer(timer);
    },
    [debounceTimer, performSearch]
  );

  return {
    query,
    results,
    loading,
    search,
  };
}
