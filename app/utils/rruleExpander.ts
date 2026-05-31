/**
 * RRULE Expansion Utility
 * Handles parsing and expanding recurring meeting rules
 * TODO: Complete implementation with rrule npm package
 * Reference: server/utils/rruleExpander.js from feature/architecture-v2
 */

import { RRule } from 'rrule';

/**
 * Convert date to YYYY-MM-DD string format
 */
export function toDateStr(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Extract a specific part from RRULE string
 * e.g., 'FREQ=DAILY;UNTIL=20260612' -> extractRrulePart('FREQ') -> 'DAILY'
 */
export function extractRrulePart(rrule: string, key: string): string | null {
  const match = rrule.match(new RegExp(`${key}=([^;]+)`));
  return match ? match[1] : null;
}

/**
 * Build RRULE string from components
 * e.g., buildRrule('DAILY', new Date('2026-06-01'), 30) -> 'DTSTART=20260601;RRULE:FREQ=DAILY;COUNT=30'
 */
export function buildRrule(
  frequency: string,
  startDate: Date,
  count?: number,
  until?: Date
): string {
  let rule = `DTSTART=${toDateStr(startDate)}\nRRULE:FREQ=${frequency}`;

  if (count) {
    rule += `;COUNT=${count}`;
  }

  if (until) {
    rule += `;UNTIL=${toDateStr(until)}`;
  }

  return rule;
}

/**
 * Expand RRULE to individual dates within a range
 * Returns array of date strings (YYYY-MM-DD format)
 */
export function expandInRange(
  rruleStr: string,
  startDate: Date,
  endDate: Date
): string[] {
  try {
    // Parse DTSTART and RRULE from the combined string
    const lines = rruleStr.split('\n');
    let dtstart: Date | null = null;
    let rruleText = '';

    for (const line of lines) {
      if (line.startsWith('DTSTART')) {
        const dateStr = line.replace('DTSTART=', '');
        dtstart = new Date(
          `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`
        );
      }
      if (line.startsWith('RRULE')) {
        rruleText = line.replace('RRULE:', '');
      }
    }

    if (!dtstart || !rruleText) {
      return [];
    }

    // Create RRule instance
    const rule = new RRule({
      dtstart: dtstart,
      ...parseRruleString(rruleText),
    });

    // Get all occurrences between start and end dates
    const occurrences = rule.between(startDate, endDate);
    return occurrences.map((date) => toDateStr(date));
  } catch (error) {
    console.error('Failed to expand RRULE:', error);
    return [];
  }
}

/**
 * Parse RRULE string into RRule options object
 * e.g., 'FREQ=DAILY;COUNT=10' -> { freq: RRule.DAILY, count: 10 }
 */
export function parseRruleString(
  rruleStr: string
): Record<string, any> {
  const options: Record<string, any> = {};
  const parts = rruleStr.split(';');

  for (const part of parts) {
    const [key, value] = part.split('=');

    switch (key) {
      case 'FREQ':
        options.freq = RRule[value as keyof typeof RRule];
        break;
      case 'COUNT':
        options.count = parseInt(value, 10);
        break;
      case 'UNTIL':
        const dateStr = value;
        options.until = new Date(
          `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`
        );
        break;
      case 'BYDAY':
        options.byweekday = parseByDay(value);
        break;
      case 'BYMONTHDAY':
        options.bymonthday = parseInt(value, 10);
        break;
      default:
        // Ignore unknown parts
        break;
    }
  }

  return options;
}

/**
 * Parse BYDAY string (e.g., 'MO,WE,FR') into RRule weekday values
 */
function parseByDay(byDayStr: string): any[] {
  const dayMap: Record<string, any> = {
    MO: RRule.MO,
    TU: RRule.TU,
    WE: RRule.WE,
    TH: RRule.TH,
    FR: RRule.FR,
    SA: RRule.SA,
    SU: RRule.SU,
  };

  return byDayStr.split(',').map((day) => dayMap[day]).filter(Boolean);
}
