import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { clone, freshState, israelDay, migrate, onOpen, T, type PlayerState, type Session, type SessionResult } from '@/engine';

/* One store for the whole app. Engine functions mutate a cloned draft, then the store saves it.
   Progress lives on the phone for now; account backup plugs in here later. */

const KEY = 'lishka-progress-v1';

type Store = {
  ready: boolean;
  s: PlayerState;
  /** Clock with the developer day offset applied. */
  now: () => number;
  today: () => string;
  update: (fn: (draft: PlayerState) => void) => void;
  session: Session | null;
  setSession: (s: Session | null) => void;
  result: SessionResult | null;
  setResult: (r: SessionResult | null) => void;
  /** Developer tool: pretend days have passed. Never shown in store builds. */
  skipDays: (n: number) => void;
  reset: () => void;
};

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [s, setS] = useState<PlayerState>(freshState);
  const [session, setSession] = useState<Session | null>(null);
  const [result, setResult] = useState<SessionResult | null>(null);
  const offset = useRef(0);
  const latest = useRef(s);

  const now = useCallback(() => Date.now() + offset.current * 864e5, []);
  const today = useCallback(() => israelDay(now()), [now]);

  const commit = useCallback((next: PlayerState) => {
    latest.current = next;
    setS(next);
    AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const update = useCallback(
    (fn: (draft: PlayerState) => void) => {
      const draft = clone(latest.current);
      fn(draft);
      commit(draft);
    },
    [commit],
  );

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => (raw ? migrate(JSON.parse(raw)) : freshState()))
      .catch(() => freshState())
      .then((loaded) => {
        onOpen(loaded, today());
        commit(loaded);
        setReady(true);
      });
  }, [commit, today]);

  const skipDays = useCallback(
    (n: number) => {
      offset.current += n;
      update((d) => onOpen(d, today()));
    },
    [update, today],
  );

  const reset = useCallback(() => {
    offset.current = 0;
    setSession(null);
    setResult(null);
    commit(freshState());
  }, [commit]);

  const value = useMemo(
    () => ({ ready, s, now, today, update, session, setSession, result, setResult, skipDays, reset }),
    [ready, s, now, today, update, session, result, skipDays, reset],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore outside StoreProvider');
  return v;
}

/** Resolve {m|f} tokens for the current player. */
export function useT() {
  const { s } = useStore();
  return useCallback((str: string) => T(str, s.g), [s.g]);
}
