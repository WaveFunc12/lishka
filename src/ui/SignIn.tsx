import * as AppleAuthentication from 'expo-apple-authentication';
import { useEffect, useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';
import { saveName, say, sendEmailCode, signInApple, verifyEmailCode } from '@/net/backend';
import { useAccount } from '@/net/account';
import { Btn, Card, LinkBtn, T_ } from './kit';
import { BW, C, F } from './theme';

/* Getting into the rooms: Sign in with Apple where the phone offers it, otherwise a code by email;
   then a display name for the tables. */
export function SignIn() {
  const [apple, setApple] = useState(false);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  useEffect(() => { AppleAuthentication.isAvailableAsync().then(setApple).catch(() => {}); }, []);

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true); setErr('');
    try { await fn(); } catch (e) { setErr(say(e)); } finally { setBusy(false); }
  };
  const viaApple = () => run(async () => {
    try {
      const c = await AppleAuthentication.signInAsync({ requestedScopes: [AppleAuthentication.AppleAuthenticationScope.FULL_NAME] });
      if (c.identityToken) await signInApple(c.identityToken);
    } catch (e) {
      if ((e as { code?: string }).code !== 'ERR_REQUEST_CANCELED') throw e;
    }
  });

  return (
    <Card style={{ gap: 12 }}>
      <T_ style={{ fontFamily: F.display, fontSize: 22 }}>כניסה לחדרים</T_>
      <T_ style={{ color: C.muted, fontSize: 14 }}>צריך להיכנס פעם אחת, כדי שהחברים יראו את התוצאות שלך. ההתקדמות במשחק נשארת בטלפון.</T_>
      {apple && (
        <AppleAuthentication.AppleAuthenticationButton buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK} cornerRadius={14} style={{ height: 52, width: '100%' }} onPress={viaApple} />
      )}
      {!sent ? (
        <>
          <TextInput maxFontSizeMultiplier={1.3} value={email} onChangeText={setEmail} placeholder="כתובת מייל" placeholderTextColor={C.muted} keyboardType="email-address" autoCapitalize="none" autoCorrect={false}
            autoComplete="email" style={[st.input, st.ltr]} accessibilityLabel="כתובת מייל" />
          <Btn alt={apple} label="לשלוח לי קוד כניסה" disabled={busy || !/\S+@\S+\.\S+/.test(email)} onPress={() => run(async () => { await sendEmailCode(email); setSent(true); })} />
        </>
      ) : (
        <>
          <T_ style={{ fontSize: 14 }}>שלחנו קוד בן 6 ספרות אל {email}.</T_>
          <TextInput maxFontSizeMultiplier={1.3} value={code} onChangeText={setCode} placeholder="הקוד מהמייל" placeholderTextColor={C.muted} keyboardType="number-pad" maxLength={6} style={[st.input, st.ltr]}
            accessibilityLabel="קוד כניסה" autoComplete="one-time-code" textContentType="oneTimeCode" />
          <Btn label="להיכנס" disabled={busy || code.trim().length < 6} onPress={() => run(() => verifyEmailCode(email, code))} />
          <LinkBtn label="לשנות כתובת" onPress={() => { setSent(false); setCode(''); }} />
        </>
      )}
      {!!err && <T_ style={{ color: C.bad, fontFamily: F.bold }}>{err}</T_>}
    </Card>
  );
}

/** First time in: the name others will see in the tables. */
export function PickName() {
  const { session, setProfile } = useAccount();
  const [name, setName] = useState('');
  const [err, setErr] = useState('');
  const ok = name.trim().length >= 1 && name.trim().length <= 24;
  const save = () => saveName(session!.user.id, name).then(setProfile).catch((e) => setErr(say(e)));
  return (
    <Card style={{ gap: 12 }}>
      <T_ style={{ fontFamily: F.display, fontSize: 22 }}>איך לקרוא לך?</T_>
      <T_ style={{ color: C.muted, fontSize: 14 }}>השם שיופיע בטבלה של החדרים. אפשר שם פרטי או כינוי.</T_>
      <TextInput maxFontSizeMultiplier={1.3} value={name} onChangeText={setName} maxLength={24} placeholder="שם" placeholderTextColor={C.muted} style={st.input} accessibilityLabel="שם לתצוגה" />
      <Btn label="שמירה" disabled={!ok} onPress={save} />
      {!!err && <T_ style={{ color: C.bad, fontFamily: F.bold }}>{err}</T_>}
    </Card>
  );
}

export const st = StyleSheet.create({
  input: { borderWidth: BW, borderColor: C.ink, borderRadius: 12, backgroundColor: C.surface, fontFamily: F.bold, fontSize: 18, padding: 12, textAlign: 'right', writingDirection: 'rtl' },
  ltr: { textAlign: 'left', writingDirection: 'ltr' },
});
