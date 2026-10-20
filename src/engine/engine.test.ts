import { describe, expect, it } from 'vitest';
import {
  BY, DAY_MS, UNITS, PLACES, STORY, REGION_UNITS, UNIT_BY, shiftItems, advance, anchorFor, buildExam, buildShift, bump, clone, compareAnswer, dailyIds, dailyStats, dayNo, dist, points, shareText, totalKm,
  fading, finish, freshState, reminderPlan, msToNextDay, untilText, gradePin, gradeType, israelDay, markDay, migrate, nextShift, onOpen, rank, seeded,
  squares, startSession, strength, T, answer, gradeTap, zoomAt, clampView, COUNTRY, ROUTES, roadQuiz, routeTitle,
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
    const q = buildExam(freshState(), seeded(4));
    expect(new Set(q.map((x) => x.id)).size).toBe(10);
    expect(q.every((x) => STORY.some((u) => u.items.includes(x.id)))).toBe(true);
  });
});

describe('catalog', () => {
  it('has 500 places with unique ids, the story first', () => {
    expect(PLACES.length).toBe(500);
    expect(new Set(PLACES.map((p) => p.id)).size).toBe(500);
    expect(STORY.map((u) => u.items.length)).toEqual([6, 6, 6, 6, 6, 6, 6]);
  });
  it('puts every place in exactly one postcard of 4 to 6', () => {
    const all = UNITS.flatMap((u) => u.items);
    expect(all.length).toBe(500);
    expect(new Set(all).size).toBe(500);
    expect(UNITS.every((u) => u.items.length >= 4 && u.items.length <= 6)).toBe(true);
  });
  it('splits a postcard into two non-empty shifts', () => {
    for (const u of UNITS) {
      expect(shiftItems(u, 0).length).toBeGreaterThan(0);
      expect(shiftItems(u, 1).length).toBeGreaterThan(0);
      expect([...shiftItems(u, 0), ...shiftItems(u, 1)]).toEqual(u.items);
    }
  });
  it('goes through the story, then the chosen region, then the rest', () => {
    const s = freshState();
    expect(nextShift(s)!.u.id).toBe('u1');
    STORY.forEach((u) => { s.units[u.id] = true; });
    expect(nextShift(s)!.u.id).toBe(REGION_UNITS[0].id);
    s.focus = 'ngv';
    expect(nextShift(s)!.u.id).toBe('ngv1');
    s.units.ngv1 = true;
    s.shifts.ngv2 = [true, false];
    expect(nextShift(s)).toEqual({ u: UNIT_BY.ngv2, s: 1 });
  });
  it('builds a shift for every regional postcard', () => {
    const s = freshState();
    for (const u of REGION_UNITS.slice(0, 20)) expect(buildShift(s, u, 1, 0, seeded(1)).length).toBeGreaterThan(5);
  });
  it('draws the daily from the biggest places only', () => {
    expect(dailyIds('2026-11-02').every((id) => BY[id].rank <= 150)).toBe(true);
  });
});

describe('daily', () => {
  it('gives everyone the same five places all day, spread apart', () => {
    const ids = dailyIds('2026-10-19');
    expect(ids).toEqual(dailyIds('2026-10-19'));
    expect(new Set(ids).size).toBe(5);
    expect(dailyIds('2026-10-20')).not.toEqual(ids);
    for (const a of ids) for (const b of ids) if (a !== b) expect(dist(BY[a], BY[b])).toBeGreaterThanOrEqual(20);
    expect(dayNo('2026-10-01')).toBe(1);
  });
  it('scores a point for each pin within 10 km', () => {
    const at = (d: number) => ({ id: 'x', d, g: { x: 0, y: 0 } });
    const picks = [at(3), at(10), at(10.5), at(40)];
    expect(points(picks)).toBe(2);
    expect(totalKm(picks)).toBe(63.5);
    expect(squares(picks)).toBe('🟩🟩🟥🟥⬜');
    expect(shareText(picks, '2026-10-19', 'f')).toContain('2/5');
    expect(shareText(picks, '2026-10-19', 'f', 3)).toContain('3 ימים ברצף');
    expect(shareText(picks, '2026-10-19', 'f', 1)).not.toContain('ברצף');
  });
  it('keeps a record of games, runs of days and the score spread', () => {
    const s = freshState();
    s.dailies = { '2026-10-10': [5, 4], '2026-10-11': [3, 30], '2026-10-12': [4, 12], '2026-10-15': [2, 50], '2026-10-16': [5, 3] };
    const st = dailyStats(s, '2026-10-17');
    expect(st.played).toBe(5);
    expect(st.avg).toBeCloseTo(3.8);
    expect(st.run).toBe(2); // yesterday still counts until today is over
    expect(st.best).toBe(3);
    expect(st.spread).toEqual([0, 0, 1, 1, 1, 2]);
    expect(dailyStats(s, '2026-10-18').run).toBe(0);
    expect(dailyStats(freshState(), '2026-10-18')).toEqual({ played: 0, avg: 0, run: 0, best: 0, spread: [0, 0, 0, 0, 0, 0] });
  });
});

describe('state', () => {
  it('fills fields missing from older saves', () => {
    const s = migrate({ xp: 50, daily: { day: '2026-10-19', dp: { id: 'jlm', d: 3, g: { x: 0, y: 0 } } } });
    expect(s.xp).toBe(50);
    expect(s.daily.shifts).toBe(0);
    expect(s.daily.picks).toEqual([]);
    expect('dp' in s.daily).toBe(false);
    expect(s.mastery).toEqual({});
    expect(s.focus).toBeNull();
    expect(clone(s)).toEqual(s);
  });
  it('logs a finished daily from a save made before the daily log', () => {
    const at = (d: number) => ({ id: 'x', d, g: { x: 0, y: 0 } });
    const s = migrate({ daily: { day: '2026-10-19', picks: [at(1), at(2), at(30), at(4), at(5.04)] } });
    expect(s.dailies).toEqual({ '2026-10-19': [4, 42] });
    expect(migrate({ daily: { day: '2026-10-19', picks: [at(1)] } }).dailies).toEqual({});
  });
});

describe('map zoom', () => {
  const v = { x: 0, y: 0, w: 40, h: 20 };
  it('keeps the zoom point in place', () => {
    const z = zoomAt(v, 2, { x: 10, y: 5 });
    expect(z).toEqual({ x: 5, y: 2.5, w: 20, h: 10 });
    expect((10 - z.x) / z.w).toBeCloseTo((10 - v.x) / v.w);
  });
  it('clamps width and keeps the view inside the map', () => {
    expect(clampView(zoomAt(v, 100), COUNTRY, 6, 200).w).toBe(6);
    const far = clampView({ x: 900, y: 900, w: 4000, h: 2000 }, COUNTRY, 6, 200);
    expect(far.w).toBe(200);
    expect(far.x + far.w / 2).toBe(COUNTRY.x + COUNTRY.w / 2); // wider than the map: centred
    expect(far.y + far.h).toBe(COUNTRY.y + COUNTRY.h); // fits in height: pushed back inside
  });
});

describe('reminders', () => {
  const at = new Date(2026, 9, 19, 10, 0, 0).getTime(); // 10:00 device time
  it('plans a week at the chosen hour, from today when not played', () => {
    const s = freshState();
    const plan = reminderPlan(s, '2026-10-19', at, 20);
    expect(plan).toHaveLength(7);
    expect(new Date(plan[0].at).getHours()).toBe(20);
    expect(new Date(plan[0].at).getDate()).toBe(19);
  });
  it('skips today once played, and guards the streak first', () => {
    const s = freshState();
    s.g = 'f'; s.streak = 4; s.lastDay = '2026-10-19';
    const plan = reminderPlan(s, '2026-10-19', at, 20);
    expect(plan).toHaveLength(6);
    expect(new Date(plan[0].at).getDate()).toBe(20);
    expect(plan[0].body).toContain('4 ימי נוכחות');
    expect(plan.every((r) => !/[{}|]/.test(r.body))).toBe(true);
  });
  it('skips an hour that already passed today', () => {
    expect(reminderPlan(freshState(), '2026-10-19', at, 8)).toHaveLength(6);
  });
});

describe('next daily countdown', () => {
  it('counts to midnight Israel time', () => {
    // 21:30 UTC on 19 Oct is 00:30 on 20 Oct in Israel (UTC+3), so 23.5 hours remain.
    expect(msToNextDay(Date.parse('2026-10-19T21:30:00Z'))).toBe(23.5 * 3600e3);
    expect(msToNextDay(Date.parse('2026-10-19T20:59:00Z'))).toBe(60e3);
  });
  it('says it in Hebrew', () => {
    expect(untilText(5 * 3600e3 + 12 * 60e3)).toBe('5 שעות ו־12 דקות');
    expect(untilText(2 * 3600e3)).toBe('שעתיים');
    expect(untilText(3600e3 + 60e3)).toBe('שעה ודקה');
    expect(untilText(20e3)).toBe('דקה');
  });
});

describe('road quiz', () => {
  it('knows every numbered road on the map', async () => {
    const overlay = (await import('../data/overlay.json')).default as { roads: { ref: string }[] };
    const refs = new Set(overlay.roads.map((r) => r.ref));
    expect([...refs].sort()).toEqual(ROUTES.map((r) => r.ref).sort());
  });
  it('asks about different roads, each with its own number among three', () => {
    const qs = roadQuiz(seeded(7));
    expect(qs).toHaveLength(8);
    expect(new Set(qs.map((q) => q.ref)).size).toBe(8);
    for (const q of qs) {
      expect(new Set(q.choices).size).toBe(3);
      expect(q.choices).toContain(q.ref);
    }
    expect(routeTitle('6')).toBe('כביש 6 · חוצה ישראל');
    expect(routeTitle('40')).toBe('כביש 40');
  });
});
