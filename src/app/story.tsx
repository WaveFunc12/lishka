import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { useStart } from '@/state/actions';
import { useStore, useT } from '@/state/store';
import { ComicPlayer } from '@/ui/comic/ComicPlayer';
import { chapterOne } from '@/ui/comic/scenes';

/* The opening comic, one full-screen picture at a time. The first time it leads straight into the first shift;
   watched again from the file (?replay=1) it just goes back. */
export default function Story() {
  const { s, update } = useStore();
  const start = useStart();
  const t = useT();
  const { replay } = useLocalSearchParams<{ replay?: string }>();
  const panels = useMemo(() => chapterOne(t), [t]);
  const done = () => {
    if (replay) {
      if (router.canGoBack()) router.back();
      else router.replace('/home');
      return;
    }
    update((d) => {
      d.seenComic = true;
    });
    router.replace('/home');
    if (!s.xp) start.shift();
  };
  return <ComicPlayer panels={panels} doneLabel={replay ? 'חזרה לתיק' : 'יאללה, לעבודה'} onDone={done} onSkip={done} mute={s.mute} />;
}
