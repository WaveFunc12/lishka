import { daily, markDay } from './attendance';
import { BY, shiftItems, STORY } from './catalog';
import { COPY, DIR_WORD } from './content';
import { dist, nearest } from './geo';
import { bump, fading, introduce, learned, mastery, qType, strength } from './memory';
import { rank } from './progress';
import { pick, rnd, shuffle, type Rng } from './random';
import { kmText, norm } from './text';
import type { Dir, DayStr, Point, PlayerState, Question, Session, SessionKind, SessionResult, Unit } from './types';

/** Pin answers within this many km count. Within 4 km is a bullseye. */
export const PIN_LIMIT = { shift: 12, review: 12, exam: 8 } as const;
export const BULLSEYE_KM = 4;

/** Pick two nearby places to compare north/south or east/west, preferring close, confusable pairs. */
export function confPair(s: PlayerState, ids: string[], rng: Rng): { a: string; b: string; dir: Dir } | null {
  const pool = [...new Set([...ids, ...learned(s).map((p) => p.id)])];
  const c: { a: string; b: string; ax: 'x' | 'y'; d: number }[] = [];
  for (const lim of [45, 999]) {
    ids.forEach((a) =>
      pool.forEach((b) => {
        if (a === b) return;
        const A = BY[a], B = BY[b];
        if (dist(A, B) > lim) return;
        const dy = Math.abs(A.y - B.y), dx = Math.abs(A.x - B.x);
        if (dy >= 4) c.push({ a, b, ax: 'y', d: dy });
        if (dx >= 4) c.push({ a, b, ax: 'x', d: dx });
      }),
    );
    if (c.length) break;
  }
  if (!c.length) return null;
  c.sort((x, y) => x.d - y.d);
  const k = rnd(c.slice(0, 4), rng);
  return { a: k.a, b: k.b, dir: k.ax === 'y' ? rnd<Dir>(['n', 's'], rng) : rnd<Dir>(['e', 'w'], rng) };
}

/** One postcard = two shifts of 2 or 3 places; a shift is about 14 short screens. */
export function buildShift(s: PlayerState, u: Unit, shift: number, now: number, rng: Rng): Question[] {
  const ids = shiftItems(u, shift);
  const q: Question[] = [];
  ids.forEach((id) => {
    if (mastery(s, id) < 1) q.push({ t: 'intro', id });
    q.push({ t: 'tap', id });
  });
  shuffle(ids.slice(), rng).forEach((id) => q.push({ t: 'name', id }));
  const c = confPair(s, ids, rng);
  if (c) q.push({ t: 'compare', id: c.a, ...c });
  fading(s, now)
    .filter((p) => !ids.includes(p.id))
    .slice(0, 2)
    .forEach((p) => q.push({ t: qType(s, p.id), id: p.id, rev: true }));
  const sh = shuffle(ids.slice(), rng);
  q.push({ t: 'pin', id: sh[0] }, { t: 'type', id: sh[1 % sh.length] });
  return q;
}

/** Surprise inspection: the weakest learned places, at the difficulty their mastery has reached. */
export function buildReview(s: PlayerState, now: number, rng: Rng, pool = learned(s).map((p) => p.id), n = 8): Question[] {
  return shuffle(
    pool
      .slice()
      .sort((a, b) => strength(s, a, now) - strength(s, b, now))
      .slice(0, n)
      .map((id): Question => ({ t: qType(s, id), id, rev: true })),
    rng,
  );
}

/** The tenure exam: 10 random places the player has learned (the story's at least) on a blank map. */
export function buildExam(s: PlayerState, rng: Rng): Question[] {
  const pool = [...new Set([...STORY.flatMap((u) => u.items), ...learned(s).map((p) => p.id)])];
  return pick(pool, 10, rng).map((id): Question => ({ t: 'pin', id }));
}

/** Choices are drawn from `pool` (places the player has met, plus the session's own),
    so a wrong option is never a hamlet they've never heard of. */
export function startSession(kind: SessionKind, q: Question[], rng: Rng, unitId: string | null = null, shift = 0, pool?: string[]): Session {
  const sess: Session = { kind, unitId, shift, q, i: 0, ok: 0, n: 0, xp: 0, combo: 0, best: 0, misses: [], fb: null, pool };
  prep(sess, rng);
  return sess;
}

/** Fill in the choices and map framing for the current question. */
export function prep(sess: Session, rng: Rng): void {
  const q = sess.q[sess.i];
  if (!q) return;
  const pool = sess.pool && sess.pool.length >= 6 ? sess.pool : undefined;
  const near = nearest(q.id, 2, 4, pool);
  const jitter = (k: number) => (rng() - 0.5) * k;
  if (q.t === 'tap') q.choices = shuffle([q.id, ...near], rng);
  if (q.t === 'name') {
    q.choices = shuffle([q.id, ...near], rng);
    q.off = { x: jitter(14), y: jitter(14) };
  }
  if (q.t === 'pin') {
    const w = sess.kind === 'exam' ? 140 : 110, it = BY[q.id];
    q.view = { x: it.x - w / 2 + jitter(w * 0.5), y: it.y - w / 2 + jitter(w * 0.5), w, h: w };
  }
  if (q.t === 'type') q.off = { x: jitter(12), y: jitter(12) };
}

export type Grade = { ok: boolean; ids: string[]; text: string; bonus?: boolean; title?: string };

export function gradeTap(q: Question, picked: string): Grade {
  const ok = picked === q.id, it = BY[q.id];
  return { ok, ids: [q.id], text: ok ? `${it.name}: ${it.hint}` : `זו ${BY[picked].name}. ${it.name} מסומנת בירוק.` };
}

export function gradeName(q: Question, picked: string): Grade {
  const ok = picked === q.id, it = BY[q.id];
  return { ok, ids: [q.id], text: ok ? it.hint : `זו ${it.name}. ${it.hint}` };
}

export function compareAnswer(q: Question): string {
  const A = BY[q.a!], B = BY[q.b!];
  const firstWins = q.dir === 'n' ? A.y < B.y : q.dir === 's' ? A.y > B.y : q.dir === 'e' ? A.x > B.x : A.x < B.x;
  return firstWins ? A.id : B.id;
}

export function gradeCompare(q: Question, picked: string): Grade {
  const A = BY[q.a!], B = BY[q.b!], correct = compareAnswer(q);
  const gap = Math.round(q.dir === 'n' || q.dir === 's' ? Math.abs(A.y - B.y) : Math.abs(A.x - B.x));
  return { ok: picked === correct, ids: [q.a!, q.b!], text: `${BY[correct].name} ${DIR_WORD[q.dir!]} יותר, בכ־${gap} ק״מ.` };
}

export function gradePin(q: Question, guess: Point, kind: SessionKind): Grade {
  const it = BY[q.id], d = dist(guess, it), ok = d <= PIN_LIMIT[kind];
  return {
    ok,
    ids: [q.id],
    text: `${kmText(d)} מהמיקום האמיתי.${ok ? '' : ' ' + it.name + ': ' + it.hint}`,
    bonus: d <= BULLSEYE_KM,
    title: d <= BULLSEYE_KM ? COPY.bullseye : undefined,
  };
}

export function gradeType(q: Question, typed: string): Grade {
  const it = BY[q.id], v = norm(typed);
  const ok = !!v && [it.name, ...(it.alias || [])].some((n) => norm(n) === v);
  return { ok, ids: [q.id], text: ok ? it.hint : `התשובה: ${it.name}` };
}

/** Apply an answer: XP with a combo bonus, mastery up or down, and one retry at the end for a miss. */
export function answer(sess: Session, s: PlayerState, g: Grade, now: number, rng: Rng): void {
  const q = sess.q[sess.i];
  sess.n++;
  if (g.ok) {
    sess.ok++;
    sess.combo++;
    sess.best = Math.max(sess.best, sess.combo);
    const xp = (sess.combo >= 3 ? 2 : 1) * (g.bonus ? 15 : 10);
    sess.xp += xp;
    g.ids.forEach((id) => bump(s, id, 1, now));
    sess.fb = { ok: true, title: g.title || rnd(COPY.praise, rng), text: g.text, xp };
  } else {
    sess.combo = 0;
    g.ids.forEach((id) => bump(s, id, -1, now));
    if (sess.kind === 'exam') sess.misses.push(q.id);
    else if (!q.again) sess.q.push({ t: q.t, id: q.id, a: q.a, b: q.b, dir: q.dir, rev: q.rev, again: true });
    sess.fb = { ok: false, title: rnd(COPY.oops, rng), text: g.text };
  }
}

/** Move on. Leaving an intro card counts as having met the place. Returns true when the session is over. */
export function advance(sess: Session, s: PlayerState, now: number, rng: Rng): boolean {
  const cq = sess.q[sess.i];
  if (cq && cq.t === 'intro') introduce(s, cq.id, now);
  sess.fb = null;
  sess.i++;
  if (sess.i >= sess.q.length) return true;
  prep(sess, rng);
  return false;
}

/** Bank the session: XP, shift and postcard completion, sick day, attendance, promotion. */
export function finish(sess: Session, s: PlayerState, today: DayStr): SessionResult {
  const before = rank(s.xp).name;
  const d = daily(s, today);
  let card = false, earnedSick = false, welcomed = false, streakUp: number | null = null;
  s.xp += sess.xp;
  if (sess.kind === 'shift' && sess.unitId) {
    const sh = (s.shifts[sess.unitId] = s.shifts[sess.unitId] || [false, false]);
    sh[sess.shift] = true;
    d.shifts++;
    if (sh.every(Boolean) && !s.units[sess.unitId]) {
      s.units[sess.unitId] = true;
      card = true;
    }
  }
  if (sess.kind === 'review') {
    d.reviews++;
    if (s.sick < 1) {
      s.sick = 1;
      earnedSick = true;
    }
    if (s.welcome) {
      s.welcome = false;
      welcomed = true;
    }
  }
  if (sess.kind === 'exam' && !sess.misses.length) s.legendary = true;
  if (sess.kind !== 'exam' && markDay(s, today)) streakUp = s.streak;
  s.note = null;
  s.lost = 0;
  const after = rank(s.xp).name;
  return {
    kind: sess.kind,
    unitId: sess.unitId,
    shift: sess.shift,
    xp: sess.xp,
    ok: sess.ok,
    n: sess.n,
    best: sess.best,
    misses: sess.misses,
    newIds: sess.q.filter((q) => q.t === 'intro').map((q) => q.id),
    card,
    streakUp,
    rankUp: after !== before ? after : null,
    earnedSick,
    welcomed,
  };
}
