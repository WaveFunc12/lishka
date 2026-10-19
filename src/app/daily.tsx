import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Share, View } from 'react-native';
import { ANCHORS, BY, daily, dailyId, dailyView, dayNo, dist, kmText, PLACES, score, shareText, squares } from '@/engine';
import { useStore, useT } from '@/state/store';
import { MapView, type MapDot } from '@/ui/MapView';
import { Btn, Card, Kicker, LinkBtn, Screen, T_ } from '@/ui/kit';
import { C, F } from '@/ui/theme';

/* Settlement of the day: everyone gets the same place, one try, and shares squares without the answer. */
export default function Daily() {
  const { s, update, today } = useStore();
  const t = useT();
  const day = today(), it = BY[dailyId(day)], v = dailyView(day, it.x, it.y);
  const dp = s.daily.day === day ? s.daily.dp : null;
  const anchors: MapDot[] = PLACES.filter((p) => ANCHORS.includes(p.id) && p.id !== it.id && p.x > v.x && p.x < v.x + v.w && p.y > v.y && p.y < v.y + v.h)
    .map((p) => ({ ...p, state: 'anc', size: 0.75, label: p.name }));
  const place = (g: { x: number; y: number }) => {
    const d = dist(g, it);
    update((draft) => {
      daily(draft, day).dp = { id: it.id, d, g };
    });
    if (!s.mute) Haptics.notificationAsync(score(d) >= 3 ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning).catch(() => {});
  };
  return (
    <Screen>
      <LinkBtn label="חזרה לשולחן" onPress={() => router.back()} />
      <View>
        <Kicker>היישוב של היום · #{dayNo(day)}</Kicker>
        <T_ style={{ fontFamily: F.display, fontSize: 26 }}>{dp ? it.name : t(`{סמן|סמני} את ${it.name}`)}</T_>
      </View>
      <MapView view={v} mini style={{ height: 320 }} label="מפת היישוב של היום"
        dots={dp ? [...anchors, { ...it, state: 'right', label: it.name, size: 1.2 }] : anchors}
        pins={dp ? [dp.g] : undefined} lines={dp ? [[dp.g, it]] : undefined}
        rings={dp ? [5, 12, 25].map((r) => ({ x: it.x, y: it.y, r })) : undefined}
        onPressMap={dp ? undefined : place} />
      {dp ? (
        <>
          <Card style={{ alignItems: 'center', gap: 4 }}>
            <T_ style={{ fontSize: 30 }}>{squares(dp.d)}</T_>
            <T_ style={{ fontFamily: F.black }}>{kmText(dp.d)} מהמיקום האמיתי</T_>
            <T_ style={{ color: C.muted }}>{it.hint}</T_>
          </Card>
          <Btn big label="לשתף" onPress={() => Share.share({ message: shareText(dp.d, day, s.g) }).catch(() => {})} />
          <T_ style={{ textAlign: 'center', color: C.muted }}>יישוב חדש מחר בבוקר.</T_>
        </>
      ) : (
        <T_ style={{ color: C.muted }}>ניסיון אחד בלבד. כל מי שמשחק היום מקבל את אותו יישוב, והתוצאה נשלחת בלי לגלות את התשובה.</T_>
      )}
    </Screen>
  );
}
