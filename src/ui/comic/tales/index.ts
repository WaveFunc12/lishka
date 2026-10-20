import type { Panel } from '../ComicPlayer';
import { ashdod } from './ashdod';
import { beersheva } from './beersheva';
import { haifa } from './haifa';
import { jerusalem } from './jerusalem';
import { netanya } from './netanya';
import { regions1 } from './regions1';
import { regions2 } from './regions2';
import { regions3 } from './regions3';
import { telaviv } from './telaviv';

/* Founding stories: a short comic for each big city, keyed by place id, and for each region, keyed `r-<region id>`
   (Haifa is both a city and a region). A city's story plays the first time its file opens in a shift, a region's as
   its first postcard starts; both can be watched again, from the map and from the archive. */

export type Tale = {
  /** Shown over the panels. */
  title: string;
  /** `today` is the closing line about the place now, such as its population. */
  panels: (t: (s: string) => string, today: string) => Panel[];
};

/** The key of a region's story in TALES. */
export const regionTale = (regionId: string) => `r-${regionId}`;

export const TALES: Record<string, Tale> = {
  jlm: jerusalem,
  tlv: telaviv,
  hfa: haifa,
  bsh: beersheva,
  asd: ashdod,
  ntn: netanya,
  ...Object.fromEntries(Object.entries({ ...regions1, ...regions2, ...regions3 }).map(([id, tale]) => [regionTale(id), tale])),
};
