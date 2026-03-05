import { useState, useEffect } from 'react';

export type ViewMode = 'cards' | 'list';
export type ListDensity = 'comfortable' | 'compact';

interface ViewPreference {
  viewMode: ViewMode;
  listDensity: ListDensity;
}

const STORAGE_KEY = 'taskViewPreference';
const DEFAULT_VIEW: ViewPreference = {
  viewMode: 'cards',
  listDensity: 'comfortable'
};

/**
 * Hook for managing task view preferences
 * - Persists to localStorage
 * - Supports URL override (?view=list|cards)
 * - Widget-ready: can be generalized for any dashboard widget
 */
export const useViewPreference = () => {
  const [viewMode, setViewModeState] = useState<ViewMode>(DEFAULT_VIEW.viewMode);
  const [listDensity, setListDensityState] = useState<ListDensity>(DEFAULT_VIEW.listDensity);

  // Initialize from localStorage + URL override
  useEffect(() => {
    // Check URL params first (highest priority)
    const urlParams = new URLSearchParams(window.location.search);
    const urlView = urlParams.get('view') as ViewMode | null;

    if (urlView === 'list' || urlView === 'cards') {
      setViewModeState(urlView);
      return; // URL override takes precedence, don't read from storage
    }

    // Fall back to localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: ViewPreference = JSON.parse(stored);
        setViewModeState(parsed.viewMode || DEFAULT_VIEW.viewMode);
        setListDensityState(parsed.listDensity || DEFAULT_VIEW.listDensity);
      }
    } catch (error) {
      console.warn('Failed to load view preference:', error);
      // Use defaults on error
    }
  }, []);

  // Persist to localStorage when changed
  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
    try {
      const current = localStorage.getItem(STORAGE_KEY);
      const parsed: ViewPreference = current ? JSON.parse(current) : DEFAULT_VIEW;
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        ...parsed,
        viewMode: mode
      }));
    } catch (error) {
      console.warn('Failed to save view mode:', error);
    }
  };

  const setListDensity = (density: ListDensity) => {
    setListDensityState(density);
    try {
      const current = localStorage.getItem(STORAGE_KEY);
      const parsed: ViewPreference = current ? JSON.parse(current) : DEFAULT_VIEW;
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        ...parsed,
        listDensity: density
      }));
    } catch (error) {
      console.warn('Failed to save list density:', error);
    }
  };

  return {
    viewMode,
    listDensity,
    setViewMode,
    setListDensity
  };
};
