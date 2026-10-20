import { router } from 'expo-router';
import { useCallback } from 'react';
import { buildExam, buildReview, buildShift, clone, nextShift, startSession, UNITS } from '@/engine';
import { useStore } from './store';

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
        const u = unitId ? UNITS.find((x) => x.id === unitId)! : ns?.u;
        if (!u) return;
        const sh = ns && ns.u.id === u.id ? ns.s : 0;
        // Questions are built against a copy; mastery only changes as answers come in.
        setSession(startSession('shift', buildShift(clone(s), u, sh, now(), rng), rng, u.id, sh));
        open();
      },
      [s, now, setSession, open, rng],
    ),
    review: useCallback(
      (pool?: string[]) => {
        setSession(startSession('review', buildReview(s, now(), rng, pool), rng));
        open();
      },
      [s, now, setSession, open, rng],
    ),
    exam: useCallback(() => {
      setSession(startSession('exam', buildExam(rng), rng));
      open();
    }, [setSession, open, rng]),
  };
}
