import { Redirect } from 'expo-router';
import { useStore } from '@/state/store';

export default function Index() {
  const { s } = useStore();
  return <Redirect href={!s.g ? '/hello' : !s.seenComic ? '/story' : '/home'} />;
}
