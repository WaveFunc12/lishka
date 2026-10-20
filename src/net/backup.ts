import { useEffect, useRef, useState } from 'react';
import { migrate, onOpen } from '@/engine';
import { useStore } from '@/state/store';
import { useAccount } from './account';
import { loadProgress, saveProgress } from './backend';

/* Progress backup for signed-in players. On the first sign-in on a phone, the save with more seniority (xp)
   wins, so a new phone picks up the old one's game; after that every change is backed up a few seconds later. */
export function useBackup() {
  const { ready, s, update, today } = useStore();
  const { session } = useAccount();
  const uid = session?.user.id;
  const [synced, setSynced] = useState<string | null>(null);
  const xp = useRef(s.xp);
  useEffect(() => { xp.current = s.xp; }, [s.xp]);

  useEffect(() => {
    if (!ready || !uid || synced === uid) return;
    let live = true;
    loadProgress(uid)
      .then((remote) => {
        if (!live) return;
        if (remote && remote.xp > xp.current) update((d) => { Object.assign(d, migrate(remote.state)); onOpen(d, today()); });
        setSynced(uid);
      })
      .catch(() => {});
    return () => { live = false; };
  }, [ready, uid, synced, update, today]);

  useEffect(() => {
    if (!uid || synced !== uid) return;
    const t = setTimeout(() => saveProgress(uid, s).catch(() => {}), 4000);
    return () => clearTimeout(t);
  }, [s, uid, synced]);
}
