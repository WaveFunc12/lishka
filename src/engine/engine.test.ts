import { describe, expect, it } from 'vitest';
import {
  BY, DAY_MS, PLACES, UNITS, advance, anchorFor, buildExam, buildShift, bump, clone, compareAnswer, dailyId, dayNo,
  fading, finish, freshState, gradePin, gradeType, israelDay, markDay, migrate, nextShift, onOpen, rank, score, seeded,
  squares, startSession, strength, T, answer, gradeTap,
} from './index';

const NOW = Date.parse('2026-10-19T09:00:00Z');

describe('text', () => {
  it('resolves gender tokens', () => {
    expect(T('{סמן|סמני} את חיפה', 'm')).toBe('סמן את חיפה');
    expect(T('{סמן|סמני} את חיפה', 'f')).toBe('סמני את חיפה');
    expect(T('אם {תפספס|}י', 'f')).toBe('אם י');
  });
  it('accepts loose spellings when typing', () => {
    const q = { t: 'type' as const, id: 'tlv' };
    expect(gradeType(q, 'תל-אביב').ok).toBe(true);
    expect(gradeType(q, 'תל אביב יפו').ok).toBe(true);
    expect(gradeType(q, 'חיפה').ok).toBe(false);
    expect(gradeType(q, '   ').ok).toBe(false);
  });
});

describe('time', () => {
  it('rolls the day over at midnight Israel time, not UTC', () => {
    expect(israelDay(Date.parse('2026-10-19T21:30:00Z'))).toBe('2026-10-20');
    expect(israelDay(Date.parse('2026-10-19T20:30:00Z'))).toBe('2026-10-19');
    expect(israelDay(Date.parse('2026-07-01T21:30:00Z'))).toBe('2026-07-02'); // summer time, UTC+3
  });
});

describe('memory', () => {
  it('halves strength every half-life', () => {
    const s = freshState();
    s.mastery.hfa = 2; // half-life 2 days
    s.seen.hfa = NOW - 2 * DAY_MS;
    expect(strength(s, 'hfa', NOW)).toBeCloseTo(0.5);
    expect(fading(s, NOW + DAY_MS).map((p) => p.id)).toEqual(['hfa']);
  });
  it('never drops an introduced place below level 1', () => {
    const s = freshState();
    bump(s, 'hfa', 1, NOW);
    bump(s, 'hfa', -1, NOW);
    bump(s, 'hfa', -1, NOW);
    expect(s.mastery.hfa).toBe(1);
  });
});

describe('attendance', () => {
  it('counts consecutive days', () => {
    const s = freshState();
    expect(markDay(s, '2026-10-18')).toBe(true);
    expect(markDay(s, '2026-10-18')).toBe(false);
    markDay(s, '2026-10-19');
    expect(s.streak).toBe(2);
  });
  it('spends the sick day on a single missed day', () => {
    const s = freshState();
    Object.assign(s, { streak: 4, lastDay: '2026-10-17', sick: 1 });
    onOpen(s, '2026-10-19');
    expect(s).toMatchObject({ streak: 4, sick: 0, note: 'sick', lastDay: '2026-10-18' });
    markDay(s, '2026-10-19');
    expect(s.streak).toBe(5);
  });
  it('resets the streak after two missed days', () => {
    const s = freshState();
    Object.assign(s, { streak: 4, lastDay: '2026-10-16', sick: 1 });
    onOpen(s, '2026-10-19');
    expect(s).toMatchObject({ streak: 0, lost: 4, sick: 1 });
  });
  it('welcomes back after a week away', () => {
    const s = freshState();
    s.mastery.hfa = 1;
    s.lastOpen = '2026-10-10';
    onOpen(s, '2026-10-19');
    expect(s.welcome).toBe(true);
  });
});

describe('shift', () => {
  it('introduces new places, then asks every kind of question', () => {
    const s = freshState(), u = UNITS[0];
    const q = buildShift(s, u, 0, NOW, seeded(1));
    const ids = u.items.slice(0, 3);
    expect(q.filter((x) => x.t === 'intro').map((x) => x.id)).toEqual(ids);
    expect(q.filter((x) => x.t === 'tap')).toHaveLength(3);
    expect(q.filter((x) => x.t === 'name')).toHaveLength(3);
    expect(q.slice(-2).map((x) => x.t)).toEqual(['pin', 'type']);
  });
  it('anchors a new place to the nearest known one', () => {
    const a = anchorFor('rmg', []);
    expect(a && BY[a.id].unit).toBe('u1');
    expect(a!.km).toBeGreaterThan(0);
  });
  it('completes a postcard after both shifts and counts the day', () => {
    const s = freshState(), rng = seeded(2), u = UNITS[0];
    for (const shift of [0, 1]) {
      const sess = startSession('shift', buildShift(s, u, shift, NOW, rng), rng, u.id, shift);
      let done = false;
      while (!done) {
        const q = sess.q[sess.i];
        if (q.t !== 'intro') answer(sess, s, gradeTap({ ...q, t: 'tap' }, q.t === 'compare' ? compareAnswer(q) : q.id), NOW, rng);
        done = advance(sess, s, NOW, rng);
      }
      const res = finish(sess, s, '2026-10-19');
      expect(res.card).toBe(shift === 1);
    }
    expect(s.units[u.id]).toBe(true);
    expect(s.streak).toBe(1);
    expect(nextShift(s)!.u.id).toBe(UNITS[1].id);
    u.items.forEach((id) => expect(s.mastery[id]).toBeGreaterThanOrEqual(1));
  });
  it('retries a miss once at the end of the shift', () => {
    const s = freshState(), rng = seeded(3), u = UNITS[0];
    const sess = startSession('shift', buildShift(s, u, 0, NOW, rng), rng, u.id, 0);
    const len = sess.q.length;
    advance(sess, s, NOW, rng); // past the first intro
    answer(sess, s, { ok: false, ids: [sess.q[1].id], text: '' }, NOW, rng);
    expect(sess.q).toHaveLength(len + 1);
    expect(sess.q.at(-1)!.again).toBe(true);
  });
});

describe('scoring', () => {
  it('counts a pin within 12 km in a shift and 8 km in the exam', () => {
    const it = BY.hfa, q = { t: 'pin' as const, id: 'hfa' };
    expect(gradePin(q, { x: it.x + 10, y: it.y }, 'shift').ok).toBe(true);
    expect(gradePin(q, { x: it.x + 10, y: it.y }, 'exam').ok).toBe(false);
    expect(gradePin(q, { x: it.x + 3, y: it.y }, 'exam').bonus).toBe(true);
  });
  it('promotes by seniority', () => {
    expect(rank(0).name).toBe('מתמחה');
    expect(rank(120).name).toBe('{ממפה זוטר|ממפה זוטרה}');
    expect(rank(5000).next).toBeNull();
  });
  it('builds a 10-place exam with no repeats', () => {
    const q = buildExam(seeded(4));
    expect(new Set(q.map((x) => x.id)).size).toBe(10);
  });
});

describe('settlement of the day', () => {
  it('is the same place all day and numbered from the epoch', () => {
    expect(dailyId('2026-10-19')).toBe(dailyId('2026-10-19'));
    expect(PLACES.map((p) => p.id)).toContain(dailyId('2026-10-19'));
    expect(dayNo('2026-10-01')).toBe(1);
  });
  it('scores five squares by distance', () => {
    expect(score(4)).toBe(5);
    expect(score(30)).toBe(2);
    expect(squares(100)).toBe('⬜⬜⬜⬜⬜');
  });
});

describe('state', () => {
  it('fills fields missing from older saves', () => {
    const s = migrate({ xp: 50, daily: { day: '2026-10-19' } });
    expect(s.xp).toBe(50);
    expect(s.daily.shifts).toBe(0);
    expect(s.mastery).toEqual({});
    expect(clone(s)).toEqual(s);
  });
});
