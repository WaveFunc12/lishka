import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Share, StyleSheet, View } from 'react-native';
import { dayNo, kmText } from '@/engine';
import { getRoom, leaveRoom, roomDay, roomWeek, say, type DayRow, type Room, type WeekRow } from '@/net/backend';
import { useAccount } from '@/net/account';
import { useStore, useT } from '@/state/store';
import { Btn, Card, H1, Kicker, LinkBtn, Screen, T_ } from '@/ui/kit';
import { C, F } from '@/ui/theme';

/* One room's table: today's daily (who played, points, total distance) or the last seven days. */
export default function RoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { today, s } = useStore();
  const { session } = useAccount();
  const t = useT(), meTag = t(' ({אתה|את})');
  const [room, setRoom] = useState<Room | null>(null);
  const [tab, setTab] = useState<'day' | 'week'>('day');
  const [day, setDay] = useState<DayRow[] | null>(null);
  const [week, setWeek] = useState<WeekRow[] | null>(null);
  const [err, setErr] = useState('');
  const [sure, setSure] = useState(false);
  const d = today();
  const played = s.daily.day === d && s.daily.picks.length >= 5;

  const load = useCallback(() => {
    if (!id) return;
    Promise.all([getRoom(id), roomDay(id, d), roomWeek(id, d)])
      .then(([r, a, b]) => { setRoom(r); setDay(a); setWeek(b); })
      .catch((e) => setErr(say(e)));
  }, [id, d]);
  useFocusEffect(load);

  const invite = () => room && Share.share({ message: `בואו להתחרות איתי ביומי של גלויות מהלשכה! החדר "${room.name}", קוד ${room.code}` }).catch(() => {});
  const leave = () => {
    if (!room || !session) return;
    leaveRoom(room.id, session.user.id).then(() => router.back()).catch((e) => setErr(say(e)));
  };

  return (
    <Screen>
      <LinkBtn label="לכל החדרים" onPress={() => router.back()} />
      <View>
        <Kicker>חדר פרטי · קוד {room?.code ?? '······'}</Kicker>
        <H1>{room?.name ?? ''}</H1>
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Btn style={{ flex: 1 }} alt={tab !== 'day'} label={`היום · #${dayNo(d)}`} onPress={() => setTab('day')} />
        <Btn style={{ flex: 1 }} alt={tab !== 'week'} label="השבוע" onPress={() => setTab('week')} />
      </View>
      <Card style={{ gap: 2, paddingVertical: 8 }}>
        {tab === 'day'
          ? (day || []).map((r, i) => (
            <Row key={r.user_id} n={r.points === null ? '' : String(i + 1)} me={r.me} name={r.name + (r.me ? meTag : '')}
              mid={r.squares ?? 'עוד לא שיחק היום'} right={r.points === null ? '' : `${r.points}/5 · ${kmText(r.total_km ?? 0)}`} />
          ))
          : (week || []).map((r, i) => (
            <Row key={r.user_id} n={String(i + 1)} me={r.me} name={r.name + (r.me ? meTag : '')}
              mid={`${r.days} ${r.days === 1 ? 'יום' : 'ימים'}`} right={`${r.points} נק׳ · ${kmText(r.total_km)}`} />
          ))}
        {!day && !err && <T_ style={{ color: C.muted, padding: 8 }}>טוען…</T_>}
      </Card>
      {tab === 'day' && <T_ style={{ color: C.muted, fontSize: 13 }}>מי שצבר יותר נקודות מוביל. בתיקו, מי שסטה פחות קילומטרים.</T_>}
      {!played && <Btn big label="לשחק את היומי" onPress={() => router.push('/daily')} />}
      <Btn alt label="להזמין לחדר" onPress={invite} />
      {!!err && <T_ style={{ color: C.bad, fontFamily: F.bold }}>{err}</T_>}
      <View style={{ alignItems: 'center' }}>
        {sure ? <LinkBtn label="כן, לעזוב את החדר" onPress={leave} /> : <LinkBtn label="לעזוב את החדר" onPress={() => setSure(true)} />}
      </View>
    </Screen>
  );
}

function Row({ n, name, mid, right, me }: { n: string; name: string; mid: string; right: string; me: boolean }) {
  return (
    <View style={[st.row, me && { backgroundColor: C.track }]}>
      <T_ style={{ fontFamily: F.black, width: 22, color: C.muted }}>{n}</T_>
      <View style={{ flex: 1 }}>
        <T_ style={{ fontFamily: F.black }}>{name}</T_>
        <T_ style={{ fontSize: 13, color: C.muted }}>{mid}</T_>
      </View>
      <T_ style={{ fontFamily: F.bold, fontSize: 14 }}>{right}</T_>
    </View>
  );
}

const st = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 6, borderRadius: 8 },
});
