import React, { useState } from 'react';
import { 
  NoteAddOutlined, 
  MoreVertOutlined,
  EditOutlined,
  DeleteOutlined,
  PushPinOutlined 
} from '@mui/icons-material';
import { IconButton, Menu, MenuItem, TextField } from '@mui/material';
import '../../dashboard.css';

interface Note {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  createdAt: Date;
}

interface NotesWidgetProps {
  className?: string;
  showRecentTasks?: boolean;
}

const NotesWidget: React.FC<NotesWidgetProps> = ({ 
  className = '',
  showRecentTasks = false 
}) => {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      title: 'Meeting Notes',
      content: 'Discuss project timeline and deliverables',
      pinned: true,
      createdAt: new Date()
    },
    {
      id: '2', 
      title: 'Ideas',
      content: 'New feature concepts for the dashboard',
      pinned: false,
      createdAt: new Date()
    }
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, noteId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedNoteId(noteId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedNoteId(null);
  };

  const handleAddNote = () => {
    if (newNoteTitle.trim()) {
      const newNote: Note = {
        id: Date.now().toString(),
        title: newNoteTitle,
        content: '',
        pinned: false,
        createdAt: new Date()
      };
      setNotes([newNote, ...notes]);
      setNewNoteTitle('');
      setIsAdding(false);
    }
  };

  const handlePinNote = (noteId: string) => {
    setNotes(notes.map(note => 
      note.id === noteId ? { ...note, pinned: !note.pinned } : note
    ));
    handleMenuClose();
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes(notes.filter(note => note.id !== noteId));
    handleMenuClose();
  };

  const sortedNotes = [...notes].sort((a, b) => {
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
        <IconButton 
          onClick={() => setIsAdding(true)}
          className="text-white/60 hover:text-white pro-button-gradient pro-rounded"
          size="small"
        >
          <NoteAddOutlined fontSize="small" />
        </IconButton>
      </div>

      {/* Add New Note */}
      {isAdding && (
        <div className="mb-4 p-3 pro-card-gradient pro-rounded">
          <TextField
            fullWidth
            placeholder="Enter note title..."
            value={newNoteTitle}
            onChange={(e) => setNewNoteTitle(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddNote();
              }
            }}
            size="small"
            InputProps={{
              style: { color: 'white' },
              className: 'text-white placeholder-white/60'
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                '&.Mui-focused fieldset': { borderColor: 'rgba(255,255,255,0.7)' }
              }
            }}
          />
          <div className="flex space-x-2 mt-2">
            <button 
              onClick={handleAddNote}
              className="px-4 py-1 pro-button-gradient pro-rounded text-white text-sm hover:scale-105 transition-transform duration-200"
            >
              Save
            </button>
            <button 
              onClick={() => {
                setIsAdding(false);
                setNewNoteTitle('');
              }}
              className="px-4 py-1 text-white/60 text-sm hover:text-white transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Notes List */}
      <div className="space-y-3 max-h-64 overflow-y-auto pro-scrollbar">
        {sortedNotes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-white/60 text-sm">No notes yet</p>
            <p className="text-white/40 text-xs mt-1">Click + to add your first note</p>
          </div>
        ) : (
          sortedNotes.map((note) => (
            <div 
              key={note.id}
              className="p-3 pro-card-gradient pro-rounded group hover:scale-[1.02] transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    {note.pinned && (
                      <PushPinOutlined 
                        className="text-yellow-400" 
                        sx={{ fontSize: 14 }} 
                      />
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
                <IconButton
                  onClick={(e) => handleMenuClick(e, note.id)}
                  className="text-white/40 hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-200"
                  size="small"
                >
                  <MoreVertOutlined fontSize="small" />
                </IconButton>
              </div>
            </div>
          ))
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

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          className: 'pro-button-gradient pro-rounded border border-white/10',
          style: { marginTop: 8 }
        }}
      >
        <MenuItem 
          onClick={() => selectedNoteId && handlePinNote(selectedNoteId)}
          className="text-white hover:bg-white/10"
        >
          <PushPinOutlined className="mr-2" fontSize="small" />
          {selectedNoteId && notes.find(n => n.id === selectedNoteId)?.pinned ? 'Unpin' : 'Pin'} Note
        </MenuItem>
        <MenuItem 
          onClick={() => handleMenuClose()}
          className="text-white hover:bg-white/10"
        >
          <EditOutlined className="mr-2" fontSize="small" />
          Edit Note
        </MenuItem>
        <MenuItem 
          onClick={() => selectedNoteId && handleDeleteNote(selectedNoteId)}
          className="text-red-300 hover:bg-red-500/10"
        >
          <DeleteOutlined className="mr-2" fontSize="small" />
          Delete Note
        </MenuItem>
      </Menu>
    </div>
  );
};

export default NotesWidget; 