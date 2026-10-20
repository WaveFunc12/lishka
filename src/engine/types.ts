export type Gender = 'm' | 'f';

export type Place = {
  id: string;
  name: string;
  alias: string[];
  lat: number;
  lon: number;
  /** Map coordinates in km, x east, y south, origin near the country's middle. */
  x: number;
  y: number;
  type: string;
  district: string;
  hint: string;
  unit: string;
};

export type Point = { x: number; y: number };

export type Unit = {
  id: string;
  /** Full title shown on the postcard. */
  t: string;
  /** Short name used in the postmark. */
  s: string;
  col: string;
  /** Zvi's opening line for the unit. */
  z: string;
  /** Zvi's note on the back of the postcard. */
  card: string;
  /** Clue for the chocolate-milk mystery. */
  clue: string;
  items: string[];
};

export type DayStr = string; // YYYY-MM-DD in Israel time

export type DailyPick = { id: string; d: number; g: Point };

export type PlayerState = {
  v: 1;
  g: Gender | null;
  xp: number;
  streak: number;
  lastDay: DayStr | null;
  lastOpen: DayStr | null;
  sick: number;
  note: 'sick' | null;
  lost: number;
  welcome: boolean;
  mastery: Record<string, number>;
  seen: Record<string, number>;
  shifts: Record<string, [boolean, boolean]>;
  units: Record<string, boolean>;
  legendary: boolean;
  seenComic: boolean;
  mute: boolean;
  daily: { day: DayStr | null; shifts: number; reviews: number; dp: DailyPick | null };
};

export type QType = 'intro' | 'tap' | 'name' | 'compare' | 'pin' | 'type';
export type Dir = 'n' | 's' | 'e' | 'w';

export type Question = {
  t: QType;
  /** The place asked about. For compare, the first of the pair. */
  id: string;
  a?: string;
  b?: string;
  dir?: Dir;
  /** A fading place pulled back in for review. */
  rev?: boolean;
  /** A retry after a mistake; never retried twice. */
  again?: boolean;
  choices?: string[];
  /** Map offset so the cross isn't always centred. */
  off?: Point;
  view?: { x: number; y: number; w: number; h: number };
};

export type SessionKind = 'shift' | 'review' | 'exam';

export type Feedback = { ok: boolean; title: string; text: string; xp?: number };

export type Session = {
  kind: SessionKind;
  unitId: string | null;
  shift: number;
  q: Question[];
  i: number;
  ok: number;
  n: number;
  xp: number;
  combo: number;
  best: number;
  misses: string[];
  fb: Feedback | null;
};

export type SessionResult = {
  kind: SessionKind;
  unitId: string | null;
  shift: number;
  xp: number;
  ok: number;
  n: number;
  best: number;
  misses: string[];
  newIds: string[];
  /** A postcard was completed by this session. */
  card: boolean;
  streakUp: number | null;
  rankUp: string | null;
  earnedSick: boolean;
  welcomed: boolean;
};
