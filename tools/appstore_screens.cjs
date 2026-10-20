// App Store screenshots, 6.9" iPhone (1320 x 2868): 440 x 956 points at 3x. Needs Playwright and the web export served on :8096
// (npx expo export -p web, then any static server). Usage: node tools/appstore_screens.cjs <out dir>
const { chromium } = require('playwright');
const places = require('../src/data/places.json');
const seed = require('./seed_save.cjs');
const OUT = process.argv[2]; require('fs').mkdirSync(OUT, { recursive: true });
const B = 'http://localhost:8096';
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 440, height: 956 }, deviceScaleFactor: 3 });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  const set = async (st) => { await p.goto(B + '/'); await p.waitForTimeout(800); await p.evaluate((s) => localStorage.setItem('lishka-progress-v1', JSON.stringify(s)), st); };
  const shot = (n) => p.screenshot({ path: `${OUT}/${n}.png` });
  // 1. Home mid-story.
  await set(seed(places, { upto: 'u4', m: 3, ago: 0, extra: { streak: 6, xp: 1240 } }));
  await p.goto(B + '/home'); await p.waitForTimeout(2500); await shot('1-home');
  // 2. A question: the surprise inspection asks about places already met.
  await set(seed(places, { upto: 'u5', m: 2, ago: 12, extra: { streak: 6, xp: 1600 } }));
  await p.goto(B + '/home'); await p.waitForTimeout(2000);
  await p.getByText('ביקורת פתע', { exact: true }).first().click(); await p.waitForTimeout(2000);
  for (let i = 0; i < 8; i++) {
    const txt = await p.evaluate(() => document.body.innerText);
    if (/איפה נמצאת|איזה יישוב מסומן|סמן את/.test(txt)) break;
    const opt = p.getByRole('button', { name: '1', exact: true });
    if (await opt.count()) await opt.click(); else if (await p.getByText('להעביר לצבי').count()) await p.getByText('להעביר לצבי').click();
    else { const m = p.getByLabel('מפת השאלה').first(); const bb = await m.boundingBox(); await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); }
    await p.waitForTimeout(600); await p.getByRole('button', { name: 'הבא בתור', exact: true }).click().catch(() => {}); await p.waitForTimeout(900);
  }
  await shot('2-question');
  // 3. The daily, played, with its result.
  await set(seed(places, { upto: 'u7', m: 3, ago: 0 }));
  await p.goto(B + '/daily'); await p.waitForTimeout(2000);
  for (let i = 0; i < 5; i++) {
    const m = p.getByRole('button', { name: /^מפת הארץ/ }).first(); const bb = await m.boundingBox();
    await p.mouse.click(bb.x + bb.width * (0.45 + 0.03 * i), bb.y + bb.height * (0.3 + 0.08 * i)); await p.waitForTimeout(600);
    await p.getByRole('button', { name: /ליישוב הבא|לתוצאה/ }).click(); await p.waitForTimeout(700);
  }
  // Swap the clicks for a good game: four within a few km, one miss.
  await p.evaluate((P) => {
    const st = JSON.parse(localStorage.getItem('lishka-progress-v1'));
    const off = [[1.5, -2], [-3, 1], [2, 2.5], [-1, -1], [14, 9]];
    st.daily.picks = st.daily.picks.map((k, i) => { const q = P.find((x) => x.id === k.id); const g = { x: q.x + off[i][0], y: q.y + off[i][1] };
      return { id: k.id, g, d: Math.hypot(off[i][0], off[i][1]) }; });
    // A few weeks of earlier dailies, the last six in a row, so the record card has something to show.
    const t0 = Date.parse(st.daily.day + 'T00:00:00Z'), day = (n) => new Date(t0 - n * 864e5).toISOString().slice(0, 10);
    const pts = [3, 4, 2, 5, 3, 4, 3, 4, 5, 2, 3, 4, 3, 4, 4, 5, 3, 4];
    st.dailies = { [st.daily.day]: [4, 27] };
    pts.forEach((n, i) => { st.dailies[day(i < 5 ? i + 1 : i + 2 + (i > 11 ? 1 : 0))] = [n, 60 - 10 * n]; });
    localStorage.setItem('lishka-progress-v1', JSON.stringify(st));
  }, places.map((q) => ({ id: q.id, x: q.x, y: q.y })));
  await p.goto(B + '/daily'); await p.waitForTimeout(2500); await shot('3-daily');
  // 4. My map: everything learned so far.
  const st = seed(places, { upto: 'dan1', m: 3, ago: 1 });
  for (const q of places) if (/^(u\d|dan|shr|hfa)/.test(q.unit)) { st.mastery[q.id] = 3; st.seen[q.id] = Date.now(); st.units[q.unit] = true; }
  await set(st);
  await p.goto(B + '/atlas?v=-50,-140,100'); await p.waitForTimeout(2500); await shot('4-my-map');
  // 5. The archive of regions.
  await p.goto(B + '/archive'); await p.waitForTimeout(2000); await shot('5-archive');
  console.log('errors', JSON.stringify(errs));
  await b.close();
})();
