import { REGION_UNITS } from './catalog';
import { REGIONS } from './content';
import { strength } from './memory';
import { DAY_MS } from './time';
import type { PlayerState } from './types';

/* Fading ink. A closed region's stamp fades as its places fade from memory. Renewing it is a short inspection of the
   region's weakest places, and each renewal holds twice as long as the one before (4, 8, 16, then 30 days),
   so a region comes back less and less often. Nothing is ever taken away: the stamp stays earned, only its ink fades. */

/** Below this average memory strength a closed region's ink counts as faded. */
export const INK_FADED = 0.4;
/** How many of the region's weakest places a renewal asks about. */
export const INK_QS = 10;
/** A renewal counts only with this share of right answers; below it the ink stays faded and Zvi asks again. */
export const INK_PASS = 0.6;

export const regionPlaces = (id: string): string[] => REGION_UNITS.filter((u) => u.region === id).flatMap((u) => u.items);
export const regionClosed = (s: PlayerState, id: string): boolean => REGION_UNITS.filter((u) => u.region === id).every((u) => s.units[u.id]);

/** The region's ink: how well its places are remembered on average, 1 = fresh. */
export function inkLevel(s: PlayerState, id: string, now: number): number {
  const ids = regionPlaces(id);
  return ids.length ? ids.reduce((a, p) => a + strength(s, p, now), 0) / ids.length : 1;
}

/** Days a renewal holds, by how many renewals the region has had (1st: 4 days, 2nd: 8, 3rd: 16, then 30). */
export const inkHold = (n: number): number => Math.min(30, 2 ** (Math.max(n, 1) + 1)); // n 0 is the region just closed: 4 days, like a first renewal

/** A closed region whose ink has faded and whose last renewal no longer holds. */
export function inkFaded(s: PlayerState, id: string, now: number): boolean {
  if (!regionClosed(s, id)) return false;
  const r = s.ink[id];
  if (r && now < r.at + inkHold(r.n) * DAY_MS) return false;
  return inkLevel(s, id, now) < INK_FADED;
}

/** The one region to renew now, the most faded, or null. One at a time, so it never piles up into a chore. */
export function fadingRegion(s: PlayerState, now: number): string | null {
  const faded = REGIONS.filter((g) => inkFaded(s, g.id, now)).map((g) => ({ id: g.id, k: inkLevel(s, g.id, now) }));
  faded.sort((a, b) => a.k - b.k);
  return faded[0]?.id ?? null;
}

/** Record a renewal; returns how many days it holds. */
export function renewInk(s: PlayerState, id: string, now: number): number {
  const n = (s.ink[id]?.n ?? 0) + 1;
  s.ink[id] = { at: now, n };
  return inkHold(n);
}
