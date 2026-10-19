import placesJson from '../data/places.json';
import { REGION_MORE, REGIONS, UNIT_META } from './content';
import type { Place, Unit } from './types';

/* The 500 biggest places (CBS 2023), built by tools/places/build_places.py. The first 42 are the story's. */
export const PLACES: Place[] = placesJson as Place[];
export const BY: Record<string, Place> = Object.fromEntries(PLACES.map((p) => [p.id, p]));
const itemsOf = (id: string) => PLACES.filter((p) => p.unit === id).map((p) => p.id);

/** The story: seven postcards with Zvi and the chocolate-milk mystery. */
export const STORY: Unit[] = UNIT_META.map((u) => ({ ...u, items: itemsOf(u.id) }));

/** The archive after the story: each region's postcards in order (ids like shr1, shr2). */
export const REGION_UNITS: Unit[] = REGIONS.flatMap((g) => {
  const ids = [...new Set(PLACES.filter((p) => p.region === g.id && p.unit.startsWith(g.id)).map((p) => p.unit))]
    .sort((a, b) => Number(a.slice(g.id.length)) - Number(b.slice(g.id.length)));
  return ids.map((id, i): Unit => ({
    id, t: g.t, s: g.s, col: g.col, clue: '', items: itemsOf(id), region: g.id, part: i + 1, parts: ids.length,
    z: i === 0 ? g.z : REGION_MORE[(i - 1) % REGION_MORE.length].replace('{R}', g.in),
    card: i === ids.length - 1 ? g.card : `עוד גלויה ${g.in} מתויקת. ${ids.length - i - 1 === 1 ? 'נשארה עוד אחת' : `נשארו עוד ${ids.length - i - 1}`} באזור.`,
  }));
});

export const UNITS: Unit[] = [...STORY, ...REGION_UNITS];
export const UNIT_BY: Record<string, Unit> = Object.fromEntries(UNITS.map((u) => [u.id, u]));
/** The big cities every new place can be described against. */
export const ANCHORS: string[] = STORY[0].items;
/** The places the daily draws from: the biggest, so the five are fair to everyone. */
export const DAILY_POOL: Place[] = PLACES.filter((p) => p.rank <= 150);

/** The places of one shift: the first or second half of the postcard. */
export function shiftItems(u: Unit, shift: number): string[] {
  const half = Math.ceil(u.items.length / 2);
  return shift === 0 ? u.items.slice(0, half) : u.items.slice(half);
}
