import type { ComponentRef, Ref } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';
import geo from '@/data/geo.json';
import { COUNTRY, DAILY_N, dayNo, hit, kmText, points, squares, totalKm, type DailyPick, type DayStr } from '@/engine';
import { C, F } from './theme';

const OUTLINE = (geo as { homeLow: string[] }).homeLow;
export const CARD_W = 360, CARD_H = 470;

/* The daily as a postcard picture to share. It gives nothing away: no place names and no places on the map,
   only how far each guess landed, so a friend who hasn't played yet can still play. */
export function ShareCard({ picks, day, run, ask, ref }: { picks: DailyPick[]; day: DayStr; run: number; ask: string; ref?: Ref<ComponentRef<typeof View>> }) {
  const n = points(picks);
  return (
    <View ref={ref} collapsable={false} style={st.card}>
      <View style={st.top}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text maxFontSizeMultiplier={1} style={st.kicker}>הלשכה · משחק מפת ישראל</Text>
          <Text maxFontSizeMultiplier={1} style={st.title}>היומי #{dayNo(day)}</Text>
        </View>
        {/* The stamp: the country in miniature, perforated like the ones in the personal file. */}
        <View style={st.stamp}>
          <Svg width={34} height={76} viewBox={`${COUNTRY.x - 10} ${COUNTRY.y - 10} ${COUNTRY.w + 20} ${COUNTRY.h + 20}`}>
            <G>{OUTLINE.map((d, i) => <Path key={i} d={d} fill={C.land} stroke={C.ink} strokeWidth={5} />)}</G>
          </Svg>
        </View>
      </View>
      <View style={st.score}>
        <Text maxFontSizeMultiplier={1} style={st.big}>{n}/{DAILY_N}</Text>
        <Text maxFontSizeMultiplier={1} style={st.sq}>{squares(picks)}</Text>
      </View>
      <View style={{ gap: 7 }}>
        {picks.map((p, i) => (
          <View key={i} style={st.row}>
            <Text maxFontSizeMultiplier={1} style={st.n}>{i + 1}</Text>
            <View style={st.track}>
              <View style={[st.bar, { width: `${Math.max(4, 100 - Math.min(100, (p.d / 50) * 100))}%`, backgroundColor: hit(p.d) ? C.ok : C.bad }]} />
            </View>
            <Text maxFontSizeMultiplier={1} style={[st.km, { color: hit(p.d) ? C.ok : C.bad }]}>{kmText(p.d)}</Text>
          </View>
        ))}
      </View>
      <View style={{ flex: 1 }} />
      <View style={st.foot}>
        <Text maxFontSizeMultiplier={1} style={st.footT}>סטייה כוללת {kmText(totalKm(picks))}{run > 1 ? ` · ${run} ימים ברצף` : ''}</Text>
        <Text maxFontSizeMultiplier={1} style={st.ask}>{ask}</Text>
      </View>
      <Svg width={86} height={86} style={st.postmark} viewBox="0 0 80 80">
        <Circle cx={40} cy={40} r={34} fill="none" stroke={C.kicker} strokeWidth={3} opacity={0.75} />
        <Circle cx={40} cy={40} r={27} fill="none" stroke={C.kicker} strokeWidth={1.5} strokeDasharray={[3, 3]} opacity={0.75} />
      </Svg>
      <Text maxFontSizeMultiplier={1} style={st.postT}>{day.split('-').reverse().slice(0, 2).map(Number).join('.')}</Text>
    </View>
  );
}

const st = StyleSheet.create({
  card: { width: CARD_W, height: CARD_H, backgroundColor: C.surface, borderWidth: 3, borderColor: C.ink, borderRadius: 18, padding: 20, gap: 14 },
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  kicker: { fontFamily: F.black, fontSize: 13, color: C.kicker, textAlign: 'right' },
  title: { fontFamily: F.display, fontSize: 36, lineHeight: 44, color: C.ink, textAlign: 'right' },
  stamp: { borderWidth: 2, borderColor: C.ink, borderStyle: 'dashed', backgroundColor: C.accent, padding: 4, transform: [{ rotate: '4deg' }] },
  score: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  big: { fontFamily: F.display, fontSize: 58, lineHeight: 70, color: C.ink },
  sq: { fontSize: 30, letterSpacing: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  n: { fontFamily: F.black, fontSize: 15, width: 16, color: C.muted, textAlign: 'center' },
  track: { flex: 1, height: 14, borderRadius: 7, backgroundColor: C.track, overflow: 'hidden', borderWidth: 1.5, borderColor: C.ink },
  bar: { height: '100%' },
  km: { fontFamily: F.black, fontSize: 14, width: 104, textAlign: 'left' },
  foot: { gap: 4, borderTopWidth: 2, borderTopColor: C.ink, borderStyle: 'dashed', paddingTop: 10 },
  footT: { fontFamily: F.bold, fontSize: 15, color: C.muted, textAlign: 'right', paddingLeft: 90 },
  ask: { fontFamily: F.display, fontSize: 24, color: C.ink, textAlign: 'right', paddingLeft: 90 },
  postmark: { position: 'absolute', left: 16, bottom: 10, transform: [{ rotate: '-14deg' }] },
  postT: { position: 'absolute', left: 16, bottom: 10, width: 86, lineHeight: 86, textAlign: 'center', fontFamily: F.stamp, fontSize: 22, color: C.kicker, opacity: 0.85, transform: [{ rotate: '-14deg' }] },
});
