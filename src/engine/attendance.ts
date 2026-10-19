import { learned } from './memory';
import { dayNum, dayStr } from './time';
import type { DayStr, PlayerState } from './types';

/** Today's quota counters, reset when the day changes. */
export function daily(s: PlayerState, today: DayStr) {
  if (s.daily.day !== today) s.daily = { day: today, shifts: 0, reviews: 0, dp: null };
  return s.daily;
}

/**
 * Run when the app opens. A gap of one missed day spends the saved sick day and keeps the streak;
 * a longer gap resets it. A week away earns the gentle welcome-back warm-up.
 */
export function onOpen(s: PlayerState, today: DayStr): void {
  if (s.lastOpen && learned(s).length && dayNum(today) - dayNum(s.lastOpen) >= 7) s.welcome = true;
  s.lastOpen = today;
  if (s.lastDay && s.streak > 0) {
    const gap = dayNum(today) - dayNum(s.lastDay);
    if (gap === 2 && s.sick > 0) {
      s.sick = 0;
      s.lastDay = dayStr(dayNum(today) - 1);
      s.note = 'sick';
    } else if (gap >= 2) {
      s.lost = s.streak;
      s.streak = 0;
    }
  }
}

/** Count today as an attendance day. Returns false if it already was. */
export function markDay(s: PlayerState, today: DayStr): boolean {
  if (s.lastDay === today) return false;
  const gap = s.lastDay ? dayNum(today) - dayNum(s.lastDay) : 99;
  s.streak = gap === 1 ? s.streak + 1 : 1;
  s.lastDay = today;
  return true;
}
