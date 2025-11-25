import React from 'react';
import { Task } from '../../types/types';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: Task['status']) => void;
  className?: string;
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onEdit, 
  onDelete, 
  onStatusChange,
  className = '' 
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

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
        </div>

        <div className="flex items-center space-x-1 text-white/60 text-xs">
          <span className="text-sm">🕒</span>
          <span>{formatDate(task.createdAt)}</span>
        </div>
      </div>

      {/* Action Menu */}
      {open && (
        <div className="absolute top-12 right-4 bg-slate-800/90 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg z-50 min-w-[160px]">
          {/* Status Options */}
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
      )}

      {/* Click outside to close menu */}
      {open && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={handleClose}
        />
      )}
    </div>
  );
};

export default TaskCard; 