import { Circle, Ellipse, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import { F } from '../theme';
import { K } from './parts';

/* People, animals and places for the founding stories, in the same ink-and-flat-colour style as Zvi.
   Everything takes a position and a scale, and is drawn around its own origin. */

const INK = { stroke: K.ink, strokeWidth: 4, strokeLinejoin: 'round' as const };

export type Hat = 'none' | 'fedora' | 'boater' | 'fez' | 'tembel' | 'slouch' | 'cloth' | 'crown' | 'scarf' | 'cap' | 'kippah' | 'turban' | 'feathers' | 'bicorne' | 'shtreimel' | 'helmet';
export type Pose = 'down' | 'wave' | 'point' | 'hold' | 'cheer' | 'hips';

/** A person, feet at (x, y), about 220 tall at scale 1. `flip` turns them to face left.
    `coat` is the jacket or robe colour; a robe (`robe`) reaches the feet. */
export function Person({ x, y, s = 1, flip, coat = K.navy, pants = '#3B3B3B', skin = K.skin, hair = '#3A2A1E', hat = 'none', hatColor,
  beard, moustache, robe, dress, pose = 'down', mouth = 'smile', glasses }: {
  x: number; y: number; s?: number; flip?: boolean; coat?: string; pants?: string; skin?: string; hair?: string; hat?: Hat; hatColor?: string;
  beard?: string; moustache?: boolean; robe?: boolean; dress?: boolean; pose?: Pose; mouth?: 'smile' | 'open' | 'flat' | 'shout'; glasses?: boolean;
}) {
  const long = robe || dress;
  // Arms: [shoulder, hand] for the near and far arm, by pose (facing right; flip mirrors).
  const arms: Record<Pose, [string, string]> = {
    down: ['M-30 -150 Q-42 -110 -38 -84', 'M30 -150 Q42 -110 38 -84'],
    wave: ['M-30 -150 Q-42 -110 -38 -84', 'M30 -150 Q62 -170 58 -214'],
    point: ['M-30 -150 Q-42 -110 -38 -84', 'M30 -150 Q70 -150 98 -160'],
    hold: ['M-30 -150 Q-10 -110 20 -112', 'M30 -150 Q50 -116 46 -110'],
    cheer: ['M-30 -150 Q-62 -170 -58 -214', 'M30 -150 Q62 -170 58 -214'],
    hips: ['M-30 -150 Q-58 -122 -34 -100', 'M30 -150 Q58 -122 34 -100'],
  };
  const hand = (d: string) => {
    const m = d.match(/(-?\d+) (-?\d+)$/)!;
    return { x: +m[1], y: +m[2] };
  };
  const hc = hatColor ?? ({ fedora: '#4A3B2E', boater: '#E9CF8E', fez: K.red, tembel: '#C8B27A', slouch: '#8C7A54', cloth: '#E8DDC8', crown: '#F2C230',
    scarf: K.teal, cap: '#4A4A4A', kippah: K.navy, turban: '#F4F1EA', feathers: '#F4F1EA', bicorne: '#1E1E1E', shtreimel: '#5A3A22', helmet: '#6E7F3B', none: '' } as const)[hat];
  return (
    <G transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      {/* Legs and shoes, unless a robe covers them. */}
      {!long && (
        <G>
          <Rect x={-26} y={-82} width={22} height={76} fill={pants} {...INK} />
          <Rect x={4} y={-82} width={22} height={76} fill={pants} {...INK} />
        </G>
      )}
      <Ellipse cx={-18} cy={-4} rx={16} ry={7} fill={long ? '#6F4826' : K.ink} {...INK} strokeWidth={3} />
      <Ellipse cx={20} cy={-4} rx={16} ry={7} fill={long ? '#6F4826' : K.ink} {...INK} strokeWidth={3} />
      {/* Body. */}
      <Path d={long ? 'M-32 -156 Q-50 -80 -46 -8 L46 -8 Q50 -80 32 -156 Q0 -166 -32 -156Z' : 'M-32 -156 Q-40 -120 -34 -78 L34 -78 Q40 -120 32 -156 Q0 -166 -32 -156Z'}
        fill={coat} {...INK} />
      <Path d={long ? 'M-32 -156 Q-50 -80 -46 -8 L-30 -8 Q-36 -80 -22 -152Z' : 'M-32 -156 Q-40 -120 -34 -78 L-22 -78 Q-28 -120 -22 -152Z'} fill="url(#dots)" />
      {robe && <Path d="M-38 -110 L38 -100" stroke={hc || '#B5651D'} strokeWidth={7} />}
      {!long && <Path d="M-10 -156 L0 -128 L10 -156" fill="#FFFFFF" stroke={K.ink} strokeWidth={3} strokeLinejoin="round" />}
      {/* Arms with hands. */}
      {arms[pose].map((d, i) => {
        const h = hand(d);
        return (
          <G key={i}>
            <Path d={d} stroke={K.ink} strokeWidth={22} fill="none" strokeLinecap="round" />
            <Path d={d} stroke={coat} strokeWidth={15} fill="none" strokeLinecap="round" />
            <Circle cx={h.x} cy={h.y} r={10} fill={skin} {...INK} strokeWidth={3.5} />
          </G>
        );
      })}
      {/* Head. */}
      <Rect x={-9} y={-176} width={18} height={20} fill={skin} {...INK} strokeWidth={3} />
      {hat !== 'cloth' && hat !== 'scarf' && hat !== 'turban' && hair !== 'bald' && (
        <Path d="M-27 -190 Q-30 -222 0 -224 Q30 -222 27 -190 Q20 -206 0 -206 Q-20 -206 -27 -190Z" fill={hair} {...INK} strokeWidth={3} />
      )}
      {(hat === 'cloth' || hat === 'scarf') && <Path d="M-34 -150 Q-40 -200 -26 -220 Q0 -236 26 -220 Q40 -200 34 -150 Q20 -160 22 -190 Q0 -200 -22 -190 Q-20 -160 -34 -150Z" fill={hc} {...INK} strokeWidth={3.5} />}
      <Circle cx={0} cy={-192} r={25} fill={skin} {...INK} />
      {beard && <Path d="M-24 -190 Q-26 -158 0 -150 Q26 -158 24 -190 Q12 -176 0 -178 Q-12 -176 -24 -190Z" fill={beard} {...INK} strokeWidth={3} />}
      {moustache && <Path d="M-12 -180 Q0 -188 12 -180 Q6 -175 0 -178 Q-6 -175 -12 -180Z" fill={beard ?? '#5A4636'} stroke={K.ink} strokeWidth={2} />}
      <Circle cx={-9} cy={-196} r={3.4} fill={K.ink} />
      <Circle cx={9} cy={-196} r={3.4} fill={K.ink} />
      {glasses && <Path d="M-17 -196 a8 8 0 1 0 16 0 a8 8 0 1 0 -16 0 M1 -196 a8 8 0 1 0 16 0 a8 8 0 1 0 -16 0 M-1 -197 L1 -197" stroke={K.ink} strokeWidth={2.5} fill="none" />}
      <Ellipse cx={-16} cy={-184} rx={5} ry={3} fill={K.blush} opacity={0.6} />
      <Ellipse cx={16} cy={-184} rx={5} ry={3} fill={K.blush} opacity={0.6} />
      {mouth === 'smile' && !beard && <Path d="M-7 -178 Q0 -172 7 -178" stroke={K.ink} strokeWidth={3} fill="none" strokeLinecap="round" />}
      {mouth === 'flat' && !beard && <Path d="M-6 -177 L6 -177" stroke={K.ink} strokeWidth={3} strokeLinecap="round" />}
      {(mouth === 'open' || mouth === 'shout') && <Ellipse cx={0} cy={beard ? -172 : -175} rx={mouth === 'shout' ? 7 : 5} ry={mouth === 'shout' ? 7 : 4} fill="#6B2A1A" stroke={K.ink} strokeWidth={2.5} />}
      {/* Hats. */}
      {hat === 'fedora' && <G><Ellipse cx={0} cy={-212} rx={38} ry={8} fill={hc} {...INK} strokeWidth={3.5} /><Path d="M-22 -212 Q-24 -244 0 -242 Q24 -244 22 -212Z" fill={hc} {...INK} strokeWidth={3.5} /><Rect x={-22} y={-222} width={44} height={7} fill={K.ink} /></G>}
      {hat === 'boater' && <G><Ellipse cx={0} cy={-213} rx={38} ry={7} fill={hc} {...INK} strokeWidth={3.5} /><Rect x={-22} y={-236} width={44} height={22} fill={hc} {...INK} strokeWidth={3.5} /><Rect x={-22} y={-224} width={44} height={7} fill={K.navy} /></G>}
      {hat === 'fez' && <G><Path d="M-20 -210 L-15 -244 L15 -244 L20 -210Z" fill={hc} {...INK} strokeWidth={3.5} /><Path d="M0 -244 Q16 -240 18 -222" stroke={K.ink} strokeWidth={3} fill="none" /></G>}
      {hat === 'tembel' && <Path d="M-27 -206 Q-20 -250 0 -252 Q20 -250 27 -206 Q0 -214 -27 -206Z" fill={hc} {...INK} strokeWidth={3.5} />}
      {hat === 'slouch' && <G><Path d="M-44 -210 Q0 -222 30 -212 L40 -244 L28 -214 Z" fill={hc} {...INK} strokeWidth={3.5} /><Path d="M-22 -212 Q-22 -240 0 -240 Q22 -240 22 -212Z" fill={hc} {...INK} strokeWidth={3.5} /><Path d="M30 -232 Q46 -250 52 -262" stroke="#3A2A1E" strokeWidth={4} fill="none" strokeLinecap="round" /></G>}
      {hat === 'cloth' && <Path d="M-28 -208 Q0 -216 28 -208" stroke={K.ink} strokeWidth={6} fill="none" />}
      {hat === 'crown' && <Path d="M-22 -212 L-24 -244 L-12 -228 L0 -248 L12 -228 L24 -244 L22 -212Z" fill={hc} {...INK} strokeWidth={3.5} />}
      {hat === 'cap' && <G><Path d="M-26 -206 Q-24 -232 0 -232 Q24 -232 26 -206Z" fill={hc} {...INK} strokeWidth={3.5} /><Path d="M14 -208 L44 -204 L26 -212Z" fill={hc} {...INK} strokeWidth={3} /></G>}
      {hat === 'kippah' && <Path d="M-14 -216 Q0 -226 14 -216Z" fill={hc} {...INK} strokeWidth={2.5} />}
      {hat === 'feathers' && (
        <G>
          {[-24, -14, -4, 6, 16].map((d) => <Path key={d} d={`M${d} -212 L${d + 1} -252 Q${d + 5} -256 ${d + 9} -252 L${d + 9} -212Z`} fill={hc} {...INK} strokeWidth={2.5} />)}
          <Rect x={-28} y={-216} width={56} height={12} fill={K.orange} {...INK} strokeWidth={3} />
        </G>
      )}
      {hat === 'bicorne' && <G><Path d="M-46 -212 Q0 -262 46 -212 Q0 -224 -46 -212Z" fill={hc} {...INK} strokeWidth={3.5} /><Circle cx={0} cy={-232} r={6} fill={K.red} stroke={K.ink} strokeWidth={2} /></G>}
      {hat === 'shtreimel' && <G><Ellipse cx={0} cy={-212} rx={34} ry={14} fill={hc} {...INK} strokeWidth={3.5} /><Path d="M-18 -220 Q0 -246 18 -220Z" fill={K.ink} /></G>}
      {hat === 'helmet' && <Path d="M-30 -204 Q-30 -246 0 -246 Q30 -246 30 -204Z" fill={hc} {...INK} strokeWidth={3.5} />}
      {hat === 'turban' && <Path d="M-28 -200 Q-34 -238 0 -240 Q34 -238 28 -200 Q0 -210 -28 -200Z M-20 -226 Q0 -216 22 -230" fill={hc} {...INK} strokeWidth={3.5} />}
    </G>
  );
}

/** Rolling sand dunes along the bottom of the panel from height `y`. */
export function Dunes({ y, fill = K.sand }: { y: number; fill?: string }) {
  return (
    <G>
      <Path d={`M-10 ${y + 30} Q60 ${y - 20} 140 ${y + 10} Q220 ${y + 40} 300 ${y - 4} Q360 ${y - 24} 410 ${y + 10} L410 710 L-10 710Z`} fill={fill} {...INK} />
      <Path d={`M-10 ${y + 90} Q90 ${y + 50} 190 ${y + 80} Q290 ${y + 110} 410 ${y + 70} L410 710 L-10 710Z`} fill="#E6C78C" {...INK} />
      <Path d={`M-10 ${y + 90} Q90 ${y + 50} 190 ${y + 80} Q290 ${y + 110} 410 ${y + 70} L410 710 L-10 710Z`} fill="url(#dotsBig)" />
      <Path d={`M60 ${y + 20} q20 -8 40 0 M250 ${y + 18} q16 -6 32 0`} stroke="#C9A866" strokeWidth={3} fill="none" strokeLinecap="round" />
    </G>
  );
}

/** Sea from the top line `y` down to `to`, with a few wave marks. */
export function Sea({ y, to = 700, x0 = -10, x1 = 410 }: { y: number; to?: number; x0?: number; x1?: number }) {
  return (
    <G>
      <Rect x={x0} y={y} width={x1 - x0} height={to - y} fill={K.teal} {...INK} />
      <Rect x={x0} y={y} width={x1 - x0} height={to - y} fill="url(#dotsBig)" />
      {Array.from({ length: 6 }, (_, i) => (
        <Path key={i} d={`M${x0 + 30 + ((i * 83) % (x1 - x0 - 60))} ${y + 16 + i * 14} q8 -6 16 0 q8 -6 16 0`} stroke="#E8F6F7" strokeWidth={3} fill="none" strokeLinecap="round" />
      ))}
    </G>
  );
}

/** A flat-roofed stone house, the kind every old town in the country is made of. */
export function House({ x, y, w, h, fill = '#E8D9B8', dome, windows = 2 }: { x: number; y: number; w: number; h: number; fill?: string; dome?: boolean; windows?: number }) {
  return (
    <G>
      {dome && <Path d={`M${x + w * 0.25} ${y} Q${x + w / 2} ${y - w * 0.4} ${x + w * 0.75} ${y}Z`} fill={fill} {...INK} strokeWidth={3} />}
      <Rect x={x} y={y} width={w} height={h} fill={fill} {...INK} strokeWidth={3} />
      <Rect x={x} y={y} width={w * 0.22} height={h} fill="url(#dots)" />
      {Array.from({ length: windows }, (_, i) => (
        <Path key={i} d={`M${x + (w / (windows + 1)) * (i + 1) - 6} ${y + h * 0.62} L${x + (w / (windows + 1)) * (i + 1) - 6} ${y + h * 0.34} Q${x + (w / (windows + 1)) * (i + 1)} ${y + h * 0.24} ${x + (w / (windows + 1)) * (i + 1) + 6} ${y + h * 0.34} L${x + (w / (windows + 1)) * (i + 1) + 6} ${y + h * 0.62}Z`}
          fill={K.navy} stroke={K.ink} strokeWidth={2.5} />
      ))}
    </G>
  );
}

/** A town wall with battlements from x0 to x1, top at y, down to `to`. */
export function TownWall({ x0, x1, y, to, fill = '#D9C69C' }: { x0: number; x1: number; y: number; to: number; fill?: string }) {
  const n = Math.floor((x1 - x0) / 24);
  return (
    <G>
      <Rect x={x0} y={y} width={x1 - x0} height={to - y} fill={fill} {...INK} />
      {Array.from({ length: n }, (_, i) => i % 2 === 0 && <Rect key={i} x={x0 + i * 24} y={y - 14} width={24} height={16} fill={fill} {...INK} strokeWidth={3} />)}
      {Array.from({ length: 5 }, (_, r) => (
        <Line key={r} x1={x0} y1={y + 18 + r * 22} x2={x1} y2={y + 18 + r * 22} stroke="#B9A374" strokeWidth={2} />
      ))}
      <Rect x={x0} y={y} width={x1 - x0} height={to - y} fill="url(#dotsBig)" />
    </G>
  );
}

/** A sun with a halftone face, or a low evening sun when `low`. */
export function Sun({ x, y, r, fill = K.yellow }: { x: number; y: number; r: number; fill?: string }) {
  return (
    <G>
      <Circle cx={x} cy={y} r={r} fill={fill} {...INK} />
      <Circle cx={x} cy={y} r={r} fill="url(#dotsBig)" />
    </G>
  );
}

/** A horse in full gallop with its rider, as a dark silhouette (facing left). The rider wears a slouch hat and carries a rifle. */
export function Rider({ x, y, s = 1, fill = '#2A1C14' }: { x: number; y: number; s?: number; fill?: string }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <G fill={fill} stroke={fill}>
        <Ellipse cx={0} cy={0} rx={58} ry={25} />
        <Path d="M-36 -14 L-70 -58 Q-80 -66 -96 -60 L-112 -44 Q-114 -36 -104 -36 L-84 -40 L-54 6Z" />
        <Path d="M-74 -62 L-70 -76 L-62 -62Z" />
        <Path d="M52 -10 Q84 -16 104 6 Q86 -2 56 4Z" />
        <G strokeWidth={10} strokeLinecap="round" fill="none">
          <Path d="M-40 14 L-74 24 L-104 22" />
          <Path d="M-30 18 L-60 38 L-86 40" />
          <Path d="M40 14 L72 30 L100 34" />
          <Path d="M48 10 L84 14 L112 8" />
        </G>
        {/* The rider, leaning forward. */}
        <Path d="M-6 -20 L-30 -62 L-14 -70 L12 -24Z" />
        <Circle cx={-30} cy={-80} r={12} />
        <Path d="M-52 -82 Q-30 -92 -8 -84 L-6 -96 L-12 -84Z" strokeWidth={3} />
        <Path d="M-26 -60 L-62 -40" strokeWidth={8} strokeLinecap="round" fill="none" />
        <Path d="M-10 -56 L36 -96" strokeWidth={4} fill="none" />
      </G>
    </G>
  );
}

/** A cargo ship seen side on, bow to the left. */
export function Ship({ x, y, s = 1, name }: { x: number; y: number; s?: number; name?: string }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Path d="M-150 0 L150 0 L126 46 L-118 46 Q-140 30 -150 0Z" fill={K.red} {...INK} />
      <Path d="M-150 0 L150 0 L144 12 L-146 12Z" fill={K.ink} />
      <Rect x={40} y={-56} width={84} height={56} fill="#FFFFFF" {...INK} />
      <Rect x={52} y={-44} width={14} height={12} fill={K.glass} stroke={K.ink} strokeWidth={2.5} />
      <Rect x={74} y={-44} width={14} height={12} fill={K.glass} stroke={K.ink} strokeWidth={2.5} />
      <Rect x={96} y={-44} width={14} height={12} fill={K.glass} stroke={K.ink} strokeWidth={2.5} />
      <Rect x={70} y={-98} width={26} height={42} fill={K.navy} {...INK} />
      <Rect x={70} y={-90} width={26} height={8} fill="#FFFFFF" />
      {[[-120, -30], [-80, -30], [-40, -30], [-100, -58], [-60, -58]].map(([cx, cy], i) => (
        <Rect key={i} x={cx} y={cy} width={38} height={28} fill={[K.orange, K.teal, K.yellow, K.navyLight, K.orange][i]} {...INK} strokeWidth={3} />
      ))}
      {name && <SvgText x={0} y={34} fontSize={16} fontFamily={F.black} textAnchor="middle" fill="#FFFFFF">{name}</SvgText>}
    </G>
  );
}

/** A clay tablet covered in cuneiform wedges. */
export function Tablet({ x, y, w, h, rot = 0 }: { x: number; y: number; w: number; h: number; rot?: number }) {
  const rows = Math.floor((h - 30) / 26);
  return (
    <G transform={`rotate(${rot} ${x + w / 2} ${y + h / 2})`}>
      <Rect x={x + 8} y={y + 8} width={w} height={h} rx={22} fill={K.ink} />
      <Rect x={x} y={y} width={w} height={h} rx={22} fill="#C9A06A" {...INK} />
      <Rect x={x} y={y} width={w} height={h} rx={22} fill="url(#dotsBig)" />
      {Array.from({ length: rows }, (_, r) => (
        <G key={r}>
          <Line x1={x + 16} y1={y + 30 + r * 26} x2={x + w - 16} y2={y + 30 + r * 26} stroke="#9C7444" strokeWidth={1.5} />
          {Array.from({ length: Math.floor((w - 40) / 22) }, (_, c) => {
            const wx = x + 24 + c * 22 + ((r * 7 + c * 5) % 6), wy = y + 14 + r * 26;
            return (r * 3 + c) % 4 === 0
              ? <Path key={c} d={`M${wx} ${wy + 4} L${wx + 10} ${wy} L${wx + 10} ${wy + 8}Z`} fill="#6E4E2A" />
              : <Path key={c} d={`M${wx} ${wy} L${wx + 8} ${wy} L${wx + 4} ${wy + 12}Z`} fill="#6E4E2A" />;
          })}
        </G>
      ))}
    </G>
  );
}
