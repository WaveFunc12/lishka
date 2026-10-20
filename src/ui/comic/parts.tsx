import { Circle, Defs, Ellipse, G, Path, Pattern, Rect, Text as SvgText } from 'react-native-svg';
import geo from '@/data/geo.json';
import { BY } from '@/engine';
import { F } from '../theme';

/* Shared pieces for the comic art: the palette, Zvi, the map of the country, halftone shading and sound effects.
   Everything is drawn in the 400 x 700 panel box with a heavy ink line, flat colour and halftone dots for shade. */

export const K = {
  ink: '#111111',
  paper: '#FFF6E2',
  sand: '#F3DDAE',
  wall: '#E9D2A6',
  wallDark: '#D8BC8C',
  skin: '#F2C49C',
  skinShade: '#DDA57D',
  blush: '#E89B7B',
  hair: '#B4BAC2',
  navy: '#1B2A4A',
  navyLight: '#2C4170',
  orange: '#EE7B30',
  red: '#D9431A',
  teal: '#2E9CA8',
  yellow: '#F7C873',
  pale: '#FBE7B9',
  wood: '#9A6A3E',
  woodDark: '#6F4826',
  steel: '#8E98A3',
  shoko: '#7A4A2A',
  land: '#F6E3BA',
  glass: '#9CC9CF',
  lit: '#FFE08A',
};

/** Halftone dot fills, for shade without gradients: ids "dots" (fine) and "dotsBig". Put once in each panel. */
export function Halftone() {
  return (
    <Defs>
      <Pattern id="dots" width={7} height={7} patternUnits="userSpaceOnUse">
        <Circle cx={3.5} cy={3.5} r={1.5} fill={K.ink} opacity={0.22} />
      </Pattern>
      <Pattern id="dotsBig" width={12} height={12} patternUnits="userSpaceOnUse">
        <Circle cx={6} cy={6} r={3} fill={K.ink} opacity={0.14} />
      </Pattern>
    </Defs>
  );
}

/** A sound effect in hand-lettered capitals: thick ink outline, bright fill, tilted. */
export function Sfx({ x, y, text, size = 64, rot = -10, fill = K.yellow }: { x: number; y: number; text: string; size?: number; rot?: number; fill?: string }) {
  return (
    <G transform={`rotate(${rot} ${x} ${y})`}>
      <SvgText x={x + 4} y={y + 4} fontSize={size} fontFamily={F.stamp} textAnchor="middle" fill={K.ink}>{text}</SvgText>
      <SvgText x={x} y={y} fontSize={size} fontFamily={F.stamp} textAnchor="middle" fill={fill} stroke={K.ink} strokeWidth={size * 0.06}
        strokeLinejoin="round">{text}</SvgText>
    </G>
  );
}

/** Rays from a point to beyond the panel edges, for drama (alternating two colours). */
export function Rays({ cx, cy, n = 22, a, b }: { cx: number; cy: number; n?: number; a: string; b: string }) {
  const R = 900;
  return (
    <G>
      <Rect x={0} y={0} width={400} height={700} fill={a} />
      {Array.from({ length: n }, (_, i) => {
        const t0 = (i / n) * Math.PI * 2, t1 = ((i + 0.5) / n) * Math.PI * 2;
        return <Path key={i} d={`M${cx} ${cy}L${cx + R * Math.cos(t0)} ${cy + R * Math.sin(t0)}L${cx + R * Math.cos(t1)} ${cy + R * Math.sin(t1)}Z`} fill={b} />;
      })}
    </G>
  );
}

// The country outline, in map km (x -82..102, y -212..228).
const C_X = -82, C_Y = -212, C_H = 440;

/** The map of the country with its top-left corner at (x, y) and the given height. Dots are place ids;
    `ring` circles them in red marker, `glow` lights them up. */
export function IsraelMap({ x, y, h, dots = [], ring, glow, smudges }: { x: number; y: number; h: number; dots?: string[]; ring?: boolean; glow?: boolean; smudges?: boolean }) {
  const s = h / C_H;
  const at = (id: string) => ({ x: x + (BY[id].x - C_X) * s, y: y + (BY[id].y - C_Y) * s });
  return (
    <G>
      <G transform={`translate(${x - C_X * s} ${y - C_Y * s}) scale(${s})`}>
        {geo.homeLow.map((d, i) => <Path key={i} d={d} fill={K.land} stroke={K.ink} strokeWidth={2.4 / s} strokeLinejoin="round" />)}
        {geo.lakesLow.map((d, i) => <Path key={'l' + i} d={d} fill={K.teal} stroke={K.ink} strokeWidth={1.2 / s} />)}
      </G>
      {smudges && [[0.45, 0.3, 9], [0.62, 0.52, 7], [0.38, 0.62, 11], [0.55, 0.8, 6]].map(([fx, fy, r], i) => (
        <G key={'s' + i} opacity={0.55}>
          <Ellipse cx={x + fx * h * 0.42} cy={y + fy * h} rx={r} ry={r * 1.25} fill={K.shoko} />
          <Path d={`M${x + fx * h * 0.42 - r * 0.6} ${y + fy * h - r * 0.2}q${r * 0.6} -${r * 0.5} ${r * 1.2} 0`} stroke={K.paper} strokeWidth={1} fill="none" opacity={0.6} />
        </G>
      ))}
      {dots.map((id) => {
        const p = at(id);
        return (
          <G key={id}>
            {glow && <Circle cx={p.x} cy={p.y} r={16} fill={K.yellow} opacity={0.75} />}
            {glow && <Circle cx={p.x} cy={p.y} r={10} fill={K.lit} />}
            <Circle cx={p.x} cy={p.y} r={5.5} fill={K.orange} stroke={K.ink} strokeWidth={2.2} />
            {ring && <Ellipse cx={p.x + 1} cy={p.y} rx={15} ry={12} fill="none" stroke={K.red} strokeWidth={3} transform={`rotate(-14 ${p.x} ${p.y})`} />}
          </G>
        );
      })}
    </G>
  );
}

/** A framed map on the wall, the office's pride. */
export function WallMap({ x, y, w, h, ...map }: { x: number; y: number; w: number; h: number; dots?: string[]; ring?: boolean; glow?: boolean; smudges?: boolean }) {
  const mh = h - 30;
  return (
    <G>
      <Rect x={x + 6} y={y + 6} width={w} height={h} fill={K.ink} />
      <Rect x={x} y={y} width={w} height={h} fill={K.teal} stroke={K.ink} strokeWidth={5} />
      <Rect x={x} y={y} width={w} height={h} fill="url(#dotsBig)" />
      <IsraelMap x={x + w / 2 - (184 / 440) * mh / 2} y={y + 15} h={mh} {...map} />
    </G>
  );
}

export type Mood = 'calm' | 'talk' | 'worried' | 'proud' | 'look';

/** Zvi, 31 years at the office: bald crown, grey side tufts, round glasses, a big grey moustache, navy cardigan and an orange tie.
    (x, y) is the middle of his face; at scale 1 the head is 120 wide. `body` adds shoulders and chest. */
export function Zvi({ x, y, s = 1, mood = 'calm', body = true, look = [0, 0] }: { x: number; y: number; s?: number; mood?: Mood; body?: boolean; look?: [number, number] }) {
  const [lx, ly] = look;
  const worried = mood === 'worried';
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      {body && (
        <G>
          <Rect x={-20} y={48} width={40} height={40} fill={K.skinShade} stroke={K.ink} strokeWidth={4} />
          <Path d="M-112 260 Q-108 112 -44 82 L44 82 Q108 112 112 260 Z" fill={K.navy} stroke={K.ink} strokeWidth={4} />
          <Path d="M-112 260 Q-108 112 -44 82 L-30 90 Q-80 140 -84 260Z" fill="url(#dots)" />
          <Path d="M-34 82 L0 150 L34 82 Z" fill={K.paper} stroke={K.ink} strokeWidth={4} strokeLinejoin="round" />
          <Path d="M-9 96 L9 96 L14 158 L0 174 L-14 158 Z" fill={K.orange} stroke={K.ink} strokeWidth={3.5} strokeLinejoin="round" />
          <Path d="M-34 82 L-16 112 L-4 92 M34 82 L16 112 L4 92" fill={K.paper} stroke={K.ink} strokeWidth={3.5} strokeLinejoin="round" />
          <Path d="M-44 82 L-6 200 M44 82 L6 200" stroke={K.navyLight} strokeWidth={5} fill="none" />
          <Circle cx={-14} cy={214} r={4} fill={K.paper} stroke={K.ink} strokeWidth={2} />
          <Circle cx={-14} cy={244} r={4} fill={K.paper} stroke={K.ink} strokeWidth={2} />
        </G>
      )}
      <Ellipse cx={-60} cy={8} rx={13} ry={19} fill={K.skin} stroke={K.ink} strokeWidth={4} />
      <Ellipse cx={60} cy={8} rx={13} ry={19} fill={K.skin} stroke={K.ink} strokeWidth={4} />
      <Ellipse cx={0} cy={0} rx={60} ry={70} fill={K.skin} stroke={K.ink} strokeWidth={4} />
      <Path d="M-58 20 Q-60 50 -30 64 Q-52 58 -58 20Z" fill={K.skinShade} opacity={0.7} />
      <Path d="M-26 -54 Q0 -66 24 -56" stroke="#FFFFFF" strokeWidth={6} strokeLinecap="round" fill="none" opacity={0.7} />
      <Path d="M-20 -40 Q0 -46 20 -40 M-14 -32 Q0 -36 14 -32" stroke={K.skinShade} strokeWidth={2.5} fill="none" strokeLinecap="round" />
      {/* Grey tufts over the ears; the crown is bald. */}
      <Path d="M-50 22 Q-74 4 -66 -26 Q-60 -48 -40 -52 Q-48 -40 -50 -26 Q-56 -8 -44 6 Q-52 12 -50 22Z" fill={K.hair} stroke={K.ink} strokeWidth={3.5} strokeLinejoin="round" />
      <Path d="M50 22 Q74 4 66 -26 Q60 -48 40 -52 Q48 -40 50 -26 Q56 -8 44 6 Q52 12 50 22Z" fill={K.hair} stroke={K.ink} strokeWidth={3.5} strokeLinejoin="round" />
      {/* Eyebrows: worried lifts the inner ends. */}
      <Path d={worried ? 'M-46 -22 Q-30 -40 -10 -40 Q-28 -30 -46 -16Z' : mood === 'proud' ? 'M-46 -30 Q-28 -40 -10 -30 Q-28 -34 -46 -24Z' : 'M-46 -26 Q-30 -38 -10 -30 Q-28 -32 -46 -20Z'}
        fill={K.hair} stroke={K.ink} strokeWidth={3} strokeLinejoin="round" />
      <Path d={worried ? 'M46 -22 Q30 -40 10 -40 Q28 -30 46 -16Z' : mood === 'proud' ? 'M46 -30 Q28 -40 10 -30 Q28 -34 46 -24Z' : 'M46 -26 Q30 -38 10 -30 Q28 -32 46 -20Z'}
        fill={K.hair} stroke={K.ink} strokeWidth={3} strokeLinejoin="round" />
      {/* Glasses. */}
      <Path d="M-44 -6 L-60 0 M44 -6 L60 0 M-7 -8 Q0 -14 7 -8" stroke={K.ink} strokeWidth={4} fill="none" strokeLinecap="round" />
      <Circle cx={-25} cy={-6} r={19} fill="#FFFFFF" stroke={K.ink} strokeWidth={4.5} />
      <Circle cx={25} cy={-6} r={19} fill="#FFFFFF" stroke={K.ink} strokeWidth={4.5} />
      <Circle cx={-25 + lx} cy={-4 + ly} r={worried ? 3.6 : 5.5} fill={K.ink} />
      <Circle cx={25 + lx} cy={-4 + ly} r={worried ? 3.6 : 5.5} fill={K.ink} />
      <Path d="M-34 -16 L-28 -20 M16 -16 L22 -20" stroke="#FFFFFF" strokeWidth={0} />
      <Path d="M-36 -14 Q-32 -20 -26 -21 M14 -14 Q18 -20 24 -21" stroke={K.glass} strokeWidth={3} fill="none" strokeLinecap="round" />
      {/* Nose, cheeks, moustache, mouth. */}
      <Ellipse cx={-38} cy={30} rx={10} ry={6} fill={K.blush} opacity={0.6} />
      <Ellipse cx={38} cy={30} rx={10} ry={6} fill={K.blush} opacity={0.6} />
      <Path d="M-4 8 Q-16 24 -6 30 Q2 34 10 30 Q16 22 6 10" fill={K.skinShade} stroke={K.ink} strokeWidth={3.5} strokeLinejoin="round" />
      {mood === 'talk' || worried ? (
        <Ellipse cx={0} cy={54} rx={worried ? 13 : 10} ry={worried ? 10 : 7} fill="#6B2A1A" stroke={K.ink} strokeWidth={3} />
      ) : (
        <Path d={mood === 'proud' ? 'M-18 50 Q0 66 18 50' : 'M-12 54 Q0 59 12 54'} stroke={K.ink} strokeWidth={3.5} fill={mood === 'proud' ? '#6B2A1A' : 'none'} strokeLinecap="round" />
      )}
      <Path d="M-38 42 Q-24 26 0 36 Q24 26 38 42 Q30 50 18 46 Q8 52 0 44 Q-8 52 -18 46 Q-30 50 -38 42Z" fill={K.hair} stroke={K.ink} strokeWidth={3.5} strokeLinejoin="round" />
      <Path d="M-22 40 L-20 46 M-10 38 L-9 45 M10 38 L9 45 M22 40 L20 46" stroke="#8C929A" strokeWidth={2} />
      {worried && (
        <G>
          <Path d="M70 -46 Q60 -26 70 -20 Q80 -26 70 -46Z" fill="#BFE3EA" stroke={K.ink} strokeWidth={3} />
          <Path d="M-74 -34 Q-82 -18 -74 -13 Q-66 -18 -74 -34Z" fill="#BFE3EA" stroke={K.ink} strokeWidth={3} />
          <Path d="M-30 -52 L-24 -62 M0 -58 L0 -70 M30 -52 L24 -62" stroke={K.ink} strokeWidth={3.5} strokeLinecap="round" />
        </G>
      )}
    </G>
  );
}

/** A hand: a mitten with a thumb, pointing the way `rot` turns it (0 = fingers up). */
export function Hand({ x, y, s = 1, rot = 0, sleeve = K.navy }: { x: number; y: number; s?: number; rot?: number; sleeve?: string }) {
  return (
    <G transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <Rect x={-20} y={22} width={40} height={40} fill={sleeve} stroke={K.ink} strokeWidth={4} />
      <Rect x={-22} y={18} width={44} height={10} fill={K.paper} stroke={K.ink} strokeWidth={3.5} />
      <Path d="M-17 20 Q-20 -6 -12 -22 Q-4 -30 6 -24 Q16 -16 17 0 Q26 -4 28 6 Q26 16 17 20Z" fill={K.skin} stroke={K.ink} strokeWidth={4} strokeLinejoin="round" />
      <Path d="M-8 -14 L-8 2 M2 -16 L2 2" stroke={K.ink} strokeWidth={2.5} strokeLinecap="round" />
    </G>
  );
}

/** A raised fist, knuckles to the front. */
export function Fist({ x, y, s = 1, rot = 0 }: { x: number; y: number; s?: number; rot?: number }) {
  return (
    <G transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <Path d="M-28 -14 Q-30 -36 -14 -34 Q-7 -42 0 -34 Q7 -42 14 -34 Q22 -42 28 -30 Q34 -8 26 14 Q20 30 0 30 Q-22 30 -28 10Z"
        fill={K.skin} stroke={K.ink} strokeWidth={4} strokeLinejoin="round" />
      <Path d="M-14 -34 L-14 -16 M0 -34 L0 -16 M14 -34 L14 -16" stroke={K.ink} strokeWidth={3} strokeLinecap="round" />
      <Path d="M-28 -4 Q-6 -16 18 -4" stroke={K.ink} strokeWidth={3.5} fill="none" strokeLinecap="round" />
      <Path d="M-20 16 Q0 24 20 16" stroke={K.skinShade} strokeWidth={4} fill="none" strokeLinecap="round" />
    </G>
  );
}

/** A paper mug with steam. */
export function Mug({ x, y, s = 1, label }: { x: number; y: number; s?: number; label?: string }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Path d="M-8 -34 Q-14 -46 -6 -56 M8 -34 Q2 -48 10 -60" stroke="#FFFFFF" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.8} />
      <Path d="M18 -14 Q36 -14 34 2 Q32 16 16 14" stroke={K.ink} strokeWidth={5} fill="none" />
      <Path d="M-22 -26 L22 -26 L18 24 Q0 30 -18 24 Z" fill="#FFFFFF" stroke={K.ink} strokeWidth={4} strokeLinejoin="round" />
      <Ellipse cx={0} cy={-26} rx={22} ry={6} fill="#5A3A22" stroke={K.ink} strokeWidth={3} />
      {label && <SvgText x={0} y={8} fontSize={11} fontFamily={F.black} textAnchor="middle" fill={K.red}>{label}</SvgText>}
    </G>
  );
}

/** The bag of chocolate milk (שקית שוקו): a soft pillow of a bag with brown stripes and a bitten corner. */
export function ShokoBag({ x, y, s = 1, rot = 0, straw }: { x: number; y: number; s?: number; rot?: number; straw?: boolean }) {
  return (
    <G transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      {straw && <Path d="M18 -40 L26 -78 L36 -80" stroke={K.red} strokeWidth={6} fill="none" strokeLinejoin="round" strokeLinecap="round" />}
      <Path d="M-46 -38 Q0 -50 40 -38 L48 -22 Q54 10 46 38 Q0 50 -46 38 Q-56 0 -46 -38Z" fill={K.paper} stroke={K.ink} strokeWidth={4} strokeLinejoin="round" />
      <Path d="M-50 -10 Q0 -18 52 -10 L52 4 Q0 -4 -52 4Z" fill={K.shoko} />
      <Path d="M-50 18 Q0 10 50 18 L49 26 Q0 18 -50 26Z" fill="#3E7CB1" />
      <SvgText x={0} y={2} fontSize={19} fontFamily={F.black} textAnchor="middle" fill={K.paper}>שוקו</SvgText>
      <Path d="M40 -38 L48 -22 L36 -28Z" fill={K.shoko} stroke={K.ink} strokeWidth={3} strokeLinejoin="round" />
    </G>
  );
}

/** David Ben-Gurion, "the Old Man", as a framed portrait: bald crown, the famous clouds of white hair, heavy brows, open khaki collar. */
export function OldManPortrait({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  const cx = x + w / 2, cy = y + h * 0.46;
  return (
    <G>
      <Rect x={x + 7} y={y + 7} width={w} height={h} fill={K.ink} />
      <Rect x={x} y={y} width={w} height={h} fill={K.woodDark} stroke={K.ink} strokeWidth={5} />
      <Rect x={x + 14} y={y + 14} width={w - 28} height={h - 28} fill="#EADBC0" stroke={K.ink} strokeWidth={3} />
      <Rect x={x + 14} y={y + 14} width={w - 28} height={h - 28} fill="url(#dotsBig)" />
      <G transform={`translate(${cx} ${cy})`}>
        <Path d="M-78 150 Q-74 80 -30 66 L30 66 Q74 80 78 150Z" fill="#B9A46A" stroke={K.ink} strokeWidth={4} />
        <Path d="M-30 66 L-6 108 L0 74 L6 108 L30 66" fill="#CDBB86" stroke={K.ink} strokeWidth={3.5} strokeLinejoin="round" />
        <Rect x={-16} y={42} width={32} height={30} fill={K.skinShade} stroke={K.ink} strokeWidth={3.5} />
        {/* The hair: white clouds on both sides of a bald head. */}
        <Path d="M-40 -6 Q-78 -10 -74 -38 Q-92 -52 -74 -70 Q-74 -94 -50 -88 Q-46 -62 -40 -40Z" fill="#F7F7F4" stroke={K.ink} strokeWidth={3.5} strokeLinejoin="round" />
        <Path d="M40 -6 Q78 -10 74 -38 Q92 -52 74 -70 Q74 -94 50 -88 Q46 -62 40 -40Z" fill="#F7F7F4" stroke={K.ink} strokeWidth={3.5} strokeLinejoin="round" />
        <Ellipse cx={0} cy={-6} rx={46} ry={54} fill={K.skin} stroke={K.ink} strokeWidth={4} />
        <Path d="M-18 -50 Q0 -58 16 -52" stroke="#FFFFFF" strokeWidth={5} fill="none" opacity={0.7} strokeLinecap="round" />
        <Path d="M-38 -16 Q-22 -28 -6 -18 L-8 -12 Q-22 -20 -36 -10Z M38 -16 Q22 -28 6 -18 L8 -12 Q22 -20 36 -10Z" fill="#4A4A48" stroke={K.ink} strokeWidth={2} />
        <Circle cx={-18} cy={-4} r={4} fill={K.ink} />
        <Circle cx={18} cy={-4} r={4} fill={K.ink} />
        <Path d="M-2 0 Q-10 16 -2 20 Q4 22 8 18" stroke={K.ink} strokeWidth={3} fill="none" strokeLinecap="round" />
        <Path d="M-16 32 Q0 28 16 32" stroke={K.ink} strokeWidth={4} fill="none" strokeLinecap="round" />
        <Path d="M-40 8 Q-38 34 -18 44 M40 8 Q38 34 18 44" stroke={K.skinShade} strokeWidth={4} fill="none" strokeLinecap="round" />
      </G>
    </G>
  );
}
