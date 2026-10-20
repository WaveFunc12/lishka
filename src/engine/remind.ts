import { T } from './text';
import type { DayStr, PlayerState } from './types';

export type Reminder = { at: number; title: string; body: string };

const LINES = [
  'הגלויה היומית מחכה על השולחן. חמישה יישובים, דקה אחת.',
  'מישהו השאיר מפה פתוחה על השולחן שלך. חמישה יישובים מחכים לסימון.',
  'הלשכה שקטה היום. {בוא|בואי} לסמן את חמשת היישובים של היומי.',
  'מה שלא חוזרים עליו נשכח. חמש דקות במפה ואני רגוע.',
  'היומי של היום כבר בתיק. מי בחדרים שלך כבר שיחק?',
];

/**
 * Zvi's reminders for the coming week, one a day at `hour` (device time).
 * Today is skipped once the player has been in (a shift or the daily), so it never nags after playing.
 */
export function reminderPlan(s: PlayerState, today: DayStr, now: number, hour: number, days = 7): Reminder[] {
  const inToday = s.lastDay === today || (s.daily.day === today && s.daily.picks.length >= 5);
  const out: Reminder[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    d.setHours(hour, 0, 0, 0);
    if (d.getTime() <= now || (i === 0 && inToday)) continue;
    // The first reminder after an attended day guards the streak; the rest rotate.
    const streak = !out.length && s.streak >= 2 && (inToday ? i === 1 : i === 0);
    const line = streak ? `${s.streak} ימי נוכחות ברצף. חבל לשבור את זה היום.` : LINES[(d.getDate() + i) % LINES.length];
    out.push({ at: d.getTime(), title: 'צבי מהלשכה', body: T(line, s.g) });
  }
  return out;
}
