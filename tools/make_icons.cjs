// Render the app icon, Android adaptive icon layers and splash image from SVG with Chromium (Playwright).
// Needs Playwright with a Chromium. Run from assets/: cd assets && node ../tools/make_icons.cjs
const { chromium } = require('playwright');
const g = require('../src/data/geo.json');
const land = g.homeLow.map((d) => `<path d="${d}"/>`).join('');
const lakes = (g.lakesLow || []).map((d) => `<path d="${d}"/>`).join('');
// Israel is 184 x 440 km (x -82..102, y -212..228); fit it in a box, centred.
function country(cx, cy, h, stroke) {
  const s = h / 440;
  // Outline first, then the fill on top, so only the outer coast and borders keep a line.
  return `<g transform="translate(${cx} ${cy}) scale(${s}) translate(-10 -8)">
    <g fill="#111" stroke="#111" stroke-width="${(2 * stroke) / s}" stroke-linejoin="round">${land}</g>
    <g fill="#F2C25F" stroke="#F2C25F" stroke-width="${1.5 / s}">${land}</g>
    <g fill="#2E9CA8">${lakes}</g>
  </g>`;
}
function pin(x, y, r) {
  return `<g transform="translate(${x} ${y})">
    <path d="M0 0 C ${-r * 0.2} ${-r * 0.9} ${-r} ${-r * 1.2} ${-r} ${-r * 2} A ${r} ${r} 0 1 1 ${r} ${-r * 2} C ${r} ${-r * 1.2} ${r * 0.2} ${-r * 0.9} 0 0 Z" fill="#D9431A" stroke="#111" stroke-width="${r * 0.22}" stroke-linejoin="round"/>
    <circle cx="0" cy="${-r * 2}" r="${r * 0.42}" fill="#FFF6E2" stroke="#111" stroke-width="${r * 0.14}"/>
  </g>`;
}
// Postage-stamp edge: a cream frame with round perforations.
function stamp(size, inset, holes) {
  const step = (size - 2 * inset) / holes, rr = step * 0.28;
  let h = '';
  for (let i = 0; i <= holes; i++) {
    const t = inset + i * step;
    for (const [x, y] of [[t, inset], [t, size - inset], [inset, t], [size - inset, t]]) h += `<circle cx="${x}" cy="${y}" r="${rr}"/>`;
  }
  return h;
}
const S = 1024;
const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">
  <rect width="${S}" height="${S}" fill="#F3DDAE"/>
  <rect x="70" y="70" width="${S - 140}" height="${S - 140}" fill="#2E9CA8"/>
  <g fill="#F3DDAE">${stamp(S, 70, 16)}</g>
  ${country(512, 512, 800, 12)}
  ${pin(500, 440, 52)}
</svg>`;
// Android adaptive foreground: transparent, content inside the middle 66%.
const fg = `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">
  ${country(512, 512, 560, 10)}${pin(503, 462, 38)}</svg>`;
const bgA = `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}"><rect width="${S}" height="${S}" fill="#2E9CA8"/></svg>`;
const mono = `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">
  <g transform="translate(512 512) scale(${560 / 440}) translate(-10 -8)" fill="#000">${land}</g></svg>`;
const splash = `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">
  ${country(512, 512, 900, 12)}${pin(498, 432, 58)}</svg>`;
(async () => {
  const b = await chromium.launch();
  for (const [name, svg, transparent] of [['icon', icon, false], ['android-icon-foreground', fg, true], ['android-icon-background', bgA, false], ['android-icon-monochrome', mono, true], ['splash-icon', splash, true], ['favicon', icon, false]]) {
    const size = name === 'favicon' ? 48 : S;
    const p = await b.newPage({ viewport: { width: size, height: size } });
    await p.setContent(`<html><body style="margin:0;background:transparent">${svg.replace(/width="1024" height="1024"/, `width="${size}" height="${size}"`)}</body></html>`);
    await p.screenshot({ path: `${name}.png`, omitBackground: transparent });
    await p.close();
  }
  await b.close();
})();
