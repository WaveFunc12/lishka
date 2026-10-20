import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DAILY_N } from '@/engine';
import { useStore } from '@/state/store';
import { TabIcon } from '@/ui/TabIcon';
import { C, F } from '@/ui/theme';

/* The five places a player goes back to, along the bottom. Shifts, results and comics open over them, full screen. */
const TABS = [
  { name: 'home', title: 'שולחן' },
  { name: 'daily', title: 'היומי' },
  { name: 'atlas', title: 'המפה שלי' },
  { name: 'rooms', title: 'חדרים' },
  { name: 'file', title: 'תיק אישי' },
] as const;

export default function TabsLayout() {
  const { s, today } = useStore();
  const inset = useSafeAreaInsets().bottom;
  // An orange dot on the daily until today's five are played.
  const dailyOpen = !(s.daily.day === today() && s.daily.picks.length >= DAILY_N);
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: C.bg },
        tabBarActiveTintColor: C.kicker,
        tabBarInactiveTintColor: C.muted,
        // The bar reads right to left, so the desk is the first tab on the right.
        tabBarStyle: { direction: 'rtl', backgroundColor: C.surface, borderTopWidth: 3, borderTopColor: C.ink, height: 70 + inset, paddingTop: 4, paddingBottom: Math.max(inset, 4) },
        tabBarLabelStyle: { fontFamily: F.bold, fontSize: 12, lineHeight: 16 },
        tabBarAllowFontScaling: false,
      }}>
      {TABS.map((tab) => (
        <Tabs.Screen key={tab.name} name={tab.name}
          options={{ title: tab.title, tabBarIcon: ({ color }) => <TabIcon name={tab.name} color={String(color)} dot={tab.name === 'daily' && dailyOpen} /> }} />
      ))}
    </Tabs>
  );
}
