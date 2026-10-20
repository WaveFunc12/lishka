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

const clockFmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jerusalem', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

/** Time left until midnight in Israel, when the next daily opens. */
export function msToNextDay(ms: number): number {
  const p = Object.fromEntries(clockFmt.formatToParts(new Date(ms)).map((x) => [x.type, x.value]));
  const sec = (Number(p.hour) % 24) * 3600 + Number(p.minute) * 60 + Number(p.second);
  return (86400 - sec) * 1000 - (ms % 1000);
}

export const dayNum = (s: DayStr): number => Math.round(Date.parse(`${s}T00:00:00Z`) / DAY_MS);
export const dayStr = (n: number): DayStr => new Date(n * DAY_MS).toISOString().slice(0, 10);
export const daysBetween = (from: DayStr, to: DayStr): number => dayNum(to) - dayNum(from);
export { DAY_MS };

/** The Saturday that closes the week (Sunday to Saturday, the Israeli week) holding `day`; `back` weeks earlier for past weeks. */
export function weekEnd(day: DayStr, back = 0): DayStr {
  const n = dayNum(day), weekday = (n + 4) % 7; // day 0 was a Thursday; 0 = Sunday
  return dayStr(n + 6 - weekday - 7 * back);
}

/** A week as people write it: 11.10 עד 17.10 (with words, not a dash, so it reads the same right to left). */
export function weekText(end: DayStr): string {
  const [, m2, d2] = end.split('-').map(Number), [, m1, d1] = dayStr(dayNum(end) - 6).split('-').map(Number);
  return `${d1}.${m1} עד ${d2}.${m2}`;
}
