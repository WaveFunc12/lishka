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

export type Milestone = { at: number; title: string; short: string; say: string };

/** Stops on the way to the whole country: the first few places, then shares of it. */
export function milestones(total: number = PLACES.length): Milestone[] {
  const all: Milestone[] = [
    { at: 10, title: '10 יישובים על המפה', short: '10 יישובים', say: 'עשרה יישובים חזרו למפה. ככה מתחילים, אחד אחד.' },
    { at: 25, title: '25 יישובים על המפה', short: '25 יישובים', say: 'המפה כבר לא ריקה. עוד קצת והיא תתחיל להיראות כמו מדינה.' },
    { at: Math.round(total * 0.1), title: 'עשירית מהארץ', short: 'עשירית מהארץ', say: 'עשירית מהארץ חזרה למפה. במשרד כבר מדברים עליך.' },
    { at: Math.round(total * 0.25), title: 'רבע מהארץ על המפה', short: 'רבע מהארץ', say: 'רבע מהארץ! אני מזמין אותך לשוקו. לא על השרת.' },
    { at: Math.round(total * 0.5), title: 'חצי מהארץ על המפה', short: 'חצי מהארץ', say: 'חצי מהארץ. מכאן כל יישוב שחוזר מקרב אותנו לסוף.' },
    { at: Math.round(total * 0.75), title: 'שלושה רבעים מהארץ', short: 'שלושה רבעים מהארץ', say: 'שלושה רבעים. כבר אפשר לראות את הקצה של המפה.' },
    { at: total, title: 'כל הארץ על המפה', short: 'כל הארץ', say: 'כל הארץ על המפה. 31 שנה חיכיתי {למישהו|למישהי} כמוך.' },
  ];
  return all.filter((m, i) => m.at <= total && all.findIndex((o) => o.at === m.at) === i).sort((a, b) => a.at - b.at);
}

/** The milestone a jump from `before` to `after` known places passed, the biggest if several. */
export const crossedMilestone = (before: number, after: number, total: number = PLACES.length) =>
  milestones(total).filter((m) => before < m.at && after >= m.at).pop() ?? null;

/** The next milestone ahead of `known` places, or null once the whole country is back. */
export const nextMilestone = (known: number, total: number = PLACES.length) => milestones(total).find((m) => m.at > known) ?? null;
