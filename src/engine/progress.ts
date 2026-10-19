import { PLACES, UNITS } from './catalog';
import { RANKS } from './content';
import { mastery } from './memory';
import type { PlayerState, Unit } from './types';

export function rank(xp: number): { name: string; from: number; next: [number, string] | null } {
  let r = RANKS[0];
  let next: [number, string] | null = RANKS[1];
  RANKS.forEach((k, i) => {
    if (xp >= k[0]) {
      r = k;
      next = RANKS[i + 1] || null;
    }
  });
  return { name: r[1], from: r[0], next };
}

/** Badges: bronze = every postcard, silver/gold = 80%/100% of places at mastery 3+, legend = the exam. */
export function tiers(s: PlayerState) {
  const mast = PLACES.filter((p) => mastery(s, p.id) >= 3).length / PLACES.length;
  return { bronze: UNITS.every((u) => s.units[u.id]), silver: mast >= 0.8, gold: mast >= 1, legend: s.legendary, mast };
}

export const unitOpen = (s: PlayerState, i: number): boolean => i === 0 || !!s.units[UNITS[i - 1].id];

/** The next postcard to work on and which of its two shifts. Null when all are done. */
export function nextShift(s: PlayerState): { u: Unit; s: 0 | 1 } | null {
  const u = UNITS.find((x) => !s.units[x.id]);
  if (!u) return null;
  return { u, s: (s.shifts[u.id] || [])[0] ? 1 : 0 };
}

export const postcardsDone = (s: PlayerState): number => UNITS.filter((u) => s.units[u.id]).length;
