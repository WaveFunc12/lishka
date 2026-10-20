import type { Gender, Place } from './types';

/** Resolve {masculine|feminine} address tokens. Masculine until the player picks. */
export const T = (s: string, g: Gender | null): string =>
  s.replace(/\{([^|{}]*)\|([^{}]*)\}/g, (_, a: string, b: string) => (g === 'f' ? b : a));

/** Loose Hebrew match for typed answers: ignores spaces, dashes, quotes and doubled vav/yod. */
export const norm = (s: string | null | undefined): string =>
  (s || '').replace(/[\s\-־'"״׳.,]/g, '').replace(/יי/g, 'י').replace(/וו/g, 'ו');

/** True when a and b differ by one letter added, dropped or swapped for another. */
export function near1(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 1 || a === b) return a === b;
  let i = 0;
  while (i < a.length && a[i] === b[i]) i++;
  return a.length === b.length ? a.slice(i + 1) === b.slice(i + 1) : a.length > b.length ? a.slice(i + 1) === b.slice(i) : a.slice(i) === b.slice(i + 1);
}

export const shortName = (p: Place): string => p.short || p.name;

/** Rough population in words: "כ־12 אלף תושבים", "כ־1,300 תושבים". */
export const popText = (n: number): string =>
  n >= 1e6 ? 'יותר ממיליון תושבים' : n >= 10000 ? `כ־${Math.round(n / 1000).toLocaleString('en-US')} אלף תושבים` : `כ־${(Math.round(n / 100) * 100).toLocaleString('en-US')} תושבים`;

/** How many people live in the places on the map: "כ־1.4 מיליון איש", "כ־86 אלף איש". */
export const peopleText = (n: number): string =>
  n >= 1e6 ? `כ־${(Math.round(n / 1e5) / 10).toLocaleString('en-US')} מיליון איש` : n >= 10000 ? `כ־${Math.round(n / 1000).toLocaleString('en-US')} אלף איש` : `כ־${(Math.round(n / 100) * 100).toLocaleString('en-US')} איש`;

/** "5 שעות ו־12 דקות", "שעתיים", "דקה": a countdown in words. */
export function untilText(ms: number): string {
  const m = Math.max(1, Math.ceil(ms / 60000)), h = Math.floor(m / 60), mm = m % 60;
  const H = h === 1 ? 'שעה' : h === 2 ? 'שעתיים' : `${h} שעות`, M = mm === 1 ? 'דקה' : `${mm} דקות`;
  return h && mm ? `${H} ${/^\d/.test(M) ? 'ו־' : 'ו'}${M}` : h ? H : M;
}

export const kmText = (d: number): string => (d < 1 ? 'פחות מקילומטר' : `${Math.round(d)} ק״מ`);
