import { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { BY, COPY, COUNTRY, learned, mastery, peopleText, PLACES, regionProgress, rnd, shortName, STORY, storyDone, strength, UNIT_BY } from '@/engine';
import { useStart } from '@/state/actions';
import { goHome } from '@/state/nav';
import { useStore, useT } from '@/state/store';
import { MapView, type MapDot } from '@/ui/MapView';
import { sfx } from '@/ui/sound';
import { Btn, Card, H1, Kicker, OkStamp, Screen, T_, ZviSays } from '@/ui/kit';
import { C, F } from '@/ui/theme';

/* End of shift, inspection or exam. A finished postcard shows Zvi's note and the next mystery clue. */
export default function Result() {
  const { s, now, result: R } = useStore();
  const t = useT();
  const start = useStart();
  const say = useMemo(() => {
    if (!R) return '';
    const acc = R.n ? R.ok / R.n : 1;
    if (R.welcomed) return 'הנה, כמו אופניים. המפה כבר נראית יותר טוב.';
    if (R.kind === 'shift' && R.shift === 0) return 'חצי גלויה מוכנה. עוד משמרת אחת והיא נשלחת אליך.';
    return rnd(acc >= 0.9 ? COPY.great : COPY.good, Math.random);
  }, [R]);
  // A new postcard in the mail gets its little tune, once.
  const card = !!R?.card || !!R?.milestone, mute = s.mute;
  useEffect(() => { if (card && !mute) sfx('card'); }, [card, mute]);
  if (!R) return null;
  const acc = R.n ? Math.round((R.ok / R.n) * 100) : 100;
  const unit = R.unitId ? UNIT_BY[R.unitId] : null;
  // Known places light up; the ones still missing show faintly, but only in the story or in this region.
  const todo = (id: string) => (unit?.region ? BY[id].region === unit.region : STORY.some((u) => u.items.includes(id)));
  const dots: MapDot[] = PLACES.filter((p) => mastery(s, p.id) >= 1 || todo(p.id))
    .map((p) => ({ ...p, state: mastery(s, p.id) >= 1 ? 'lit' : 'dim', size: mastery(s, p.id) >= 1 ? 1 : 0.6, label: R.newIds.includes(p.id) ? p.name : '' }));
  const regionsLeft = regionProgress(s).filter((g) => g.done < g.units.length).length;
  const storyEnd = R.card && unit?.id === STORY[STORY.length - 1].id && storyDone(s);
  const reveal = learned(s).map((p) => ({ x: p.x, y: p.y, s: strength(s, p.id, now()) }));
  const perks = [
    R.streakUp && `🔥 ${R.streakUp} ${R.streakUp === 1 ? 'יום נוכחות' : 'ימי נוכחות'}`,
    R.rankUp && `קידום: ${t(R.rankUp)}`,
    R.earnedSick && 'קיבלת יום מחלה',
  ].filter(Boolean) as string[];

  if (R.kind === 'exam') {
    const win = !R.misses.length;
    // The places missed stand out in red with their names, so the map shows what to go over.
    const missDots: MapDot[] = [
      ...dots.filter((d) => !R.misses.includes(d.id)).map((d) => ({ ...d, size: 0.7, label: '' })),
      ...R.misses.map((id): MapDot => ({ ...BY[id], state: 'wrong', size: 1.1, label: shortName(BY[id]) })),
    ];
    return (
      <Screen>
        <View><Kicker>מבחן הקביעות</Kicker><H1 size={36}>{win ? 'קביעות!' : 'כמעט קביעות'}</H1></View>
        <ZviSays text={t(win ? COPY.confess : `פספסת ${R.misses.length}: ${R.misses.map((id) => BY[id].name).join(', ')}. קביעות לא נותנים בהנחות. {תעבור|תעברי} שוב על ${R.misses.length} שפספסת, ו{גש|גשי} למועד ב׳.`)} />
        <MapView view={COUNTRY} dots={missDots} dotPx={5} reveal={reveal} revealR={1.7} style={{ height: 380 }}
          label={win ? 'מפת הארץ' : `מפת הארץ, ובאדום ${R.misses.length} היישובים שפוספסו`} />
        {!win && <Btn big label={`לחזור על ${R.misses.length} שפוספסו`} onPress={() => start.review(R.misses)} />}
        {!win && <Btn alt label="למועד ב׳" onPress={() => start.exam()} />}
        <Btn big={win} alt={!win} label="חזרה לשולחן" onPress={goHome} />
      </Screen>
    );
  }

  return (
    <Screen footer={<Btn big label={R.kind === 'shift' && R.shift === 0 ? 'הבא בתור' : 'חזרה לשולחן'} onPress={goHome} />}>
      <View style={styles.top}>
        <View style={{ flex: 1 }}>
          <Kicker>סוף משמרת{R.kind === 'shift' ? ` · ${R.shift + 1} מתוך 2` : ''}</Kicker>
          <H1 size={32}>{R.kind === 'review' ? (R.welcomed ? 'חימום הושלם' : 'ביקורת פתע הושלמה') : unit?.t}</H1>
        </View>
        <OkStamp xp={R.xp} size={96} />
      </View>
      {perks.length > 0 && (
        <View style={styles.perks}>{perks.map((p) => <View key={p} style={styles.perk}><T_ style={{ fontFamily: F.black, fontSize: 14 }}>{p}</T_></View>)}</View>
      )}
      {R.milestone && (
        <Card style={styles.mile}>
          <Kicker>אבן דרך בדרך לכל הארץ</Kicker>
          <View style={styles.top}>
            <T_ style={{ fontFamily: F.display, fontSize: 44, color: C.orange }}>
              {R.milestone.at < PLACES.length * 0.1 ? R.milestone.at : `${Math.round((R.milestone.at / PLACES.length) * 100)}%`}
            </T_>
            <T_ style={{ fontFamily: F.display, fontSize: 24, flex: 1 }}>{R.milestone.title.replace(/^\d+ /, '')}</T_>
          </View>
          <T_ style={{ fontSize: 16, lineHeight: 23 }}>{t(R.milestone.say)} — צבי</T_>
        </Card>
      )}
      <Card style={styles.stats}>
        <Stat n={`+${R.xp}`} l="ותק" />
        <Stat n={`${acc}%`} l="דיוק" />
        <Stat n={String(R.best)} l="רצף תשובות" />
      </Card>
      {R.newIds.length > 0 && (
        <Card style={{ gap: 6 }}>
          <Kicker>חזרו למפה במשמרת הזאת</Kicker>
          <T_ style={{ fontFamily: F.black, fontSize: 18, lineHeight: 26 }}>{R.newIds.map((id) => BY[id].name).join(' · ')}</T_>
          <T_ style={{ color: C.muted }}>ביישובים שעל המפה שלך גרים {peopleText(learned(s).reduce((a, p) => a + (p.pop || 0), 0))}.</T_>
        </Card>
      )}
      {R.card && unit ? (
        <Card style={{ backgroundColor: '#FFF6E2', gap: 8, borderColor: unit.col }}>
          <Kicker>דואר נכנס · {unit.region ? `${unit.t} · גלויה ${unit.part} מתוך ${unit.parts}` : `גלויה ${STORY.indexOf(unit) + 1} מתוך ${STORY.length}`}</Kicker>
          <T_ style={{ fontFamily: F.display, fontSize: 24 }}>גלויה חדשה הגיעה</T_>
          <T_ style={{ fontSize: 18, lineHeight: 26 }}>{t(unit.card)}</T_>
          {!!unit.clue && <T_ style={{ color: C.muted }}>נ.ב. {unit.clue}</T_>}
          {unit.region && unit.part === unit.parts && <T_ style={{ fontFamily: F.bold }}>{`נ.ב. 2: אות אזורי חדש נכנס לתיק האישי. ${regionsLeft ? `עוד ${regionsLeft} אזורים, וכל הארץ על המפה.` : 'וזהו: כל הארץ על המפה.'}`}</T_>}
          {storyEnd && <T_ style={{ fontFamily: F.bold }}>{t('נ.ב. 2: הארכיון נפתח. עוד מאות יישובים, אזור אחרי אזור, עד שכל הארץ חוזרת למפה. ואת מבחן הקביעות {תעשה|תעשי} כשמתחשק לך.')}</T_>}
          <T_ style={{ fontFamily: F.display, fontSize: 20 }}>צבי</T_>
        </Card>
      ) : (
        <ZviSays text={t(say)} />
      )}
      <MapView view={COUNTRY} dots={dots} dotPx={5} reveal={reveal} revealR={1.7} style={{ height: 340 }}
        tag={`${learned(s).length}/${PLACES.length} יישובים חזרו למפה · המטרה: כל הארץ`} label="המפה הלאומית" />
    </Screen>
  );
}

const Stat = ({ n, l }: { n: string; l: string }) => (
  <View style={{ flex: 1, alignItems: 'center' }}>
    <T_ style={{ fontFamily: F.display, fontSize: 26 }}>{n}</T_>
    <T_ style={{ color: C.muted, fontSize: 13 }}>{l}</T_>
  </View>
);

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  perks: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  perk: { borderWidth: 2, borderColor: C.ink, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, backgroundColor: C.orange },
  stats: { flexDirection: 'row' },
  mile: { gap: 6, borderColor: C.orange, borderWidth: 3, backgroundColor: '#FFF6E2' },
});
