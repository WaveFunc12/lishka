import { Circle, Ellipse, G, Line, Path, Rect } from 'react-native-svg';
import { K } from './parts';

/* Pioneer-era scenery for the region stories: tower and stockade, water towers, swamps, tents, trucks and hills. */

const INK = { stroke: K.ink, strokeWidth: 4, strokeLinejoin: 'round' as const };

/** Rolling hills from height y to the bottom, in two layers. */
export function Hills({ y, near = '#B48F55', far = '#C9A76B', green }: { y: number; near?: string; far?: string; green?: boolean }) {
  const f = green ? '#7FA65A' : far, n = green ? '#5E8C45' : near;
  return (
    <G>
      <Path d={`M-10 ${y + 40} Q80 ${y - 40} 170 ${y} Q260 ${y - 60} 410 ${y - 10} L410 710 L-10 710Z`} fill={f} {...INK} />
      <Path d={`M-10 ${y + 120} Q120 ${y + 50} 230 ${y + 100} Q330 ${y + 140} 410 ${y + 90} L410 710 L-10 710Z`} fill={n} {...INK} />
      <Path d={`M-10 ${y + 120} Q120 ${y + 50} 230 ${y + 100} Q330 ${y + 140} 410 ${y + 90} L410 710 L-10 710Z`} fill="url(#dotsBig)" />
    </G>
  );
}

/** Tower and stockade (חומה ומגדל): a wooden watchtower with a searchlight inside a double wall of planks. */
export function TowerStockade({ x, y, s = 1, light }: { x: number; y: number; s?: number; light?: boolean }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      {light && <Path d="M10 -196 L240 -260 L240 -150Z" fill={K.lit} opacity={0.45} />}
      {/* The tower. */}
      <Path d="M-26 -60 L-18 -180 M26 -60 L18 -180 M-24 -90 L22 -140 M24 -90 L-22 -140" stroke={K.ink} strokeWidth={8} />
      <Path d="M-26 -60 L-18 -180 M26 -60 L18 -180 M-24 -90 L22 -140 M24 -90 L-22 -140" stroke={K.wood} strokeWidth={4} />
      <Rect x={-30} y={-210} width={60} height={34} fill={K.wood} {...INK} />
      <Path d="M-36 -210 L0 -232 L36 -210Z" fill={K.woodDark} {...INK} />
      <Circle cx={14} cy={-196} r={8} fill={light ? K.lit : '#C4CCD4'} stroke={K.ink} strokeWidth={3} />
      {/* The stockade wall. */}
      <Rect x={-110} y={-60} width={220} height={60} fill="#B98A55" {...INK} />
      {Array.from({ length: 11 }, (_, i) => <Line key={i} x1={-110 + i * 20} y1={-60} x2={-110 + i * 20} y2={0} stroke={K.woodDark} strokeWidth={2.5} />)}
      <Rect x={-110} y={-60} width={220} height={60} fill="url(#dots)" />
      <Rect x={-14} y={-36} width={28} height={36} fill={K.woodDark} stroke={K.ink} strokeWidth={3} />
    </G>
  );
}

/** A concrete water tower on legs, the kibbutz skyline. */
export function WaterTower({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Path d="M-20 0 L-14 -90 M20 0 L14 -90 M-17 -40 L17 -40" stroke={K.ink} strokeWidth={8} />
      <Path d="M-20 0 L-14 -90 M20 0 L14 -90 M-17 -40 L17 -40" stroke="#C4CCD4" strokeWidth={4} />
      <Rect x={-30} y={-140} width={60} height={50} rx={6} fill="#D9DDE0" {...INK} />
      <Rect x={-30} y={-140} width={16} height={50} fill="url(#dots)" />
    </G>
  );
}

/** A eucalyptus tree: a pale trunk and drooping grey-green crown (planted to dry the swamps). */
export function Eucalyptus({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Path d="M-8 0 Q-12 -80 -4 -150 L6 -150 Q10 -80 8 0Z" fill="#E6DCC8" {...INK} strokeWidth={3} />
      <Path d="M-2 -110 L-30 -150 M2 -90 L30 -130" stroke={K.ink} strokeWidth={5} />
      {[[-34, -170, 30], [0, -195, 36], [32, -168, 30], [-18, -140, 24], [22, -140, 24]].map(([cx, cy, r], i) => (
        <Ellipse key={i} cx={cx} cy={cy} rx={r} ry={r * 0.8} fill="#8FAE8A" {...INK} strokeWidth={3} />
      ))}
    </G>
  );
}

/** A swamp: dark water with reeds, from height y down. */
export function Swamp({ y, x0 = -10, x1 = 410, to = 710 }: { y: number; x0?: number; x1?: number; to?: number }) {
  return (
    <G>
      <Rect x={x0} y={y} width={x1 - x0} height={to - y} fill="#5B7A5A" {...INK} />
      <Rect x={x0} y={y} width={x1 - x0} height={to - y} fill="url(#dots)" />
      {Array.from({ length: 14 }, (_, i) => {
        const rx = x0 + 20 + ((i * 61) % (x1 - x0 - 40)), ry = y + 20 + ((i * 37) % Math.max(20, to - y - 40));
        return (
          <G key={i}>
            <Path d={`M${rx} ${ry} L${rx - 4} ${ry - 40} M${rx + 6} ${ry} L${rx + 10} ${ry - 34} M${rx + 12} ${ry} L${rx + 12} ${ry - 26}`} stroke="#3E5A32" strokeWidth={4} strokeLinecap="round" />
            <Ellipse cx={rx - 4} cy={ry - 44} rx={3} ry={8} fill={K.woodDark} />
          </G>
        );
      })}
    </G>
  );
}

/** A mosquito, for the malaria years. */
export function Mosquito({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Ellipse cx={-8} cy={-8} rx={10} ry={5} fill="#FFFFFF" opacity={0.8} stroke={K.ink} strokeWidth={1.5} transform="rotate(-30 -8 -8)" />
      <Ellipse cx={8} cy={-8} rx={10} ry={5} fill="#FFFFFF" opacity={0.8} stroke={K.ink} strokeWidth={1.5} transform="rotate(30 8 -8)" />
      <Ellipse cx={0} cy={0} rx={4} ry={10} fill={K.ink} />
      <Line x1={0} y1={8} x2={0} y2={20} stroke={K.ink} strokeWidth={1.5} />
      <Path d="M-3 4 L-12 14 M3 4 L12 14 M-3 0 L-14 4 M3 0 L14 4" stroke={K.ink} strokeWidth={1.5} />
    </G>
  );
}

/** A canvas tent (bell tent) of the first settlers. */
export function Tent({ x, y, s = 1, fill = '#EDE3CC' }: { x: number; y: number; s?: number; fill?: string }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Path d="M-60 0 L0 -80 L60 0Z" fill={fill} {...INK} />
      <Path d="M-60 0 L0 -80 L-20 0Z" fill="url(#dots)" />
      <Path d="M0 -80 L-12 0 L12 0Z" fill={K.woodDark} {...INK} strokeWidth={3} />
      <Line x1={0} y1={-80} x2={0} y2={-96} stroke={K.ink} strokeWidth={4} />
    </G>
  );
}

/** A 1940s truck with a canvas cover, facing left. */
export function Truck({ x, y, s = 1, color = '#6E7F3B' }: { x: number; y: number; s?: number; color?: string }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Path d="M-20 -80 Q40 -100 100 -80 L100 -30 L-20 -30Z" fill="#D8CBA8" {...INK} />
      <Rect x={-20} y={-30} width={120} height={20} fill={color} {...INK} />
      <Path d="M-80 -10 L-80 -40 L-60 -64 L-22 -64 L-22 -10Z" fill={color} {...INK} />
      <Rect x={-64} y={-58} width={32} height={20} fill={K.glass} stroke={K.ink} strokeWidth={3} />
      <Rect x={-96} y={-30} width={20} height={20} fill={color} {...INK} strokeWidth={3} />
      {[-62, 30, 74].map((cx) => (
        <G key={cx}>
          <Circle cx={cx} cy={-6} r={16} fill={K.ink} />
          <Circle cx={cx} cy={-6} r={6} fill="#9AA3AD" />
        </G>
      ))}
    </G>
  );
}

/** A lake (the Kinneret) seen from the hills: a wide flat oval of water. */
export function Lake({ x, y, rx, ry }: { x: number; y: number; rx: number; ry: number }) {
  return (
    <G>
      <Ellipse cx={x} cy={y} rx={rx} ry={ry} fill={K.teal} {...INK} />
      <Ellipse cx={x} cy={y} rx={rx} ry={ry} fill="url(#dotsBig)" />
      <Path d={`M${x - rx * 0.5} ${y - ry * 0.2} q10 -6 20 0 q10 -6 20 0 M${x + rx * 0.1} ${y + ry * 0.3} q10 -6 20 0 q10 -6 20 0`} stroke="#E8F6F7" strokeWidth={3} fill="none" strokeLinecap="round" />
    </G>
  );
}

/** A plough furrowed field in rows, seen in perspective, from height y down. */
export function Field({ y, fill = '#9C7A46', rows = '#7A5A30' }: { y: number; fill?: string; rows?: string }) {
  return (
    <G>
      <Rect x={-10} y={y} width={420} height={720 - y} fill={fill} {...INK} />
      {Array.from({ length: 11 }, (_, i) => <Line key={i} x1={200 + (i - 5) * 26} y1={y} x2={200 + (i - 5) * 120} y2={710} stroke={rows} strokeWidth={3} />)}
    </G>
  );
}
