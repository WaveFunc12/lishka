// Seed a saved game: units before `upto` done, their places at mastery m, last seen `ago` days back.
module.exports = function seed(places, { upto = 'u3', m = 2, ago = 10, g = 'm', extra = {} } = {}) {
  const order = ['u1','u2','u3','u4','u5','u6','u7'], done = order.slice(0, order.indexOf(upto));
  const t = Date.now() - ago * 864e5, mastery = {}, seen = {}, shifts = {}, units = {};
  for (const p of places) if (done.includes(p.unit)) { mastery[p.id] = m; seen[p.id] = t; }
  for (const u of done) { shifts[u] = [true, true]; units[u] = true; }
  return { v: 1, g, xp: 900, streak: 3, lastDay: null, lastOpen: null, sick: 0, note: null, lost: 0, welcome: false,
    mastery, seen, shifts, units, legendary: false, seenComic: true, mute: true, daily: { day: null, shifts: 0, reviews: 0, picks: [] }, ...extra };
};
