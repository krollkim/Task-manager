import { RRule } from 'rrule';
import { Meeting } from '@/types/types';

/**
 * Expand a recurring base meeting into virtual instances within [startDate, endDate].
 * Virtual instances have synthetic _id = `${base._id}_${YYYY-MM-DD}` and are never written to DB.
 *
 * @param meeting - Mongoose document or plain object with .rrule, .isRecurringBase, .exceptedDates
 * @param startDate - Start of expansion range (UTC)
 * @param endDate - End of expansion range (UTC)
 * @returns Virtual meeting objects with isRecurringInstance flag
 */
export function expandInRange(
  meeting: any,
  startDate: Date,
  endDate: Date
): Meeting[] {
  if (!meeting.rrule || !meeting.isRecurringBase) {
    return [];
  }

  const excepted = new Set(meeting.exceptedDates || []);

  try {
    // The rrule string stored in DB includes DTSTART, e.g.:
    // "DTSTART:20260421T000000Z\nRRULE:FREQ=WEEKLY;BYDAY=MO"
    const rule = RRule.fromString(meeting.rrule);

    // between() is inclusive on both ends when inc=true
    const occurrences = rule.between(startDate, endDate, true);

    const base = meeting.toObject ? meeting.toObject() : { ...meeting };

    return occurrences
      .filter((date) => {
        const dateStr = toDateStr(date);
        return !excepted.has(dateStr);
      })
      .map((date) => {
        const dateStr = toDateStr(date);
        return {
          ...base,
          _id: `${base._id}_${dateStr}`,
          date: date.toISOString(),
          isRecurringInstance: true,
          isRecurringBase: false,
          recurringId: base._id,
        } as Meeting;
      });
  } catch (err) {
    console.error(`[rruleExpander] Failed to expand meeting ${meeting._id}:`, err);
    return [];
  }
}

/**
 * Format a Date as YYYY-MM-DD using UTC parts
 */
export function toDateStr(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Extract just the FREQ=... options from a full rrule string
 * (strips DTSTART and UNTIL so they can be recomputed).
 */
export function extractRrulePart(rruleStr: string | null): string {
  if (!rruleStr) return '';
  const match = rruleStr.match(/RRULE:(.+)/);
  if (!match) return '';
  return match[1]
    .replace(/;?UNTIL=[^;\n\r]+/g, '')
    .replace(/;$/, '');
}

/**
 * Build a full rrule string from a FREQ options string and a base date.
 * e.g. buildRrule('FREQ=WEEKLY;BYDAY=MO', new Date('2026-04-21'))
 *   → "DTSTART:20260421T000000Z\nRRULE:FREQ=WEEKLY;BYDAY=MO"
 */
export function buildRrule(freqOptions: string, dtstart: Date | string): string | null {
  if (!freqOptions) return null;
  const ds = dtstart instanceof Date ? dtstart : new Date(dtstart);
  const dtStr = ds.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  return `DTSTART:${dtStr}\nRRULE:${freqOptions}`;
}
