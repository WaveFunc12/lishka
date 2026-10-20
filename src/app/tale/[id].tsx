import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { BY, popText } from '@/engine';
import { useStore, useT } from '@/state/store';
import { ComicPlayer } from '@/ui/comic/ComicPlayer';
import { TALES } from '@/ui/comic/tales';

/* A founding story: a few comic panels about how a city began. Opened over the shift (or the map) and closed back to it. */
export default function TaleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { s } = useStore();
  const t = useT();
  const tale = id ? TALES[id] : undefined;
  const place = id ? BY[id] : undefined;
  const panels = useMemo(() => (tale ? tale.panels(t, place ? `והיום: ${popText(place.pop)}.` : '') : []), [tale, t, place]);
  const close = () => (router.canGoBack() ? router.back() : router.replace('/home'));
  if (!tale) return null;
  return <ComicPlayer title={`${tale.title} · איך הכול התחיל`} panels={panels} doneLabel="חזרה לעבודה" onDone={close} onSkip={close} mute={s.mute} />;
}
