import { router } from 'expo-router';
import { View } from 'react-native';
import { useStore } from '@/state/store';
import { Btn, H1, Kicker, Mentor, Screen, T_ } from '@/ui/kit';
import { C } from '@/ui/theme';

/* First screen: Zvi introduces himself and asks how to address the player. */
export default function Hello() {
  const { s, update } = useStore();
  const choose = (g: 'm' | 'f') => {
    const first = !s.g;
    update((d) => {
      d.g = g;
    });
    router.replace(first && !s.seenComic ? '/story' : '/home');
  };
  return (
    <Screen style={{ justifyContent: 'center', gap: 22 }}>
      <View style={{ alignItems: 'center' }}>
        <Mentor size={132} />
      </View>
      <View>
        <Kicker>הלשכה למיפוי ישראל · קומה 3</Kicker>
        <H1 size={38}>בוקר. אני צבי.</H1>
      </View>
      <T_ style={{ fontSize: 19, lineHeight: 28 }}>31 שנה בלשכה. לפני שאני מסביר לך מה קרה פה, איך לפנות אליך?</T_>
      <View style={{ gap: 12 }}>
        <Btn big label="בלשון זכר" onPress={() => choose('m')} />
        <Btn big alt label="בלשון נקבה" onPress={() => choose('f')} />
      </View>
      <T_ style={{ color: C.muted, fontSize: 14, textAlign: 'center' }}>אפשר לשנות אחר כך בתיק האישי.</T_>
    </Screen>
  );
}
