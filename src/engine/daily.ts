import { PLACES } from './catalog';
import { DAILY_EPOCH } from './content';
import { kmText } from './text';
import { dayNum } from './time';
import type { DayStr, Gender } from './types';

/* Settlement of the day: the same place for everyone, one try, a shareable result.
   Picked by hashing the date so it needs no server. The Gemini calendar will replace the hash. */

/** FNV-1a, identical to the prototype so both pick the same place on the same day. */
export function hash(s: string): number {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}

export const dailyId = (day: DayStr): string => PLACES[hash('lishka' + day) % PLACES.length].id;
export const dayNo = (day: DayStr): number => dayNum(day) - dayNum(DAILY_EPOCH) + 1;

/** 5 squares at 5 km, down to 0 beyond 90 km. */
export const score = (d: number): number => (d <= 5 ? 5 : d <= 12 ? 4 : d <= 25 ? 3 : d <= 50 ? 2 : d <= 90 ? 1 : 0);
export const squares = (d: number): string => '🟩'.repeat(score(d)) + '⬜'.repeat(5 - score(d));

export const shareText = (d: number, day: DayStr, g: Gender | null): string =>
  `הלשכה למיפוי · היישוב של היום #${dayNo(day)}\n${squares(d)}  ${kmText(d)} מהמקום\nמי ${g === 'f' ? 'מצליחה' : 'מצליח'} יותר קרוב?`;

/** Where the map opens for today's place: offset by the date so the answer isn't centred. */
export function dailyView(day: DayStr, x: number, y: number) {
  const h = hash(day), w = 150;
  return { x: x - w / 2 + ((h % 100) / 100 - 0.5) * w * 0.5, y: y - w / 2 + (((h >> 8) % 100) / 100 - 0.5) * w * 0.5, w, h: w };
}
