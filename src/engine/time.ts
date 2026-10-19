import type { DayStr } from './types';

const DAY_MS = 864e5;

const israelFmt = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Jerusalem',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** The calendar day in Israel, so attendance and the daily place roll over at midnight Israel time. */
export function israelDay(ms: number): DayStr {
  const parts = Object.fromEntries(israelFmt.formatToParts(new Date(ms)).map((p) => [p.type, p.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export const dayNum = (s: DayStr): number => Math.round(Date.parse(`${s}T00:00:00Z`) / DAY_MS);
export const dayStr = (n: number): DayStr => new Date(n * DAY_MS).toISOString().slice(0, 10);
export const daysBetween = (from: DayStr, to: DayStr): number => dayNum(to) - dayNum(from);
export { DAY_MS };
