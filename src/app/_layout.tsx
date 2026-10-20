// Per-weight imports, so only these five font files ship with the app.
import { Karantina_700Bold } from '@expo-google-fonts/karantina/700Bold';
import { Rubik_400Regular } from '@expo-google-fonts/rubik/400Regular';
import { Rubik_700Bold } from '@expo-google-fonts/rubik/700Bold';
import { Rubik_900Black } from '@expo-google-fonts/rubik/900Black';
import { SuezOne_400Regular } from '@expo-google-fonts/suez-one/400Regular';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AccountProvider } from '@/net/account';
import { useReminders } from '@/state/reminders';
import { StoreProvider, useStore } from '@/state/store';
import { C } from '@/ui/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

function Gate() {
  const { ready } = useStore();
  useReminders();
  const [fontsLoaded, fontError] = useFonts({ Rubik_400Regular, Rubik_700Bold, Rubik_900Black, SuezOne_400Regular, Karantina_700Bold });
  // If a font fails to load, carry on with the system font rather than a blank screen.
  const go = ready && (fontsLoaded || !!fontError);
  useEffect(() => {
    if (go) SplashScreen.hideAsync().catch(() => {});
  }, [go]);
  if (!go) return null;
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.bg }, animation: 'fade' }} />;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StoreProvider>
          <AccountProvider>
            <StatusBar style="dark" />
            <Gate />
          </AccountProvider>
        </StoreProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
