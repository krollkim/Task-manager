import { RRule } from 'rrule';

export function expandInRange(meeting: any, startDate: Date, endDate: Date): any[] {
  if (!meeting.rrule || !meeting.isRecurringBase) return [];

  const excepted = new Set(meeting.exceptedDates || []);

  try {
    const rule = RRule.fromString(meeting.rrule);
    const occurrences = rule.between(startDate, endDate, true);
    const base = meeting.toObject ? meeting.toObject() : { ...meeting };

    return occurrences
      .filter((date: Date) => {
        const dateStr = toDateStr(date);
        return !excepted.has(dateStr);
      })
      .map((date: Date) => {
        const dateStr = toDateStr(date);
        return {
          ...base,
          _id: `${base._id}_${dateStr}`,
          date,
          isRecurringInstance: true,
          isRecurringBase: false,
          recurringId: base._id,
        };
      });
  } catch (err: any) {
    console.error(`[rruleExpander] Failed to expand meeting ${meeting._id}:`, err.message);
    return [];
  }
}

export function toDateStr(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function extractRrulePart(rruleStr: string): string {
  if (!rruleStr) return '';
  const match = rruleStr.match(/RRULE:(.+)/);
  if (!match) return '';
  return match[1].replace(/;?UNTIL=[^;\n\r]+/g, '').replace(/;$/, '');
}

export function buildRrule(freqOptions: string, dtstart: Date | string): string | null {
  if (!freqOptions) return null;
  const ds = dtstart instanceof Date ? dtstart : new Date(dtstart);
  const dtStr = ds.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  return `DTSTART:${dtStr}\nRRULE:${freqOptions}`;
}
