import { useLayoutEffect, useState, type ReactNode } from 'react';
import { PixelRatio, Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import Svg, { Circle, Defs, G, Image as SvgImage, Line, Mask, Path, RadialGradient, Rect, Stop, Text as SvgText } from 'react-native-svg';
import geo from '@/data/geo.json';
import { clampView, COUNTRY, fitAspect, fitView, niceScale, zoomAt, type Point, type View as MapBox } from '@/engine';
import { MapLabels, MapOverlayBase } from './MapOverlay';
import { OVERVIEW, OVERVIEW_PX_PER_KM, TILES } from './mapTiles';
import { BW, C, F, SHADOW } from './theme';

/* The map: a shaded-relief basemap (no names, roads or towns, so it gives nothing away) with the game drawn on top.
   Coordinates are km; the view is fitted to the box's aspect. Pinch to zoom, drag once zoomed, or use the buttons. */

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
  /** Pinch, drag and zoom buttons. On by default. */
  zoom?: boolean;
  children?: ReactNode;
};

const G_ = geo as { home: string[]; homeLow: string[]; lakes: string[] };
const MIN_W = 10, MAX_W = 220; // km
// Rough land past the edges of the basemap, seen only when zoomed far out on a wide map: [x0, y0, x1, y1] in km.
const FAR = 9999;
const BEYOND: [number, number, number, number][] = [
  [140, -FAR, FAR, FAR], [46, -FAR, 140, -250], [-FAR, 260, -25, FAR], [-5, 260, 140, FAR], [-FAR, 44, -120, 260],
];
const BEYOND_LAND = '#D4BD92';
const isFit = (v: MapBox | FitSpec): v is FitSpec => 'fit' in v;

const DOT_FILL: Record<DotState, string> = {
  lit: C.dotLit, ctx: C.dotLit, dim: C.dot, anc: C.dotLit, choice: C.surface, right: C.ok, wrong: C.bad, target: C.target, mystery: C.surface,
};

export function MapView(p: Props) {
  const [box, setBox] = useState({ w: 0, h: 0 });
  const onLayout = (e: LayoutChangeEvent) => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height });
  const W = box.w || 320, H = box.h || 320, aspect = W / H;
  const base = isFit(p.view) ? fitView(p.view.fit, p.view.pad ?? 0.6, p.view.minW ?? 30, aspect) : fitAspect(p.view, aspect);

  // A zoom belongs to the view it started from; a new question resets it.
  const key = JSON.stringify(p.view);
  const [zoom, setZoom] = useState<{ key: string; v: MapBox } | null>(null);
  const zoomed = !!zoom && zoom.key === key;
  const v = zoomed ? fitAspect(zoom.v, aspect) : base;
  const k = v.w / W, r = (p.dotPx || 6) * k, fs = 13 * k;
  const canZoom = p.zoom !== false;

  // While a finger is down the drawing just moves (no re-render); on release it redraws sharp at the new view.
  const sc = useSharedValue(1), tx = useSharedValue(0), ty = useSharedValue(0);
  const ax = useSharedValue(0), ay = useSharedValue(0), s0 = useSharedValue(1), live = useSharedValue(0);
  const moved = useAnimatedStyle(() => ({
    transform: [
      { translateX: (ax.value - W / 2) * (1 - sc.value) + tx.value },
      { translateY: (ay.value - H / 2) * (1 - sc.value) + ty.value },
      { scale: sc.value },
    ],
  }));
  useLayoutEffect(() => {
    sc.value = 1; tx.value = 0; ty.value = 0;
  }, [zoom, sc, tx, ty]);

  const goTo = (nv: MapBox) => setZoom({ key, v: clampView(nv, OVERVIEW, MIN_W, Math.max(base.w, MAX_W)) });
  const commit = (s: number, a: Point, t: Point) => {
    if (Math.abs(s - 1) < 0.01 && Math.hypot(t.x, t.y) < 1) {
      sc.value = 1; tx.value = 0; ty.value = 0;
      return;
    }
    // Screen point q shows what used to be at (q - a - t) / s + a.
    const x0 = (-a.x - t.x) / s + a.x, y0 = (-a.y - t.y) / s + a.y;
    goTo({ x: v.x + (x0 / W) * v.w, y: v.y + (y0 / H) * v.h, w: v.w / s, h: v.h / s });
  };
  const toKm = (x: number, y: number): Point => ({ x: v.x + (x / W) * v.w, y: v.y + (y / H) * v.h });
  const tap = (x: number, y: number) => {
    const g = toKm(x, y);
    if (p.onPressDot) {
      const hit = (p.dots || [])
        .filter((d) => d.state === 'choice')
        .map((d) => ({ d, km: Math.hypot(d.x - g.x, d.y - g.y) }))
        .filter((o) => o.km <= Math.max(r * (o.d.size || 1) * 2.4, 24 * k))
        .sort((a, b) => a.km - b.km)[0];
      if (hit) return p.onPressDot(hit.d.id);
    }
    p.onPressMap?.(g);
  };

  const end = () => {
    'worklet';
    live.value -= 1;
    if (live.value === 0) runOnJS(commit)(sc.value, { x: ax.value, y: ay.value }, { x: tx.value, y: ty.value });
  };
  const pinch = Gesture.Pinch()
    .enabled(canZoom)
    .onStart((e) => {
      live.value += 1;
      if (sc.value === 1) { ax.value = e.focalX - tx.value; ay.value = e.focalY - ty.value; }
      s0.value = sc.value;
    })
    .onUpdate((e) => { sc.value = Math.min(Math.max(s0.value * e.scale, 0.2), 12); })
    .onEnd(end);
  // One finger pans only once zoomed in, so at the start view it still scrolls the page.
  const pan = Gesture.Pan()
    .enabled(canZoom && zoomed)
    .minDistance(6)
    .averageTouches(true)
    .onStart(() => { live.value += 1; })
    .onUpdate((e) => { tx.value = e.translationX; ty.value = e.translationY; })
    .onEnd(end);
  const tapG = Gesture.Tap()
    .enabled(!!(p.onPressMap || p.onPressDot))
    .maxDistance(8)
    .onEnd((e, ok) => { if (ok) runOnJS(tap)(e.x, e.y); });
  const gesture = Gesture.Race(tapG, Gesture.Simultaneous(pinch, pan));

  // Draw a margin around the view so panning and zooming out don't show blank edges mid-gesture.
  const M = canZoom ? 0.5 : 0;
  const sv = { x: v.x - v.w * M, y: v.y - v.h * M, w: v.w * (1 + 2 * M), h: v.h * (1 + 2 * M) };
  const sharp = (W * PixelRatio.get()) / v.w > OVERVIEW_PX_PER_KM * 1.3;
  const tiles = sharp ? TILES.filter((t) => t.x < sv.x + sv.w && t.x + t.w > sv.x && t.y < sv.y + sv.h && t.y + t.h > sv.y) : [];

  // Keep map labels clear of the game's dots, pins and place names (names run leftwards from their dot).
  const avoid: Point[] = [...(p.pins || []), ...(p.cross || [])];
  for (const d of p.dots || []) {
    avoid.push(d);
    if (d.label) for (let i = 1; i * 12 < d.label.length * 7.5; i++) avoid.push({ x: d.x - (8 + i * 12) * k, y: d.y });
  }

  // Screen corners covered by the zoom buttons, the mini map and the tag, in km.
  const px = (x: number, y: number, w: number, h: number): MapBox => ({ x: v.x + x * k, y: v.y + y * k, w: w * k, h: h * k });
  const reserved = [
    ...(canZoom ? [px(0, 0, 50, zoomed ? 122 : 84)] : []),
    ...(p.mini ? [px(W - 54, 0, 54, 106)] : []),
    ...(p.tag ? [px(0, H - 40, 12 + p.tag.length * 8, 40)] : []),
    ...(!p.noScale ? [px(0, H - 34, 90, 34)] : []),
  ];

  const svg = (
    <Svg width={W * (1 + 2 * M)} height={H * (1 + 2 * M)} viewBox={`${sv.x} ${sv.y} ${sv.w} ${sv.h}`} accessibilityLabel={p.label || 'מפה'}>
      <Rect x={sv.x} y={sv.y} width={sv.w} height={sv.h} fill={C.sea} />
      {BEYOND.map(([x0, y0, x1, y1], i) => <Rect key={'by' + i} x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill={BEYOND_LAND} />)}
      <SvgImage href={OVERVIEW.src} x={OVERVIEW.x} y={OVERVIEW.y} width={OVERVIEW.w} height={OVERVIEW.h} preserveAspectRatio="none" />
      {tiles.map((t) => (
        <SvgImage key={`${t.x},${t.y}`} href={t.src} x={t.x} y={t.y} width={t.w} height={t.h} preserveAspectRatio="none" />
      ))}
      {p.reveal && (
        <>
          <Defs>
            <RadialGradient id="rvg">
              <Stop offset="0" stopColor="#fff" />
              <Stop offset="0.5" stopColor="#fff" />
              <Stop offset="1" stopColor="#fff" stopOpacity="0" />
            </RadialGradient>
            <RadialGradient id="rvk">
              <Stop offset="0" stopColor="#000" />
              <Stop offset="0.5" stopColor="#000" />
              <Stop offset="1" stopColor="#000" stopOpacity="0" />
            </RadialGradient>
            <Mask id="rv" maskUnits="userSpaceOnUse" x={sv.x} y={sv.y} width={sv.w} height={sv.h}>
              <Rect x={sv.x} y={sv.y} width={sv.w} height={sv.h} fill="#000" />
              {p.reveal.map((q, i) => <Circle key={i} cx={q.x} cy={q.y} r={(7 + 9 * q.s) * (p.revealR || 1)} fill="url(#rvg)" />)}
            </Mask>
            <Mask id="rvx" maskUnits="userSpaceOnUse" x={sv.x} y={sv.y} width={sv.w} height={sv.h}>
              <Rect x={sv.x} y={sv.y} width={sv.w} height={sv.h} fill="#fff" />
              {p.reveal.map((q, i) => <Circle key={i} cx={q.x} cy={q.y} r={(7 + 9 * q.s) * (p.revealR || 1)} fill="url(#rvk)" />)}
            </Mask>
          </Defs>
          {/* Wiped land keeps a faint relief; what the player knows comes back in colour. */}
          <G mask="url(#rvx)">{G_.home.map((d, i) => <Path key={'w' + i} d={d} fill={C.wiped} opacity={0.82} />)}</G>
          <G mask="url(#rv)">{G_.home.map((d, i) => <Path key={'l' + i} d={d} fill={C.litLand} opacity={0.38} />)}</G>
        </>
      )}
      {G_.lakes.map((d, i) => <Path key={'lk' + i} d={d} fill={C.sea} stroke={C.ink} strokeWidth={0.8 * k} strokeOpacity={0.6} />)}
      {G_.home.map((d, i) => <Path key={'hs' + i} d={d} fill="none" stroke={C.ink} strokeWidth={2 * k} strokeLinejoin="round" />)}
      <MapOverlayBase v={sv} k={k} />
      <MapLabels v={v} k={k} avoid={avoid} reserved={reserved} />
      {(p.lines || []).map(([a, b, cls], i) => (
        <Line key={'ln' + i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={cls === 'aline' ? C.accent : C.pin} strokeWidth={2 * k}
          strokeDasharray={cls === 'aline' ? [3 * k, 4 * k] : [4 * k, 3 * k]} opacity={cls === 'aline' ? 0.7 : 1} />
      ))}
      {(p.rings || []).map((g, i) => <Circle key={'rg' + i} cx={g.x} cy={g.y} r={g.r} fill="none" stroke={C.target} strokeWidth={2 * k} opacity={0.5} />)}
      {(p.dots || []).map((d) => {
        const rr = r * (d.size || 1), choice = d.state === 'choice', ring = choice || d.state === 'mystery';
        return (
          <G key={d.id + d.state}>
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
    </Svg>
  );

  return (
    <GestureDetector gesture={gesture}>
      <View style={[styles.box, p.style]} onLayout={onLayout} collapsable={false}
        accessibilityRole={p.onPressMap || p.onPressDot ? 'button' : 'image'} accessibilityLabel={p.label}>
        {box.w > 0 && (
          <Animated.View style={[{ position: 'absolute', left: -W * M, top: -H * M }, moved]}>{svg}</Animated.View>
        )}
        {box.w > 0 && !p.noScale && (
          <Svg width={W} height={H} viewBox={`${v.x} ${v.y} ${v.w} ${v.h}`} style={StyleSheet.absoluteFill} pointerEvents="none">
            <ScaleBar v={v} k={k} />
          </Svg>
        )}
        {p.mini && box.w > 0 && <MiniMap v={v} />}
      {!!p.tag && (
        <View style={styles.tag} pointerEvents="none">
          <Text style={styles.tagText}>{p.tag}</Text>
        </View>
      )}
        {canZoom && box.w > 0 && (
          <View style={styles.zoom}>
            <ZoomBtn label="+" a11y="התקרבות" onPress={() => goTo(zoomAt(v, 1.8))} />
            <ZoomBtn label="−" a11y="התרחקות" onPress={() => goTo(zoomAt(v, 1 / 1.8))} />
            {zoomed && <ZoomBtn label="⟲" a11y="חזרה לתצוגה הרגילה" onPress={() => setZoom(null)} />}
          </View>
        )}
        {p.children}
      </View>
    </GestureDetector>
  );
}

function ZoomBtn({ label, a11y, onPress }: { label: string; a11y: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={a11y} hitSlop={6}
      style={({ pressed }) => [styles.zoomBtn, pressed && { backgroundColor: C.wiped }]}>
      <Text style={styles.zoomText}>{label}</Text>
    </Pressable>
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
        {G_.homeLow.map((d, i) => <Path key={i} d={d} fill={C.land} stroke={C.ink} strokeWidth={4} />)}
        <Rect x={v.x} y={v.y} width={v.w} height={v.h} fill="none" stroke={C.target} strokeWidth={8} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { overflow: 'hidden', backgroundColor: C.sea, borderWidth: BW, borderColor: C.ink, borderRadius: 8, direction: 'ltr', ...SHADOW },
  tag: { position: 'absolute', bottom: 8, left: 8, backgroundColor: C.surface, borderWidth: 2, borderColor: C.ink, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  tagText: { fontFamily: F.black, fontSize: 12, color: C.ink, writingDirection: 'rtl' },
  zoom: { position: 'absolute', top: 8, left: 8, gap: 6 },
  zoomBtn: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: C.ink, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' },
  zoomText: { fontFamily: F.black, fontSize: 18, lineHeight: 22, color: C.ink },
  mini: { position: 'absolute', top: 8, right: 8, borderWidth: 2, borderColor: C.ink, borderRadius: 4, overflow: 'hidden', backgroundColor: C.surface },
});
