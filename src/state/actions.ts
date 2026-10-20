import { router } from 'expo-router';
import { useCallback } from 'react';
import { ANCHORS, buildExam, buildReview, buildShift, clone, INK_QS, learned, nextShift, regionPlaces, startSession, UNIT_BY, type PlayerState } from '@/engine';
import { useStore } from './store';

/** Places the player has met, plus the big cities and any extra: where wrong options come from. */
const known = (s: PlayerState, extra: string[] = []) => [...new Set([...ANCHORS, ...learned(s).map((p) => p.id), ...extra])];

/** Start a shift, a surprise inspection or the tenure exam, and open the lesson screen. */
export function useStart() {
  const { s, now, setSession, setResult } = useStore();
  const rng = Math.random;
  const open = useCallback(() => {
    setResult(null);
    router.push('/shift');
  }, [setResult]);
  return {
    shift: useCallback(
      (unitId?: string) => {
        const ns = nextShift(s);
        const u = unitId ? UNIT_BY[unitId] : ns?.u;
        if (!u) return;
        const sh = ns && ns.u.id === u.id ? ns.s : 0;
        // Questions are built against a copy; mastery only changes as answers come in.
        setSession(startSession('shift', buildShift(clone(s), u, sh, now(), rng), rng, u.id, sh, known(s, u.items)));
        open();
      },
      [s, now, setSession, open, rng],
    ),
    review: useCallback(
      (pool?: string[]) => {
        setSession(startSession('review', buildReview(s, now(), rng, pool), rng, null, 0, known(s)));
        open();
      },
      [s, now, setSession, open, rng],
    ),
    /** Renew a closed region's fading ink: an inspection of its weakest places. */
    ink: useCallback(
      (region: string) => {
        const sess = startSession('review', buildReview(s, now(), rng, regionPlaces(region), INK_QS), rng, null, 0, known(s, regionPlaces(region)));
        setSession({ ...sess, ink: region });
        open();
      },
      [s, now, setSession, open, rng],
    ),
    exam: useCallback(() => {
      setSession(startSession('exam', buildExam(s, rng), rng, null, 0, known(s)));
      open();
    }, [s, setSession, open, rng]),
  };
}
