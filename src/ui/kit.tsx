import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { BW, C, F, SHADOW, SHADOW_SM } from './theme';

/* Small shared pieces. Every screen sits in an RTL root; maps opt back into LTR. */

export function Screen({ children, scroll = true, style }: { children: ReactNode; scroll?: boolean; style?: StyleProp<ViewStyle> }) {
  const body = <View style={[styles.screen, style]}>{children}</View>;
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {scroll ? <ScrollView contentContainerStyle={{ flexGrow: 1 }}>{body}</ScrollView> : body}
    </SafeAreaView>
  );
}

export const T_ = ({ style, children, ...rest }: { style?: StyleProp<TextStyle>; children: ReactNode; accessibilityRole?: 'header' }) => (
  <Text maxFontSizeMultiplier={1.3} style={[styles.text, style]} {...rest}>{children}</Text>
);

export const Kicker = ({ children }: { children: ReactNode }) => <T_ style={styles.kicker}>{children}</T_>;
export const H1 = ({ children, size = 32 }: { children: ReactNode; size?: number }) => (
  <T_ style={[styles.h1, { fontSize: size, lineHeight: size * 1.2 }]} accessibilityRole="header">{children}</T_>
);

type BtnProps = { label: string; onPress: () => void; alt?: boolean; big?: boolean; disabled?: boolean; style?: StyleProp<ViewStyle>; right?: ReactNode; tone?: 'right' | 'wrong' };
export function Btn({ label, onPress, alt, big, disabled, style, right, tone }: BtnProps) {
  const bg = tone === 'right' ? C.ok : tone === 'wrong' ? C.bad : alt ? C.surface : C.accent;
  const fg = tone || !alt ? C.accentInk : C.ink;
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={label}
      style={({ pressed }) => [styles.btn, big && styles.big, { backgroundColor: bg, opacity: disabled && !tone ? 0.55 : 1 }, pressed && styles.pressed, style]}>
      <Text maxFontSizeMultiplier={1.3} style={[styles.btnText, big && { fontSize: 20 }, { color: fg }]}>{label}</Text>
      {right}
    </Pressable>
  );
}

export function LinkBtn({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="link" hitSlop={10}>
      <Text maxFontSizeMultiplier={1.3} style={styles.link}>{label}</Text>
    </Pressable>
  );
}

export const Card = ({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) => <View style={[styles.card, style]}>{children}</View>;

/** Zvi: grey hair, round glasses, mustache. */
export function Mentor({ size = 52 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 60 60" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Circle cx={30} cy={30} r={29} fill={C.sea} stroke={C.ink} strokeWidth={2} />
      <Path d="M10 58 Q30 42 50 58Z" fill={C.accent} stroke={C.ink} strokeWidth={1.5} />
      <Circle cx={30} cy={29} r={14} fill="#F2C49C" stroke={C.ink} strokeWidth={1.5} />
      <Path d="M16 26 Q17 12 30 12 Q43 12 44 26 Q40 18 30 18 Q20 18 16 26Z" fill="#9AA0A8" stroke={C.ink} strokeWidth={1.5} />
      <Circle cx={24.5} cy={29} r={4.4} fill="#fff" stroke="#1d2633" strokeWidth={1.6} />
      <Circle cx={35.5} cy={29} r={4.4} fill="#fff" stroke="#1d2633" strokeWidth={1.6} />
      <Circle cx={25} cy={30} r={1.4} fill="#1d2633" />
      <Circle cx={36} cy={30} r={1.4} fill="#1d2633" />
      <Path d="M23 37 Q30 33.5 37 37 Q30 40.5 23 37Z" fill="#9AA0A8" stroke={C.ink} strokeWidth={1} />
    </Svg>
  );
}

export function ZviSays({ text, size = 52, children }: { text?: string; size?: number; children?: ReactNode }) {
  return (
    <View style={styles.zvi}>
      <Mentor size={size} />
      <View style={styles.bubble}>
        {!!text && <T_ style={styles.bubbleText}>{text}</T_>}
        {children}
      </View>
    </View>
  );
}

export function Meter({ pct, color = C.orange }: { pct: number; color?: string }) {
  return (
    <View style={styles.meter} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(pct) }}>
      <View style={{ width: `${Math.max(0, Math.min(100, pct))}%`, height: '100%', backgroundColor: color }} />
    </View>
  );
}

/** The orange "approved" stamp with the XP earned. */
export function OkStamp({ xp, size = 72 }: { xp: number; size?: number }) {
  return (
    <View style={{ width: size, height: size, transform: [{ rotate: '-12deg' }] }} accessibilityLabel={`מאושר, ${xp} ותק`}>
      <Svg width={size} height={size} viewBox="0 0 80 80">
        <Circle cx={40} cy={40} r={35} fill={C.orange} stroke={C.ink} strokeWidth={3} />
        <Circle cx={40} cy={40} r={27} fill="none" stroke={C.ink} strokeWidth={1.5} strokeDasharray={[3, 3]} />
      </Svg>
      <View style={StyleSheet.absoluteFill}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text maxFontSizeMultiplier={1} style={{ fontFamily: F.stamp, fontSize: size * 0.33, color: C.ink, lineHeight: size * 0.36 }}>מאושר</Text>
          <Text maxFontSizeMultiplier={1} style={{ fontFamily: F.black, fontSize: size * 0.13, color: C.ink }}>+{xp} ותק</Text>
        </View>
      </View>
    </View>
  );
}

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg, direction: 'rtl' },
  screen: { flex: 1, padding: 16, gap: 16, direction: 'rtl' },
  text: { fontFamily: F.body, fontSize: 17, color: C.ink, textAlign: 'right', writingDirection: 'rtl' },
  kicker: { fontFamily: F.black, fontSize: 13, color: C.kicker, letterSpacing: 0.5 },
  h1: { fontFamily: F.display, color: C.ink },
  btn: { minHeight: 52, borderWidth: BW, borderColor: C.ink, borderRadius: 14, paddingHorizontal: 18, paddingVertical: 10, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 12, ...SHADOW_SM },
  big: { minHeight: 62 },
  pressed: { transform: [{ translateX: 2 }, { translateY: 2 }], shadowOffset: { width: 1, height: 1 } },
  btnText: { fontFamily: F.black, fontSize: 18, textAlign: 'center' },
  link: { fontFamily: F.black, fontSize: 16, color: C.accent, textDecorationLine: 'underline' },
  card: { backgroundColor: C.surface, borderWidth: BW, borderColor: C.ink, borderRadius: 16, padding: 14, ...SHADOW },
  zvi: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  bubble: { flex: 1, backgroundColor: C.surface, borderWidth: 2, borderColor: C.ink, borderRadius: 16, borderTopRightRadius: 4, padding: 12 },
  bubbleText: { fontSize: 16, lineHeight: 23 },
  meter: { height: 12, borderRadius: 6, borderWidth: 2, borderColor: C.ink, backgroundColor: C.track, overflow: 'hidden' },
});
