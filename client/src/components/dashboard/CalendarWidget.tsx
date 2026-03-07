import React, { useState, useEffect } from 'react';
import { AgendaData, AgendaView, WeekAgendaDay, Meeting, Task, Note } from '../../types/types';

interface CalendarWidgetProps {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  className?: string;
  agenda?: AgendaData;
  agendaLoading?: boolean;
  agendaEmpty?: boolean;
  agendaView?: AgendaView;
  onAgendaViewChange?: (view: AgendaView) => void;
  weekAgenda?: WeekAgendaDay[];
  monthAgenda?: WeekAgendaDay[];
  onAddTask?: () => void;
  onAddNote?: () => void;
  onAddMeeting?: () => void;
  onMeetingClick?: (meeting: Meeting) => void;
  onTaskClick?: (task: Task) => void;
  onNoteClick?: (note: Note) => void;
}

const CalendarWidget: React.FC<CalendarWidgetProps> = ({
  selectedDate = new Date(),
  onDateSelect,
  className = '',
  agenda,
  agendaLoading,
  agendaEmpty,
  agendaView = 'day',
  onAgendaViewChange,
  weekAgenda = [],
  monthAgenda = [],
  onAddTask,
  onAddNote,
  onAddMeeting,
  onMeetingClick,
  onTaskClick,
  onNoteClick
}) => {
  const [currentMonth, setCurrentMonth] = useState(selectedDate.getMonth());
  const [currentYear, setCurrentYear] = useState(selectedDate.getFullYear());

  // Sync grid display when selectedDate crosses a month boundary (e.g. via Prev/Next nav)
  useEffect(() => {
    setCurrentMonth(selectedDate.getMonth());
    setCurrentYear(selectedDate.getFullYear());
  }, [selectedDate]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayAbbreviations = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentYear, currentMonth, day);
    onDateSelect?.(newDate);
  };

  const handleCancel = () => {
    const today = new Date();
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    onDateSelect?.(today);
  };

  const handleOK = () => {
    onDateSelect?.(selectedDate);
  };

  const handlePrev = () => {
    const d = new Date(selectedDate);
    if (agendaView === 'month') d.setMonth(d.getMonth() - 1);
    else d.setDate(d.getDate() + (agendaView === 'week' ? -7 : -1));
    onDateSelect?.(d);
  };

  const handleNext = () => {
    const d = new Date(selectedDate);
    if (agendaView === 'month') d.setMonth(d.getMonth() + 1);
    else d.setDate(d.getDate() + (agendaView === 'week' ? 7 : 1));
    onDateSelect?.(d);
  };

  const handleToday = () => {
    onDateSelect?.(new Date());
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  const isSelectedDate = (day: number) => {
    return (
      day === selectedDate.getDate() &&
      currentMonth === selectedDate.getMonth() &&
      currentYear === selectedDate.getFullYear()
    );
  };

  const buildMonthMap = (): Record<number, AgendaData> => {
    const map: Record<number, AgendaData> = {};
    monthAgenda.forEach(({ date, agenda }) => {
      if (date.getMonth() === currentMonth && date.getFullYear() === currentYear)
        map[date.getDate()] = agenda;
    });
    return map;
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];
    const monthMap = buildMonthMap();

    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-10 w-8"></div>
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(day)}
          onDoubleClick={() => { handleDateClick(day); onAgendaViewChange?.('day'); }}
          className={`
            h-10 w-8 flex flex-col items-center justify-start pt-1 rounded-lg text-sm font-medium transition-all duration-200
            hover:scale-110 hover:bg-white/20
            ${isToday(day)
              ? 'bg-white/30 text-white font-bold'
              : isSelectedDate(day)
              ? 'pro-button-gradient text-white'
              : 'text-white/80 hover:text-white'
            }
          `}
        >
          <span className="text-sm font-medium leading-none">{day}</span>
          {monthMap[day] && (
            <div
              className="flex justify-center gap-0.5 mt-1"
              onClick={(e) => { e.stopPropagation(); handleDateClick(day); onAgendaViewChange?.('day'); }}
            >
              {monthMap[day].meetings.length > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_5px_rgba(168,85,247,0.9)]" />
              )}
              {monthMap[day].tasks.length > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_5px_rgba(96,165,250,0.9)]" />
              )}
              {monthMap[day].notes.length > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 shadow-[0_0_5px_rgba(250,204,21,0.9)]" />
              )}
            </div>
          )}
        </button>
      );
    }

    return days;
  };

  const renderAgendaItems = (dayAgenda: AgendaData) => (
    <div className="space-y-1">
      {dayAgenda.meetings.map((meeting) => (
        <div key={meeting._id} onClick={() => onMeetingClick?.(meeting)} className="flex items-center p-2 pro-card-gradient pro-rounded text-sm cursor-pointer hover:bg-white/10 transition-colors">
          <span className="text-purple-300 mr-2 text-xs">📅</span>
          <span className="text-white/60 text-xs mr-2 whitespace-nowrap">{meeting.startTime || '--:--'}</span>
          <span className="text-white text-xs truncate">{meeting.title}</span>
        </div>
      ))}
      {dayAgenda.tasks.map((task) => (
        <div key={task._id} onClick={() => onTaskClick?.(task)} className="flex items-center justify-between p-2 pro-card-gradient pro-rounded text-sm cursor-pointer hover:bg-white/10 transition-colors">
          <div className="flex items-center min-w-0">
            <span className="text-blue-300 mr-2 text-xs">
              {task.status === 'done' ? '✅' : task.status === 'in-progress' ? '⏳' : '📋'}
            </span>
            <span className="text-white text-xs truncate">{task.task}</span>
          </div>
          {task.priority && (
            <span className={`text-xs ml-2 px-1.5 py-0.5 rounded-full whitespace-nowrap ${
              task.priority === 'urgent' ? 'bg-red-600/20 text-red-400' :
              task.priority === 'high' ? 'bg-orange-600/20 text-orange-400' :
              task.priority === 'medium' ? 'bg-yellow-600/20 text-yellow-400' :
              'bg-green-600/20 text-green-400'
            }`}>
              {task.priority}
            </span>
          )}
        </div>
      ))}
      {dayAgenda.notes.map((note) => (
        <div key={note._id} onClick={() => onNoteClick?.(note)} className="flex items-center p-2 pro-card-gradient pro-rounded text-sm cursor-pointer hover:bg-white/10 transition-colors">
          <span className="text-yellow-300 mr-2 text-xs">📝</span>
          <span className="text-white text-xs truncate">{note.title}</span>
        </div>
      ))}
    </div>
  );

  const CategoryDivider = ({ label, color }: { label: string; color: 'purple' | 'blue' | 'yellow' }) => {
    const styles = {
      purple: { line: 'bg-purple-500/40 shadow-[0_0_6px_rgba(168,85,247,0.5)]', text: 'text-purple-400/80' },
      blue:   { line: 'bg-blue-500/40 shadow-[0_0_6px_rgba(96,165,250,0.5)]',   text: 'text-blue-400/80' },
      yellow: { line: 'bg-yellow-500/40 shadow-[0_0_6px_rgba(250,204,21,0.5)]', text: 'text-yellow-400/80' },
    }[color];
    return (
      <div className="flex items-center gap-2 my-2">
        <div className={`flex-1 h-px ${styles.line}`} />
        <span className={`${styles.text} text-[9px] tracking-[0.2em] font-semibold uppercase`}>{label}</span>
        <div className={`flex-1 h-px ${styles.line}`} />
      </div>
    );
  };

  const renderGroupedAgendaItems = (dayAgenda: AgendaData) => (
    <div className="space-y-1">
      {dayAgenda.meetings.length > 0 && (
        <>
          <CategoryDivider label="Meetings" color="purple" />
          {dayAgenda.meetings.map((meeting) => (
            <div key={meeting._id} onClick={() => onMeetingClick?.(meeting)} className="flex items-center p-2 pro-card-gradient pro-rounded text-sm cursor-pointer hover:bg-white/10 transition-colors">
              <span className="text-purple-300 mr-2 text-xs">📅</span>
              <span className="text-white/60 text-xs mr-2 whitespace-nowrap">{meeting.startTime || '--:--'}</span>
              <span className="text-white text-xs truncate">{meeting.title}</span>
            </div>
          ))}
        </>
      )}
      {dayAgenda.tasks.length > 0 && (
        <>
          <CategoryDivider label="Tasks" color="blue" />
          {dayAgenda.tasks.map((task) => (
            <div key={task._id} onClick={() => onTaskClick?.(task)} className="flex items-center justify-between p-2 pro-card-gradient pro-rounded text-sm cursor-pointer hover:bg-white/10 transition-colors">
              <div className="flex items-center min-w-0">
                <span className="text-blue-300 mr-2 text-xs">
                  {task.status === 'done' ? '✅' : task.status === 'in-progress' ? '⏳' : '📋'}
                </span>
                <span className="text-white text-xs truncate">{task.task}</span>
              </div>
              {task.priority && (
                <span className={`text-xs ml-2 px-1.5 py-0.5 rounded-full whitespace-nowrap ${
                  task.priority === 'urgent' ? 'bg-red-600/20 text-red-400' :
                  task.priority === 'high' ? 'bg-orange-600/20 text-orange-400' :
                  task.priority === 'medium' ? 'bg-yellow-600/20 text-yellow-400' :
                  'bg-green-600/20 text-green-400'
                }`}>
                  {task.priority}
                </span>
              )}
            </div>
          ))}
        </>
      )}
      {dayAgenda.notes.length > 0 && (
        <>
          <CategoryDivider label="Notes" color="yellow" />
          {dayAgenda.notes.map((note) => (
            <div key={note._id} onClick={() => onNoteClick?.(note)} className="flex items-center p-2 pro-card-gradient pro-rounded text-sm cursor-pointer hover:bg-white/10 transition-colors">
              <span className="text-yellow-300 mr-2 text-xs">📝</span>
              <span className="text-white text-xs truncate">{note.title}</span>
            </div>
          ))}
        </>
      )}
    </div>
  );

  return (
    <div className={`pro-glass pro-rounded-lg pro-shadow p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-white/80 text-lg">📅</span>
          <span className="text-white font-medium text-sm">Select date</span>
        </div>
        <button className="p-1 text-white/60 hover:text-white transition-colors duration-200 rounded">
          <span className="text-sm">✏️</span>
        </button>
      </div>

      {/* Month/Year Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          className="p-2 text-white/60 hover:text-white transition-colors duration-200 rounded"
        >
          <span className="text-lg">‹</span>
        </button>

        <h3 className="text-white font-semibold">
          {monthNames[currentMonth]} {currentYear}
        </h3>

        <button
          onClick={handleNextMonth}
          className="p-2 text-white/60 hover:text-white transition-colors duration-200 rounded"
        >
          <span className="text-lg">›</span>
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day, index) => (
          <div key={`day-${index}`} className="h-8 flex items-center justify-center">
            <span className="text-white/60 text-xs font-medium">{dayAbbreviations[index]}</span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {renderCalendarDays()}
      </div>

      {/* Selected Date Display */}
      <div className="mt-4 p-3 pro-card-gradient pro-rounded text-center">
        <p className="text-white text-sm font-medium">
          {selectedDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          })}
        </p>
      </div>

      {/* Quick-Add Row */}
      <div className="flex items-center justify-between mt-3 p-2 pro-card-gradient pro-rounded">
        <span className="text-white/60 text-xs font-medium ml-1">Quick add:</span>
        <div className="flex space-x-2">
          <button
            onClick={onAddTask}
            className="px-2 py-1 text-xs text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            + Task
          </button>
          <button
            onClick={onAddNote}
            className="px-2 py-1 text-xs text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            + Note
          </button>
          <button
            onClick={onAddMeeting}
            className="px-2 py-1 text-xs text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            + Meeting
          </button>
        </div>
      </div>

      {/* Prev / Today / Next Navigation */}
      <div className="flex items-center justify-between mt-3">
        <button
          onClick={handlePrev}
          className="px-2 py-1 text-xs text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          ‹ {agendaView === 'month' ? 'Prev Month' : agendaView === 'week' ? 'Prev Week' : 'Prev Day'}
        </button>
        <button
          onClick={handleToday}
          className="px-3 py-1 text-xs text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors font-medium"
        >
          Today
        </button>
        <button
          onClick={handleNext}
          className="px-2 py-1 text-xs text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          {agendaView === 'month' ? 'Next Month' : agendaView === 'week' ? 'Next Week' : 'Next Day'} ›
        </button>
      </div>

      {/* Day / Week Toggle */}
      <div className="flex items-center space-x-1 mt-2 mb-1">
        <button
          onClick={() => onAgendaViewChange?.('day')}
          className={`px-3 py-1 text-xs rounded-lg transition-colors ${
            agendaView === 'day'
              ? 'bg-white/20 text-white font-medium'
              : 'text-white/50 hover:text-white hover:bg-white/10'
          }`}
        >
          Day
        </button>
        <button
          onClick={() => onAgendaViewChange?.('week')}
          className={`px-3 py-1 text-xs rounded-lg transition-colors ${
            agendaView === 'week'
              ? 'bg-white/20 text-white font-medium'
              : 'text-white/50 hover:text-white hover:bg-white/10'
          }`}
        >
          Week
        </button>
        <button
          onClick={() => onAgendaViewChange?.('month')}
          className={`px-3 py-1 text-xs rounded-lg transition-colors ${
            agendaView === 'month'
              ? 'bg-white/20 text-white font-medium'
              : 'text-white/50 hover:text-white hover:bg-white/10'
          }`}
        >
          Month
        </button>
      </div>

      {/* Agenda List */}
      <div className="mt-1 max-h-48 overflow-y-auto scrollbar-hide pb-3">
        {agendaLoading ? (
          <div className="text-center py-4">
            <span className="text-white/40 text-sm">Loading...</span>
          </div>
        ) : agendaEmpty ? (
          <div className="text-center py-4">
            <p className="text-white/50 text-sm">Nothing scheduled</p>
            <p className="text-white/30 text-xs mt-1">Use the buttons above to add items</p>
          </div>
        ) : agendaView === 'month' ? (
          (() => {
            const monthMap = buildMonthMap();
            const selectedDayData = selectedDate.getMonth() === currentMonth && selectedDate.getFullYear() === currentYear
              ? monthMap[selectedDate.getDate()]
              : undefined;
            const isEmpty = !selectedDayData || (
              selectedDayData.meetings.length === 0 &&
              selectedDayData.tasks.length === 0 &&
              selectedDayData.notes.length === 0
            );
            return (
              <div>
                <p className="text-white/30 text-xs mb-2">
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  {' · '}double-click to open Day view
                </p>
                {isEmpty ? (
                  <p className="text-white/40 text-sm text-center py-2">Nothing scheduled</p>
                ) : (
                  renderGroupedAgendaItems(selectedDayData!)
                )}
              </div>
            );
          })()
        ) : agendaView === 'week' ? (
          <div className="space-y-3">
            {weekAgenda.map((day) => {
              const dayEmpty =
                day.agenda.meetings.length === 0 &&
                day.agenda.tasks.length === 0 &&
                day.agenda.notes.length === 0;
              if (dayEmpty) return null;
              return (
                <div key={day.label}>
                  <p className="text-white/40 text-xs font-medium mb-1 uppercase tracking-wide">{day.label}</p>
                  {renderAgendaItems(day.agenda)}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {renderGroupedAgendaItems(agenda ?? { meetings: [], tasks: [], notes: [] })}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2 mt-4">
        <button
          onClick={handleCancel}
          className="flex-1 py-2 text-white/60 text-sm hover:text-white transition-colors duration-200"
        >
          Today
        </button>
        <button
          onClick={handleOK}
          className="flex-1 py-2 pro-button-gradient pro-rounded text-white text-sm font-medium hover:scale-105 transition-transform duration-200"
        >
          Select
        </button>
      </div>
    </div>
  );
};

export default CalendarWidget;
