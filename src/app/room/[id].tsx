import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { dayNo, kmText, weekEnd, weekText } from '@/engine';
import { getRoom, leaveRoom, roomDay, roomWeek, say, type DayRow, type Room, type WeekRow } from '@/net/backend';
import { useAccount } from '@/net/account';
import { useStore, useT } from '@/state/store';
import { Medal } from '@/ui/Badges';
import { Btn, Card, H1, Kicker, LinkBtn, Screen, T_ } from '@/ui/kit';
import { shareText } from '@/ui/share';
import { C, F } from '@/ui/theme';

/* One room's table: today's daily (who played, points, total distance) or this week, Sunday to Saturday.
   Whoever led last week hangs on the wall as worker of the week until the next one closes. */
export default function RoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { today, s } = useStore();
  const { session } = useAccount();
  const t = useT(), meTag = t(' ({אתה|את})');
  const [room, setRoom] = useState<Room | null>(null);
  const [tab, setTab] = useState<'day' | 'week'>('day');
  const [day, setDay] = useState<DayRow[] | null>(null);
  const [week, setWeek] = useState<WeekRow[] | null>(null);
  const [prev, setPrev] = useState<WeekRow[] | null>(null);
  const [err, setErr] = useState('');
  const [sure, setSure] = useState(false);
  const d = today(), end = weekEnd(d), lastEnd = weekEnd(d, 1);
  const played = s.daily.day === d && s.daily.picks.length >= 5;

  const load = useCallback(() => {
    if (!id) return;
    Promise.all([getRoom(id), roomDay(id, d), roomWeek(id, end), roomWeek(id, lastEnd)])
      .then(([r, a, b, c]) => { setRoom(r); setDay(a); setWeek(b); setPrev(c); })
      .catch((e) => setErr(say(e)));
  }, [id, d, end, lastEnd]);
  useFocusEffect(load);

  const best = prev?.[0] && prev[0].points > 0 ? prev[0] : null;
  const [copied, setCopied] = useState(false);
  const invite = () => room && shareText(`בואו להתחרות איתי ביומי של גלויות מהלשכה! החדר "${room.name}", קוד ${room.code}`).then((r) => setCopied(r === 'copied'));
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
      {best && (
        <Card style={st.plaque}>
          <Medal tier="gold" face="★" earned size={46} />
          <View style={{ flex: 1, gap: 2 }}>
            <Kicker>עובד/ת השבוע · {weekText(lastEnd)}</Kicker>
            <T_ style={{ fontFamily: F.display, fontSize: 24, lineHeight: 30 }}>{best.name}</T_>
            <T_ style={{ fontSize: 13, color: C.muted }}>{best.points} נקודות ב־{best.days} {best.days === 1 ? 'יום' : 'ימים'}{best.me ? t('. {זה אתה|זו את}! התמונה שלך תלויה על הקיר עד שבת הבאה.') : ''}</T_>
          </View>
        </Card>
      )}
      <Card style={{ gap: 2, paddingVertical: 8 }}>
        {tab === 'day'
          ? (day || []).map((r, i) => (
            <Row key={r.user_id} n={r.points === null ? '' : String(i + 1)} me={r.me} name={r.name + (r.me ? meTag : '')}
              mid={r.squares ?? 'עוד לא שיחק היום'} right={r.points === null ? '' : `${r.points}/5 · ${kmText(r.total_km ?? 0)}`} />
          ))
          : (week || []).map((r, i) => (
            <Row key={r.user_id} n={String(i + 1)} me={r.me} name={r.name + (r.me ? meTag : '')}
              mid={`${r.days} ${r.days === 1 ? 'יום' : 'ימים'}${i === 0 && r.points > 0 ? ' · בדרך לתעודה' : ''}`} right={`${r.points} נק׳ · ${kmText(r.total_km)}`} />
          ))}
        {!day && !err && <T_ style={{ color: C.muted, padding: 8 }}>טוען…</T_>}
      </Card>
      <T_ style={{ color: C.muted, fontSize: 13 }}>
        {tab === 'day' ? 'מי שצבר יותר נקודות מוביל. בתיקו, מי שסטה פחות קילומטרים.' : 'השבוע נסגר במוצאי שבת. מי שבראש הטבלה נהיה עובד/ת השבוע, והתעודה נתלית בראש החדר לשבוע שלם.'}
      </T_>
      {!played && <Btn big label="לשחק את היומי" onPress={() => router.push('/daily')} />}
      <Btn alt label="להזמין לחדר" onPress={invite} />
      {copied && <T_ style={{ textAlign: 'center', color: C.ok, fontFamily: F.bold }}>ההזמנה הועתקה, עם קוד החדר. אפשר להדביק אותה בוואטסאפ.</T_>}
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
  plaque: { flexDirection: 'row', alignItems: 'center', gap: 12, borderColor: C.gold, borderWidth: 3 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 6, borderRadius: 8 },
});
