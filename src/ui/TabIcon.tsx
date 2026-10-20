import Svg, { Circle, Path } from 'react-native-svg';
import { C } from './theme';

/* Line icons for the tab bar, drawn in the postcard's ink: the office, the daily, my map, rooms, the personal file. */
const PATHS: Record<string, string> = {
  home: 'M3 10 12 4l9 6M5 10v9h14v-9M9 19v-5h6v5M3 19h18',
  daily: 'M4 6h16v14H4zM4 10h16M8 3v5M16 3v5M12 13.5a2 2 0 1 1 0 4',
  atlas: 'M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2zM9 4v14M15 6v14',
  rooms: 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20c0-3.5 2.7-6 6-6s6 2.5 6 6M16 5.5a3 3 0 0 1 0 5.5M17.5 14c2 .7 3.5 3 3.5 6',
  file: 'M3 7V5h7l2 2h9v13H3zM3 9h18',
};

export function TabIcon({ name, color, dot }: { name: string; color: string; dot?: boolean }) {
  return (
    <Svg width={26} height={26} viewBox="0 0 24 24">
      <Path d={PATHS[name]} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {dot && <Circle cx={20.5} cy={4} r={3.4} fill={C.orange} stroke={C.surface} strokeWidth={1.4} />}
    </Svg>
  );
}
