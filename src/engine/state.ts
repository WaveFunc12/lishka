import { DAILY_N, logEntry } from './daily';
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
  tales: [],
  mute: false,
  focus: null,
  remind: null,
  dailies: {},
  ink: {},
  daily: { day: null, shifts: 0, reviews: 0, picks: [] },
});

/** Load saved progress, filling any fields added since it was saved. */
export function migrate(raw: unknown): PlayerState {
  const base = freshState();
  if (!raw || typeof raw !== 'object') return base;
  const s = raw as Partial<PlayerState>;
  // Saves from before the five-place daily have one pick in `dp`; that day's daily just starts over.
  const { dp: _old, ...d } = (s.daily || {}) as Partial<PlayerState['daily']> & { dp?: unknown };
  const out: PlayerState = { ...base, ...s, v: 1, daily: { ...base.daily, ...d, picks: Array.isArray(d.picks) ? d.picks : [] } };
  // Saves from before the daily log still have the last finished daily; keep it.
  const last = out.daily;
  if (last.day && last.picks.length >= DAILY_N && !out.dailies[last.day]) out.dailies = { ...out.dailies, [last.day]: logEntry(last.picks) };
  return out;
}

/** Engine functions mutate a draft; the store clones first so React sees a new object. */
export const clone = (s: PlayerState): PlayerState => JSON.parse(JSON.stringify(s));
