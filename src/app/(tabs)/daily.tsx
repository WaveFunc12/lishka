import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import {
  ANCHORS, BY, COUNTRY, daily, dailyIds, dailyStats, DAILY_N, dayNo, dist, hit, HIT_KM, kmText, logEntry, markDay, msToNextDay, PLACES, points, shareText, shortName,
  squares, totalKm, untilText, type Point,
} from '@/engine';
import { submitDaily } from '@/net/backend';
import { useAccount } from '@/net/account';
import { useStore, useT } from '@/state/store';
import { MapView, type MapDot } from '@/ui/MapView';
import { shareImage } from '@/ui/share';
import { ShareCard } from '@/ui/ShareCard';
import { sfx } from '@/ui/sound';
import { Btn, Card, Kicker, Screen, T_ } from '@/ui/kit';
import { C, F } from '@/ui/theme';

/** Countdown to the next daily (midnight in Israel), refreshed every half minute. */
function NextDaily() {
  const { now } = useStore();
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 30000);
    return () => clearInterval(id);
  }, []);
  return <T_ style={{ textAlign: 'center', color: C.muted }}>חמישה יישובים חדשים בעוד {untilText(msToNextDay(now()))}.</T_>;
}

/** The player's daily record: games, average, runs of days, and a bar per score with today's marked. */
function Record({ today, score }: { today: string; score: number }) {
  const { s } = useStore();
  const rec = dailyStats(s, today), most = Math.max(1, ...rec.spread);
  return (
    <Card style={{ gap: 10 }}>
      <T_ style={{ fontFamily: F.display, fontSize: 22 }}>המאזן שלך ביומי</T_>
      <View style={{ flexDirection: 'row' }}>
        {([[rec.played, 'משחקים'], [rec.avg.toFixed(1), 'ממוצע'], [rec.run, 'ימים ברצף'], [rec.best, 'שיא רצף']] as const).map(([n, l]) => (
          <View key={l} style={{ flex: 1, alignItems: 'center' }}>
            <T_ style={{ fontFamily: F.display, fontSize: 24 }}>{String(n)}</T_>
            <T_ style={{ color: C.muted, fontSize: 13 }}>{l}</T_>
          </View>
        ))}
      </View>
      <View style={{ gap: 4 }} accessibilityLabel={`התפלגות הנקודות: ${rec.spread.map((n, k) => `${k} נקודות ${n} פעמים`).reverse().join(', ')}`}>
        {rec.spread.map((_, k) => DAILY_N - k).map((k) => (
          <View key={k} style={st.row}>
            <T_ style={{ width: 14, fontFamily: F.black, textAlign: 'center' }}>{k}</T_>
            <View style={{ flex: 1 }}>
              <View style={{ width: `${Math.max(8, (rec.spread[k] / most) * 100)}%`, backgroundColor: k === score ? C.ok : C.track, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1 }}>
                <T_ style={{ fontFamily: F.black, fontSize: 13, color: k === score ? C.accentInk : C.ink }}>{rec.spread[k]}</T_>
              </View>
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
}

const COUNTRY_ANCHORS = ['hfa', 'tlv', 'jlm', 'bsh', 'elt'];

/* The daily: everyone gets the same five places. Pin each one on the whole map; within 10 km is a point.
   The share shows squares and the score without giving the places away. */
export default function Daily() {
  const { s, update, today } = useStore();
  const winH = useWindowDimensions().height;
  const t = useT();
  const day = today(), ids = dailyIds(day), places = ids.map((id) => BY[id]);
  const picks = s.daily.day === day ? s.daily.picks : [];
  // The pin just placed stays on screen until "next"; reopening the screen goes straight to the next place.
  const [shown, setShown] = useState<number | null>(null);
  const done = picks.length >= DAILY_N && shown === null;
  // Signed in to rooms: the finished daily goes to the room tables by itself.
  const { session, profile } = useAccount();
  const [sent, setSent] = useState<'no' | 'yes' | 'failed'>('no');
  const [shared, setShared] = useState<'shared' | 'copied' | 'failed' | null>(null);
  const cardRef = useRef<ComponentRef<typeof View>>(null);
  // The pin placed on the map, not yet confirmed.
  const [draft, setDraft] = useState<Point | null>(null);
  const uid = profile ? session?.user.id : undefined, complete = picks.length >= DAILY_N;
  useEffect(() => {
    if (uid && complete) submitDaily(uid, day, picks).then(() => setSent('yes'), () => setSent('failed'));
    // picks is complete and fixed once all five are in
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, complete, day]);
  const i = shown ?? picks.length, it = places[Math.min(i, DAILY_N - 1)], pick = shown !== null ? picks[shown] : null;

  // On the whole-country map only a few far-apart cities fit with their names; zoomed to an answer, all the big ones do.
  const anchors = (few: boolean): MapDot[] =>
    PLACES.filter((p) => (few ? COUNTRY_ANCHORS : ANCHORS).includes(p.id) && !ids.includes(p.id)).map((p) => ({ ...p, state: 'anc', size: 0.75, label: shortName(p) }));
  const place = (g: Point) => {
    const d = dist(g, it);
    update((draft) => {
      const dd = daily(draft, day);
      if (dd.picks.length === i) dd.picks.push({ id: it.id, d, g });
      // Finishing the daily counts as showing up at the office.
      if (dd.picks.length === DAILY_N) {
        markDay(draft, day);
        draft.dailies[day] = logEntry(dd.picks);
      }
    });
    setShown(i);
    if (!s.mute) {
      Haptics.notificationAsync(hit(d) ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning).catch(() => {});
      sfx(hit(d) ? 'ok' : 'bad');
    }
  };

  if (done) {
    const all = picks.flatMap((p) => [p.g, BY[p.id]]);
    // Pins stand above their point, so leave room over the northernmost one.
    const top = all.reduce((a, b) => (b.y < a.y ? b : a));
    all.push({ x: top.x, y: top.y - 0.1 * Math.max(60, Math.max(...all.map((q) => q.y)) - top.y) });
    return (
      <Screen tab>
        <View>
          <Kicker>היומי · #{dayNo(day)}</Kicker>
          <T_ style={{ fontFamily: F.display, fontSize: 26 }}>{points(picks)} מתוך {DAILY_N} נקודות</T_>
        </View>
        <Card style={{ gap: 4, paddingVertical: 12 }}>
          <T_ style={{ fontSize: 26, textAlign: 'center' }}>{squares(picks)}</T_>
          {picks.map((p) => (
            <View key={p.id} style={st.row}>
              <T_ style={{ flex: 1, fontFamily: F.black }}>{BY[p.id].name}</T_>
              <T_ style={{ color: hit(p.d) ? C.ok : C.bad, fontFamily: F.black }}>{hit(p.d) ? 'נקודה' : 'פספוס'} · {kmText(p.d)}</T_>
            </View>
          ))}
          <T_ style={{ color: C.muted, textAlign: 'center' }}>סטייה כוללת {kmText(totalKm(picks))}. בתיקו, מי שסטה פחות מנצח.</T_>
        </Card>
        <Btn big label="לשתף ולהתחרות" onPress={() => shareImage(shareText(picks, day, s.g, dailyStats(s, day).run),
          () => captureRef(cardRef, { format: 'png', quality: 1, result: 'tmpfile' })).then(setShared)} />
        {/* The picture that goes with the shared text, drawn off screen until it is captured. */}
        {Platform.OS !== 'web' && (
          <View style={st.offscreen} pointerEvents="none">
            <ShareCard ref={cardRef} picks={picks} day={day} run={dailyStats(s, day).run} ask={t('מי {מצליח|מצליחה} יותר?')} />
          </View>
        )}
        {shared === 'copied' && <T_ style={{ textAlign: 'center', color: C.ok, fontFamily: F.bold }}>התוצאה הועתקה. אפשר להדביק אותה בוואטסאפ.</T_>}
        <MapView view={{ fit: all, pad: 0.25, minW: 60 }} style={{ height: Math.round(Math.max(240, Math.min(360, winH - 540))) }} label="מפת התוצאות של היום"
          dots={picks.map((p) => ({ ...BY[p.id], state: hit(p.d) ? 'right' : 'wrong', label: BY[p.id].name }))}
          pins={picks.map((p) => p.g)} lines={picks.map((p) => [p.g, BY[p.id]] as [Point, Point])} />
        <Record today={day} score={points(picks)} />
        <Btn alt label={sent === 'yes' ? 'נשלח לחדרים. לטבלה' : 'חדרים פרטיים עם חברים'} onPress={() => router.push('/rooms')} />
        {sent === 'failed' && <T_ style={{ color: C.bad, textAlign: 'center' }}>לא הצלחנו לשלוח לחדרים. ננסה שוב כשתפתחו את המסך.</T_>}
        <NextDaily />
      </Screen>
    );
  }

  // The way on is pinned below the map, so it stays on screen on an iPhone SE, even with large text.
  const footer = pick
    ? <Btn big label={i + 1 < DAILY_N ? 'ליישוב הבא' : 'לתוצאה'} onPress={() => setShown(null)} />
    : <Btn big label="לאשר את המיקום" disabled={!draft} onPress={() => { if (draft) { place(draft); setDraft(null); } }} />;
  return (
    <Screen tab footer={footer}>
      <View style={{ gap: 2 }}>
        <Kicker>היומי · #{dayNo(day)} · יישוב {i + 1} מתוך {DAILY_N}</Kicker>
        <T_ style={{ fontFamily: F.display, fontSize: 26 }}>{pick ? it.name : t(`{סמן|סמני} את ${it.name}`)}</T_>
        <T_ style={{ fontSize: 18 }}>{squares(picks)}</T_>
      </View>
      {/* Sized to the phone, so the whole question fits without scrolling, even on an iPhone SE. */}
      <MapView key={`${i}-${pick ? 1 : 0}`} view={pick ? { fit: [pick.g, it], pad: 0.5, minW: 40 } : COUNTRY} mini style={{ height: pick ? Math.round(Math.max(220, Math.min(300, winH - 420))) : Math.round(Math.max(260, Math.min(420, winH - 350))) }}
        label={pick ? 'המפה עם הסימון שלך' : `מפת הארץ. ${t('{סמן|סמני}')} את ${it.name}`}
        dots={pick ? [...anchors(false), { ...it, state: hit(pick.d) ? 'right' : 'wrong', label: it.name, size: 1.2 }] : anchors(true)}
        pins={pick ? [pick.g] : draft ? [draft] : undefined} lines={pick ? [[pick.g, it]] : undefined}
        rings={pick ? [{ x: it.x, y: it.y, r: HIT_KM }] : undefined}
        onPressMap={pick ? undefined : setDraft} />
      {pick ? (
        <Card style={{ alignItems: 'center', gap: 4 }}>
          <T_ style={{ fontFamily: F.black, fontSize: 22, color: hit(pick.d) ? C.ok : C.bad }}>{hit(pick.d) ? 'פגיעה! נקודה' : 'פספוס'}</T_>
          <T_ style={{ fontFamily: F.black }}>{kmText(pick.d)} מהמיקום האמיתי</T_>
          <T_ style={{ color: C.muted }}>{it.hint}</T_>
        </Card>
      ) : (
        <T_ style={{ color: C.muted }}>
          {draft ? 'אפשר לגעת שוב במפה כדי להזיז את הסיכה.' : `ניסיון אחד לכל יישוב. פגיעה עד ${HIT_KM} ק״מ שווה נקודה.`}
        </T_>
      )}
    </Screen>
  );
}

const st = StyleSheet.create({
  offscreen: { position: 'absolute', left: -2000, top: 0 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
