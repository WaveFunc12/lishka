import { memo } from 'react';
import { G, Path, Rect, Text as SvgText } from 'react-native-svg';
import overlay from '@/data/overlay.json';
import roadnet from '@/data/roadnet.json';
import type { Point, View as MapBox } from '@/engine';
import { C, F, ROAD_COL } from './theme';

/* The road network, named streams, route shields and region names, drawn over the relief.
   Built by tools/map/build_overlays.py from OpenStreetMap data (via Overture Maps).
   Sizes are in screen pixels (k = km per pixel); how much shows depends on how far in the view is. */

type Road = { ref: string; d: string };
type Stream = { name: string; level: number; d: string; f: string };
type Region = { name: string; x: number; y: number; size: number };
/** One piece of the road network: class (0 motorway .. 3 secondary), level of detail, cell corner in km, path in 10 m units. */
type NetPart = { c: number; l: 0 | 1; x: number; y: number; d: string };
const O = overlay as unknown as { roads: Road[]; streams: Stream[]; regions: Region[] };
const NET = roadnet as NetPart[];
const CELL = 16; // km, as in build_overlays.py
const REGION_PX = [17, 14, 12];
// Rough width of one Suez One letter, as a share of the font size.
const CHAR_W = 0.29;
// About how far each size of region spreads from its centre, in km. A name shows only once the whole region fits on screen.
const REGION_R = [30, 16, 8];
// Below this view width (km) the full-detail roads and streams are drawn.
const DETAIL_W = 90;
// Line and casing widths in px, by road class. Secondary roads get no casing so they stay in the background.
const ROAD_PX = [2.5, 1.9, 1.3, 0.9];
const CASE_PX = [4.6, 3.7, 2.7, 0];

/** The road classes worth drawing at this zoom: motorways and trunk roads always, primary from 140 km across, secondary from 50. */
const showClass = (c: number, w: number) => c <= 1 || (c === 2 && w < 140) || (c === 3 && w < 50);

/** Lines under the game: streams and the road network. */
export const MapOverlayBase = memo(function MapOverlayBase({ v, k }: { v: MapBox; k: number }) {
  const streamLevel = v.w < 110 ? 1 : v.w < 260 ? 0 : -1;
  const lod = v.w < DETAIL_W ? 1 : 0;
  const parts = NET.filter((p) => p.l === lod && showClass(p.c, v.w) &&
    (lod === 0 || (p.x < v.x + v.w && p.x + CELL > v.x && p.y < v.y + v.h && p.y + CELL > v.y)))
    .sort((a, b) => b.c - a.c);
  // Full-detail paths are in 10 m units: draw them in a group scaled by 0.01, with widths scaled up to match.
  // Zoomed far out the network is drawn finer, so the country doesn't turn into a tangle.
  const u = 100 * k * (v.w > 200 ? 0.6 : v.w > DETAIL_W ? 0.8 : 1);
  return (
    <G>
      {lod ? (
        <G transform="scale(0.01)">
          {O.streams.filter((s) => s.level <= streamLevel).map((s) => (
            <Path key={s.name} d={s.f} fill="none" stroke={C.stream} strokeWidth={1.4 * u} strokeLinejoin="round" strokeLinecap="round" />
          ))}
        </G>
      ) : (
        O.streams.filter((s) => s.level <= streamLevel).map((s) => (
          <Path key={s.name} d={s.d} fill="none" stroke={C.stream} strokeWidth={1.4 * k} strokeLinejoin="round" strokeLinecap="round" />
        ))
      )}
      <G transform="scale(0.01)">
        {parts.filter((p) => CASE_PX[p.c]).map((p) => (
          <Path key={`c${p.c}-${p.x}-${p.y}`} d={p.d} fill="none" stroke={C.roadCase} strokeOpacity={0.85} strokeWidth={CASE_PX[p.c] * u}
            strokeLinejoin="round" strokeLinecap="round" />
        ))}
        {parts.map((p) => (
          <Path key={`r${p.c}-${p.x}-${p.y}`} d={p.d} fill="none" stroke={ROAD_COL[p.c]} strokeWidth={ROAD_PX[p.c] * u}
            strokeLinejoin="round" strokeLinecap="round" />
        ))}
      </G>
    </G>
  );
});

type Label =
  | { kind: 'shield'; x: number; y: number; ref: string }
  | { kind: 'region'; x: number; y: number; name: string; size: number }
  | { kind: 'stream'; x: number; y: number; name: string; a: number };
type Box = { x0: number; y0: number; x1: number; y1: number };
type Line = { pts: Point[]; cum: number[] };

// Path strings to point lists with running length, parsed once.
const toLines = (d: string): Line[] => d.split('M').filter(Boolean).map((part) => {
  const pts = part.split('L').map((xy) => { const [x, y] = xy.split(' ').map(Number); return { x, y }; });
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
  return { pts, cum };
});
const ROAD_LINES = O.roads.map((r) => toLines(r.d));
const STREAM_LINES = O.streams.map((s) => toLines(s.d));

/** Every point of a numbered road (all its pieces). */
export const routePoints = (ref: string): Point[] => O.roads.flatMap((r, i) => (r.ref === ref ? ROAD_LINES[i].flatMap((l) => l.pts) : []));

/** The box around a numbered road, for fitting the map to it. */
export function routeBox(ref: string): Point[] {
  const pts = routePoints(ref);
  const xs = pts.map((q) => q.x), ys = pts.map((q) => q.y);
  return [{ x: Math.min(...xs), y: Math.min(...ys) }, { x: Math.max(...xs), y: Math.max(...ys) }];
}

/** One numbered road drawn bold in the game's orange over a pale halo, for the road quiz. */
export function RouteHighlight({ route, k }: { route: string; k: number }) {
  const ds = O.roads.filter((r) => r.ref === route).map((r) => r.d);
  return (
    <G>
      {[[C.roadCase, 9], [C.target, 4.5]].map(([col, w]) => ds.map((d, i) => (
        <Path key={`${col}${i}`} d={d} fill="none" stroke={col as string} strokeWidth={(w as number) * k} strokeLinejoin="round" strokeLinecap="round" />
      )))}
    </G>
  );
}

/** Points every `step` km along the lines (at fixed distances, so they don't jump while panning), with the local angle. */
function along(lines: Line[], step: number, v: MapBox, margin: number) {
  const out: (Point & { a: number })[] = [];
  for (const { pts, cum } of lines) {
    let j = 1;
    for (let t = step / 2; t < cum[cum.length - 1]; t += step) {
      while (cum[j] < t) j++;
      const a = pts[j - 1], b = pts[j], f = (t - cum[j - 1]) / (cum[j] - cum[j - 1] || 1);
      const q = { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
      if (q.x > v.x + margin && q.x < v.x + v.w - margin && q.y > v.y + margin && q.y < v.y + v.h - margin) {
        let ang = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
        if (ang > 90) ang -= 180;
        if (ang < -90) ang += 180;
        out.push({ ...q, a: ang });
      }
    }
  }
  return out;
}

/** Road shields, region names and stream names for whatever part of each is on screen,
    placed so none overlap each other or the game's own marks. */
export const MapLabels = memo(function MapLabels({ v, k, avoid, reserved = [], noShields }: { v: MapBox; k: number; avoid: Point[]; reserved?: MapBox[]; noShields?: boolean }) {
  const m = 16 * k;
  // A shield roughly every 150 px of road on screen, a stream name every 320 px.
  const shields = (): Label[] => noShields ? [] : O.roads.flatMap((r, i) => along(ROAD_LINES[i], 150 * k, v, m).map((q): Label => ({ kind: 'shield', x: q.x, y: q.y, ref: r.ref })));
  const streams = (lv: number): Label[] => (lv <= (v.w < 70 ? 1 : v.w < 160 ? 0 : -1) ? O.streams : [])
    .flatMap((s, i) => (s.level === lv ? along(STREAM_LINES[i], 320 * k, v, m * 2) : []).map((q): Label => ({ kind: 'stream', x: q.x, y: q.y, name: s.name, a: q.a })));
  // A region's name shows only when the whole region is on screen, so zoomed in on part of השפלה there's no השפלה.
  const regions = (sz: number): Label[] => (sz <= (v.w < 130 ? 2 : v.w < 300 ? 1 : 0) ? O.regions : []).flatMap((g): Label[] => {
    const r = REGION_R[g.size];
    if (g.size !== sz || v.w < 2 * r || v.h < 1.4 * r) return [];
    return g.x > v.x && g.x < v.x + v.w && g.y > v.y && g.y < v.y + v.h ? [{ kind: 'region', x: g.x, y: g.y, name: g.name, size: g.size }] : [];
  });
  const order = [...regions(0), ...shields(), ...regions(1), ...streams(0), ...regions(2), ...streams(1)];

  const box = (l: Label): Box => {
    const pad = 3 * k;
    let hw: number, hh: number;
    if (l.kind === 'shield') { hw = (4 + 3.25 * l.ref.length) * k; hh = 7 * k; }
    else if (l.kind === 'region') { const fs = REGION_PX[l.size] * k; hw = fs * CHAR_W * l.name.length; hh = fs * 0.6; }
    else { const r = 10 * k * 0.3 * l.name.length; hw = r; hh = r; } // rotated: a square around it
    return { x0: l.x - hw - pad, x1: l.x + hw + pad, y0: l.y - hh - pad, y1: l.y + hh + pad };
  };
  const hit = (a: Box, b: Box) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
  const taken: Box[] = [
    ...avoid.map((q) => ({ x0: q.x - 14 * k, x1: q.x + 14 * k, y0: q.y - 14 * k, y1: q.y + 14 * k })),
    ...reserved.map((r) => ({ x0: r.x, x1: r.x + r.w, y0: r.y, y1: r.y + r.h })),
  ];
  const fits = (b: Box) => b.x0 > v.x && b.x1 < v.x + v.w && b.y0 > v.y && b.y1 < v.y + v.h;
  const placed = order.filter((l) => {
    const b = box(l);
    if (!fits(b) || taken.some((t) => hit(t, b))) return false;
    taken.push(b);
    return true;
  });

  return (
    <G>
      {placed.map((l) => {
        if (l.kind === 'shield') {
          const h = 14 * k, w = (8 + 6.5 * l.ref.length) * k;
          return (
            <G key={`s${l.ref}-${l.x}`}>
              <Rect x={l.x - w / 2} y={l.y - h / 2} width={w} height={h} rx={2.5 * k} fill={C.shield} stroke={C.surface} strokeWidth={1.4 * k} />
              <SvgText x={l.x} y={l.y + h * 0.3} textAnchor="middle" fontSize={h * 0.78} fontFamily={F.black} fontWeight="900" fill={C.surface}>{l.ref}</SvgText>
            </G>
          );
        }
        if (l.kind === 'region') {
          const fs = REGION_PX[l.size] * k;
          return (
            <G key={'g' + l.name} opacity={0.7}>
              <SvgText x={l.x} y={l.y + fs * 0.35} textAnchor="middle" fontSize={fs} fontFamily={F.display}
                stroke={C.surface} strokeWidth={fs * 0.2} strokeLinejoin="round" fill={C.surface}>{l.name}</SvgText>
              <SvgText x={l.x} y={l.y + fs * 0.35} textAnchor="middle" fontSize={fs} fontFamily={F.display} fill={C.muted}>{l.name}</SvgText>
            </G>
          );
        }
        const fs = 10 * k;
        return (
          <G key={'n' + l.name} transform={`rotate(${l.a} ${l.x} ${l.y})`}>
            <SvgText x={l.x} y={l.y - fs * 0.5} textAnchor="middle" fontSize={fs} fontFamily={F.bold} fontWeight="700"
              stroke={C.surface} strokeWidth={fs * 0.3} strokeLinejoin="round" fill={C.surface}>{l.name}</SvgText>
            <SvgText x={l.x} y={l.y - fs * 0.5} textAnchor="middle" fontSize={fs} fontFamily={F.bold} fontWeight="700" fill={C.streamInk}>{l.name}</SvgText>
          </G>
        );
      })}
    </G>
  );
});
