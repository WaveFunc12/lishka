import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { createRoom, deleteAccount, joinRoom, myRooms, say, signOut, type Room } from '@/net/backend';
import { useAccount } from '@/net/account';
import { useT } from '@/state/store';
import { Btn, Card, H1, Kicker, LinkBtn, Screen, T_, ZviSays } from '@/ui/kit';
import { PickName, SignIn, st as form } from '@/ui/SignIn';
import { BW, C, F, SHADOW_SM } from '@/ui/theme';

/* Private rooms: friends and family compete on the daily. Create a room and share its code, or join with one. */
export default function Rooms() {
  const t = useT();
  const { enabled, ready, session, profile } = useAccount();
  const [rooms, setRooms] = useState<Room[] | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const load = useCallback(() => {
    if (session && profile) myRooms().then(setRooms).catch((e) => setErr(say(e)));
  }, [session, profile]);
  useFocusEffect(load);

  const act = async (fn: () => Promise<Room>) => {
    setBusy(true); setErr('');
    try {
      const r = await fn();
      setName(''); setCode('');
      router.push({ pathname: '/room/[id]', params: { id: r.id } });
    } catch (e) { setErr(say(e)); } finally { setBusy(false); }
  };

  return (
    <Screen tab>
      <View><Kicker>חדר הישיבות · קומה 4</Kicker><H1>חדרים פרטיים</H1></View>
      <ZviSays text="פותחים חדר לחברים או למשפחה, משחקים יחד ביומי ומשווים מי פגע הכי קרוב." />
      {!enabled ? (
        <Card style={{ gap: 6 }}>
          <T_ style={{ fontFamily: F.black }}>החדרים עוד לא מחוברים בגרסה הזאת</T_>
          <T_ style={{ color: C.muted, fontSize: 14 }}>בינתיים אפשר לשתף את התוצאה של היומי בוואטסאפ ולהשוות ידנית.</T_>
        </Card>
      ) : !ready ? null : !session ? (
        <SignIn />
      ) : !profile ? (
        <>
          <PickName />
          {/* Signed in but not named yet: leaving or deleting the account must still be one tap away. */}
          <AccountLinks />
        </>
      ) : (
        <>
          <View style={{ gap: 10 }}>
            {(rooms || []).map((r) => (
              <Pressable key={r.id} accessibilityRole="button" accessibilityLabel={`חדר ${r.name}`}
                onPress={() => router.push({ pathname: '/room/[id]', params: { id: r.id } })}
                style={({ pressed }) => [s.room, pressed && { transform: [{ translateY: 2 }] }]}>
                <T_ style={{ fontFamily: F.black, fontSize: 18, flex: 1 }}>{r.name}</T_>
                <T_ style={s.code}>{r.code}</T_>
              </Pressable>
            ))}
            {rooms && !rooms.length && <T_ style={{ color: C.muted }}>עוד אין לך חדרים. אפשר לפתוח חדר או להצטרף עם קוד.</T_>}
          </View>
          <Card style={{ gap: 10 }}>
            <T_ style={{ fontFamily: F.display, fontSize: 20 }}>להצטרף עם קוד</T_>
            <TextInput maxFontSizeMultiplier={1.3} value={code} onChangeText={(v) => setCode(v.toUpperCase())} placeholder="K7QM2X" placeholderTextColor={C.muted} maxLength={8} autoCapitalize="characters"
              autoCorrect={false} style={[form.input, form.ltr, { letterSpacing: 4 }]} accessibilityLabel="קוד חדר" />
            <Btn label="להצטרף" disabled={busy || code.replace(/\s/g, '').length !== 6} onPress={() => act(() => joinRoom(code))} />
          </Card>
          <Card style={{ gap: 10 }}>
            <T_ style={{ fontFamily: F.display, fontSize: 20 }}>לפתוח חדר חדש</T_>
            <TextInput maxFontSizeMultiplier={1.3} value={name} onChangeText={setName} placeholder="שם החדר, למשל המשפחה" placeholderTextColor={C.muted} maxLength={30} style={form.input} accessibilityLabel="שם החדר" />
            <Btn alt label="לפתוח חדר" disabled={busy || !name.trim()} onPress={() => act(() => createRoom(name))} />
          </Card>
          {!!err && <T_ style={{ color: C.bad, fontFamily: F.bold }}>{err}</T_>}
          <T_ style={{ color: C.muted, fontSize: 13, textAlign: 'center' }}>{t(`{מחובר|מחוברת} בתור ${profile.name}. ההתקדמות נשמרת בחשבון.`)}</T_>
          <AccountLinks onGone={() => setRooms(null)} />
        </>
      )}
    </Screen>
  );
}


/** Sign out, and delete the account after a confirmation: wherever a signed-in player is, both are one tap away. */
function AccountLinks({ onGone }: { onGone?: () => void }) {
  const [bye, setBye] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  return (
    <>
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 24 }}>
        <LinkBtn label="להתנתק" onPress={() => { signOut().catch(() => {}); onGone?.(); }} />
        <LinkBtn label="למחוק את החשבון" onPress={() => setBye(true)} />
      </View>
      {bye && (
        <Card style={{ gap: 10, borderColor: C.bad }}>
          <T_ style={{ fontFamily: F.black }}>למחוק את החשבון?</T_>
          <T_ style={{ fontSize: 14 }}>השם, התוצאות בחדרים והגיבוי של ההתקדמות יימחקו מהשרת. חדרים שפתחת יעברו לחבר הבא בחדר. ההתקדמות בטלפון הזה נשארת.</T_>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Btn style={{ flex: 1 }} alt label="ביטול" onPress={() => setBye(false)} />
            <Btn style={{ flex: 1 }} tone="wrong" label="למחוק" disabled={busy} onPress={async () => {
              setBusy(true); setErr('');
              try { await deleteAccount(); onGone?.(); setBye(false); } catch (e) { setErr(say(e)); } finally { setBusy(false); }
            }} />
          </View>
        </Card>
      )}
      {!!err && <T_ style={{ color: C.bad, fontFamily: F.bold }}>{err}</T_>}
    </>
  );
}

const s = StyleSheet.create({
  room: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: BW, borderColor: C.ink, borderRadius: 12, padding: 14, backgroundColor: C.surface, ...SHADOW_SM },
  code: { fontFamily: F.black, fontSize: 15, letterSpacing: 2, color: C.accent, writingDirection: 'ltr' },
});
