import React from 'react';
import { ViewMode, ListDensity } from '../../hooks/useViewPreference';

interface TaskViewToggleProps {
  viewMode: ViewMode;
  onViewChange: (mode: ViewMode) => void;
  listDensity?: ListDensity;
  onDensityChange?: (density: ListDensity) => void;
  isMobile?: boolean;
}

/**
 * TaskViewToggle - View mode switcher with density control
 * Widget-ready: designed to work in widget headers or dashboard controls
 * Keyboard accessible, respects reduced-motion
 */
const TaskViewToggle: React.FC<TaskViewToggleProps> = ({
  viewMode,
  onViewChange,
  listDensity = 'comfortable',
  onDensityChange,
  isMobile = false
}) => {
  const handleKeyDown = (e: React.KeyboardEvent, mode: ViewMode) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onViewChange(mode);
    }
  };

  const handleDensityKeyDown = (e: React.KeyboardEvent, density: ListDensity) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onDensityChange?.(density);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* View Mode Toggle */}
      <div className="flex items-center bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-1">
        {/* Cards Button */}
        <button
          onClick={() => onViewChange('cards')}
          onKeyDown={(e) => handleKeyDown(e, 'cards')}
          className={`
            px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150
            focus:outline-none focus-visible:ring-1 focus-visible:ring-white/10
            ${
              viewMode === 'cards'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }
          `}
          aria-label="Card view"
          aria-pressed={viewMode === 'cards'}
        >
          <span className="flex items-center gap-1.5">
            <span className="text-base">⊞</span>
            <span className="hidden sm:inline">Cards</span>
          </span>
        </button>

        {/* List Button */}
        <button
          onClick={() => onViewChange('list')}
          onKeyDown={(e) => handleKeyDown(e, 'list')}
          className={`
            px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150
            focus:outline-none focus-visible:ring-1 focus-visible:ring-white/10
            ${
              viewMode === 'list'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }
          `}
          aria-label="List view"
          aria-pressed={viewMode === 'list'}
        >
          <span className="flex items-center gap-1.5">
            <span className="text-base">☰</span>
            <span className="hidden sm:inline">List</span>
          </span>
        </button>
      </div>

      {/* Density Control (List view only, desktop only) */}
      {viewMode === 'list' && onDensityChange && !isMobile && (
        <div className="flex items-center bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-1">
          {/* Comfortable */}
          <button
            onClick={() => onDensityChange('comfortable')}
            onKeyDown={(e) => handleDensityKeyDown(e, 'comfortable')}
            className={`
              px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150
              focus:outline-none focus-visible:ring-1 focus-visible:ring-white/10
              ${
                listDensity === 'comfortable'
                  ? 'bg-white/20 text-white'
                  : 'text-white/50 hover:text-white hover:bg-white/10'
              }
            `}
            aria-label="Comfortable density"
            aria-pressed={listDensity === 'comfortable'}
          >
            Comfortable
          </button>

          {/* Compact */}
          <button
            onClick={() => onDensityChange('compact')}
            onKeyDown={(e) => handleDensityKeyDown(e, 'compact')}
            className={`
              px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150
              focus:outline-none focus-visible:ring-1 focus-visible:ring-white/10
              ${
                listDensity === 'compact'
                  ? 'bg-white/20 text-white'
                  : 'text-white/50 hover:text-white hover:bg-white/10'
              }
            `}
            aria-label="Compact density"
            aria-pressed={listDensity === 'compact'}
          >
            Compact
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskViewToggle;
