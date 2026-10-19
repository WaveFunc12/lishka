import { ANCHORS, BY, PLACES } from './catalog';
import { COMPASS } from './content';
import type { Point } from './types';

export type View = { x: number; y: number; w: number; h: number };

export const dist = (a: Point, b: Point): number => Math.hypot(a.x - b.x, a.y - b.y);

/** Compass word for the direction from `from` to `to` (y grows southwards). */
export function bearing(from: Point, to: Point): string {
  const a = (Math.atan2(from.y - to.y, to.x - from.x) * 180) / Math.PI;
  return COMPASS[((Math.round(a / 45) % 8) + 8) % 8];
}

/** The n places closest to `id`, skipping any closer than minKm (they'd overlap on the map). */
export function nearest(id: string, n: number, minKm = 3, pool: string[] = PLACES.map((p) => p.id)): string[] {
  const a = BY[id];
  return pool
    .filter((k) => k !== id && dist(BY[k], a) >= minKm)
    .sort((x, y) => dist(BY[x], a) - dist(BY[y], a))
    .slice(0, n);
}

/** Every new place is introduced relative to something the player already knows. */
export function anchorFor(id: string, learnedIds: string[]): { id: string; km: number; dir: string } | null {
  const it = BY[id];
  const pool = [...new Set([...ANCHORS, ...learnedIds])].filter((k) => k !== id && dist(BY[k], it) >= 3);
  const a = pool.sort((x, y) => dist(BY[x], it) - dist(BY[y], it))[0];
  if (!a) return null;
  return { id: a, km: Math.round(dist(BY[a], it)), dir: bearing(BY[a], it) };
}

/** A round scale-bar length for a view this wide. */
export function niceScale(w: number): number {
  const t = w / 4;
  for (const s of [1, 2, 5, 10, 20, 50, 100]) if (s >= t * 0.6) return s;
  return 100;
}

/** Smallest view of the given aspect that holds all points, with padding and a minimum width. */
export function fitView(pts: Point[], pad: number, minW: number, aspect: number): View {
  const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  let w = Math.max(x1 - x0, minW) * (1 + pad);
  let h = Math.max(y1 - y0, minW / aspect) * (1 + pad);
  if (w / h < aspect) w = h * aspect;
  else h = w / aspect;
  return { x: (x0 + x1) / 2 - w / 2, y: (y0 + y1) / 2 - h / 2, w, h };
}

/** Grow a view around its centre to match the box's aspect ratio. */
export function fitAspect(v: View, aspect: number): View {
  const c = { x: v.x + v.w / 2, y: v.y + v.h / 2 };
  let { w, h } = v;
  if (w / h < aspect) w = h * aspect;
  else h = w / aspect;
  return { x: c.x - w / 2, y: c.y - h / 2, w, h };
}

export const viewAround = (p: Point, w: number, off: Point = { x: 0, y: 0 }): View => ({
  x: p.x - w / 2 + off.x,
  y: p.y - w / 2 + off.y,
  w,
  h: w,
});
