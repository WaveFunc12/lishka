import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type GestureResponderEvent, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle, Defs, G, Line, Mask, Path, RadialGradient, Rect, Stop, Text as SvgText } from 'react-native-svg';
import geo from '@/data/geo.json';
import { COUNTRY, fitAspect, fitView, niceScale, type Point, type View as MapBox } from '@/engine';
import { BW, C, F, SHADOW } from './theme';

/* The map, ported from the prototype's drawMap. Coordinates are km; the view is fitted to the box's aspect. */

export type DotState = 'lit' | 'ctx' | 'dim' | 'anc' | 'choice' | 'right' | 'wrong' | 'target' | 'mystery';
export type MapDot = Point & { id: string; state: DotState; size?: number; num?: string | number; label?: string; pulse?: boolean };
export type FitSpec = { fit: Point[]; pad?: number; minW?: number };

type Props = {
  view: MapBox | FitSpec;
  style?: object;
  dots?: MapDot[];
  lines?: [Point, Point, ('miss' | 'aline')?][];
  rings?: (Point & { r: number })[];
  cross?: Point[];
  pins?: Point[];
  /** Wiped-map mode: land shows only around known places, sized by memory strength. */
  reveal?: (Point & { s: number })[];
  revealR?: number;
  dotPx?: number;
  noScale?: boolean;
  mini?: boolean;
  tag?: string;
  label?: string;
  onPressMap?: (p: Point) => void;
  onPressDot?: (id: string) => void;
  children?: ReactNode;
};

const G_ = geo as { home: string[]; nb: string[]; lakes: string[] };
const isFit = (v: MapBox | FitSpec): v is FitSpec => 'fit' in v;

const DOT_FILL: Record<DotState, string> = {
  lit: C.dotLit, ctx: C.dotLit, dim: C.dot, anc: C.dotLit, choice: C.surface, right: C.ok, wrong: C.bad, target: C.target, mystery: C.surface,
};

export function MapView(p: Props) {
  const [box, setBox] = useState({ w: 0, h: 0 });
  const onLayout = (e: LayoutChangeEvent) => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height });
  const W = box.w || 320, H = box.h || 320, aspect = W / H;
  const v = isFit(p.view) ? fitView(p.view.fit, p.view.pad ?? 0.6, p.view.minW ?? 30, aspect) : fitAspect(p.view, aspect);
  const k = v.w / W, r = (p.dotPx || 6) * k, fs = 13 * k;

  const press = (e: GestureResponderEvent) => {
    if (!p.onPressMap) return;
    // Native gives locationX/Y; react-native-web only gives offsetX/Y on the underlying DOM event.
    const ne = e.nativeEvent as typeof e.nativeEvent & { offsetX?: number; offsetY?: number };
    const lx = Number.isFinite(ne.locationX) ? ne.locationX : ne.offsetX;
    const ly = Number.isFinite(ne.locationY) ? ne.locationY : ne.offsetY;
    if (lx === undefined || ly === undefined) return;
    p.onPressMap({ x: v.x + (lx / W) * v.w, y: v.y + (ly / H) * v.h });
  };

  const svg = (
    <Svg width={W} height={H} viewBox={`${v.x} ${v.y} ${v.w} ${v.h}`} accessibilityLabel={p.label || 'מפה'}>
      <Rect x={v.x} y={v.y} width={v.w} height={v.h} fill={C.sea} />
      {G_.nb.map((d, i) => <Path key={'nb' + i} d={d} fill={C.nb} />)}
      {G_.home.map((d, i) => <Path key={'hs' + i} d={d} fill="none" stroke={C.ink} strokeWidth={2.5 * k} strokeLinejoin="round" />)}
      {p.reveal ? (
        <>
          <Defs>
            <RadialGradient id="rvg">
              <Stop offset="0" stopColor="#fff" />
              <Stop offset="0.5" stopColor="#fff" />
              <Stop offset="1" stopColor="#fff" stopOpacity="0" />
            </RadialGradient>
            <Mask id="rv" maskUnits="userSpaceOnUse" x={v.x} y={v.y} width={v.w} height={v.h}>
              <Rect x={v.x} y={v.y} width={v.w} height={v.h} fill="#000" />
              {p.reveal.map((q, i) => <Circle key={i} cx={q.x} cy={q.y} r={(7 + 9 * q.s) * (p.revealR || 1)} fill="url(#rvg)" />)}
            </Mask>
          </Defs>
          {G_.home.map((d, i) => <Path key={'w' + i} d={d} fill={C.wiped} stroke={C.wiped} strokeWidth={1.4 * k} />)}
          <G mask="url(#rv)">{G_.home.map((d, i) => <Path key={'l' + i} d={d} fill={C.litLand} stroke={C.litLand} strokeWidth={1.4 * k} />)}</G>
        </>
      ) : (
        G_.home.map((d, i) => <Path key={'h' + i} d={d} fill={C.land} stroke={C.land} strokeWidth={1.4 * k} />)
      )}
      {G_.lakes.map((d, i) => <Path key={'lk' + i} d={d} fill={C.sea} stroke={C.ink} strokeWidth={1 * k} />)}
      {(p.lines || []).map(([a, b, cls], i) => (
        <Line key={'ln' + i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={cls === 'aline' ? C.accent : C.pin} strokeWidth={2 * k}
          strokeDasharray={cls === 'aline' ? [3 * k, 4 * k] : [4 * k, 3 * k]} opacity={cls === 'aline' ? 0.7 : 1} />
      ))}
      {(p.rings || []).map((g, i) => <Circle key={'rg' + i} cx={g.x} cy={g.y} r={g.r} fill="none" stroke={C.target} strokeWidth={2 * k} opacity={0.5} />)}
      {(p.dots || []).map((d) => {
        const rr = r * (d.size || 1), choice = d.state === 'choice', ring = choice || d.state === 'mystery';
        return (
          <G key={d.id + d.state} onPress={choice && p.onPressDot ? () => p.onPressDot!(d.id) : undefined} accessibilityLabel={choice ? `נקודה ${d.num}` : undefined}>
            {choice && <Circle cx={d.x} cy={d.y} r={rr * 2.4} fill="transparent" />}
            {d.pulse && <Circle cx={d.x} cy={d.y} r={rr * 1.6} fill="none" stroke={C.target} strokeWidth={2 * k} opacity={0.5} />}
            <Circle cx={d.x} cy={d.y} r={rr} fill={DOT_FILL[d.state]} opacity={d.state === 'dim' ? 0.5 : d.state === 'anc' ? 0.4 : 1}
              stroke={ring ? (d.state === 'mystery' ? C.target : C.ink) : undefined} strokeWidth={ring ? 2.5 * k : 0} />
            {d.num !== undefined && d.num !== '' && (
              <SvgText x={d.x} y={d.y + rr * 0.38} textAnchor="middle" fontSize={rr * 1.15} fontFamily={F.black} fontWeight="900"
                fill={d.state === 'mystery' ? C.target : C.ink}>{String(d.num)}</SvgText>
            )}
            {!!d.label && <Label x={d.x - rr * 1.5} y={d.y + fs * 0.35} fs={fs} text={d.label} faint={d.state === 'anc'} />}
          </G>
        );
      })}
      {(p.cross || []).map((c, i) => {
        const a = r * 1.8, b = r * 4.2;
        return (
          <G key={'x' + i}>
            <Path d={`M${c.x} ${c.y - b}V${c.y - a}M${c.x} ${c.y + a}V${c.y + b}M${c.x - b} ${c.y}H${c.x - a}M${c.x + a} ${c.y}H${c.x + b}`}
              stroke={C.target} strokeWidth={2.5 * k} strokeLinecap="round" />
            <Circle cx={c.x} cy={c.y} r={r * 0.55} fill={C.target} />
          </G>
        );
      })}
      {(p.pins || []).map((q, i) => (
        <Path key={'pin' + i} d={`M${q.x} ${q.y}l${-r * 1.4} ${-r * 3.2}a${r * 1.6} ${r * 1.6} 0 1 1 ${r * 2.8} 0z`} fill={C.pin} stroke={C.ink} strokeWidth={1.5 * k} />
      ))}
      {!p.noScale && <ScaleBar v={v} k={k} />}
    </Svg>
  );

  return (
    <View style={[styles.box, p.style]} onLayout={onLayout}>
      {box.w > 0 && (p.onPressMap ? <Pressable onPress={press} accessibilityRole="button" accessibilityLabel={p.label}>{svg}</Pressable> : svg)}
      {p.mini && box.w > 0 && <MiniMap v={v} />}
      {!!p.tag && (
        <View style={styles.tag} pointerEvents="none">
          <Text style={styles.tagText}>{p.tag}</Text>
        </View>
      )}
      {p.children}
    </View>
  );
}

function Label({ x, y, fs, text, faint, anchor = 'end' }: { x: number; y: number; fs: number; text: string; faint?: boolean; anchor?: 'end' | 'middle' }) {
  return (
    <G opacity={faint ? 0.65 : 1}>
      <SvgText x={x} y={y} textAnchor={anchor} fontSize={fs} fontFamily={F.bold} fontWeight="700" stroke={C.surface} strokeWidth={fs * 0.28} strokeLinejoin="round" fill={C.surface}>{text}</SvgText>
      <SvgText x={x} y={y} textAnchor={anchor} fontSize={fs} fontFamily={F.bold} fontWeight="700" fill={C.ink}>{text}</SvgText>
    </G>
  );
}

function ScaleBar({ v, k }: { v: MapBox; k: number }) {
  const sc = niceScale(v.w), sx = v.x + 12 * k, sy = v.y + v.h - 14 * k;
  return (
    <G>
      <Path d={`M${sx} ${sy}h${sc}M${sx} ${sy - 4 * k}v${8 * k}M${sx + sc} ${sy - 4 * k}v${8 * k}`} stroke={C.ink} strokeWidth={2 * k} fill="none" />
      <Label x={sx + sc / 2} y={sy - 7 * k} fs={11 * k} text={`${sc} ק״מ`} anchor="middle" />
    </G>
  );
}

function MiniMap({ v }: { v: MapBox }) {
  return (
    <View style={styles.mini} pointerEvents="none">
      <Svg width={38} height={90} viewBox={`${COUNTRY.x} ${COUNTRY.y} ${COUNTRY.w} ${COUNTRY.h}`}>
        <Rect x={COUNTRY.x} y={COUNTRY.y} width={COUNTRY.w} height={COUNTRY.h} fill={C.surface} />
        {G_.home.map((d, i) => <Path key={i} d={d} fill={C.land} stroke={C.ink} strokeWidth={4} />)}
        <Rect x={v.x} y={v.y} width={v.w} height={v.h} fill="none" stroke={C.target} strokeWidth={8} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { overflow: 'hidden', backgroundColor: C.sea, borderWidth: BW, borderColor: C.ink, borderRadius: 8, direction: 'ltr', ...SHADOW },
  tag: { position: 'absolute', bottom: 8, left: 8, backgroundColor: C.surface, borderWidth: 2, borderColor: C.ink, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  tagText: { fontFamily: F.black, fontSize: 12, color: C.ink, writingDirection: 'rtl' },
  mini: { position: 'absolute', top: 8, right: 8, borderWidth: 2, borderColor: C.ink, borderRadius: 4, overflow: 'hidden', backgroundColor: C.surface },
});
