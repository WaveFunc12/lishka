import { Circle, Ellipse, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import { F } from '../theme';
import { K } from './parts';

/* Small props for the region stories: flags, a hanukkiah, a plane, a jeep, a stone lion, fires, ruins and signs. */

const INK = { stroke: K.ink, strokeWidth: 4, strokeLinejoin: 'round' as const };

/** A flag on a pole. `star` draws a Star of David between two stripes; `ink` makes it look hand-drawn. */
export function Flag({ x, y, h = 160, w = 90, star = true, rot = 0, text }: { x: number; y: number; h?: number; w?: number; star?: boolean; rot?: number; text?: string }) {
  const cx = x + w / 2, cy = y - h + w * 0.33;
  return (
    <G transform={`rotate(${rot} ${x} ${y})`}>
      <Line x1={x} y1={y} x2={x} y2={y - h - 10} stroke={K.ink} strokeWidth={6} />
      <Path d={`M${x} ${y - h} Q${x + w / 2} ${y - h - 10} ${x + w} ${y - h} L${x + w} ${y - h + w * 0.66} Q${x + w / 2} ${y - h + w * 0.56} ${x} ${y - h + w * 0.66}Z`} fill="#FFFFFF" {...INK} strokeWidth={3} />
      <Path d={`M${x} ${y - h + 8} Q${x + w / 2} ${y - h - 2} ${x + w} ${y - h + 8}`} stroke="#2F5FB3" strokeWidth={6} fill="none" />
      <Path d={`M${x} ${y - h + w * 0.58} Q${x + w / 2} ${y - h + w * 0.48} ${x + w} ${y - h + w * 0.58}`} stroke="#2F5FB3" strokeWidth={6} fill="none" />
      {star && <Path d={`M${cx} ${cy - 12} L${cx + 10} ${cy + 6} L${cx - 10} ${cy + 6}Z M${cx} ${cy + 12} L${cx + 10} ${cy - 6} L${cx - 10} ${cy - 6}Z`} fill="none" stroke="#2F5FB3" strokeWidth={2.5} />}
      {text && <SvgText x={cx} y={cy + 30} fontSize={11} fontFamily={F.black} textAnchor="middle" fill="#C9962A">{text}</SvgText>}
    </G>
  );
}

/** A hanukkiah with its candles lit (n of eight, plus the shamash). */
export function Hanukkiah({ x, y, s = 1, n = 8 }: { x: number; y: number; s?: number; n?: number }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Path d="M-60 -20 Q0 30 60 -20 M0 -20 L0 30 M-24 40 L24 40" stroke="#C9962A" strokeWidth={6} fill="none" strokeLinecap="round" />
      <Line x1={-64} y1={-20} x2={64} y2={-20} stroke="#C9962A" strokeWidth={6} strokeLinecap="round" />
      {Array.from({ length: 9 }, (_, i) => {
        const cx = -64 + i * 16, top = i === 4 ? -48 : -38, lit = i === 4 || (i < 4 ? i < n : i - 1 < n);
        return (
          <G key={i}>
            <Rect x={cx - 3} y={top} width={6} height={-20 - top} fill="#FFFFFF" stroke={K.ink} strokeWidth={1.5} />
            {lit && <Path d={`M${cx} ${top - 12} Q${cx + 5} ${top - 4} ${cx} ${top} Q${cx - 5} ${top - 4} ${cx} ${top - 12}Z`} fill={K.orange} stroke={K.ink} strokeWidth={1.5} />}
          </G>
        );
      })}
    </G>
  );
}

/** A propeller airliner of the late 1940s, nose to the left. */
export function Plane({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Path d="M-140 0 Q-150 -20 -120 -24 L120 -24 L150 -60 L166 -60 L156 -14 Q150 6 120 8 L-120 8 Q-140 8 -140 0Z" fill="#E4E8EC" {...INK} />
      <Path d="M-20 -6 L40 50 L64 50 L40 -6Z" fill="#C4CCD4" {...INK} strokeWidth={3} />
      {[-90, -60, -30, 0, 30, 60, 90].map((d) => <Circle key={d} cx={d} cy={-10} r={5} fill={K.glass} stroke={K.ink} strokeWidth={2} />)}
      <Path d="M-140 -2 L120 -2" stroke={K.navyLight} strokeWidth={4} />
      <Ellipse cx={28} cy={20} rx={14} ry={7} fill="#9AA3AD" stroke={K.ink} strokeWidth={2.5} />
      <Line x1={14} y1={8} x2={14} y2={34} stroke={K.ink} strokeWidth={3} />
    </G>
  );
}

/** An open army jeep, facing left. */
export function Jeep({ x, y, s = 1, rot = 0 }: { x: number; y: number; s?: number; rot?: number }) {
  return (
    <G transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <Path d="M-80 -20 L-70 -46 L60 -46 L80 -20 L80 0 L-80 0Z" fill="#6E7F3B" {...INK} />
      <Path d="M-40 -46 L-30 -76 L-24 -76 L-30 -46Z" fill={K.glass} stroke={K.ink} strokeWidth={3} />
      {[-50, 50].map((cx) => <G key={cx}><Circle cx={cx} cy={4} r={20} fill={K.ink} /><Circle cx={cx} cy={4} r={8} fill="#9AA3AD" /></G>)}
      <Rect x={60} y={-40} width={22} height={26} fill="#5A6A30" stroke={K.ink} strokeWidth={3} />
    </G>
  );
}

/** The roaring stone lion (as at Tel Hai): a lion on a plinth, all in grey stone. */
export function StoneLion({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Rect x={-110} y={-40} width={220} height={40} fill="#A8A29A" {...INK} />
      <Path d="M-90 -40 L-90 -110 Q-60 -150 0 -140 L60 -130 Q90 -120 96 -90 L96 -40Z" fill="#B9B3AA" {...INK} />
      {/* The mane, the face, and the jaws open in a roar, up and to the left. */}
      {Array.from({ length: 11 }, (_, i) => {
        const t = (i / 11) * Math.PI * 2;
        return <Circle key={i} cx={-40 + Math.cos(t) * 40} cy={-150 + Math.sin(t) * 40} r={18} fill="#8C867E" {...INK} strokeWidth={3} />;
      })}
      <Circle cx={-40} cy={-150} r={40} fill="#8C867E" />
      <Path d="M-60 -176 L-112 -200 Q-122 -196 -118 -186 L-84 -164Z" fill="#C4BEB5" {...INK} strokeWidth={3} />
      <Path d="M-64 -136 L-112 -142 Q-118 -134 -110 -128 L-66 -122Z" fill="#C4BEB5" {...INK} strokeWidth={3} />
      <Path d="M-84 -164 L-118 -186 L-110 -142 L-66 -136Z" fill="#4A4540" />
      <Path d="M-112 -186 L-108 -176 M-106 -140 L-102 -146" stroke="#FFFFFF" strokeWidth={3} />
      <Circle cx={-116} cy={-196} r={5} fill={K.ink} />
      <Circle cx={-44} cy={-150} r={30} fill="#C4BEB5" {...INK} strokeWidth={3} />
      <Circle cx={-56} cy={-162} r={4.5} fill={K.ink} />
      <Path d="M-68 -172 L-46 -176" stroke={K.ink} strokeWidth={3} strokeLinecap="round" />
      <Rect x={-90} y={-40} width={30} height={40} fill="url(#dots)" />
    </G>
  );
}

/** A bonfire or beacon with flames. */
export function Fire({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Circle cx={0} cy={-30} r={60} fill={K.lit} opacity={0.35} />
      <Path d="M-30 0 Q-40 -40 -12 -70 Q-10 -40 0 -36 Q4 -80 24 -96 Q20 -50 34 -30 Q40 -10 30 0Z" fill={K.orange} {...INK} strokeWidth={3} />
      <Path d="M-14 0 Q-16 -24 0 -40 Q4 -20 14 -14 Q18 -4 14 0Z" fill={K.yellow} stroke={K.ink} strokeWidth={2} />
      <Path d="M-40 6 L40 -6 M-40 -6 L40 6" stroke={K.woodDark} strokeWidth={8} strokeLinecap="round" />
    </G>
  );
}

/** Ruined columns and a lintel of dark basalt (the Golan's old synagogues). */
export function Ruin({ x, y, s = 1, fill = '#5E5A56' }: { x: number; y: number; s?: number; fill?: string }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Rect x={-100} y={-12} width={200} height={12} fill={fill} {...INK} />
      {[[-80, 150], [-30, 110], [20, 160], [70, 70]].map(([cx, h], i) => (
        <G key={i}>
          <Rect x={cx - 12} y={-12 - h} width={24} height={h} fill={fill} {...INK} />
          <Rect x={cx - 16} y={-20 - h} width={32} height={10} fill={fill} {...INK} strokeWidth={3} />
        </G>
      ))}
      <Rect x={-96} y={-196} width={130} height={22} fill={fill} {...INK} transform="rotate(-3 -30 -186)" />
      <Path d="M-60 -186 L-56 -178 M-36 -186 L-32 -178 M-12 -188 L-8 -180" stroke="#8C8680" strokeWidth={2} />
    </G>
  );
}

/** A two-wheeled chariot with its horse, as a silhouette, facing right. */
export function Chariot({ x, y, s = 1, fill = '#3A2A1E' }: { x: number; y: number; s?: number; fill?: string }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`} fill={fill} stroke={fill}>
      <Ellipse cx={40} cy={-40} rx={36} ry={16} />
      <Path d="M70 -48 L92 -84 L104 -80 L88 -44Z" />
      <Path d="M96 -88 L112 -76 L104 -70Z" />
      <G strokeWidth={6} strokeLinecap="round" fill="none">
        <Path d="M16 -30 L4 0 M28 -28 L30 0 M56 -30 L70 -2 M64 -32 L84 -6" />
        <Path d="M4 -40 L-20 -40" />
      </G>
      <Circle cx={-30} cy={-14} r={16} fill="none" strokeWidth={5} />
      <Path d="M-50 -36 L-14 -36 L-18 -62 L-46 -62Z" />
      <Circle cx={-32} cy={-80} r={10} />
      <Path d="M-40 -70 L-36 -50 M-24 -70 L-10 -62 L0 -40" strokeWidth={5} fill="none" />
    </G>
  );
}

/** A potsherd (ostracon) with a few lines of ancient writing. */
export function Ostracon({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Path d="M-80 -60 L60 -70 L84 -10 L60 60 L-60 70 L-86 10Z" fill="#C98B5A" {...INK} />
      <Path d="M-80 -60 L60 -70 L84 -10 L60 60 L-60 70 L-86 10Z" fill="url(#dotsBig)" />
      {[-36, -12, 12, 36].map((ly) => (
        <Path key={ly} d={`M-56 ${ly} l8 -6 l6 8 l10 -6 l4 6 l12 -4 l6 6 l10 -8 l8 6 l12 -2 l10 4 l8 -6`} stroke="#3A2414" strokeWidth={2.5} fill="none" />
      ))}
    </G>
  );
}

/** A wooden sign on a post with a few words on it. */
export function Sign({ x, y, text, w = 140, rot = 0, fill = '#E9D6AE', color = K.ink }: { x: number; y: number; text: string; w?: number; rot?: number; fill?: string; color?: string }) {
  return (
    <G transform={`rotate(${rot} ${x} ${y})`}>
      <Rect x={x - 5} y={y} width={10} height={90} fill={K.wood} stroke={K.ink} strokeWidth={3} />
      <Rect x={x - w / 2} y={y - 40} width={w} height={44} rx={4} fill={fill} {...INK} />
      <SvgText x={x} y={y - 10} fontSize={20} fontFamily={F.black} textAnchor="middle" fill={color}>{text}</SvgText>
    </G>
  );
}

/** A sack (of flour, of supplies). */
export function Sack({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Path d="M-30 0 Q-40 -50 -16 -70 L-8 -82 L8 -82 L16 -70 Q40 -50 30 0Z" fill="#D8CBA8" {...INK} />
      <Path d="M-12 -72 L12 -72" stroke={K.ink} strokeWidth={3} />
    </G>
  );
}

/** A low army barrack or prefab block with a door and windows. */
export function Barrack({ x, y, w = 200, h = 80, fill = '#C9C2B0', label }: { x: number; y: number; w?: number; h?: number; fill?: string; label?: string }) {
  return (
    <G>
      <Rect x={x} y={y} width={w} height={h} fill={fill} {...INK} />
      <Path d={`M${x - 8} ${y} L${x + w / 2} ${y - 28} L${x + w + 8} ${y}Z`} fill="#8E877A" {...INK} />
      {Array.from({ length: Math.floor(w / 50) }, (_, i) => <Rect key={i} x={x + 18 + i * 50} y={y + 20} width={26} height={22} fill={K.navyLight} stroke={K.ink} strokeWidth={2.5} />)}
      <Rect x={x + w - 40} y={y + h - 46} width={24} height={46} fill={K.woodDark} stroke={K.ink} strokeWidth={3} />
      {label && (
        <G>
          <Rect x={x + 12} y={y + h - 34} width={w * 0.5} height={24} fill="#FFFFFF" stroke={K.ink} strokeWidth={2.5} />
          <SvgText x={x + 12 + w * 0.25} y={y + h - 16} fontSize={14} fontFamily={F.black} textAnchor="middle" fill={K.ink}>{label}</SvgText>
        </G>
      )}
    </G>
  );
}

/** A young tree, planted in a row. */
export function Sapling({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Line x1={0} y1={0} x2={0} y2={-50} stroke={K.wood} strokeWidth={5} />
      <Circle cx={0} cy={-60} r={16} fill="#4E9A54" stroke={K.ink} strokeWidth={3} />
      <Ellipse cx={0} cy={0} rx={14} ry={4} fill={K.woodDark} />
    </G>
  );
}

/** A donkey, side on, facing left, with a load on its back if `load`. */
export function Donkey({ x, y, s = 1, load }: { x: number; y: number; s?: number; load?: boolean }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      {[-34, -20, 22, 36].map((lx) => <Line key={lx} x1={lx} y1={-30} x2={lx} y2={0} stroke={K.ink} strokeWidth={7} strokeLinecap="round" />)}
      <Ellipse cx={0} cy={-46} rx={50} ry={26} fill="#9C968E" {...INK} />
      <Path d="M-40 -56 L-66 -92 Q-80 -100 -90 -88 L-92 -72 Q-90 -64 -80 -66 L-62 -66 L-40 -36Z" fill="#9C968E" {...INK} />
      <Path d="M-66 -92 L-70 -124 L-60 -96 M-58 -96 L-56 -126 L-50 -94" stroke={K.ink} strokeWidth={3} fill="#9C968E" />
      <Circle cx={-76} cy={-84} r={3} fill={K.ink} />
      <Path d="M50 -50 Q64 -40 60 -20" stroke={K.ink} strokeWidth={4} fill="none" />
      {load && <Rect x={-30} y={-90} width={60} height={34} rx={8} fill="#D8CBA8" {...INK} />}
    </G>
  );
}
