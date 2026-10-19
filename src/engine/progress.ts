import { PLACES, REGION_UNITS, STORY, UNITS } from './catalog';
import { RANKS, REGIONS } from './content';
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

/** Badges: bronze = the story's postcards, silver/gold = 80%/100% of places at mastery 3+, legend = the exam. */
export function tiers(s: PlayerState) {
  const mast = PLACES.filter((p) => mastery(s, p.id) >= 3).length / PLACES.length;
  return { bronze: storyDone(s), silver: mast >= 0.8, gold: mast >= 1, legend: s.legendary, mast };
}

export const storyDone = (s: PlayerState): boolean => STORY.every((u) => s.units[u.id]);

/** The next postcard to work on and which of its two shifts. Null when all are done.
    The story comes first, in order; then the region the player picked, else the regions in order. */
export function nextShift(s: PlayerState): { u: Unit; s: 0 | 1 } | null {
  const open = (x: Unit) => !s.units[x.id];
  const u = STORY.find(open) || REGION_UNITS.find((x) => x.region === s.focus && open(x)) || REGION_UNITS.find(open);
  if (!u) return null;
  return { u, s: (s.shifts[u.id] || [])[0] ? 1 : 0 };
}

export const postcardsDone = (s: PlayerState): number => UNITS.filter((u) => s.units[u.id]).length;

/** Postcards done and total for one region, or for the story when region is null. */
export function chapter(s: PlayerState, region: string | null): { units: Unit[]; done: number } {
  const units = region ? REGION_UNITS.filter((u) => u.region === region) : STORY;
  return { units, done: units.filter((u) => s.units[u.id]).length };
}

/** Every region with its progress, in the archive's order. */
export const regionProgress = (s: PlayerState) =>
  REGIONS.map((g) => {
    const units = REGION_UNITS.filter((u) => u.region === g.id), places = units.flatMap((u) => u.items);
    return { ...g, units, done: units.filter((u) => s.units[u.id]).length, places: places.length,
      known: places.filter((id) => mastery(s, id) >= 1).length };
  });
