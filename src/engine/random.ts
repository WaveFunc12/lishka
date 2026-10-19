export type Rng = () => number;

export function shuffle<T>(a: T[], rng: Rng): T[] {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const pick = <T>(a: T[], n: number, rng: Rng): T[] => shuffle(a.slice(), rng).slice(0, n);
export const rnd = <T>(a: T[], rng: Rng): T => a[Math.floor(rng() * a.length)];

/** Small seeded generator for tests and for anything that must repeat (mulberry32). */
export function seeded(seed: number): Rng {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
