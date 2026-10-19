import { PLACES } from './catalog';
import { HALF_LIFE } from './content';
import { DAY_MS } from './time';
import type { Place, PlayerState, QType } from './types';

export const mastery = (s: PlayerState, id: string): number => s.mastery[id] || 0;
export const learned = (s: PlayerState): Place[] => PLACES.filter((p) => mastery(s, p.id) >= 1);

/** How well a place is remembered right now, 1 = fresh, halving every half-life. */
export function strength(s: PlayerState, id: string, now: number): number {
  const m = mastery(s, id);
  if (!m) return 0;
  const age = Math.max(0, now - (s.seen[id] ?? now)) / DAY_MS;
  return Math.pow(2, -age / HALF_LIFE[Math.min(m, 5)]);
}

/** Places that have dropped below half strength, weakest first. */
export const fading = (s: PlayerState, now: number): Place[] =>
  learned(s)
    .filter((p) => strength(s, p.id, now) < 0.5)
    .sort((a, b) => strength(s, a.id, now) - strength(s, b.id, now));

/** Harder question types as mastery grows. */
export function qType(s: PlayerState, id: string): QType {
  const k = mastery(s, id);
  return k <= 1 ? 'tap' : k === 2 ? 'name' : k === 3 ? 'pin' : 'type';
}

/** Once a place has been introduced it stays on the map (level 1 floor); decay, not mistakes, fades it. */
export function bump(s: PlayerState, id: string, d: number, now: number): void {
  s.mastery[id] = Math.max(s.seen[id] ? 1 : 0, Math.min(5, mastery(s, id) + d));
  s.seen[id] = now;
}

/** Mark a place as introduced. */
export function introduce(s: PlayerState, id: string, now: number): void {
  if (!mastery(s, id)) {
    s.mastery[id] = 1;
    s.seen[id] = now;
  }
}
