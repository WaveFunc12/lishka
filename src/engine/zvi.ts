import { daysBetween } from './time';
import type { DayStr, PlayerState, Unit } from './types';

/** What Zvi says on the home postcard, most urgent first. Plain text; the review prompt is a separate button. */
export function zviSays(s: PlayerState, today: DayStr, next: { u: Unit; s: number } | null, fadingCount: number, quotaDone: boolean): string {
  if (s.welcome) return '{ברוך שובך|ברוכה השבה}. המפה קצת דהתה בלעדיך. נתחיל בחימום קצר, בלי לחץ.';
  if (s.note === 'sick') return 'אתמול לא הגעת. השתמשתי ביום המחלה שלך והנוכחות נשמרה. אל {תתרגל|תתרגלי}.';
  if (s.lost) return `הרצף של ${s.lost} ימים התאפס. קורה. גם אני איחרתי פעם, ב־1994. מתחילים מחדש היום.`;
  if (s.lastDay && daysBetween(s.lastDay, today) === 1 && !quotaDone) return `עוד לא החתמת כרטיס היום. ${s.streak} ימי נוכחות על הכף.`;
  if (fadingCount >= 3) return `${fadingCount} תיקים מתחילים לדהות בארכיון. כדאי ביקורת פתע.`;
  if (!next) return 'סיימת את כל הגלויות. נשאר רק המבחן שלי.';
  if (next.s === 1) return 'חצי גלויה כבר מוכנה. עוד משמרת אחת והיא בדרך אליך.';
  return next.u.z;
}
