import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, StyleSheet, View } from 'react-native';
import { BY, learned, mastery, PLACES, postcardsDone, rank, regionProgress, STORY, tiers, UNITS } from '@/engine';
import { useStart } from '@/state/actions';
import { allowReminders, remindersSupported } from '@/state/reminders';
import { useStore, useT } from '@/state/store';
import { Medal, RegionStamp } from '@/ui/Badges';
import { Btn, Card, H1, Kicker, LinkBtn, Meter, Screen, T_ } from '@/ui/kit';
import { C, F } from '@/ui/theme';

/* Personnel file: rank, stats, badges, settings, and (in development builds only) time-travel tools. */
export default function File() {
  const { s, update, skipDays, reset, today } = useStore();
  const t = useT();
  const start = useStart();
  const [denied, setDenied] = useState(false);
  const r = rank(s.xp), tr = tiers(s);
  const regions = regionProgress(s), closed = regions.filter((g) => g.done === g.units.length).length;
  const setRemind = async (h: number | null) => {
    setDenied(false);
    if (h !== null && !(await allowReminders().catch(() => false))) return setDenied(true);
    update((d) => { d.remind = h; });
  };
  const pct = r.next ? ((s.xp - r.from) / (r.next[0] - r.from)) * 100 : 100;
  const confirmReset = () => {
    const doIt = () => { reset(); router.replace('/hello'); };
    if (Platform.OS === 'web') return doIt();
    Alert.alert('להתחיל מחדש?', 'כל ההתקדמות תימחק מהטלפון.', [{ text: 'ביטול', style: 'cancel' }, { text: 'למחוק', style: 'destructive', onPress: doIt }]);
  };
  return (
    <Screen tab>
      <View><Kicker>משאבי אנוש · קומה 2</Kicker><H1>תיק אישי</H1></View>
      <Card style={{ gap: 6 }}>
        <T_ style={{ fontSize: 13, color: C.muted }}>{t('{תעודת עובד|תעודת עובדת}')} · מס׳ 0042</T_>
        <T_ style={{ fontFamily: F.display, fontSize: 24 }}>{t(r.name)}</T_>
        <Meter pct={pct} />
        <T_ style={{ fontSize: 13, color: C.muted }}>{r.next ? `עוד ${r.next[0] - s.xp} נקודות ותק לקידום ל${t(r.next[1])}` : 'הדרגה הגבוהה ביותר בלשכה'}</T_>
      </Card>
      <Card style={{ flexDirection: 'row' }}>
        {[[s.xp, 'ותק'], [`${learned(s).length}/${PLACES.length}`, 'יישובים'], [`${postcardsDone(s)}/${UNITS.length}`, 'גלויות']].map(([n, l]) => (
          <View key={String(l)} style={{ flex: 1, alignItems: 'center' }}>
            <T_ style={{ fontFamily: F.display, fontSize: 24 }}>{String(n)}</T_>
            <T_ style={{ color: C.muted, fontSize: 13 }}>{String(l)}</T_>
          </View>
        ))}
      </Card>
      <Card>
        <T_ style={{ fontFamily: F.black }}>{s.sick ? 'יום מחלה אחד שמור' : 'אין יום מחלה שמור'}</T_>
        <T_ style={{ color: C.muted, fontSize: 14 }}>{s.sick ? t('אם {תפספס|תפספסי} יום, הוא ישמור על הנוכחות.') : 'מקבלים יום מחלה על כל ביקורת פתע. אפשר להחזיק אחד.'}</T_>
      </Card>
      <Card style={{ gap: 10 }}>
        <T_ style={{ fontFamily: F.display, fontSize: 22 }}>אותות</T_>
        <View style={styles.medals}>
          {([
            ['bronze', 'ארד', tr.bronze, `${STORY.length} גלויות הסיפור`],
            ['silver', 'כסף', tr.silver, 'שליטה ב־80% מהיישובים'],
            ['gold', 'זהב', tr.gold, `שליטה בכל היישובים (${Math.round(tr.mast * 100)}%)`],
            ['legend', '★', tr.legend, 'מבחן הקביעות על מפה ריקה'],
          ] as const).map(([tier, face, got, what]) => (
            <View key={tier} style={styles.medal} accessibilityLabel={`${tier === 'legend' ? 'קביעות' : face}: ${what}. ${got ? 'הושג' : 'עוד לא'}`}>
              <Medal tier={tier} face={face} earned={!!got} size={58} />
              <T_ style={styles.badgeName}>{tier === 'legend' ? 'קביעות' : face}</T_>
              <T_ style={styles.badgeNote}>{what}</T_>
            </View>
          ))}
        </View>
        <Btn alt label={tr.legend ? 'לנסות שוב את מבחן הקביעות' : 'למבחן הקביעות'} onPress={() => start.exam()} />
      </Card>
      <Card style={{ gap: 10 }}>
        <T_ style={{ fontFamily: F.display, fontSize: 22 }}>בולים אזוריים · {closed}/{regions.length}</T_>
        <View style={styles.stamps}>
          {regions.map((g) => {
            const full = g.done === g.units.length, ids = g.units.flatMap((u) => u.items);
            return (
              <View key={g.id} style={styles.stamp} accessibilityLabel={`${g.t}: ${full ? 'הושלם' : `${g.done} מתוך ${g.units.length} גלויות`}`}>
                <RegionStamp col={g.col} earned={full} places={ids.map((id) => BY[id])} known={ids.filter((id) => mastery(s, id) >= 1).map((id) => BY[id])} size={60} />
                <T_ style={[styles.badgeName, !full && { color: C.muted }]}>{g.s}</T_>
                {!full && <T_ style={styles.badgeNote}>{g.done}/{g.units.length} גלויות</T_>}
              </View>
            );
          })}
        </View>
        <T_ style={{ color: C.muted, fontSize: 13 }}>בול על כל אזור שכל הגלויות שלו תויקו בארכיון. הנקודות הצבעוניות הן היישובים שכבר חזרו למפה.</T_>
      </Card>
      <Card style={{ gap: 10 }}>
        <T_ style={{ fontFamily: F.display, fontSize: 22 }}>הגדרות</T_>
        {/* Each setting is a label and two choices; the chosen one is filled and ticked. */}
        <View style={styles.setRow}>
          <T_ style={styles.setLbl}>לשון פנייה</T_>
          <Btn style={styles.seg} alt={s.g !== 'm'} label={s.g === 'm' ? '✓ זכר' : 'זכר'} onPress={() => update((d) => { d.g = 'm'; })} />
          <Btn style={styles.seg} alt={s.g !== 'f'} label={s.g === 'f' ? '✓ נקבה' : 'נקבה'} onPress={() => update((d) => { d.g = 'f'; })} />
        </View>
        <View style={styles.setRow}>
          <T_ style={styles.setLbl}>צלילים ורטט</T_>
          <Btn style={styles.seg} alt={s.mute} label={!s.mute ? '✓ פועלים' : 'פועלים'} onPress={() => update((d) => { d.mute = false; })} />
          <Btn style={styles.seg} alt={!s.mute} label={s.mute ? '✓ כבויים' : 'כבויים'} onPress={() => update((d) => { d.mute = true; })} />
        </View>
        {remindersSupported && (
          <View style={{ gap: 6 }}>
            <T_ style={{ fontFamily: F.black }}>תזכורת יומית מצבי</T_>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {([null, 8, 13, 20] as const).map((h) => (
                <Btn key={String(h)} style={{ flex: 1, paddingHorizontal: 4 }} alt={s.remind !== h} label={h === null ? 'בלי' : `${h}:00`} onPress={() => setRemind(h)} />
              ))}
            </View>
            <T_ style={{ color: C.muted, fontSize: 13 }}>
              {denied ? 'הטלפון לא מאשר התראות. אפשר לאשר בהגדרות של הטלפון, תחת גלויות מהלשכה.' : 'ביום שכבר שיחקת בו, צבי לא מזכיר.'}
            </T_>
          </View>
        )}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 6 }}>
          <LinkBtn label="על הלשכה וקרדיטים" onPress={() => router.push('/about')} />
          <LinkBtn label="לצפות שוב בקומיקס" onPress={() => router.push('/story?replay=1')} />
          <LinkBtn label="להתחיל מחדש" onPress={confirmReset} />
        </View>
      </Card>
      {__DEV__ && (
        <Card style={{ gap: 8, borderStyle: 'dashed' }}>
          <T_ style={{ fontFamily: F.black }}>כלי פיתוח (לא מופיעים בגרסה לחנות)</T_>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <Btn alt label="לדלג יום" onPress={() => skipDays(1)} />
            <Btn alt label="לדלג יומיים" onPress={() => skipDays(2)} />
            <Btn alt label="לדלג שבוע" onPress={() => skipDays(8)} />
          </View>
          <T_ style={{ fontSize: 13, color: C.muted }}>היום במשחק: {today()}</T_>
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  medals: { flexDirection: 'row', justifyContent: 'space-between', gap: 6 },
  medal: { flex: 1, alignItems: 'center', gap: 2 },
  stamps: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', columnGap: 10, rowGap: 12 },
  stamp: { width: 72, alignItems: 'center', gap: 2 },
  badgeName: { fontFamily: F.black, fontSize: 13, lineHeight: 17, textAlign: 'center' },
  setRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  setLbl: { width: 92, fontFamily: F.black, fontSize: 15 },
  seg: { flex: 1, paddingHorizontal: 4, paddingVertical: 10 },
  badgeNote: { fontSize: 11, lineHeight: 14, color: C.muted, textAlign: 'center' },
});
