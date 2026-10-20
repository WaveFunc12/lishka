import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { PLACES, ROAD_QUIZ_N, ROUTE_BY, roadQuiz, routeTitle, shortName } from '@/engine';
import { useStore, useT } from '@/state/store';
import { routeBox, routePoints } from '@/ui/MapOverlay';
import { MapView, type MapDot } from '@/ui/MapView';
import { sfx } from '@/ui/sound';
import { Btn, Card, H1, Kicker, LinkBtn, Meter, Mentor, OkStamp, Screen, T_, ZviSays } from '@/ui/kit';
import { BW, C, F } from '@/ui/theme';

/** Seniority for each road named right. */
const XP_PER_ROAD = 5;
/** Cities up to this size rank, within this many km of the road, show beside it as clues. */
const CLUE_RANK = 40;
const CLUE_KM = 8;

/* The road quiz: a main road is drawn in orange with every road number hidden, and the player says which road it is.
   The big cities along the way are the only clues. */
export default function Roads() {
  const { s, update } = useStore();
  const t = useT();
  const winH = useWindowDimensions().height;
  const [qs, setQs] = useState(() => roadQuiz(Math.random));
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  // What the player chose for each road so far.
  const [got, setGot] = useState<string[]>([]);
  const ok = got.filter((ref, n) => ref === qs[n].ref).length;
  const end = i >= qs.length;

  const answer = (ref: string) => {
    if (picked) return;
    const right = ref === qs[i].ref;
    setPicked(ref);
    setGot((g) => [...g, ref]);
    if (!s.mute) {
      Haptics.notificationAsync(right ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning).catch(() => {});
      sfx(right ? 'ok' : 'bad');
    }
  };
  const next = () => {
    setPicked(null);
    setI((n) => n + 1);
    // The round's seniority goes in once, as the last answer is put away.
    if (i + 1 === qs.length && ok) update((d) => { d.xp += ok * XP_PER_ROAD; });
  };
  const again = () => { setQs(roadQuiz(Math.random)); setI(0); setGot([]); setPicked(null); };

  if (end) {
    return (
      <Screen>
        <LinkBtn label="חזרה לשולחן" onPress={() => router.back()} />
        <View><Kicker>חידון כבישים</Kicker><H1>{ok} מתוך {qs.length} כבישים</H1></View>
        <ZviSays text={t(ok === qs.length ? 'כל הכבישים במקום. {אתה יכול|את יכולה} לנהוג בלי וייז.' : ok >= qs.length / 2
          ? 'לא רע בכלל. עוד סיבוב ו{תכיר|תכירי} את כולם.' : 'הכבישים מתבלבלים לכולם בהתחלה. עוד סיבוב?')} />
        <Card style={{ gap: 6 }}>
          {qs.map((q, n) => (
            <View key={q.ref} style={{ flexDirection: 'row', gap: 8 }}>
              <T_ style={{ fontFamily: F.black, color: got[n] === q.ref ? C.ok : C.bad, width: 18 }}>{got[n] === q.ref ? '✓' : '✗'}</T_>
              <View style={{ flex: 1 }}>
                <T_ style={{ fontFamily: F.black }}>{routeTitle(q.ref)}</T_>
                <T_ style={{ fontSize: 13, color: C.muted }}>{ROUTE_BY[q.ref].via}</T_>
              </View>
            </View>
          ))}
        </Card>
        {ok > 0 && <T_ style={{ textAlign: 'center', fontFamily: F.black }}>+{ok * XP_PER_ROAD} ותק</T_>}
        <Btn big label="עוד סיבוב" onPress={again} />
      </Screen>
    );
  }

  const q = qs[i], route = ROUTE_BY[q.ref];
  const [a, b] = routeBox(q.ref);
  const view = { fit: [a, b], pad: 0.12, minW: 40 };
  // The big cities beside the road are its only clues.
  const line = routePoints(q.ref);
  const near = (p: { x: number; y: number }) => line.some((r) => Math.hypot(r.x - p.x, r.y - p.y) < CLUE_KM);
  const dots: MapDot[] = PLACES.filter((p) => p.rank <= CLUE_RANK && near(p)).map((p) => ({ ...p, state: 'anc', size: 0.75, label: shortName(p) }));
  const mapH = Math.round(Math.min(520, Math.max(300, winH - (picked ? 470 : 400))));
  const right = picked === q.ref;
  return (
    <Screen>
      <View style={styles.head}>
        <LinkBtn label="✕ הפסקת קפה" onPress={() => router.back()} />
        <View style={{ flex: 1 }}><Meter pct={(i / qs.length) * 100} /></View>
      </View>
      <View>
        <Kicker>חידון כבישים · {i + 1} מתוך {ROAD_QUIZ_N}</Kicker>
        <T_ style={{ fontFamily: F.display, fontSize: 26, lineHeight: 32 }}>איזה כביש מודגש בכחול?</T_>
      </View>
      <MapView key={`${i}-${mapH}`} view={view} route={q.ref} noShields dots={dots} dotPx={5} style={{ height: mapH }}
        label="מפה ועליה כביש מודגש בכחול" />
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {q.choices.map((ref) => (
          <Btn key={ref} alt big label={ref} style={{ flex: 1 }} disabled={!!picked}
            tone={picked ? (ref === q.ref ? 'right' : ref === picked ? 'wrong' : undefined) : undefined} onPress={() => answer(ref)} />
        ))}
      </View>
      <View style={{ flex: 1 }} />
      {picked && (
        <View style={[styles.sheet, { backgroundColor: right ? C.sheetOk : C.sheetBad }]} accessibilityLiveRegion="polite">
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            {right ? <OkStamp xp={XP_PER_ROAD} /> : <Mentor size={56} />}
            <View style={{ flex: 1 }}>
              <T_ style={{ fontFamily: F.display, fontSize: 22 }}>{right ? routeTitle(q.ref) : `זה ${routeTitle(q.ref)}`}</T_>
              <T_>עובר דרך {route.via}.</T_>
            </View>
          </View>
          <Btn label={i + 1 < qs.length ? 'לכביש הבא' : 'לתוצאה'} onPress={next} />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sheet: { borderWidth: BW, borderColor: C.ink, borderRadius: 16, padding: 14, gap: 12 },
});
