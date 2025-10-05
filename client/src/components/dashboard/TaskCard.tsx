import React from 'react';
import { 
  MoreVertOutlined, 
  EditOutlined, 
  DeleteOutlined,
  CheckCircleOutlined,
  RadioButtonUncheckedOutlined,
  AccessTimeOutlined,
  PlayCircleOutlined 
} from '@mui/icons-material';
import { IconButton, Chip, Menu, MenuItem, Divider } from '@mui/material';
import { Task } from '../../types/types';
import '../../dashboard.css';

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
        return <CheckCircleOutlined className="text-green-400" />;
      case 'in-progress':
        return <PlayCircleOutlined className="text-yellow-400" />;
      default:
        return <RadioButtonUncheckedOutlined className="text-white/60" />;
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
      pro-card-gradient pro-rounded pro-shadow
      p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg
      relative group cursor-pointer pro-fade-in
      ${className}
    `}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3 flex-1">
          <button 
            onClick={handleStatusToggle}
            className="flex-shrink-0 hover:scale-110 transition-transform duration-200"
          >
            {getStatusIcon(task.status)}
          </button>
          <h3 className={`
            text-white font-semibold text-lg leading-tight flex-1
            ${task.status === 'done' ? 'line-through opacity-75' : ''}
          `}>
            {task.task}
          </h3>
        </div>

        <IconButton 
          onClick={handleClick}
          className="text-white/60 hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-200"
          size="small"
        >
          <MoreVertOutlined />
        </IconButton>
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
          <Chip
            label={task.status.replace('-', ' ')}
            size="small"
            className={`
              ${getStatusColor(task.status)}
              border font-medium text-xs capitalize
            `}
          />
        </div>

        <div className="flex items-center space-x-1 text-white/60 text-xs">
          <AccessTimeOutlined sx={{ fontSize: 14 }} />
          <span>{formatDate(task.createdAt)}</span>
        </div>
      </div>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          className: 'pro-button-gradient pro-rounded border border-white/10',
          style: { marginTop: 8 }
        }}
      >
        {/* Status Options */}
        <MenuItem 
          onClick={() => handleStatusChange('todo')}
          className={`text-white hover:bg-white/10 ${task.status === 'todo' ? 'bg-white/5' : ''}`}
        >
          <RadioButtonUncheckedOutlined className="mr-2 text-blue-400" fontSize="small" />
          To Do
        </MenuItem>
        <MenuItem 
          onClick={() => handleStatusChange('in-progress')}
          className={`text-white hover:bg-white/10 ${task.status === 'in-progress' ? 'bg-white/5' : ''}`}
        >
          <PlayCircleOutlined className="mr-2 text-yellow-400" fontSize="small" />
          In Progress
        </MenuItem>
        <MenuItem 
          onClick={() => handleStatusChange('done')}
          className={`text-white hover:bg-white/10 ${task.status === 'done' ? 'bg-white/5' : ''}`}
        >
          <CheckCircleOutlined className="mr-2 text-green-400" fontSize="small" />
          Done
        </MenuItem>
        
        <Divider className="bg-white/10 my-1" />
        
        <MenuItem 
          onClick={() => {
            onEdit?.(task);
            handleClose();
          }}
          className="text-white hover:bg-white/10"
        >
          <EditOutlined className="mr-2" fontSize="small" />
          Edit Task
        </MenuItem>
        <MenuItem 
          onClick={() => {
            onDelete?.(task._id);
            handleClose();
          }}
          className="text-red-300 hover:bg-red-500/10"
        >
          <DeleteOutlined className="mr-2" fontSize="small" />
          Delete Task
        </MenuItem>
      </Menu>
    </div>
  );
};

export default TaskCard; 