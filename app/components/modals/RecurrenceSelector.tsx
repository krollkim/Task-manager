'use client';

import React, { useEffect, useState } from 'react';
import { RecurrenceFreq } from '@/types/types';

interface RecurrenceSelectorProps {
  /** Full rrule string (with DTSTART) or null for no recurrence */
  value: string | null;
  onChange: (rrule: string | null) => void;
  /** The meeting's current date (YYYY-MM-DD) — used to derive DTSTART and monthly day */
  baseDate: string;
}

const DAYS: { key: string; label: string }[] = [
  { key: 'MO', label: 'M' },
  { key: 'TU', label: 'T' },
  { key: 'WE', label: 'W' },
  { key: 'TH', label: 'T' },
  { key: 'FR', label: 'F' },
  { key: 'SA', label: 'S' },
  { key: 'SU', label: 'S' },
];

function toDateStr(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function buildRrule(freq: RecurrenceFreq, weekDays: string[], baseDate: string): string | null {
  if (freq === 'none') return null;
  const dt = new Date(baseDate + 'T00:00:00Z');
  const dtstart = toDateStr(dt);

  if (freq === 'daily')   return `DTSTART:${dtstart}\nRRULE:FREQ=DAILY`;
  if (freq === 'monthly') return `DTSTART:${dtstart}\nRRULE:FREQ=MONTHLY;BYMONTHDAY=${dt.getUTCDate()}`;
  if (freq === 'weekly') {
    const days = weekDays.length > 0 ? weekDays.join(',') : getDayCode(dt);
    return `DTSTART:${dtstart}\nRRULE:FREQ=WEEKLY;BYDAY=${days}`;
  }
  return null;
}

function getDayCode(date: Date): string {
  return ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'][date.getUTCDay()];
}

function parseRrule(rrule: string | null): { freq: RecurrenceFreq; weekDays: string[] } {
  if (!rrule) return { freq: 'none', weekDays: [] };
  const freqMatch = rrule.match(/FREQ=(\w+)/);
  const raw = freqMatch?.[1]?.toLowerCase();
  const freq: RecurrenceFreq =
    raw === 'daily' || raw === 'weekly' || raw === 'monthly' ? raw : 'none';
  const byday = rrule.match(/BYDAY=([^;\n\r]+)/)?.[1]?.split(',') ?? [];
  return { freq, weekDays: byday };
}

const RecurrenceSelector: React.FC<RecurrenceSelectorProps> = ({ value, onChange, baseDate }) => {
  const parsed = parseRrule(value);
  const [freq, setFreq] = useState<RecurrenceFreq>(parsed.freq);
  const [weekDays, setWeekDays] = useState<string[]>(
    parsed.weekDays.length > 0
      ? parsed.weekDays
      : baseDate ? [getDayCode(new Date(baseDate + 'T00:00:00Z'))] : []
  );

  // Sync if parent resets value (e.g., modal close)
  useEffect(() => {
    const p = parseRrule(value);
    setFreq(p.freq);
    setWeekDays(
      p.weekDays.length > 0
        ? p.weekDays
        : baseDate ? [getDayCode(new Date(baseDate + 'T00:00:00Z'))] : []
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleFreqChange = (f: RecurrenceFreq) => {
    setFreq(f);
    if (f === 'none') {
      onChange(null);
      return;
    }
    const days =
      f === 'weekly'
        ? weekDays.length > 0
          ? weekDays
          : baseDate ? [getDayCode(new Date(baseDate + 'T00:00:00Z'))] : ['MO']
        : [];
    onChange(buildRrule(f, days, baseDate));
  };

  const toggleDay = (dayKey: string) => {
    const next = weekDays.includes(dayKey)
      ? weekDays.filter((d) => d !== dayKey)
      : [...weekDays, dayKey];
    if (next.length === 0) return; // keep at least one day
    setWeekDays(next);
    onChange(buildRrule('weekly', next, baseDate));
  };

  const inputClass =
    'bg-transparent border border-white/30 rounded-lg text-white/80 text-sm focus:outline-none focus:border-white/60 transition-colors px-2 py-1';

  return (
    <div className="space-y-2">
      <label className="block text-white/70 text-sm font-medium">Repeat</label>

      {/* Frequency selector */}
      <select
        value={freq}
        onChange={(e) => handleFreqChange(e.target.value as RecurrenceFreq)}
        className={`${inputClass} w-full`}
        style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
      >
        <option value="none">None</option>
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
      </select>

      {/* Weekly day picker */}
      {freq === 'weekly' && (
        <div className="flex gap-1 mt-1">
          {DAYS.map((d) => (
            <button
              key={d.key}
              type="button"
              onClick={() => toggleDay(d.key)}
              className={`w-7 h-7 rounded-full text-xs font-medium transition-colors ${
                weekDays.includes(d.key)
                  ? 'bg-indigo-500/70 text-white border border-indigo-400/60'
                  : 'bg-white/5 text-white/40 border border-white/10 hover:border-white/30'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      )}

      {/* Monthly — read-only label */}
      {freq === 'monthly' && baseDate && (
        <p className="text-white/40 text-xs mt-1">
          Day {new Date(baseDate + 'T00:00:00Z').getUTCDate()} of every month
        </p>
      )}
    </div>
  );
};

export default RecurrenceSelector;
