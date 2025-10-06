import React, { useState } from 'react';
import { 
  ChevronLeftOutlined, 
  ChevronRightOutlined,
  EditOutlined,
  TodayOutlined 
} from '@mui/icons-material';
import { IconButton } from '@mui/material';
import '../../dashboard.css';

interface CalendarWidgetProps {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  className?: string;
}

const CalendarWidget: React.FC<CalendarWidgetProps> = ({
  selectedDate = new Date(),
  onDateSelect,
  className = ''
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
    // Reset to today's date
    const today = new Date();
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    onDateSelect?.(today);
  };

  const handleOK = () => {
    // Maybe close a modal or confirm the selection
    // For now, just ensure the selected date is confirmed
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

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-8 w-8"></div>
      );
    }

    // Days of the month
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
          <TodayOutlined className="text-white/80" />
          <span className="text-white font-medium text-sm">Select date</span>
        </div>
        <IconButton size="small" className="text-white/60 hover:text-white">
          <EditOutlined fontSize="small" />
        </IconButton>
      </div>

      {/* Month/Year Navigation */}
      <div className="flex items-center justify-between mb-4">
        <IconButton 
          onClick={handlePrevMonth}
          className="text-white/60 hover:text-white"
          size="small"
        >
          <ChevronLeftOutlined />
        </IconButton>
        
        <h3 className="text-white font-semibold">
          {monthNames[currentMonth]} {currentYear}
        </h3>
        
        <IconButton 
          onClick={handleNextMonth}
          className="text-white/60 hover:text-white"
          size="small"
        >
          <ChevronRightOutlined />
        </IconButton>
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