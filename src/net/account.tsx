import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { myProfile, sb, type Profile, type Session } from './backend';

/* Who is signed in, and their display name. Without a configured backend, `enabled` is false. */
type Account = {
  enabled: boolean;
  ready: boolean;
  session: Session | null;
  profile: Profile | null;
  setProfile: (p: Profile | null) => void;
};

const Ctx = createContext<Account>({ enabled: false, ready: true, session: null, profile: null, setProfile: () => {} });

export function AccountProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  // The profile is kept with the user id it belongs to, so a sign-out or a new user never shows a stale name.
  const [owned, setOwned] = useState<{ uid: string; p: Profile | null } | null>(null);
  const [ready, setReady] = useState(!sb);

  useEffect(() => {
    if (!sb) return;
    sb.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    const { data } = sb.auth.onAuthStateChange((_e, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  const uid = session?.user.id;
  useEffect(() => {
    if (uid) myProfile(uid).then((p) => setOwned({ uid, p })).catch(() => setOwned({ uid, p: null }));
  }, [uid]);
  const profile = uid && owned?.uid === uid ? owned.p : null;

  const value = useMemo(() => ({
    // Ready once the session is known and, when signed in, the profile has been looked up.
    enabled: !!sb, ready: ready && (!uid || owned?.uid === uid), session, profile,
    setProfile: (p: Profile | null) => uid && setOwned({ uid, p }),
  }), [ready, session, profile, uid, owned]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAccount = () => useContext(Ctx);
