'use client';

import React from 'react';
import { ViewMode, ListDensity } from '@/hooks/useViewPreference';

interface TaskViewToggleProps {
  viewMode: ViewMode;
  onViewChange: (mode: ViewMode) => void;
  listDensity: ListDensity;
  onDensityChange: (density: ListDensity) => void;
  isMobile?: boolean;
}

const TaskViewToggle: React.FC<TaskViewToggleProps> = ({
  viewMode,
  onViewChange,
  listDensity,
  onDensityChange,
  isMobile = false,
}) => {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onViewChange('cards')}
        className={`px-3 py-1 text-sm rounded transition-colors ${
          viewMode === 'cards'
            ? 'bg-blue-600 text-white'
            : 'bg-white/10 text-white/60 hover:text-white'
        }`}
      >
        Cards
      </button>
      <button
        onClick={() => onViewChange('list')}
        className={`px-3 py-1 text-sm rounded transition-colors ${
          viewMode === 'list'
            ? 'bg-blue-600 text-white'
            : 'bg-white/10 text-white/60 hover:text-white'
        }`}
      >
        List
      </button>

      {/* Density selector appears when list view is active */}
      {viewMode === 'list' && (
        <div className="flex items-center gap-1 ml-2 pl-2 border-l border-white/20">
          <button
            onClick={() => onDensityChange('comfortable')}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              listDensity === 'comfortable'
                ? 'bg-green-600/40 text-green-300 border border-green-500/50'
                : 'bg-white/10 text-white/60 hover:text-white'
            }`}
            title="Comfortable spacing"
          >
            Normal
          </button>
          <button
            onClick={() => onDensityChange('compact')}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              listDensity === 'compact'
                ? 'bg-purple-600/40 text-purple-300 border border-purple-500/50'
                : 'bg-white/10 text-white/60 hover:text-white'
            }`}
            title="Compact spacing"
          >
            Compact
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskViewToggle;
