import React, { useState } from 'react';
import { AgendaData } from '../../types/types';

interface CalendarWidgetProps {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  className?: string;
  agenda?: AgendaData;
  agendaLoading?: boolean;
  agendaEmpty?: boolean;
  onAddTask?: () => void;
  onAddNote?: () => void;
  onAddMeeting?: () => void;
}

const CalendarWidget: React.FC<CalendarWidgetProps> = ({
  selectedDate = new Date(),
  onDateSelect,
  className = '',
  agenda,
  agendaLoading,
  agendaEmpty,
  onAddTask,
  onAddNote,
  onAddMeeting
}) => {
  const [currentMonth, setCurrentMonth] = useState(selectedDate.getMonth());
  const [currentYear, setCurrentYear] = useState(selectedDate.getFullYear());

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

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-8 w-8"></div>
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(day)}
          className={`
            h-8 w-8 rounded-lg text-sm font-medium transition-all duration-200
            hover:scale-110 hover:bg-white/20
            ${isToday(day)
              ? 'bg-white/30 text-white font-bold'
              : isSelectedDate(day)
              ? 'pro-button-gradient text-white'
              : 'text-white/80 hover:text-white'
            }
          `}
        >
          {day}
        </button>
      );
    }

    return days;
  };

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

      {/* Agenda List */}
      <div className="mt-3 max-h-48 overflow-y-auto scrollbar-hide pb-3">
        {agendaLoading ? (
          <div className="text-center py-4">
            <span className="text-white/40 text-sm">Loading...</span>
          </div>
        ) : agendaEmpty ? (
          <div className="text-center py-4">
            <p className="text-white/50 text-sm">Nothing scheduled</p>
            <p className="text-white/30 text-xs mt-1">Use the buttons above to add items</p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Meetings */}
            {agenda?.meetings.map((meeting) => (
              <div key={meeting._id} className="flex items-center p-2 pro-card-gradient pro-rounded text-sm">
                <span className="text-purple-300 mr-2 text-xs">📅</span>
                <span className="text-white/60 text-xs mr-2 whitespace-nowrap">
                  {meeting.startTime || '--:--'}
                </span>
                <span className="text-white text-xs truncate">{meeting.title}</span>
              </div>
            ))}

            {/* Tasks */}
            {agenda?.tasks.map((task) => (
              <div key={task._id} className="flex items-center justify-between p-2 pro-card-gradient pro-rounded text-sm">
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

            {/* Notes */}
            {agenda?.notes.map((note) => (
              <div key={note._id} className="flex items-center p-2 pro-card-gradient pro-rounded text-sm">
                <span className="text-yellow-300 mr-2 text-xs">📝</span>
                <span className="text-white text-xs truncate">{note.title}</span>
              </div>
            ))}
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
