import * as Haptics from 'expo-haptics';
import { useEffect, type ReactNode } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring } from 'react-native-reanimated';
import Svg, { Circle, G, Path, Rect, Text as SvgText } from 'react-native-svg';
import geo from '@/data/geo.json';
import { COUNTRY, type Point } from '@/engine';
import { C, F } from './theme';

const OUTLINE = (geo as { homeLow: string[] }).homeLow;

/* Badges drawn as the office's paperwork: a postage stamp for each region, a medal for each tier. */

/** A region's stamp: the country in miniature with the region's places marked. Grey and faint until the region is closed. */
export function RegionStamp({ col, places, known, earned, faded, size = 64 }: { col: string; places: Point[]; known: Point[]; earned: boolean; faded?: boolean; size?: number }) {
  const W = 64, H = 84, k = 66 / COUNTRY.h;
  const tx = W / 2 - k * (COUNTRY.x + COUNTRY.w / 2), ty = 9 - k * COUNTRY.y;
  // Perforations: bites out of the paper edge, every 8 px.
  const bites = [
    ...Array.from({ length: 8 }, (_, i) => [4 + i * 8, 0]), ...Array.from({ length: 8 }, (_, i) => [4 + i * 8, H]),
    ...Array.from({ length: 10 }, (_, i) => [0, 6 + i * 8]), ...Array.from({ length: 10 }, (_, i) => [W, 6 + i * 8]),
  ];
  return (
    <Svg width={size} height={(size * H) / W} viewBox={`0 0 ${W} ${H}`}>
      <Rect x={0} y={0} width={W} height={H} fill={earned ? '#FFFDF6' : C.wiped} />
      {bites.map(([x, y], i) => <Circle key={i} cx={x} cy={y} r={2.6} fill={C.surface} />)}
      <Rect x={5} y={5} width={W - 10} height={H - 10} fill={earned ? col : C.track} stroke={earned ? C.ink : 'none'} strokeWidth={1.2} />
      <G transform={`translate(${tx} ${ty}) scale(${k})`}>
        {OUTLINE.map((d, i) => <Path key={i} d={d} fill={earned ? C.land : '#EFE3C8'} stroke={earned ? C.ink : C.dot} strokeWidth={earned ? 7 : 4} />)}
        {places.map((p, i) => <Circle key={'p' + i} cx={p.x} cy={p.y} r={9} fill={earned ? C.ink : C.muted} opacity={earned ? 0.9 : 0.55} />)}
        {!earned && known.map((p, i) => <Circle key={'k' + i} cx={p.x} cy={p.y} r={10} fill={col} />)}
      </G>
      {/* Fading ink: the stamp washes out toward the paper until it is renewed. */}
      {earned && faded && <Rect x={5} y={5} width={W - 10} height={H - 10} fill="#FFFDF6" opacity={0.6} />}
    </Svg>
  );
}

const MEDAL = { bronze: C.bronze, silver: C.silver, gold: C.gold, legend: C.legend } as const;

/** A tier medal on its ribbon, with what it stands for written on its face. Flat grey until earned. */
export function Medal({ tier, face, earned, size = 64 }: { tier: keyof typeof MEDAL; face: string; earned: boolean; size?: number }) {
  const col = earned ? MEDAL[tier] : C.track, ink = earned ? C.ink : C.dot;
  return (
    <Svg width={size} height={(size * 84) / 64} viewBox="0 0 64 84">
      <Path d="M18 2h12l6 30H24zM34 2h12l-6 30H28z" fill={earned ? C.accent : C.wiped} stroke={ink} strokeWidth={1.5} strokeLinejoin="round" />
      <Path d="M24 2v28M40 2v28" stroke={earned ? C.orange : C.track} strokeWidth={2} />
      <Circle cx={32} cy={54} r={26} fill={col} stroke={ink} strokeWidth={2} />
      <Circle cx={32} cy={54} r={20.5} fill="none" stroke={earned ? '#FFF6E2' : C.wiped} strokeWidth={1.5} strokeDasharray="2 3" opacity={0.85} />
      <SvgText x={32} y={60} textAnchor="middle" fontSize={face.length > 3 ? 13 : 17} fontFamily={F.black} fontWeight="900" fill={earned ? '#FFF6E2' : C.dot}>{face}</SvgText>
    </Svg>
  );
}

/** A stamp pressed into the album: it drops in big and tilted, lands with a thump (and a tap of the phone), and settles. */
export function StampDrop({ children, delay = 350, mute }: { children: ReactNode; delay?: number; mute?: boolean }) {
  const k = useSharedValue(0);
  useEffect(() => {
    k.set(withDelay(delay, withSpring(1, { damping: 15, stiffness: 190, mass: 0.9 })));
    const id = setTimeout(() => { if (!mute) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {}); }, delay + 180);
    return () => clearTimeout(id);
  }, [k, delay, mute]);
  const st = useAnimatedStyle(() => {
    const v = k.get();
    return { opacity: Math.min(1, v * 3), transform: [{ scale: 2.4 - 1.4 * v }, { rotate: `${-16 + 12 * v}deg` }] };
  });
  // Hidden until the first animated frame, so the stamp never flashes in place before it drops.
  return <Animated.View style={[{ opacity: 0 }, st]}>{children}</Animated.View>;
}
