import { router } from 'expo-router';
import { View } from 'react-native';
import { useStart } from '@/state/actions';
import { useStore, useT } from '@/state/store';
import { Btn, Card, H1, Kicker, Mentor, Screen, T_ } from '@/ui/kit';
import { C, F } from '@/ui/theme';

/* The four-panel opening. Text-only panels for now; the illustrated comic replaces them. */
const PANELS: { who?: string; cap: string }[] = [
  { cap: 'יום ראשון, 08:00. הלשכה למיפוי ישראל, קומה 3. המעלית שוב תקועה.' },
  { who: 'צבי', cap: '״31 שנה אני מצייר את המדינה הזאת. ואת הקפה שלי אף אחד לא מכין. {אתה החדש|את החדשה}? מעולה. יש אסון.״' },
  { who: 'צבי', cap: '״מישהו שפך שוקו על השרת. כל היישובים נמחקו מהמפה. כולם.״' },
  { cap: 'המשימה שלך: להחזיר את היישובים למפה, אחד אחד. מתחילים מהגדולים.' },
];

export default function Story() {
  const { s, update } = useStore();
  const start = useStart();
  const t = useT();
  const done = () => {
    update((d) => {
      d.seenComic = true;
    });
    router.replace('/home');
    if (!s.xp) start.shift();
  };
  return (
    <Screen>
      <View>
        <Kicker>פרק 1 · הסיפור</Kicker>
        <H1 size={30}>גלויה מהלשכה</H1>
      </View>
      {PANELS.map((p, i) => (
        <Card key={i} style={{ flexDirection: 'row', gap: 12, alignItems: 'center', backgroundColor: i % 3 === 0 ? '#F7C873' : C.surface }}>
          {p.who && <Mentor size={48} />}
          <T_ style={{ flex: 1, fontSize: 17, lineHeight: 25 }}>
            {p.who && <T_ style={{ fontFamily: F.black }}>{p.who}: </T_>}
            {t(p.cap)}
          </T_>
        </Card>
      ))}
      <View style={{ flex: 1 }} />
      <Btn big label="יאללה, לעבודה" onPress={done} />
    </Screen>
  );
}
