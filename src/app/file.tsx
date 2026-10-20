import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, View } from 'react-native';
import { learned, PLACES, postcardsDone, rank, regionProgress, STORY, tiers, UNITS } from '@/engine';
import { useStart } from '@/state/actions';
import { allowReminders, remindersSupported } from '@/state/reminders';
import { useStore, useT } from '@/state/store';
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
    <Screen>
      <LinkBtn label="חזרה לשולחן" onPress={() => router.back()} />
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
      <Card style={{ gap: 4 }}>
        <T_ style={{ fontFamily: F.display, fontSize: 22 }}>אותות</T_>
        <T_>{tr.bronze ? '✓' : '○'} ארד: לתייק את {STORY.length} גלויות הסיפור</T_>
        <T_>{tr.silver ? '✓' : '○'} כסף: שליטה ב־80% מהיישובים</T_>
        <T_>{tr.gold ? '✓' : '○'} זהב: שליטה בכל היישובים ({Math.round(tr.mast * 100)}%)</T_>
        <T_>{tr.legend ? '✓' : '○'} קביעות: מבחן הקביעות על מפה ריקה</T_>
        <Btn alt label={tr.legend ? 'לנסות שוב את מבחן הקביעות' : 'למבחן הקביעות'} onPress={() => start.exam()} style={{ marginTop: 8 }} />
      </Card>
      <Card style={{ gap: 8 }}>
        <T_ style={{ fontFamily: F.display, fontSize: 22 }}>אותות אזוריים · {closed}/{regions.length}</T_>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {regions.map((g) => {
            const full = g.done === g.units.length;
            return (
              <View key={g.id} accessibilityLabel={`${g.t}: ${full ? 'הושלם' : `${g.done} מתוך ${g.units.length} גלויות`}`}
                style={{ borderWidth: full ? 3 : 2, borderColor: full ? g.col : C.track, backgroundColor: full ? C.surface : 'transparent', borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10 }}>
                <T_ style={{ fontFamily: F.bold, fontSize: 13, lineHeight: 18, color: full ? C.ink : C.muted }}>{full && <T_ style={{ color: g.col }}>★ </T_>}{g.s}</T_>
              </View>
            );
          })}
        </View>
        <T_ style={{ color: C.muted, fontSize: 13 }}>אות על כל אזור שכל הגלויות שלו תויקו בארכיון.</T_>
      </Card>
      <Card style={{ gap: 10 }}>
        <T_ style={{ fontFamily: F.display, fontSize: 22 }}>הגדרות</T_>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Btn style={{ flex: 1 }} alt={s.g !== 'm'} label="לשון זכר" onPress={() => update((d) => { d.g = 'm'; })} />
          <Btn style={{ flex: 1 }} alt={s.g !== 'f'} label="לשון נקבה" onPress={() => update((d) => { d.g = 'f'; })} />
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Btn style={{ flex: 1 }} alt={s.mute} label="צלילים ורטט פועלים" onPress={() => update((d) => { d.mute = false; })} />
          <Btn style={{ flex: 1 }} alt={!s.mute} label="כבויים" onPress={() => update((d) => { d.mute = true; })} />
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
