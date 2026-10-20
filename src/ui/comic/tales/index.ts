import type { Panel } from '../ComicPlayer';
import { ashdod } from './ashdod';
import { beersheva } from './beersheva';
import { haifa } from './haifa';
import { jerusalem } from './jerusalem';
import { netanya } from './netanya';
import { telaviv } from './telaviv';

/* Founding stories: a short comic for each big city (and, later, each region), keyed by place or region id.
   A story plays the first time its city opens a file in a shift, and can be watched again from the map. */

export type Tale = {
  /** Shown over the panels. */
  title: string;
  /** `today` is the closing line about the place now, such as its population. */
  panels: (t: (s: string) => string, today: string) => Panel[];
};

export const TALES: Record<string, Tale> = {
  jlm: jerusalem,
  tlv: telaviv,
  hfa: haifa,
  bsh: beersheva,
  asd: ashdod,
  ntn: netanya,
};
