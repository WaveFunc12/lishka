import * as Haptics from 'expo-haptics';
import { useEffect, useState, type ReactElement } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withSpring, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Rect } from 'react-native-svg';
import { sfx } from '../sound';
import { BW, C, F } from '../theme';

/* A motion comic, one panel at a time: each picture fills the screen and slowly pushes in (a Ken Burns move),
   the captions and balloons pop in one after another, and a tap turns to the next panel.
   The art is drawn in a 400 x 700 box and cropped to the screen; keep what matters inside the middle 340 x 600.
   Balloons sit over the art at fractions of the panel (left to right, top to bottom) and do not zoom, so they stay sharp. */

export const ART_W = 400;
export const ART_H = 700;

export type Bubble = {
  /** cap: a yellow caption box. say: a speech balloon. shout: a jagged one. you: the player speaking from outside the panel. */
  kind: 'cap' | 'say' | 'shout' | 'you';
  text: string;
  /** Left, top and width as fractions of the panel. */
  x: number;
  y: number;
  w: number;
  /** Where the balloon's tail leaves (a fraction of its width) and whether it points down or up, leaning left or right. */
  tail?: { at: number; up?: boolean; lean?: number };
  /** Set a caption large, in the display face, for a quotation. */
  big?: boolean;
};

export type Panel = {
  art: ReactElement;
  bubbles: Bubble[];
  /** The point the camera pushes in toward, as fractions of the art. */
  focus: [number, number];
  /** 'out' starts close and pulls back, for a reveal. */
  zoom?: 'in' | 'out';
  /** How far the move goes (1.1 = 10% closer). */
  amount?: number;
};

const MOVE_MS = 7000;
const POP_GAP_MS = 650;

function Tail({ up, lean = 0, color }: { up?: boolean; lean?: number; color: string }) {
  const tip = 13 + lean * 12;
  return (
    <Svg width={30} height={26} style={{ transform: [{ scaleY: up ? -1 : 1 }] }}>
      <Path d={`M4 0 L${tip} 24 L24 0`} fill={color} stroke={C.ink} strokeWidth={BW} strokeLinejoin="round" />
      <Rect x={5.5} y={-4} width={17} height={5.6} fill={color} />
    </Svg>
  );
}

function Balloon({ b, i, panelW, panelH, still }: { b: Bubble; i: number; panelW: number; panelH: number; still: boolean }) {
  const pop = useSharedValue(still ? 1 : 0);
  useEffect(() => {
    if (!still) pop.value = withDelay(350 + i * POP_GAP_MS, withSpring(1, { damping: 11, stiffness: 160 }));
  }, [pop, i, still]);
  const anim = useAnimatedStyle(() => ({ opacity: Math.min(1, pop.value * 1.6), transform: [{ scale: 0.6 + 0.4 * pop.value }] }));
  const color = b.kind === 'cap' ? '#F7C873' : b.kind === 'you' ? '#DDEFF0' : '#FFFFFF';
  const fs = b.big ? 22 : b.kind === 'shout' ? 26 : b.kind === 'cap' ? 16 : 18;
  return (
    <Animated.View style={[{ position: 'absolute', left: b.x * panelW, top: b.y * panelH, width: b.w * panelW }, anim]}>
      <View style={[styles.bubble, b.kind === 'cap' ? styles.cap : b.kind === 'shout' ? styles.shout : styles.say, { backgroundColor: color }]}>
        <Text maxFontSizeMultiplier={1.2} style={[styles.text, { fontSize: fs, lineHeight: fs * 1.32, fontFamily: b.kind === 'shout' || b.big ? F.display : b.kind === 'cap' ? F.bold : F.body }]}>
          {b.text}
        </Text>
      </View>
      {b.tail && (
        <View style={{ position: 'absolute', left: b.tail.at * b.w * panelW - 15, ...(b.tail.up ? { top: -23 } : { bottom: -23 }) }}>
          <Tail up={b.tail.up} lean={b.tail.lean} color={color} />
        </View>
      )}
    </Animated.View>
  );
}

function PanelView({ p, w, h, still }: { p: Panel; w: number; h: number; still: boolean }) {
  // The art is scaled to cover the panel, like an image with "cover".
  const cover = Math.max(w / ART_W, h / ART_H);
  const move = useSharedValue(0), enter = useSharedValue(still ? 1 : 0);
  useEffect(() => {
    if (still) return;
    enter.value = withTiming(1, { duration: 380, easing: Easing.out(Easing.cubic) });
    move.value = withTiming(1, { duration: MOVE_MS, easing: Easing.out(Easing.quad) });
  }, [enter, move, still]);
  const amount = (p.amount ?? 1.12) - 1, out = p.zoom === 'out';
  const [fx, fy] = p.focus;
  const artStyle = useAnimatedStyle(() => {
    const t = out ? 1 - move.value : move.value;
    const s = 1 + amount * t;
    // Push toward the focus point: it moves to the panel's centre as the picture grows.
    return { transform: [{ translateX: (0.5 - fx) * w * (s - 1) }, { translateY: (0.5 - fy) * h * (s - 1) }, { scale: s }] };
  });
  const enterStyle = useAnimatedStyle(() => ({ opacity: enter.value, transform: [{ scale: 1.04 - 0.04 * enter.value }] }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, enterStyle]}>
      <Animated.View style={[StyleSheet.absoluteFill, artStyle]}>
        <View style={{ position: 'absolute', left: (w - ART_W * cover) / 2, top: (h - ART_H * cover) / 2, width: ART_W * cover, height: ART_H * cover }}>
          <Svg width="100%" height="100%" viewBox={`0 0 ${ART_W} ${ART_H}`}>{p.art}</Svg>
        </View>
      </Animated.View>
      {p.bubbles.map((b, i) => <Balloon key={i} b={b} i={i} panelW={w} panelH={h} still={still} />)}
    </Animated.View>
  );
}

/** Plays the panels full screen. The last panel shows `doneLabel` as a button. */
export function ComicPlayer({ panels, doneLabel, onDone, onSkip, mute, title }: {
  panels: Panel[]; doneLabel: string; onDone: () => void; onSkip: () => void; mute: boolean;
  /** A short name over the progress bars, such as the city the story is about. */
  title?: string;
}) {
  const [i, setI] = useState(0);
  const still = !!useReducedMotion();
  const win = useWindowDimensions();
  const [size, setSize] = useState({ w: win.width - 24, h: win.height - 140 });
  const last = i === panels.length - 1;
  const go = (d: number) => {
    const n = i + d;
    if (n < 0 || n >= panels.length) return;
    if (!mute) {
      Haptics.selectionAsync().catch(() => {});
      sfx('flip');
    }
    setI(n);
  };
  const p = panels[i];
  const label = p.bubbles.map((b) => b.text).join(' ');
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {!!title && <Text style={styles.title}>{title}</Text>}
      <View style={styles.top}>
        <View style={styles.bars}>
          {panels.map((_, n) => <View key={n} style={[styles.bar, n <= i && { backgroundColor: C.orange }]} />)}
        </View>
        <Pressable onPress={onSkip} hitSlop={12} accessibilityRole="button">
          <Text style={styles.skip}>דילוג</Text>
        </Pressable>
      </View>
      <View style={styles.frame} onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
        {/* A new key per panel restarts its camera move and balloons. */}
        <PanelView key={i} p={p} w={size.w} h={size.h} still={still} />
        {/* Tap the right edge to go back (Hebrew reads right to left), anywhere else to go on. */}
        <View style={[StyleSheet.absoluteFill, { flexDirection: 'row' }]}>
          <Pressable style={{ flex: 3 }} onPress={() => go(1)} accessibilityRole="button" accessibilityLabel={`${label}. הבא`} />
          <Pressable style={{ flex: 1 }} onPress={() => (i ? go(-1) : go(1))} accessibilityRole="button" accessibilityLabel="הקודם" />
        </View>
      </View>
      <View style={styles.foot}>
        {last ? (
          <Pressable onPress={onDone} style={styles.cta} accessibilityRole="button">
            <Text style={styles.ctaText}>{doneLabel}</Text>
          </Pressable>
        ) : (
          <View style={styles.next}>
            <Text style={styles.hint}>{i === 0 ? 'נגיעה בתמונה להמשך' : `${i + 1} / ${panels.length}`}</Text>
            {/* A visible way on, for anyone who swipes or doesn't notice the hint. */}
            <Pressable onPress={() => go(1)} style={styles.nextBtn} accessibilityRole="button" accessibilityLabel="לתמונה הבאה" hitSlop={8}>
              <Text style={styles.nextText}>הבא ←</Text>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#14203A' },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingTop: 8, paddingBottom: 8 },
  bars: { flex: 1, flexDirection: 'row', gap: 4 },
  bar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,246,226,0.25)' },
  title: { color: C.surface, fontFamily: F.display, fontSize: 18, textAlign: 'center', paddingTop: 6 },
  skip: { color: C.surface, fontFamily: F.bold, fontSize: 15, opacity: 0.85 },
  frame: { flex: 1, marginHorizontal: 12, borderWidth: BW, borderColor: C.ink, borderRadius: 10, overflow: 'hidden', backgroundColor: C.bg, direction: 'ltr' },
  foot: { height: 72, justifyContent: 'center', paddingHorizontal: 12 },
  hint: { color: C.surface, opacity: 0.7, textAlign: 'center', fontFamily: F.body, fontSize: 14 },
  next: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', direction: 'rtl' },
  nextBtn: { borderWidth: 2, borderColor: C.surface, borderRadius: 12, paddingHorizontal: 18, paddingVertical: 8 },
  nextText: { color: C.surface, fontFamily: F.bold, fontSize: 16 },
  cta: { backgroundColor: C.orange, borderWidth: BW, borderColor: C.ink, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  ctaText: { fontFamily: F.black, fontSize: 20, color: C.ink },
  bubble: { borderWidth: BW, borderColor: C.ink, paddingHorizontal: 12, paddingVertical: 8 },
  say: { borderRadius: 26, paddingHorizontal: 16, paddingVertical: 10 },
  shout: { borderRadius: 8, borderWidth: 4, transform: [{ rotate: '-3deg' }] },
  cap: { borderRadius: 3, shadowColor: C.ink, shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0, elevation: 3 },
  text: { color: C.ink, writingDirection: 'rtl', textAlign: 'center' },
});
