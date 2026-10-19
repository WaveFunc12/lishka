import type { PlayerState } from './types';

export const freshState = (): PlayerState => ({
  v: 1,
  g: null,
  xp: 0,
  streak: 0,
  lastDay: null,
  lastOpen: null,
  sick: 0,
  note: null,
  lost: 0,
  welcome: false,
  mastery: {},
  seen: {},
  shifts: {},
  units: {},
  legendary: false,
  seenComic: false,
  mute: false,
  daily: { day: null, shifts: 0, reviews: 0, dp: null },
});

/** Load saved progress, filling any fields added since it was saved. */
export function migrate(raw: unknown): PlayerState {
  const base = freshState();
  if (!raw || typeof raw !== 'object') return base;
  const s = raw as Partial<PlayerState>;
  return { ...base, ...s, v: 1, daily: { ...base.daily, ...(s.daily || {}) } };
}

/** Engine functions mutate a draft; the store clones first so React sees a new object. */
export const clone = (s: PlayerState): PlayerState => JSON.parse(JSON.stringify(s));
