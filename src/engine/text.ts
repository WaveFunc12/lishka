import type { Gender, Place } from './types';

/** Resolve {masculine|feminine} address tokens. Masculine until the player picks. */
export const T = (s: string, g: Gender | null): string =>
  s.replace(/\{([^|{}]*)\|([^{}]*)\}/g, (_, a: string, b: string) => (g === 'f' ? b : a));

/** Loose Hebrew match for typed answers: ignores spaces, dashes, quotes and doubled vav/yod. */
export const norm = (s: string | null | undefined): string =>
  (s || '').replace(/[\s\-־'"״׳.,]/g, '').replace(/יי/g, 'י').replace(/וו/g, 'ו');

export const shortName = (p: Place): string => (p.alias && p.alias[0]) || p.name;

export const kmText = (d: number): string => (d < 1 ? 'פחות מקילומטר' : `${Math.round(d)} ק״מ`);
