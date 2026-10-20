import { PLACES, STORY } from './catalog';
import { daysBetween } from './time';
import type { DayStr, PlayerState, Unit } from './types';

/** What Zvi says on the home postcard, most urgent first. Plain text; the review prompt is a separate button. */
export function zviSays(s: PlayerState, today: DayStr, next: { u: Unit; s: number } | null, fadingCount: number, quotaDone: boolean): string {
  if (s.welcome) return '{ברוך שובך|ברוכה השבה}. המפה קצת דהתה בלעדיך. נתחיל בחימום קצר, בלי לחץ.';
  if (s.note === 'sick') return 'אתמול לא הגעת. השתמשתי ביום המחלה שלך והנוכחות נשמרה. אל {תתרגל|תתרגלי}.';
  if (s.lost) return `הרצף של ${s.lost} ימים התאפס. קורה. גם אני איחרתי פעם, ב־1994. מתחילים מחדש היום.`;
  if (s.lastDay && daysBetween(s.lastDay, today) === 1 && !quotaDone) return `עוד לא החתמת כרטיס היום. ${s.streak} ימי נוכחות על הכף.`;
  if (fadingCount >= 3) return `${fadingCount} תיקים מתחילים לדהות בארכיון. כדאי ביקורת פתע.`;
  if (!next) return s.legendary ? 'כל הגלויות בארכיון, והקביעות בכיס. מה שנשאר זה לא לשכוח. ביקורת פתע מדי פעם.' : 'סיימת את כל הגלויות. נשאר רק המבחן שלי.';
  const archiveStarted = Object.keys(s.units).some((id) => s.units[id] && !STORY.some((u) => u.id === id));
  if (next.u.region && !archiveStarted && next.s === 0)
    return `הסיפור מאחורינו, אבל העבודה רק מתחילה: עוד ${PLACES.length - STORY.flatMap((u) => u.items).length} יישובים מחכים בארכיון. ${s.legendary ? '' : 'ואת מבחן הקביעות שלי {תעשה|תעשי} מתי {שתרצה|שתרצי}. '}${next.u.z}`;
  if (next.s === 1) return 'חצי גלויה כבר מוכנה. עוד משמרת אחת והיא בדרך אליך.';
  // A region's first postcard reminds what it is all for.
  if (next.u.region && next.u.part === 1) return `${next.u.z} עוד אזור אחד בדרך לכל הארץ.`;
  return next.u.z;
}
