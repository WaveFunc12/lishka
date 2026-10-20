import { router } from 'expo-router';

/** Back to the desk tab: close whatever is stacked over the tabs (a shift, its result, a comic), or swap a lone screen for the tabs. */
export function goHome() {
  if (!router.canDismiss()) return router.replace('/home');
  router.dismissAll();
  router.navigate('/home');
}
