import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNotes } from '../../hooks/useNotes';

// Note interface is now imported from useNotes hook

interface NotesWidgetProps {
  className?: string;
  showRecentTasks?: boolean;
}

const NotesWidget: React.FC<NotesWidgetProps> = ({ 
  className = '',
  showRecentTasks = false 
}) => {
  // Use the notes hook for API integration
  const { notes, createNote, updateNote, deleteNote, togglePin } = useNotes();

  const [isAdding, setIsAdding] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingContent, setEditingContent] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const notesListRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const updateMenuPosition = (noteId: string) => {
    const buttonElement = buttonRefs.current[noteId];
    if (buttonElement) {
      const rect = buttonElement.getBoundingClientRect();
      const menuHeight = 120; // Approximate menu height
      const viewportHeight = window.innerHeight;
      
      // Check if menu would be clipped at bottom
      const wouldBeClipped = rect.bottom + menuHeight > viewportHeight;
      
      setMenuPosition({
        top: wouldBeClipped ? rect.top - menuHeight : rect.bottom,
        left: rect.right - 120, // 120px = min-w-[120px]
      });
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, noteId: string) => {
    updateMenuPosition(noteId);
    setMenuOpen(true);
    setSelectedNoteId(noteId);
  };

  // Check scroll position to show/hide scroll indicators
  const checkScrollIndicators = useCallback(() => {
    if (notesListRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = notesListRef.current;

      // Debug logging for investigation
      console.log(`📊 Scroll Metrics (${notes.length} notes):`, {
        scrollTop,
        clientHeight,
        scrollHeight,
        needsScroll: scrollHeight > clientHeight,
        clippedHeight: scrollHeight - clientHeight,
        element: notesListRef.current
      });

      setShowScrollTop(scrollTop > 0);
      setShowScrollBottom(scrollTop < scrollHeight - clientHeight - 5);
    }
  }, [notes.length]);

  // Update menu position on scroll when menu is open + check scroll indicators
  useEffect(() => {
    const scrollElement = notesListRef.current;
    
    const handleScroll = () => {
      if (menuOpen && selectedNoteId) {
        updateMenuPosition(selectedNoteId);
      }
      checkScrollIndicators();
    };
      
    if (scrollElement) {
      // Initial check
      checkScrollIndicators();
      
      scrollElement.addEventListener('scroll', handleScroll);
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, [menuOpen, selectedNoteId, notes.length, checkScrollIndicators]);

  // Debug DOM hierarchy when notes change
  useEffect(() => {
    if (notesListRef.current) {
      const element = notesListRef.current;
      const computed = window.getComputedStyle(element);
      const { scrollTop, scrollHeight, clientHeight } = element;

      console.log(`🔍 DOM State (${notes.length} notes):`, {
        scrollMetrics: {
          scrollTop,
          scrollHeight,
          clientHeight,
          isScrollable: scrollHeight > clientHeight,
          scrollableAmount: scrollHeight - clientHeight,
          isAtBottom: scrollTop >= scrollHeight - clientHeight - 1,
        },
        computedStyles: {
          maxHeight: computed.maxHeight,
          paddingBottom: computed.paddingBottom,
          overflowY: computed.overflowY,
          height: computed.height,
        },
        element,
        parent: element.parentElement,
      });
    }
  }, [notes.length]);


  // Remove the loading state early return - let the component render with empty state

  const handleMenuClose = () => {
    setMenuOpen(false);
    setSelectedNoteId(null);
  };

  const handleAddNote = async () => {
    if (newNoteTitle.trim()) {
      try {
        await createNote({
          title: newNoteTitle.trim(),
          content: '',
          pinned: false
        });
        setNewNoteTitle('');
        setIsAdding(false);
      } catch (error) {
        console.error('Failed to add note:', error);
      }
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await deleteNote(id);
      handleMenuClose();
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const handlePinNote = async (id: string) => {
    try {
      await togglePin(id);
      handleMenuClose();
    } catch (error) {
      console.error('Failed to pin/unpin note:', error);
    }
  };

  const handleEditNote = (id: string) => {
    const noteToEdit = notes.find(note => note._id === id);
    if (noteToEdit) {
      setEditingNoteId(id);
      setEditingTitle(noteToEdit.title);
      setEditingContent(noteToEdit.content);
    }
    handleMenuClose();
  };

  const handleSaveEdit = async () => {
    if (editingNoteId && editingTitle.trim()) {
      try {
        await updateNote(editingNoteId, {
          title: editingTitle.trim(),
          content: editingContent.trim()
        });
        setEditingNoteId(null);
        setEditingTitle('');
        setEditingContent('');
      } catch (error) {
        console.error('Failed to update note:', error);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditingTitle('');
    setEditingContent('');
  };

  // Sort notes by pinned status first, then by creation date
  const sortedNotes = notes.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  return (
    <div className={`pro-glass pro-rounded-lg pro-shadow p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-lg">
          {showRecentTasks ? 'Recent Tasks' : 'Notes'}
        </h3>
        <button 
          onClick={() => setIsAdding(true)}
          className="p-2 text-white/60 hover:text-white pro-button-gradient rounded transition-colors duration-200"
        >
          <span className="text-sm">📝</span>
        </button>
      </div>

      {/* Add New Note */}
      {isAdding && (
        <div className="mb-4 p-3 pro-card-gradient pro-rounded">
          <input
            type="text"
            placeholder="Enter note title..."
            value={newNoteTitle}
            onChange={(e) => setNewNoteTitle(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddNote();
              }
            }}
            className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded text-white placeholder-white/60 focus:outline-none focus:border-white/70 focus:bg-white/20"
          />
          <div className="flex space-x-2 mt-2">
            <button 
              onClick={handleAddNote}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors duration-200"
            >
              Add
            </button>
            <button 
              onClick={() => {
                setIsAdding(false);
                setNewNoteTitle('');
              }}
              className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Edit Note */}
      {editingNoteId && (
        <div className="mb-4 p-3 pro-card-gradient pro-rounded">
          <input
            type="text"
            placeholder="Note title..."
            value={editingTitle}
            onChange={(e) => setEditingTitle(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSaveEdit();
              }
              if (e.key === 'Escape') {
                handleCancelEdit();
              }
            }}
            className="w-full px-3 py-2 mb-2 bg-white/10 border border-white/30 rounded text-white placeholder-white/60 focus:outline-none focus:border-white/70 focus:bg-white/20"
            autoFocus
          />
          <textarea
            placeholder="Note content..."
            value={editingContent}
            onChange={(e) => setEditingContent(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                e.preventDefault();
                handleSaveEdit();
              }
              if (e.key === 'Escape') {
                handleCancelEdit();
              }
            }}
            rows={3}
            className="w-full px-3 py-2 mb-2 bg-white/10 border border-white/30 rounded text-white placeholder-white/60 focus:outline-none focus:border-white/70 focus:bg-white/20 resize-none"
          />
          <div className="flex space-x-2">
            <button 
              onClick={handleSaveEdit}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors duration-200"
            >
              Save
            </button>
            <button 
              onClick={handleCancelEdit}
              className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Notes List */}
      <div
        ref={notesListRef}
        className="space-y-3 max-h-64 md:max-h-80 overflow-y-auto scrollbar-hide relative pb-4 md:pb-8 overscroll-contain"
      >
        {sortedNotes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-white/60 text-sm">No notes yet</p>
            <p className="text-white/40 text-xs mt-1">Click + to add your first note</p>
          </div>
        ) : (
          sortedNotes.map((note, index) => (
            <div
              key={note._id}
              className={`p-3 pro-card-gradient pro-rounded group transition-all duration-300 cursor-pointer relative ${
                menuOpen && selectedNoteId === note._id ? '' : 'hover:scale-[1.01]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    {note.pinned && (
                      <span className="text-yellow-400 text-xs">📌</span>
                    )}
                    <h4 className="text-white font-medium text-sm">
                      {note.title}
                    </h4>
                  </div>
                  {note.content && (
                    <p className="text-white/70 text-xs leading-relaxed">
                      {note.content}
                    </p>
                  )}
                </div>
                <button
                  ref={(el) => buttonRefs.current[note._id] = el}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (menuOpen && selectedNoteId === note._id) {
                      handleMenuClose();
                    } else {
                      handleMenuClick(e, note._id);
                    }
                  }}
                  className="p-1 text-white/40 hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-300 rounded"
                >
                  <span className="text-sm">⋮</span>
                </button>
              </div>

            </div>
          ))
        )}
        
        {/* Scroll Indicators */}
        {showScrollTop && (
          <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-gray-800/60 to-transparent pointer-events-none z-10 rounded-t-lg" />
        )}
        {showScrollBottom && (
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-gray-800/60 to-transparent pointer-events-none z-10 rounded-b-lg" />
        )}
      </div>

      {/* Bottom Section */}
      <div className="flex justify-between items-center mt-4 pt-3 border-t border-white/10">
        <button className="text-white/60 hover:text-white text-sm transition-colors duration-200">
          recent tasks
        </button>
        <button className="text-white/60 hover:text-white text-sm transition-colors duration-200">
          notes
        </button>
      </div>

      {/* Portal for Context Menu */}
      {menuOpen && selectedNoteId && createPortal(
        <>
          {/* Click outside to close menu */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={handleMenuClose}
          />
          {/* Context Menu */}
          <div 
            className="fixed bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-white/10 shadow-xl z-50 min-w-[120px]"
            style={{
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`,
            }}
          >
            <button 
              onClick={() => selectedNoteId && handlePinNote(selectedNoteId)}
              className="w-full px-3 py-2 text-left text-white hover:bg-white/10 transition-colors duration-200 flex items-center text-sm rounded-t-lg"
            >
              <span className="mr-2 text-xs">📌</span>
              {notes.find(n => n._id === selectedNoteId)?.pinned ? 'Unpin' : 'Pin'} Note
            </button>
            <button 
              onClick={() => selectedNoteId && handleEditNote(selectedNoteId)}
              className="w-full px-3 py-2 text-left text-white hover:bg-white/10 transition-colors duration-200 flex items-center text-sm"
            >
              <span className="mr-2 text-xs">✏️</span>
              Edit Note
            </button>
            <button 
              onClick={() => selectedNoteId && handleDeleteNote(selectedNoteId)}
              className="w-full px-3 py-2 text-left text-red-300 hover:bg-red-500/10 transition-colors duration-200 flex items-center text-sm rounded-b-lg"
            >
              <span className="mr-2 text-xs">🗑️</span>
              Delete Note
            </button>
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

export default NotesWidget;