'use client';

import React from 'react';
import { AgendaData, AgendaView, Meeting, Task, Note } from '@/types/types';

interface CalendarSidebarProps {
  selectedDate: Date;
  onOpenCalendarModal: () => void;
  agendaView?: AgendaView;
  onAgendaViewChange?: (view: AgendaView) => void;
  onAddTask?: () => void;
  onAddNote?: () => void;
  onAddMeeting?: () => void;
  agenda?: AgendaData;
  agendaLoading?: boolean;
  onMeetingClick?: (meeting: Meeting) => void;
  onTaskClick?: (task: Task) => void;
  onNoteClick?: (note: Note) => void;
}

const CalendarSidebar: React.FC<CalendarSidebarProps> = ({
  selectedDate,
  onOpenCalendarModal,
  agendaView = 'day',
  onAgendaViewChange,
  onAddTask,
  onAddNote,
  onAddMeeting,
  agenda,
  agendaLoading,
  onMeetingClick,
  onTaskClick,
  onNoteClick,
}) => {
  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const renderAgendaItems = (dayAgenda: AgendaData) => (
    <div className="space-y-1">
      {dayAgenda.meetings.map((meeting) => (
        <div
          key={meeting._id}
          className="flex items-center p-2 pro-card-gradient pro-rounded text-sm cursor-pointer hover:bg-white/10 transition-colors"
          onClick={() => onMeetingClick?.(meeting)}
        >
          <span className="text-purple-300 mr-2 text-xs flex-shrink-0">📅</span>
          <span className="text-white/60 text-xs mr-2 whitespace-nowrap flex-shrink-0">{meeting.startTime || '--:--'}</span>
          <span className="text-white text-xs truncate">{meeting.title}</span>
          {(meeting.isRecurringBase || meeting.isRecurringInstance) && (
            <span className="ml-1.5 text-purple-400/70 text-[10px] flex-shrink-0">↻</span>
          )}
        </div>
      ))}
      {dayAgenda.tasks.map((task) => (
        <div
          key={task._id}
          className="flex items-center p-2 pro-card-gradient pro-rounded text-sm cursor-pointer hover:bg-white/10 transition-colors"
          onClick={() => onTaskClick?.(task)}
        >
          <span className="text-blue-300 mr-2 text-xs">
            {task.status === 'done' ? '✅' : task.status === 'in-progress' ? '⏳' : '📋'}
          </span>
          <span className="text-white text-xs truncate">{task.task}</span>
        </div>
      ))}
      {dayAgenda.notes.map((note) => (
        <div
          key={note._id}
          className="flex items-center p-2 pro-card-gradient pro-rounded text-sm cursor-pointer hover:bg-white/10 transition-colors"
          onClick={() => onNoteClick?.(note)}
        >
          <span className="text-yellow-300 mr-2 text-xs">📝</span>
          <span className="text-white text-xs truncate">{note.title}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Calendar Button */}
      <button
        onClick={onOpenCalendarModal}
        className="w-full py-3 px-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 hover:border-blue-500/60 hover:bg-gradient-to-r hover:from-blue-600/30 hover:to-purple-600/30 text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
      >
        <span className="text-lg">📅</span>
        <span>Open Calendar</span>
      </button>

      {/* Selected Date Display */}
      <div className="pro-glass pro-rounded p-4">
        <div className="text-white/60 text-xs uppercase tracking-wider mb-2">Selected Date</div>
        <div className="text-white font-semibold">{formatDate(selectedDate)}</div>
      </div>

      {/* Quick Add Buttons */}
      <div className="pro-glass pro-rounded p-4 space-y-3">
        <div className="text-white/60 text-xs uppercase tracking-wider">Quick Add</div>
        <div className="flex gap-2">
          <button
            onClick={onAddTask}
            className="flex-1 py-2 px-3 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 hover:text-blue-100 text-xs font-medium rounded transition-colors"
          >
            + Task
          </button>
          <button
            onClick={onAddNote}
            className="flex-1 py-2 px-3 bg-yellow-600/30 hover:bg-yellow-600/50 text-yellow-300 hover:text-yellow-100 text-xs font-medium rounded transition-colors"
          >
            + Note
          </button>
          <button
            onClick={onAddMeeting}
            className="flex-1 py-2 px-3 bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 hover:text-purple-100 text-xs font-medium rounded transition-colors"
          >
            + Meeting
          </button>
        </div>
      </div>

      {/* View Toggle */}
      <div className="pro-glass pro-rounded p-4 space-y-3">
        <div className="text-white/60 text-xs uppercase tracking-wider">View</div>
        <div className="flex gap-2">
          {['day', 'week', 'month'].map((view) => (
            <button
              key={view}
              onClick={() => onAgendaViewChange?.(view as AgendaView)}
              className={`flex-1 py-2 px-3 text-xs font-medium rounded transition-all ${
                agendaView === view
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'bg-white/10 hover:bg-white/20 text-white/70 hover:text-white'
              }`}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Agenda Items for Selected Date */}
      {agenda && !agendaLoading && (
        <div className="pro-glass pro-rounded p-4">
          <div className="text-white/60 text-xs uppercase tracking-wider mb-3">
            {agendaView === 'day' && "Today's Items"}
            {agendaView === 'week' && "This Week"}
            {agendaView === 'month' && "This Month"}
          </div>
          {agenda.meetings.length === 0 && agenda.tasks.length === 0 && agenda.notes.length === 0 ? (
            <div className="text-white/40 text-xs">No items for this {agendaView}</div>
          ) : (
            renderAgendaItems(agenda)
          )}
        </div>
      )}

      {agendaLoading && (
        <div className="pro-glass pro-rounded p-4 text-center">
          <div className="text-white/40 text-xs">Loading...</div>
        </div>
      )}
    </div>
  );
};

export default CalendarSidebar;
