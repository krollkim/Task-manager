import React, { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useSearch } from '../../hooks/useSearch';
import { staggerEnter, modalEnter } from '../../lib/animations';
import {
  Task,
  Note,
  Meeting,
  ChatMessage,
  SearchResultTask,
  SearchResultNote,
  SearchResultMeeting,
  SearchResultMessage,
} from '../../types/types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTask: (task: Task) => void;
  onOpenNote: (note: Note) => void;
  onOpenMeeting: (meeting: Meeting) => void;
  onOpenChat: () => void;
}

const ICONS: Record<string, string> = {
  task: '📋',
  note: '📝',
  meeting: '📅',
  message: '💬',
};

const LABELS: Record<string, string> = {
  task: 'Tasks',
  note: 'Notes',
  meeting: 'Meetings',
  message: 'Messages',
};

function getTitle(item: SearchResultTask | SearchResultNote | SearchResultMeeting | SearchResultMessage): string {
  if (item.type === 'task') return (item as SearchResultTask).task;
  if (item.type === 'note') return (item as SearchResultNote).title;
  if (item.type === 'meeting') return (item as SearchResultMeeting).title;
  if (item.type === 'message') return (item as SearchResultMessage).senderName;
  return '';
}

const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onOpenTask,
  onOpenNote,
  onOpenMeeting,
  onOpenChat,
}) => {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const searchQuery = useAppStore((s) => s.searchQuery);
  const setSearchQuery = useAppStore((s) => s.setSearchQuery);
  const searchResults = useAppStore((s) => s.searchResults);
  const searchLoading = useAppStore((s) => s.searchLoading);

  // Wire the debounced search effect
  useSearch();

  // Clear any stale query on mount (guards against crash-loop from leftover store state)
  useEffect(() => {
    setSearchQuery('');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Animate panel in on open; clear query on close
  useEffect(() => {
    if (isOpen && panelRef.current) {
      modalEnter(panelRef.current);
      inputRef.current?.focus();
    }
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen, setSearchQuery]);

  // Stagger animate results when they change
  useEffect(() => {
    if (!resultsRef.current || !searchResults) return;
    const items = Array.from(resultsRef.current.querySelectorAll('[data-result-item]'));
    if (items.length > 0) staggerEnter(items);
  }, [searchResults]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  const handleResultClick = (
    item: SearchResultTask | SearchResultNote | SearchResultMeeting | SearchResultMessage
  ) => {
    onClose();
    if (item.type === 'task') onOpenTask(item as unknown as Task);
    else if (item.type === 'note') onOpenNote(item as unknown as Note);
    else if (item.type === 'meeting') onOpenMeeting(item as unknown as Meeting);
    else if (item.type === 'message') onOpenChat();
  };

  if (!isOpen) return null;

  type SectionKey = 'tasks' | 'notes' | 'meetings' | 'messages';
  type ResultItem = SearchResultTask | SearchResultNote | SearchResultMeeting | SearchResultMessage;

  const sections: Array<{ key: SectionKey; items: ResultItem[] }> = searchResults
    ? (
        [
          { key: 'tasks' as SectionKey, items: (searchResults.tasks ?? []) as ResultItem[] },
          { key: 'notes' as SectionKey, items: (searchResults.notes ?? []) as ResultItem[] },
          { key: 'meetings' as SectionKey, items: (searchResults.meetings ?? []) as ResultItem[] },
          { key: 'messages' as SectionKey, items: (searchResults.messages ?? []) as ResultItem[] },
        ] as Array<{ key: SectionKey; items: ResultItem[] }>
      ).filter((s) => s.items.length > 0)
    : [];

  const hasResults = sections.some((s) => s.items.length > 0);

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      {/* Panel */}
      <div
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        style={{
          background: 'rgba(10,14,28,0.96)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
        }}
        className="w-full max-w-xl flex flex-col overflow-hidden"
      >
        {/* Search input row */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.07]">
          <span className="text-white/30 text-lg">⌕</span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search tasks, notes, meetings, messages…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-white/90 text-sm placeholder-white/25 focus:outline-none"
          />
          {searchLoading && (
            <span className="text-white/30 text-xs animate-pulse">searching…</span>
          )}
          <kbd
            className="hidden sm:flex items-center px-1.5 py-0.5 rounded text-[10px] text-white/25"
            style={{ border: '1px solid rgba(255,255,255,0.12)' }}
          >
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div
          ref={resultsRef}
          className="max-h-[60vh] overflow-y-auto py-2"
        >
          {!searchQuery || searchQuery.length < 2 ? (
            <p className="px-4 py-6 text-center text-white/25 text-sm">
              Type at least 2 characters to search
            </p>
          ) : !hasResults && !searchLoading ? (
            <p className="px-4 py-6 text-center text-white/25 text-sm">
              No results for "{searchQuery}"
            </p>
          ) : (
            sections.map(({ key, items }) => (
              <div key={key} className="mb-1">
                {/* Section header */}
                <div className="px-4 pt-3 pb-1 flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-widest text-white/25">
                    {LABELS[key.slice(0, -1)]}
                  </span>
                  <span className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
                  <span className="text-[10px] text-white/20">{items.length}</span>
                </div>

                {/* Result rows */}
                {items.map((item) => (
                  <button
                    key={item._id}
                    data-result-item
                    onClick={() => handleResultClick(item)}
                    className="w-full flex items-start gap-3 px-4 py-2.5 text-left transition-colors hover:bg-white/[0.05] focus:outline-none focus:bg-white/[0.05]"
                  >
                    <span className="text-base mt-0.5 shrink-0">{ICONS[item.type]}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-white/85 text-sm font-medium truncate">
                        {getTitle(item)}
                      </p>
                      {item.snippet && (
                        <p className="text-white/35 text-xs truncate mt-0.5">
                          {item.snippet}
                        </p>
                      )}
                    </div>
                    <span
                      className="shrink-0 mt-0.5 text-[10px] px-1.5 py-0.5 rounded-full text-white/30"
                      style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      {item.type}
                    </span>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2 border-t border-white/[0.05] flex items-center gap-4">
          <span className="text-[10px] text-white/20">↵ open</span>
          <span className="text-[10px] text-white/20">ESC close</span>
          <span className="ml-auto text-[10px] text-white/15">Cmd+K · Ctrl+Q</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
