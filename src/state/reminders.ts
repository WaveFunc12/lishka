import * as Notifications from 'expo-notifications';
import { AndroidImportance, IosAuthorizationStatus } from 'expo-notifications';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { reminderPlan } from '@/engine';
import { useStore } from './store';

/* Zvi's daily reminder: local notifications only, rescheduled for the week ahead whenever progress changes. */

export const remindersSupported = Platform.OS !== 'web';

if (remindersSupported) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
  });
}

/** Ask to show notifications. True when allowed (fully or provisionally). */
export async function allowReminders(): Promise<boolean> {
  if (!remindersSupported) return false;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('daily', { name: 'תזכורת יומית', importance: AndroidImportance.DEFAULT });
  }
  return allowed(await Notifications.requestPermissionsAsync({ ios: { allowAlert: true, allowBadge: false, allowSound: true } }));
}

function allowed(p: Notifications.NotificationPermissionsStatus): boolean {
  const st = p.ios?.status;
  return st !== undefined
    ? st === IosAuthorizationStatus.AUTHORIZED || st === IosAuthorizationStatus.PROVISIONAL
    : p.granted;
}

/** Keep the scheduled reminders in step with the player's settings and today's play. */
export function useReminders() {
  const { ready, s, now, today } = useStore();
  const d = today(), played = s.lastDay === d || (s.daily.day === d && s.daily.picks.length >= 5);
  useEffect(() => {
    if (!remindersSupported || !ready) return;
    (async () => {
      await Notifications.cancelAllScheduledNotificationsAsync();
      if (s.remind === null) return;
      if (!allowed(await Notifications.getPermissionsAsync())) return;
      for (const r of reminderPlan(s, d, now(), s.remind)) {
        await Notifications.scheduleNotificationAsync({
          content: { title: r.title, body: r.body },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: r.at, channelId: 'daily' },
        });
      }
    })().catch(() => {});
    // Reschedule only when what the reminders say could change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, s.remind, s.g, s.streak, played, d]);
}
