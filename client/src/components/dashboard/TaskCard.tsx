import React from 'react';
import { createPortal } from 'react-dom';
import { Task } from '../../types/types';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: Task['status']) => void;
  onQuickUpdate?: (id: string, updates: Partial<Task>) => void;
  className?: string;
}

const PRIORITIES: Task['priority'][] = ['low', 'medium', 'high', 'urgent'];

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  onQuickUpdate,
  className = ''
}) => {
  // Action menu state
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [menuPosition, setMenuPosition] = React.useState({ top: 0, left: 0 });
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const open = Boolean(anchorEl);

  // Chip popup state
  const [priorityMenuOpen, setPriorityMenuOpen] = React.useState(false);
  const [priorityMenuPos, setPriorityMenuPos] = React.useState({ top: 0, left: 0 });
  const [datePickerOpen, setDatePickerOpen] = React.useState(false);
  const [datePickerPos, setDatePickerPos] = React.useState({ top: 0, left: 0 });

  const updateMenuPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const menuHeight = 200;
      const menuWidth = 160;
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      const wouldBeClippedBottom = rect.bottom + menuHeight > viewportHeight;
      const wouldBeClippedRight = rect.right > viewportWidth - menuWidth;

      setMenuPosition({
        top: wouldBeClippedBottom ? rect.top - menuHeight : rect.bottom,
        left: wouldBeClippedRight ? rect.right - menuWidth : rect.left,
      });
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setPriorityMenuOpen(false);
    setDatePickerOpen(false);
    updateMenuPosition();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Update menu position on scroll
  React.useEffect(() => {
    const handleScroll = () => {
      if (open) {
        updateMenuPosition();
      }
    };

    if (open) {
      window.addEventListener('scroll', handleScroll, true);
      return () => window.removeEventListener('scroll', handleScroll, true);
    }
  }, [open]);

  // Close any popup on Escape
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (priorityMenuOpen) setPriorityMenuOpen(false);
        else if (datePickerOpen) setDatePickerOpen(false);
        else if (open) handleClose();
      }
    };

    if (open || priorityMenuOpen || datePickerOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, priorityMenuOpen, datePickerOpen]);

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'done':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'in-progress':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    }
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'done':
        return <span className="text-green-400 text-xl">✅</span>;
      case 'in-progress':
        return <span className="text-yellow-400 text-xl">⏳</span>;
      default:
        return <span className="text-white/60 text-xl">⭕</span>;
    }
  };

  const handleStatusToggle = () => {
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    onStatusChange?.(task._id, newStatus);
  };

  const handleStatusChange = (newStatus: Task['status']) => {
    onStatusChange?.(task._id, newStatus);
    handleClose();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getPriorityColor = (priority?: Task['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityChipStyle = (priority?: Task['priority']) => {
    switch (priority) {
      case 'urgent': return 'border-red-500/30 text-red-300 bg-red-500/10 hover:border-red-500/50';
      case 'high': return 'border-orange-500/30 text-orange-300 bg-orange-500/10 hover:border-orange-500/50';
      case 'medium': return 'border-yellow-500/30 text-yellow-300 bg-yellow-500/10 hover:border-yellow-500/50';
      case 'low': return 'border-blue-500/30 text-blue-300 bg-blue-500/10 hover:border-blue-500/50';
      default: return 'border-white/10 text-white/60 hover:border-white/30';
    }
  };

  const getPriorityLabel = (priority?: Task['priority']) => {
    return priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : 'Medium';
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today;
  };

  // Priority chip handlers
  const handlePriorityChipClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAnchorEl(null);
    setDatePickerOpen(false);
    const rect = e.currentTarget.getBoundingClientRect();
    setPriorityMenuPos({
      top: rect.bottom + 160 > window.innerHeight ? rect.top - 160 : rect.bottom + 4,
      left: rect.left + 140 > window.innerWidth ? rect.right - 140 : rect.left,
    });
    setPriorityMenuOpen(!priorityMenuOpen);
  };

  const handlePriorityChange = (newPriority: Task['priority']) => {
    onQuickUpdate?.(task._id, { priority: newPriority });
    setPriorityMenuOpen(false);
  };

  // Due date chip handlers
  const handleDateChipClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAnchorEl(null);
    setPriorityMenuOpen(false);
    const rect = e.currentTarget.getBoundingClientRect();
    setDatePickerPos({
      top: rect.bottom + 60 > window.innerHeight ? rect.top - 60 : rect.bottom + 4,
      left: rect.left + 220 > window.innerWidth ? rect.right - 220 : rect.left,
    });
    setDatePickerOpen(!datePickerOpen);
  };

  const handleDateChange = (newDate: string) => {
    onQuickUpdate?.(task._id, { dueDate: newDate || undefined });
    setDatePickerOpen(false);
  };

  return (
    <div className={`
      bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-lg
      p-5 transition-all duration-500 ease-out hover:scale-[1.03] hover:shadow-2xl
      hover:shadow-white/5 hover:-translate-y-1
      relative group cursor-pointer
      ${task.status === 'done' ? 'opacity-90 hover:opacity-100' : ''}
      ${className}
    `}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3 flex-1">
          <button
            onClick={handleStatusToggle}
            className="flex-shrink-0 hover:scale-125 active:scale-95 transition-all duration-300
                       hover:drop-shadow-lg active:animate-bounce-subtle
                       focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2
                       focus:ring-offset-transparent rounded-full p-1"
          >
            {getStatusIcon(task.status)}
          </button>
          <h3 className={`
            text-white font-semibold text-lg leading-tight flex-1 transition-all duration-500
            hover:text-white/90 group-hover:translate-x-1
            ${task.status === 'done' ? 'line-through opacity-75 text-green-200' : ''}
          `}>
            {task.task}
          </h3>
        </div>

        <button
          ref={buttonRef}
          onClick={handleClick}
          className="text-white/60 hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-200 p-2 rounded-full hover:bg-white/10"
        >
          <span className="text-xl">⋮</span>
        </button>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-white/80 text-sm mb-4 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className={`
            ${getStatusColor(task.status)}
            border font-medium text-xs capitalize transition-all duration-300
            hover:scale-105 hover:shadow-lg cursor-pointer px-2 py-1 rounded-full
            ${task.status === 'done' ? 'animate-pulse-slow' : ''}
          `}>
            {task.status.replace('-', ' ')}
          </span>
          {/* Priority chip */}
          <button
            onClick={handlePriorityChipClick}
            className={`flex items-center space-x-1.5 px-2 py-0.5 rounded-full border text-xs transition-colors ${getPriorityChipStyle(task.priority)}`}
          >
            <span className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)} flex-shrink-0`} />
            <span>{getPriorityLabel(task.priority)}</span>
          </button>
        </div>

        <div className="flex items-center space-x-2 text-white/60 text-xs">
          {/* Due date chip — always visible */}
          <button
            onClick={handleDateChipClick}
            className={`flex items-center space-x-1 px-1.5 py-0.5 rounded-full border transition-colors ${
              task.dueDate
                ? isOverdue(task.dueDate) && task.status !== 'done'
                  ? 'border-red-500/40 text-red-300 bg-red-500/10 hover:border-red-500/60'
                  : 'border-white/10 text-white/60 hover:border-white/30'
                : 'border-dashed border-white/20 text-white/40 hover:border-white/40 hover:text-white/60'
            }`}
          >
            {task.dueDate ? (
              <>
                <span className="text-[10px]">{isOverdue(task.dueDate) && task.status !== 'done' ? '⚠' : '📅'}</span>
                <span>Due {formatDate(task.dueDate)}</span>
              </>
            ) : (
              <>
                <span className="text-[10px]">📅</span>
                <span>Add due</span>
              </>
            )}
          </button>
          <span className="flex items-center space-x-1">
            <span className="text-sm">🕒</span>
            <span>{formatDate(task.createdAt)}</span>
          </span>
        </div>
      </div>

      {/* Portal for Action Menu */}
      {open && createPortal(
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={handleClose}
          />
          <div
            className="fixed bg-slate-800/95 backdrop-blur-sm rounded-xl border border-white/10 shadow-xl z-50 min-w-[160px]"
            style={{
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`,
            }}
          >
            <button
              onClick={() => handleStatusChange('todo')}
              className={`w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors duration-200 rounded-t-xl flex items-center ${
                task.status === 'todo' ? 'bg-white/5' : ''
              }`}
            >
              <span className="mr-2 text-blue-400">⭕</span>
              To Do
            </button>
            <button
              onClick={() => handleStatusChange('in-progress')}
              className={`w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors duration-200 flex items-center ${
                task.status === 'in-progress' ? 'bg-white/5' : ''
              }`}
            >
              <span className="mr-2 text-yellow-400">⏳</span>
              In Progress
            </button>
            <button
              onClick={() => handleStatusChange('done')}
              className={`w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors duration-200 flex items-center ${
                task.status === 'done' ? 'bg-white/5' : ''
              }`}
            >
              <span className="mr-2 text-green-400">✅</span>
              Done
            </button>

            <div className="border-t border-white/10 my-1" />

            <button
              onClick={() => {
                onEdit?.(task);
                handleClose();
              }}
              className="w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors duration-200 flex items-center"
            >
              <span className="mr-2">✏️</span>
              Edit Task
            </button>
            <button
              onClick={() => {
                onDelete?.(task._id);
                handleClose();
              }}
              className="w-full px-4 py-2 text-left text-red-300 hover:bg-red-500/10 transition-colors duration-200 rounded-b-xl flex items-center"
            >
              <span className="mr-2">🗑️</span>
              Delete Task
            </button>
          </div>
        </>,
        document.body
      )}

      {/* Portal for Priority Quick-Change */}
      {priorityMenuOpen && createPortal(
        <>
          <div className="fixed inset-0 z-40" onClick={() => setPriorityMenuOpen(false)} />
          <div
            className="fixed bg-slate-800/95 backdrop-blur-sm rounded-xl border border-white/10 shadow-xl z-50 min-w-[140px] py-1"
            style={{ top: `${priorityMenuPos.top}px`, left: `${priorityMenuPos.left}px` }}
          >
            {PRIORITIES.map((p) => (
              <button
                key={p}
                onClick={() => handlePriorityChange(p)}
                className={`w-full px-3 py-1.5 text-left text-sm text-white hover:bg-white/10 transition-colors flex items-center space-x-2 ${
                  (task.priority || 'medium') === p ? 'bg-white/5' : ''
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${getPriorityColor(p)}`} />
                <span>{getPriorityLabel(p)}</span>
              </button>
            ))}
          </div>
        </>,
        document.body
      )}

      {/* Portal for Due Date Quick-Change */}
      {datePickerOpen && createPortal(
        <>
          <div className="fixed inset-0 z-40" onClick={() => setDatePickerOpen(false)} />
          <div
            className="fixed bg-slate-800/95 backdrop-blur-sm rounded-xl border border-white/10 shadow-xl z-50 p-3"
            style={{ top: `${datePickerPos.top}px`, left: `${datePickerPos.left}px` }}
          >
            <input
              type="date"
              defaultValue={task.dueDate?.split('T')[0] || ''}
              onChange={(e) => handleDateChange(e.target.value)}
              className="px-2 py-1.5 bg-slate-700 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-white/50"
              autoFocus
            />
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

export default TaskCard;
