import React from 'react';
import { createPortal } from 'react-dom';
import { Task } from '../../types/types';
import { ListDensity } from '../../hooks/useViewPreference';

interface TaskListItemProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: Task['status']) => void;
  onQuickUpdate?: (id: string, updates: Partial<Task>) => void;
  density: ListDensity;
}

const PRIORITIES: Task['priority'][] = ['low', 'medium', 'high', 'urgent'];

const TaskListItem: React.FC<TaskListItemProps> = ({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  onQuickUpdate,
  density
}) => {
  const [priorityMenuOpen, setPriorityMenuOpen] = React.useState(false);
  const [priorityMenuPos, setPriorityMenuPos] = React.useState({ top: 0, left: 0 });
  const [datePickerOpen, setDatePickerOpen] = React.useState(false);
  const [datePickerPos, setDatePickerPos] = React.useState({ top: 0, left: 0 });

  // Close chip popups on Escape
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (priorityMenuOpen) setPriorityMenuOpen(false);
        else if (datePickerOpen) setDatePickerOpen(false);
      }
    };
    if (priorityMenuOpen || datePickerOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [priorityMenuOpen, datePickerOpen]);

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'done':        return <span className="text-green-400 text-lg">✅</span>;
      case 'in-progress': return <span className="text-yellow-400 text-lg">⏳</span>;
      default:            return <span className="text-white/60 text-lg">⭕</span>;
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'done':        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'in-progress': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default:            return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    }
  };

  // Cycle: todo → in-progress → done → todo
  const handleStatusToggle = () => {
    const next: Record<Task['status'], Task['status']> = {
      'todo': 'in-progress',
      'in-progress': 'done',
      'done': 'todo',
    };
    onStatusChange?.(task._id, next[task.status]);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getPriorityColor = (priority?: Task['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high':   return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low':    return 'bg-blue-500';
      default:       return 'bg-gray-500';
    }
  };

  const getPriorityChipStyle = (priority?: Task['priority']) => {
    switch (priority) {
      case 'urgent': return 'border-red-500/30 text-red-300 bg-red-500/10 hover:border-red-500/50';
      case 'high':   return 'border-orange-500/30 text-orange-300 bg-orange-500/10 hover:border-orange-500/50';
      case 'medium': return 'border-yellow-500/30 text-yellow-300 bg-yellow-500/10 hover:border-yellow-500/50';
      case 'low':    return 'border-blue-500/30 text-blue-300 bg-blue-500/10 hover:border-blue-500/50';
      default:       return 'border-white/10 text-white/60 hover:border-white/30';
    }
  };

  // Pass 3: priority-driven card glow — cleared when done
  const getPriorityCardStyle = () => {
    if (task.status === 'done') return '';
    switch (task.priority) {
      case 'urgent': return 'shadow-[0_0_10px_rgba(220,38,38,0.35)] border-red-500/40';
      case 'high':   return 'shadow-[0_0_10px_rgba(249,115,22,0.3)] border-orange-500/35';
      case 'medium': return 'shadow-[0_0_8px_rgba(96,165,250,0.25)] border-blue-400/30';
      default:       return '';
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

  const handlePriorityChipClick = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handleDateChipClick = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const isCompact = density === 'compact';

  // Pass 2: shared inline action buttons
  const InlineActions = ({ alwaysVisible = false }: { alwaysVisible?: boolean }) => (
    <div className={`flex items-center space-x-0.5 transition-all duration-300 ${
      alwaysVisible ? '' : 'opacity-0 group-hover:opacity-100'
    }`}>
      <button
        onClick={(e) => { e.stopPropagation(); handleStatusToggle(); }}
        title="Advance status"
        className="p-1.5 rounded-lg text-green-400/70 hover:text-green-300 hover:bg-green-500/10 transition-colors duration-200"
      >
        <span className="text-xs">✓</span>
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onEdit?.(task); }}
        title="Edit"
        className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors duration-200"
      >
        <span className="text-xs">✏️</span>
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete?.(task._id); }}
        title="Delete"
        className="p-1.5 rounded-lg text-red-400/50 hover:text-red-300 hover:bg-red-500/10 transition-colors duration-200"
      >
        <span className="text-xs">🗑️</span>
      </button>
    </div>
  );

  return (
    <div
      className={`
        group relative
        task-glass rounded-lg
        transition-all duration-300 ease-out
        hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.12)]
        ${getPriorityCardStyle()}
        ${isCompact ? 'py-2 px-4' : 'py-3 px-5'}
      `}
    >
      {/* Desktop Layout: Single Row */}
      <div className="hidden md:grid md:grid-cols-12 md:gap-4 md:items-center">
        {/* Status Icon */}
        <div className="col-span-1">
          <button
            onClick={handleStatusToggle}
            className="flex-shrink-0 hover:scale-110 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-white/20 rounded-full p-1"
            aria-label={`Status: ${task.status} — click to advance`}
          >
            {getStatusIcon(task.status)}
          </button>
        </div>

        {/* Priority Chip + Title */}
        <div className="col-span-4 flex items-center space-x-2 min-w-0">
          <button
            onClick={handlePriorityChipClick}
            className={`flex items-center space-x-1 px-1.5 py-0.5 rounded-full border text-[11px] transition-colors flex-shrink-0 ${getPriorityChipStyle(task.priority)}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${getPriorityColor(task.priority)}`} />
            <span>{getPriorityLabel(task.priority)}</span>
          </button>
          <h4
            className={`
              text-white font-semibold truncate
              ${isCompact ? 'text-sm' : 'text-base'}
              ${task.status === 'done' ? 'line-through text-white/35' : ''}
            `}
            title={task.task}
          >
            {task.task}
          </h4>
        </div>

        {/* Description */}
        {!isCompact && (
          <div className="col-span-2">
            <p className="text-white/50 text-sm truncate" title={task.description}>
              {task.description || '\u2014'}
            </p>
          </div>
        )}

        {/* Status Badge */}
        <div className={isCompact ? 'col-span-3' : 'col-span-2'}>
          <span className={`${getStatusColor(task.status)} border font-medium text-xs capitalize px-2 py-1 rounded-full inline-block`}>
            {task.status.replace('-', ' ')}
          </span>
        </div>

        {/* Date */}
        <div className="col-span-2 text-right">
          <div className="flex items-center justify-end space-x-2 text-white/40 text-xs">
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
                  <span>{formatDate(task.dueDate)}</span>
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

        {/* Inline Actions — desktop: reveal on hover */}
        <div className="col-span-2 flex justify-end">
          <InlineActions alwaysVisible={false} />
        </div>
      </div>

      {/* Mobile Layout: Stacked */}
      <div className="md:hidden flex flex-col space-y-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <button
              onClick={handleStatusToggle}
              className="flex-shrink-0 hover:scale-110 transition-transform duration-200"
              aria-label={`Status: ${task.status} — click to advance`}
            >
              {getStatusIcon(task.status)}
            </button>
            <button
              onClick={handlePriorityChipClick}
              className={`flex items-center space-x-1 px-1.5 py-0.5 rounded-full border text-[11px] transition-colors flex-shrink-0 ${getPriorityChipStyle(task.priority)}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${getPriorityColor(task.priority)}`} />
              <span>{getPriorityLabel(task.priority)}</span>
            </button>
            <h4
              className={`
                text-white font-semibold flex-1 min-w-0 truncate
                ${isCompact ? 'text-sm' : 'text-base'}
                ${task.status === 'done' ? 'line-through text-white/35' : ''}
              `}
            >
              {task.task}
            </h4>
          </div>
          {/* Inline Actions — mobile: always visible */}
          <InlineActions alwaysVisible={true} />
        </div>

        {!isCompact && task.description && (
          <p className="text-white/50 text-sm pl-9">{task.description}</p>
        )}

        <div className="flex items-center justify-between pl-9">
          <span className={`${getStatusColor(task.status)} border font-medium text-xs capitalize px-2 py-1 rounded-full`}>
            {task.status.replace('-', ' ')}
          </span>
          <div className="flex items-center space-x-2 text-white/40 text-xs">
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
      </div>

      {/* Priority Quick-Change Portal */}
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

      {/* Due Date Quick-Change Portal */}
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

export default TaskListItem;
