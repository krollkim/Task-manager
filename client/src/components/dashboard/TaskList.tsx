import React from 'react';
import { Task } from '../../types/types';
import { ListDensity } from '../../hooks/useViewPreference';
import TaskListItem from './TaskListItem';

interface TaskListProps {
  tasks: Task[];
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: Task['status']) => void;
  onQuickUpdate?: (id: string, updates: Partial<Task>) => void;
  density: ListDensity;
  isMobile: boolean;
}

/**
 * TaskList - Container for list view
 * Single-column layout (table-like, stable reading order)
 * Widget-ready: can be used standalone or in dashboard grid
 */
const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onEdit,
  onDelete,
  onStatusChange,
  onQuickUpdate,
  density,
  isMobile
}) => {
  if (tasks.length === 0) {
    return (
      <div className="pro-glass pro-rounded-lg p-8 text-center">
        <p className="text-white/60 text-lg mb-2">No tasks found</p>
        <p className="text-white/40 text-sm">
          Try adjusting your search or create a new task
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <TaskListItem
          key={task._id}
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
          onQuickUpdate={onQuickUpdate}
          density={density}
        />
      ))}
    </div>
  );
};

export default TaskList;
