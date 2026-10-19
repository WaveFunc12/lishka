import { DAILY_POOL } from './catalog';
import { DAILY_EPOCH } from './content';
import { dist } from './geo';
import { seeded, shuffle } from './random';
import { kmText } from './text';
import { dayNum } from './time';
import type { DailyPick, DayStr, Gender, Place } from './types';

/* The daily: the same five places for everyone, one pin each, a point for every pin within 10 km.
   Picked by hashing the date so it needs no server. The Gemini calendar will replace the hash. */

export const DAILY_N = 5;
export const HIT_KM = 10;
/** No two of the day's places closer than this, so one pin can't score two. */
const SPREAD_KM = 2 * HIT_KM;

/** FNV-1a, identical to the prototype so both pick the same day the same way. */
export function hash(s: string): number {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}

export function dailyIds(day: DayStr): string[] {
  const out: Place[] = [];
  for (const p of shuffle(DAILY_POOL.slice(), seeded(hash('lishka' + day)))) {
    if (out.every((q) => dist(p, q) >= SPREAD_KM)) out.push(p);
    if (out.length === DAILY_N) break;
  }
  return out.map((p) => p.id);
}

export const dayNo = (day: DayStr): number => dayNum(day) - dayNum(DAILY_EPOCH) + 1;

export const hit = (d: number): boolean => d <= HIT_KM;
export const points = (picks: DailyPick[]): number => picks.filter((p) => hit(p.d)).length;
/** Total distance off, the tie-breaker between equal points. */
export const totalKm = (picks: DailyPick[]): number => picks.reduce((a, p) => a + p.d, 0);
/** One square per place in order: green for a point, red for a miss, white for not played yet. */
export const squares = (picks: DailyPick[]): string =>
  Array.from({ length: DAILY_N }, (_, i) => (i >= picks.length ? '⬜' : hit(picks[i].d) ? '🟩' : '🟥')).join('');

export const shareText = (picks: DailyPick[], day: DayStr, g: Gender | null): string =>
  `הלשכה למיפוי · היומי #${dayNo(day)}\n${squares(picks)}  ${points(picks)}/${DAILY_N}\nסטייה כוללת: ${kmText(totalKm(picks))}\nמי ${g === 'f' ? 'מצליחה' : 'מצליח'} יותר?`;
