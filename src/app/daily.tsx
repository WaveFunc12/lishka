import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useState } from 'react';
import { Share, StyleSheet, View } from 'react-native';
import {
  ANCHORS, BY, COUNTRY, daily, dailyIds, DAILY_N, dayNo, dist, hit, HIT_KM, kmText, PLACES, points, shareText, squares, totalKm,
  type Point,
} from '@/engine';
import { useStore, useT } from '@/state/store';
import { MapView, type MapDot } from '@/ui/MapView';
import { Btn, Card, Kicker, LinkBtn, Screen, T_ } from '@/ui/kit';
import { C, F } from '@/ui/theme';

const COUNTRY_ANCHORS = ['hfa', 'tlv', 'jlm', 'bsh', 'elt'];

/* The daily: everyone gets the same five places. Pin each one on the whole map; within 10 km is a point.
   The share shows squares and the score without giving the places away. */
export default function Daily() {
  const { s, update, today } = useStore();
  const t = useT();
  const day = today(), ids = dailyIds(day), places = ids.map((id) => BY[id]);
  const picks = s.daily.day === day ? s.daily.picks : [];
  // The pin just placed stays on screen until "next"; reopening the screen goes straight to the next place.
  const [shown, setShown] = useState<number | null>(null);
  const done = picks.length >= DAILY_N && shown === null;
  const i = shown ?? picks.length, it = places[Math.min(i, DAILY_N - 1)], pick = shown !== null ? picks[shown] : null;

  // On the whole-country map only a few far-apart cities fit with their names; zoomed to an answer, all the big ones do.
  const anchors = (few: boolean): MapDot[] =>
    PLACES.filter((p) => (few ? COUNTRY_ANCHORS : ANCHORS).includes(p.id) && !ids.includes(p.id)).map((p) => ({ ...p, state: 'anc', size: 0.75, label: p.name }));
  const place = (g: Point) => {
    const d = dist(g, it);
    update((draft) => {
      const dd = daily(draft, day);
      if (dd.picks.length === i) dd.picks.push({ id: it.id, d, g });
    });
    setShown(i);
    if (!s.mute) Haptics.notificationAsync(hit(d) ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning).catch(() => {});
  };

  if (done) {
    const all = picks.flatMap((p) => [p.g, BY[p.id]]);
    return (
      <Screen>
        <LinkBtn label="חזרה לשולחן" onPress={() => router.back()} />
        <View>
          <Kicker>היומי · #{dayNo(day)}</Kicker>
          <T_ style={{ fontFamily: F.display, fontSize: 26 }}>{points(picks)} מתוך {DAILY_N} נקודות</T_>
        </View>
        <MapView view={{ fit: all, pad: 0.25, minW: 60 }} style={{ height: 300 }} label="מפת התוצאות של היום"
          dots={picks.map((p) => ({ ...BY[p.id], state: hit(p.d) ? 'right' : 'wrong', label: BY[p.id].name }))}
          pins={picks.map((p) => p.g)} lines={picks.map((p) => [p.g, BY[p.id]] as [Point, Point])} />
        <Card style={{ gap: 8 }}>
          <T_ style={{ fontSize: 30, textAlign: 'center' }}>{squares(picks)}</T_>
          {picks.map((p) => (
            <View key={p.id} style={st.row}>
              <T_ style={{ flex: 1, fontFamily: F.black }}>{BY[p.id].name}</T_>
              <T_ style={{ color: hit(p.d) ? C.ok : C.bad, fontFamily: F.black }}>{hit(p.d) ? 'נקודה' : 'פספוס'} · {kmText(p.d)}</T_>
            </View>
          ))}
          <T_ style={{ color: C.muted, textAlign: 'center' }}>סטייה כוללת {kmText(totalKm(picks))}. בתיקו, מי שסטה פחות מנצח.</T_>
        </Card>
        <Btn big label="לשתף ולהתחרות" onPress={() => Share.share({ message: shareText(picks, day, s.g) }).catch(() => {})} />
        <T_ style={{ textAlign: 'center', color: C.muted }}>חמישה יישובים חדשים מחר בבוקר.</T_>
      </Screen>
    );
  }

  return (
    <Screen>
      <LinkBtn label="חזרה לשולחן" onPress={() => router.back()} />
      <View style={{ gap: 2 }}>
        <Kicker>היומי · #{dayNo(day)} · יישוב {i + 1} מתוך {DAILY_N}</Kicker>
        <T_ style={{ fontFamily: F.display, fontSize: 26 }}>{pick ? it.name : t(`{סמן|סמני} את ${it.name}`)}</T_>
        <T_ style={{ fontSize: 18 }}>{squares(picks)}</T_>
      </View>
      <MapView key={i} view={pick ? { fit: [pick.g, it], pad: 0.5, minW: 40 } : COUNTRY} mini style={{ height: pick ? 300 : 420 }}
        label={pick ? 'המפה עם הסימון שלך' : `מפת הארץ. ${t('{סמן|סמני}')} את ${it.name}`}
        dots={pick ? [...anchors(false), { ...it, state: hit(pick.d) ? 'right' : 'wrong', label: it.name, size: 1.2 }] : anchors(true)}
        pins={pick ? [pick.g] : undefined} lines={pick ? [[pick.g, it]] : undefined}
        rings={pick ? [{ x: it.x, y: it.y, r: HIT_KM }] : undefined}
        onPressMap={pick ? undefined : place} />
      {pick ? (
        <>
          <Card style={{ alignItems: 'center', gap: 4 }}>
            <T_ style={{ fontFamily: F.black, fontSize: 22, color: hit(pick.d) ? C.ok : C.bad }}>{hit(pick.d) ? 'פגיעה! נקודה' : 'פספוס'}</T_>
            <T_ style={{ fontFamily: F.black }}>{kmText(pick.d)} מהמיקום האמיתי</T_>
            <T_ style={{ color: C.muted }}>{it.hint}</T_>
          </Card>
          <Btn big label={i + 1 < DAILY_N ? 'ליישוב הבא' : 'לתוצאה'} onPress={() => setShown(null)} />
        </>
      ) : (
        <T_ style={{ color: C.muted }}>
          {t(`ניסיון אחד לכל יישוב. פגיעה עד ${HIT_KM} ק״מ שווה נקודה. אפשר להתקרב עם שתי אצבעות או עם הכפתורים.`)}
        </T_>
      )}
    </Screen>
  );
}

const st = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
