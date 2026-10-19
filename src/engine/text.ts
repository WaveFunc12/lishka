import type { Gender, Place } from './types';

/** Resolve {masculine|feminine} address tokens. Masculine until the player picks. */
export const T = (s: string, g: Gender | null): string =>
  s.replace(/\{([^|{}]*)\|([^{}]*)\}/g, (_, a: string, b: string) => (g === 'f' ? b : a));

/** Loose Hebrew match for typed answers: ignores spaces, dashes, quotes and doubled vav/yod. */
export const norm = (s: string | null | undefined): string =>
  (s || '').replace(/[\s\-־'"״׳.,]/g, '').replace(/יי/g, 'י').replace(/וו/g, 'ו');

export const shortName = (p: Place): string => p.short || p.name;

/** Rough population in words: "כ־12 אלף תושבים", "כ־1,300 תושבים". */
export const popText = (n: number): string =>
  n >= 1e6 ? 'יותר ממיליון תושבים' : n >= 10000 ? `כ־${Math.round(n / 1000).toLocaleString('en-US')} אלף תושבים` : `כ־${(Math.round(n / 100) * 100).toLocaleString('en-US')} תושבים`;

export const kmText = (d: number): string => (d < 1 ? 'פחות מקילומטר' : `${Math.round(d)} ק״מ`);
