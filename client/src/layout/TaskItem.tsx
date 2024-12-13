import React from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
// import CheckIcon from '@mui/icons-material/Check';
import EditIcon from '@mui/icons-material/Edit';
import { Task } from '../types/types';

interface TaskItemProps {
  task: Task;
  onDelete: () => void;
  onEdit: () => void;
  onComplete: () => void;
  onClick: () => void;
}

const TaskItem = ({ task, onDelete, onEdit, onComplete, onClick }: TaskItemProps) => {
  return (
    <div 
    className="flex justify-between items-center p-2 border-b border-gray-300"
    onClick={onClick}
    >
      <span>{task.task}</span>
      <div className="flex space-x-2">
        <EditIcon
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="cursor-pointer"
          titleAccess="Edit Task"
        />
        <DeleteIcon
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="cursor-pointer"
          titleAccess="Delete Task"
        />
      </div>
    </div>
  );
};

export default TaskItem;