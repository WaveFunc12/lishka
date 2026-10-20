import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { BY, PLACES, popText, REGIONS } from '@/engine';
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
  const region = id ? REGIONS.find((g) => g.id === id) : undefined;
  // The closing line: a city's population now, or how many of a region's places are in the game.
  const today = place ? `והיום: ${popText(place.pop)}.` : region ? `והיום: ${PLACES.filter((p) => p.region === region.id).length} יישובים באזור מחכים לחזור למפה.` : '';
  const panels = useMemo(() => (tale ? tale.panels(t, today) : []), [tale, t, today]);
  const close = () => (router.canGoBack() ? router.back() : router.replace('/home'));
  if (!tale) return null;
  return <ComicPlayer title={`${tale.title} · איך הכול התחיל`} panels={panels} doneLabel="חזרה לעבודה" onDone={close} onSkip={close} mute={s.mute} />;
}
