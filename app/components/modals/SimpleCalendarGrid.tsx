'use client';

import React, { useState, useEffect } from 'react';
import { WeekAgendaDay } from '@/types/types';

interface SimpleCalendarGridProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  monthAgenda?: WeekAgendaDay[];
}

const SimpleCalendarGrid: React.FC<SimpleCalendarGridProps> = ({
  selectedDate,
  onDateSelect,
  monthAgenda = [],
}) => {
  const [currentMonth, setCurrentMonth] = useState(selectedDate.getMonth());
  const [currentYear, setCurrentYear] = useState(selectedDate.getFullYear());

  useEffect(() => {
    setCurrentMonth(selectedDate.getMonth());
    setCurrentYear(selectedDate.getFullYear());
  }, [selectedDate]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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

  const buildMonthMap = (): Record<number, boolean> => {
    const map: Record<number, boolean> = {};
    monthAgenda.forEach(({ date }) => {
      if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
        map[date.getDate()] = true;
      }
    });
    return map;
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentYear, currentMonth, day);
    onDateSelect(newDate);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];
    const monthMap = buildMonthMap();

    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-20 w-full" />
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(day)}
          className={`
            h-20 w-full px-2 py-2 flex flex-col items-center justify-start rounded border text-sm font-medium transition-all duration-200
            hover:bg-white/10 hover:border-white/40
            border-white/20
            ${isToday(day)
              ? 'bg-white/20 text-white font-bold border-white/40'
              : isSelectedDate(day)
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-white/60'
              : 'text-white/80 hover:text-white'
            }
          `}
        >
          <span className="text-lg font-semibold leading-none">{day}</span>
          {monthMap[day] && (
            <div className="flex justify-center gap-1 mt-2">
              <span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_4px_rgba(168,85,247,0.8)]" />
              <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_4px_rgba(96,165,250,0.8)]" />
              <span className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_4px_rgba(250,204,21,0.8)]" />
            </div>
          )}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Month/Year Header & Navigation */}
      <div className="p-6 border-b border-white/10 flex items-center justify-between flex-shrink-0">
        <button
          onClick={handlePrevMonth}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
        >
          ←
        </button>
        <h2 className="text-2xl font-bold text-white">
          {monthNames[currentMonth]} {currentYear}
        </h2>
        <button
          onClick={handleNextMonth}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
        >
          →
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-0 px-6 pt-4 pb-2 flex-shrink-0">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-white/60 text-sm font-semibold py-2">
            {day.slice(0, 3)}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 px-6 pb-6 flex-1 overflow-hidden">
        {renderCalendar()}
      </div>
    </div>
  );
};

export default SimpleCalendarGrid;
