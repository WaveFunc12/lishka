import { DAILY_POOL } from './catalog';
import { DAILY_EPOCH } from './content';
import { dist } from './geo';
import { seeded, shuffle } from './random';
import { kmText } from './text';
import { dayNum } from './time';
import type { DailyPick, DayStr, Gender, Place, PlayerState } from './types';

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

export const shareText = (picks: DailyPick[], day: DayStr, g: Gender | null, run = 0): string =>
  `הלשכה למיפוי · היומי #${dayNo(day)}\n${squares(picks)}  ${points(picks)}/${DAILY_N}\nסטייה כוללת: ${kmText(totalKm(picks))}` +
  (run > 1 ? `\n${run} ימים ברצף` : '') +
  `\nמי ${g === 'f' ? 'מצליחה' : 'מצליח'} יותר?`;

/** What the daily log keeps of a finished daily: points, and km off to one decimal. */
export const logEntry = (picks: DailyPick[]): [number, number] => [points(picks), Math.round(totalKm(picks) * 10) / 10];

export type DailyStats = { played: number; avg: number; run: number; best: number; spread: number[] };

/** The player's daily record: games, average points, the current and longest run of days, and how many games got each score. */
export function dailyStats(s: PlayerState, today: DayStr): DailyStats {
  const days = Object.keys(s.dailies).map(dayNum).sort((a, b) => a - b);
  const spread = Array<number>(DAILY_N + 1).fill(0);
  let sum = 0;
  for (const [p] of Object.values(s.dailies)) { spread[p]++; sum += p; }
  let best = 0, len = 0;
  days.forEach((d, i) => { len = i && d - days[i - 1] === 1 ? len + 1 : 1; best = Math.max(best, len); });
  // The run is still alive until a whole day goes by without a daily.
  let run = 0;
  const has = new Set(days), t = dayNum(today);
  for (let d = has.has(t) ? t : t - 1; has.has(d); d--) run++;
  return { played: days.length, avg: days.length ? sum / days.length : 0, run, best, spread };
}
