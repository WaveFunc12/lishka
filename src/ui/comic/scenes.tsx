import { Circle, Ellipse, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import { BY } from '@/engine';
import { F } from '../theme';
import type { Panel } from './ComicPlayer';
import { Fist, Halftone, Hand, IsraelMap, K, Mug, OldManPortrait, Rays, ShokoBag, Sfx, WallMap, Zvi } from './parts';

/* Chapter 1 of the story, as a motion comic: the office, the stuck elevator, Zvi, the spilled chocolate milk,
   the empty map, the mission, and why the work starts with the big cities.
   Each scene is drawn in the 400 x 700 box; what matters stays inside x 30-370, y 50-650. */

/** The six big cities of the first postcard. */
const BIG = ['jlm', 'tlv', 'hfa', 'bsh', 'asd', 'ntn'];

const SW = 4;

/** A rooftop solar water heater, the Israeli roofline: a tank lying on top of a tilted collector. */
function Heater({ x, y }: { x: number; y: number }) {
  return (
    <G>
      <Line x1={x - 18} y1={y} x2={x - 18} y2={y - 34} stroke={K.ink} strokeWidth={3} />
      <Line x1={x + 18} y1={y} x2={x + 18} y2={y - 34} stroke={K.ink} strokeWidth={3} />
      <Rect x={x - 30} y={y - 58} width={60} height={22} rx={11} fill="#F4F1EA" stroke={K.ink} strokeWidth={3.5} />
      <Path d={`M${x - 34} ${y} L${x - 24} ${y - 34} L${x + 26} ${y - 34} L${x + 36} ${y}Z`} fill={K.navyLight} stroke={K.ink} strokeWidth={3.5} strokeLinejoin="round" />
      <Path d={`M${x - 15} ${y - 32} L${x - 20} ${y - 2} M${x + 1} ${y - 32} L${x + 1} ${y - 2} M${x + 17} ${y - 32} L${x + 22} ${y - 2}`} stroke={K.glass} strokeWidth={2} />
    </G>
  );
}

/** A window with a roller shutter (trisim) pulled down part way. */
function Window({ x, y, down }: { x: number; y: number; down: number }) {
  return (
    <G>
      <Rect x={x} y={y} width={50} height={50} fill={K.navy} stroke={K.ink} strokeWidth={3.5} />
      <Rect x={x} y={y} width={50} height={50 * down} fill="#CFC8B8" stroke={K.ink} strokeWidth={3.5} />
      {Array.from({ length: Math.floor(down * 8) }, (_, i) => (
        <Line key={i} x1={x + 3} y1={y + 6 + i * 6} x2={x + 47} y2={y + 6 + i * 6} stroke="#9E978A" strokeWidth={1.5} />
      ))}
      <Rect x={x - 4} y={y + 50} width={58} height={6} fill={K.wallDark} stroke={K.ink} strokeWidth={2.5} />
    </G>
  );
}

/** A thick arm from the shoulder through the elbow to the hand, in a sleeve colour and then (rolled up) in skin. */
function Arm({ d, color }: { d: string; color: string }) {
  return (
    <G>
      <Path d={d} stroke={K.ink} strokeWidth={40} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Path d={d} stroke={color} strokeWidth={32} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </G>
  );
}

/** A small burst of light, for sparks and shine. */
function Spark({ x, y, r, fill = K.yellow }: { x: number; y: number; r: number; fill?: string }) {
  const pts = Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * Math.PI * 2, rr = i % 2 ? r * 0.38 : r;
    return `${x + rr * Math.cos(a)},${y + rr * Math.sin(a)}`;
  });
  return <Path d={`M${pts.join('L')}Z`} fill={fill} stroke={K.ink} strokeWidth={3} strokeLinejoin="round" />;
}

/* 1. The building, early morning. */
const exterior = (
  <G>
    <Halftone />
    <Rect x={0} y={0} width={400} height={700} fill={K.pale} />
    <Circle cx={96} cy={150} r={62} fill={K.yellow} stroke={K.ink} strokeWidth={SW} />
    <Circle cx={96} cy={150} r={62} fill="url(#dotsBig)" />
    <Path d="M250 120 q8 -8 16 0 q8 -8 16 0 M300 160 q6 -6 12 0 q6 -6 12 0" stroke={K.ink} strokeWidth={3} fill="none" strokeLinecap="round" />
    {/* The street behind. */}
    <Path d="M0 420 L40 420 L40 380 L70 380 L70 640 L0 640Z M340 440 L372 440 L372 400 L400 400 L400 640 L340 640Z" fill="#E7C78C" stroke={K.ink} strokeWidth={3} />
    {/* The office block. */}
    <Rect x={60} y={300} width={290} height={340} fill="#EADFCB" stroke={K.ink} strokeWidth={SW + 1} />
    <Rect x={318} y={300} width={32} height={340} fill="url(#dots)" />
    <Rect x={52} y={290} width={306} height={14} fill={K.wallDark} stroke={K.ink} strokeWidth={SW} />
    <Heater x={110} y={290} />
    <Heater x={200} y={290} />
    <Heater x={292} y={290} />
    <Path d="M250 290 L250 222 M234 230 L266 230 M240 214 L260 214" stroke={K.ink} strokeWidth={3} strokeLinecap="round" />
    {[0, 1, 2].map((f) => [80, 150, 220, 290].map((x, n) =>
      f === 0 && n === 2 ? null : <Window key={`${f}-${n}`} x={x} y={316 + f * 85} down={[0.9, 0.5, 0.3, 0.7, 0.6, 1, 0.4, 0.8, 0.2, 0.55, 0.75, 0.45][f * 4 + n]} />))}
    {/* The one lit window on the third floor, with Zvi already at work. */}
    <Circle cx={245} cy={341} r={44} fill={K.lit} opacity={0.55} />
    <Rect x={220} y={316} width={50} height={50} fill={K.lit} stroke={K.ink} strokeWidth={3.5} />
    <Path d="M226 366 Q228 346 245 344 Q262 346 264 366Z" fill={K.navy} />
    <Circle cx={245} cy={334} r={10} fill={K.navy} />
    <Path d="M234 333 q-4 -6 1 -10 M256 333 q4 -6 -1 -10" stroke={K.navy} strokeWidth={4} fill="none" />
    <Rect x={216} y={366} width={58} height={6} fill={K.wallDark} stroke={K.ink} strokeWidth={2.5} />
    {[0, 1, 2].map((f) => <Rect key={f} x={60} y={378 + f * 85} width={290} height={6} fill={K.wallDark} />)}
    {/* The entrance and its sign. */}
    <Rect x={88} y={558} width={234} height={32} fill={K.navy} stroke={K.ink} strokeWidth={SW} />
    <SvgText x={205} y={581} fontSize={17} fontFamily={F.black} textAnchor="middle" fill={K.paper}>הלשכה למיפוי ישראל</SvgText>
    <Rect x={172} y={596} width={66} height={44} fill={K.glass} stroke={K.ink} strokeWidth={SW} />
    <Line x1={205} y1={596} x2={205} y2={640} stroke={K.ink} strokeWidth={3} />
    {/* A palm by the door. */}
    <Path d="M30 660 Q24 540 52 430" stroke={K.ink} strokeWidth={22} fill="none" strokeLinecap="round" />
    <Path d="M30 660 Q24 540 52 430" stroke={K.wood} strokeWidth={14} fill="none" strokeLinecap="round" />
    <Path d="M28 600 l12 -4 M28 560 l12 -4 M32 520 l12 -4 M38 480 l12 -4" stroke={K.woodDark} strokeWidth={3} />
    {[[-70, 20], [-30, -40], [20, -46], [70, 10], [40, 50], [-40, 54]].map(([dx, dy], i) => (
      <Path key={i} d={`M52 430 Q${52 + dx * 0.5} ${430 + dy - 30} ${52 + dx} ${430 + dy} Q${52 + dx * 0.4} ${430 + dy * 0.3} 52 430Z`} fill="#4E9A54" stroke={K.ink} strokeWidth={3} strokeLinejoin="round" />
    ))}
    {/* The pavement, with the red-and-white kerb. */}
    <Rect x={0} y={640} width={400} height={20} fill={K.sand} stroke={K.ink} strokeWidth={3} />
    {Array.from({ length: 10 }, (_, i) => <Rect key={i} x={i * 40} y={660} width={40} height={10} fill={i % 2 ? '#FFFFFF' : K.red} stroke={K.ink} strokeWidth={2} />)}
    <Rect x={0} y={670} width={400} height={30} fill="#5B6270" />
  </G>
);

/* 2. The lift, stuck again. */
const elevator = (
  <G>
    <Halftone />
    <Rect x={0} y={0} width={400} height={700} fill="#F2EAD8" />
    {/* Oil-painted lower wall, every Israeli stairwell. */}
    <Rect x={0} y={380} width={400} height={230} fill="#9CC5B4" />
    <Rect x={0} y={380} width={400} height={230} fill="url(#dotsBig)" />
    <Line x1={0} y1={380} x2={400} y2={380} stroke={K.ink} strokeWidth={3} />
    {/* Terrazzo floor. */}
    <Rect x={0} y={608} width={400} height={92} fill="#D9CBB0" stroke={K.ink} strokeWidth={SW} />
    {Array.from({ length: 40 }, (_, i) => <Circle key={i} cx={(i * 97) % 400} cy={620 + ((i * 53) % 76)} r={2 + (i % 3)} fill={['#8E7F66', '#B65A3A', '#4F4A42'][i % 3]} />)}
    <Path d="M0 650 L400 650 M100 608 L80 700 M220 608 L220 700 M340 608 L360 700" stroke="#A89878" strokeWidth={2} />
    {/* The lift: steel frame, the doors stuck half open, the car hanging between floors. */}
    <Rect x={92} y={160} width={216} height={448} fill={K.steel} stroke={K.ink} strokeWidth={SW + 1} />
    <Rect x={110} y={176} width={180} height={432} fill="#141414" stroke={K.ink} strokeWidth={SW} />
    <Path d="M180 176 L180 214 M220 176 L220 214" stroke="#5A5A5A" strokeWidth={4} />
    <Rect x={150} y={214} width={100} height={70} fill="#A9B2BC" stroke={K.ink} strokeWidth={SW} />
    <Rect x={150} y={276} width={100} height={12} fill="#6E7781" stroke={K.ink} strokeWidth={3} />
    <Rect x={110} y={176} width={68} height={432} fill="#B8C1CA" stroke={K.ink} strokeWidth={SW} />
    <Rect x={232} y={176} width={58} height={432} fill="#B8C1CA" stroke={K.ink} strokeWidth={SW} />
    <Rect x={110} y={176} width={20} height={432} fill="url(#dots)" />
    <Line x1={150} y1={190} x2={160} y2={590} stroke="#FFFFFF" strokeWidth={3} opacity={0.6} />
    {/* The floor indicator. */}
    <Rect x={210} y={104} width={88} height={44} rx={6} fill="#222" stroke={K.ink} strokeWidth={SW} />
    <SvgText x={254} y={138} fontSize={30} fontFamily={F.black} textAnchor="middle" fill={K.orange}>2½</SvgText>
    {/* The note on the door. */}
    <G transform="rotate(6 262 440) translate(0 110)">
      <Rect x={226} y={286} width={86} height={96} fill="#FFFFFF" stroke={K.ink} strokeWidth={3} />
      <Rect x={250} y={278} width={36} height={14} fill="#E9E1A8" opacity={0.85} />
      <SvgText x={269} y={318} fontSize={17} fontFamily={F.black} textAnchor="middle" fill={K.red}>מקולקלת.</SvgText>
      <SvgText x={269} y={342} fontSize={17} fontFamily={F.black} textAnchor="middle" fill={K.red}>שוב.</SvgText>
      <SvgText x={269} y={368} fontSize={12} fontFamily={F.bold} textAnchor="middle" fill={K.ink}>—ההנהלה</SvgText>
    </G>
    {/* Call button and the stairs sign. */}
    <Rect x={330} y={400} width={30} height={56} rx={4} fill={K.steel} stroke={K.ink} strokeWidth={3} />
    <Circle cx={345} cy={428} r={9} fill={K.red} stroke={K.ink} strokeWidth={3} />
    <G transform="translate(30 0)">
      <Rect x={14} y={250} width={66} height={64} rx={4} fill="#2E8B57" stroke={K.ink} strokeWidth={SW} />
      <Path d="M24 302 L36 302 L36 290 L48 290 L48 278 L60 278 L60 266 L70 266" stroke="#FFFFFF" strokeWidth={4} fill="none" />
      <Rect x={20} y={322} width={54} height={20} rx={3} fill="#FFFFFF" stroke={K.ink} strokeWidth={2.5} />
      <SvgText x={47} y={337} fontSize={14} fontFamily={F.black} textAnchor="middle" fill={K.ink}>מדרגות</SvgText>
    </G>
    <Sfx x={200} y={350} text="קלנק!" size={64} rot={-10} fill={K.orange} />
  </G>
);

/* 3. Zvi at his desk. The map behind him already has brown smudges on it. */
const desk = (
  <G>
    <Halftone />
    <Rect x={0} y={0} width={400} height={700} fill={K.wall} />
    <Rect x={0} y={420} width={400} height={140} fill="url(#dotsBig)" />
    <Rect x={292} y={110} width={96} height={290} fill={K.lit} stroke={K.ink} strokeWidth={SW} />
    {Array.from({ length: 14 }, (_, i) => <Line key={i} x1={292} y1={126 + i * 20} x2={388} y2={126 + i * 20} stroke="#C9A866" strokeWidth={5} />)}
    <WallMap x={16} y={140} w={140} h={290} smudges />
    <Zvi x={232} y={330} s={1.1} mood="talk" />
    {/* The desk. */}
    <Rect x={-10} y={540} width={420} height={170} fill={K.wood} stroke={K.ink} strokeWidth={SW + 1} />
    <Rect x={-10} y={540} width={420} height={16} fill={K.woodDark} stroke={K.ink} strokeWidth={SW} />
    <Path d="M20 590 Q120 580 220 596 T400 590 M0 640 Q140 626 260 644 T400 636" stroke={K.woodDark} strokeWidth={3} fill="none" />
    <Mug x={74} y={516} s={0.9} label="הלשכה" />
    <G transform="rotate(-4 160 540)">
      <Rect x={112} y={520} width={86} height={22} fill="#FFFFFF" stroke={K.ink} strokeWidth={3} />
      <Rect x={118} y={512} width={86} height={12} fill={K.paper} stroke={K.ink} strokeWidth={3} />
    </G>
    <ShokoBag x={318} y={512} s={0.55} rot={-10} straw />
    <Path d="M160 600 L310 600 L296 572 L174 572Z" fill={K.navy} stroke={K.ink} strokeWidth={3.5} strokeLinejoin="round" />
    <SvgText x={235} y={593} fontSize={16} fontFamily={F.black} textAnchor="middle" fill={K.paper}>צבי · מפות</SvgText>
  </G>
);

/* 4. Close-up: disaster. */
const worried = (
  <G>
    <Halftone />
    <Rays cx={200} cy={400} n={26} a={K.red} b={K.orange} />
    <Circle cx={200} cy={400} r={360} fill="url(#dotsBig)" />
    <Zvi x={200} y={410} s={2.05} mood="worried" />
    <Hand x={90} y={508} s={1.5} rot={16} />
    <Hand x={310} y={508} s={1.5} rot={-16} />
  </G>
);

/* 5. The server room: the bag tipped over on top of the rack. Biscuit crumbs on the floor (the clue of postcard 1). */
const server = (
  <G>
    <Halftone />
    <Rect x={0} y={0} width={400} height={700} fill="#0F1B33" />
    <Rect x={0} y={0} width={400} height={700} fill="url(#dotsBig)" />
    <Rect x={0} y={610} width={400} height={90} fill="#1E2C4A" stroke={K.ink} strokeWidth={SW} />
    <Path d="M0 650 L400 650 M90 610 L70 700 M200 610 L200 700 M310 610 L330 700" stroke="#33466E" strokeWidth={2} />
    {/* Smoke. */}
    {[[150, 96, 30], [186, 74, 36], [228, 92, 30], [262, 70, 26], [118, 70, 22]].map(([x, y, r], i) => (
      <Circle key={i} cx={x} cy={y} r={r} fill="#8A93A6" stroke={K.ink} strokeWidth={3} opacity={0.85} />
    ))}
    {/* The rack. */}
    <Rect x={106} y={168} width={196} height={446} rx={6} fill="#2B3242" stroke={K.ink} strokeWidth={SW + 1} />
    {Array.from({ length: 9 }, (_, i) => (
      <G key={i}>
        <Rect x={120} y={186 + i * 46} width={168} height={38} fill="#3A4357" stroke={K.ink} strokeWidth={2.5} />
        <Path d={`M196 ${196 + i * 46} L270 ${196 + i * 46} M196 ${204 + i * 46} L270 ${204 + i * 46} M196 ${212 + i * 46} L270 ${212 + i * 46}`} stroke="#252B38" strokeWidth={2.5} />
        <Circle cx={136} cy={205 + i * 46} r={5} fill={i === 3 || i === 6 ? '#FF4D3A' : '#5BE37D'} stroke={K.ink} strokeWidth={1.5} />
        <Circle cx={154} cy={205 + i * 46} r={5} fill={i === 3 ? '#FF4D3A' : '#5BE37D'} stroke={K.ink} strokeWidth={1.5} />
      </G>
    ))}
    {/* Chocolate milk all over it. */}
    <Path d="M100 172 Q140 150 200 158 Q260 150 306 170 Q300 182 290 178 L288 250 Q286 262 280 250 L278 180 Q250 186 236 182 L234 330 Q232 346 226 330 L224 184 Q180 186 160 182 L158 226 Q156 238 150 226 L148 182 Q120 186 100 172Z"
      fill={K.shoko} stroke={K.ink} strokeWidth={3} strokeLinejoin="round" />
    <Path d="M140 164 Q170 156 200 162" stroke="#B07A50" strokeWidth={4} fill="none" strokeLinecap="round" />
    <ShokoBag x={226} y={142} s={0.75} rot={102} straw />
    <Spark x={300} y={300} r={26} />
    <Spark x={104} y={430} r={20} />
    <Spark x={292} y={470} r={14} fill="#FFFFFF" />
    {/* A puddle and the crumbs. */}
    <Ellipse cx={230} cy={640} rx={60} ry={12} fill={K.shoko} stroke={K.ink} strokeWidth={3} />
    <G transform="rotate(-18 72 650)">
      <Rect x={50} y={638} width={44} height={26} rx={3} fill="#E3B26A" stroke={K.ink} strokeWidth={3} />
      {[0, 1, 2].map((i) => <Circle key={i} cx={60 + i * 12} cy={651} r={2} fill={K.woodDark} />)}
    </G>
    {[[110, 664], [124, 652], [138, 670], [98, 676]].map(([x, y], i) => <Rect key={i} x={x} y={y} width={6} height={5} fill="#E3B26A" stroke={K.ink} strokeWidth={1.5} />)}
    <Sfx x={306} y={150} text="פלופ!" size={52} rot={10} fill="#C8874E" />
    <Sfx x={92} y={530} text="בזזזט!" size={46} rot={-14} fill={K.yellow} />
  </G>
);

/* 6. The map, empty. Pulls back to reveal it. */
const empty = (
  <G>
    <Halftone />
    <Rect x={0} y={0} width={400} height={700} fill={K.wall} />
    <Rect x={0} y={0} width={400} height={700} fill="url(#dotsBig)" />
    <WallMap x={44} y={66} w={312} h={580} smudges />
    {[[150, 200, -12], [240, 330, 10], [172, 420, -6], [214, 540, 14], [120, 300, 6]].map(([x, y, r], i) => (
      <SvgText key={i} x={x} y={y} fontSize={44} fontFamily={F.stamp} textAnchor="middle" fill={K.red} stroke={K.ink} strokeWidth={1.5} transform={`rotate(${r} ${x} ${y})`}>?</SvgText>
    ))}
    {/* Zvi's pointer, from the corner. */}
    <Line x1={420} y1={720} x2={226} y2={436} stroke={K.ink} strokeWidth={11} strokeLinecap="round" />
    <Line x1={420} y1={720} x2={226} y2={436} stroke={K.wood} strokeWidth={6} strokeLinecap="round" />
    <Circle cx={226} cy={436} r={6} fill={K.red} stroke={K.ink} strokeWidth={2.5} />
    <Hand x={366} y={652} s={1.2} rot={-36} />
  </G>
);

/* 7. The mission: a blank postcard on the desk, seen from above. */
const mission = (
  <G>
    <Halftone />
    <Rect x={0} y={0} width={400} height={700} fill={K.wood} />
    {Array.from({ length: 12 }, (_, i) => (
      <Path key={i} d={`M-10 ${i * 62 + 20} Q100 ${i * 62 + 4} 200 ${i * 62 + 24} T410 ${i * 62 + 14}`} stroke={K.woodDark} strokeWidth={2.5} fill="none" opacity={0.7} />
    ))}
    <Circle cx={320} cy={168} r={38} fill="none" stroke="#4A2C14" strokeWidth={6} opacity={0.45} strokeDasharray="160 30" />
    <G transform="rotate(-5 200 360)">
      <Rect x={58} y={268} width={300} height={200} fill={K.ink} />
      <Rect x={50} y={260} width={300} height={200} fill={K.paper} stroke={K.ink} strokeWidth={SW + 1} />
      <Line x1={200} y1={284} x2={200} y2={440} stroke={K.ink} strokeWidth={2.5} />
      <SvgText x={126} y={298} fontSize={24} fontFamily={F.display} textAnchor="middle" fill={K.navy}>גלויה</SvgText>
      {[330, 360, 390, 420].map((y) => <Line key={y} x1={68} y1={y} x2={184} y2={y} stroke="#C9B48C" strokeWidth={2} strokeDasharray="5 5" />)}
      {[372, 402, 432].map((y) => <Line key={y} x1={214} y1={y} x2={334} y2={y} stroke={K.ink} strokeWidth={2} />)}
      <Rect x={274} y={274} width={60} height={70} fill={K.orange} stroke={K.paper} strokeWidth={5} strokeDasharray="4 3" />
      <Rect x={278} y={278} width={52} height={62} fill="none" stroke={K.ink} strokeWidth={2.5} />
      <IsraelMap x={291} y={282} h={52} />
      <Circle cx={268} cy={322} r={24} fill="none" stroke={K.ink} strokeWidth={2.5} opacity={0.65} />
      <SvgText x={268} y={326} fontSize={10} fontFamily={F.black} textAnchor="middle" fill={K.ink} opacity={0.65}>הלשכה</SvgText>
      <Path d="M214 314 q8 -6 16 0 t16 0 M214 326 q8 -6 16 0 t16 0" stroke={K.ink} strokeWidth={2} fill="none" opacity={0.65} />
    </G>
    {/* The rubber stamp and its pad, a pen, a paper clip. */}
    <Rect x={46} y={556} width={96} height={56} rx={6} fill={K.red} stroke={K.ink} strokeWidth={SW} />
    <Rect x={56} y={566} width={76} height={36} rx={3} fill="#8E1E10" />
    <Ellipse cx={120} cy={540} rx={26} ry={10} fill={K.woodDark} stroke={K.ink} strokeWidth={3} />
    <Rect x={110} y={498} width={20} height={42} fill={K.woodDark} stroke={K.ink} strokeWidth={3} />
    <Circle cx={120} cy={494} r={16} fill={K.wood} stroke={K.ink} strokeWidth={3} />
    <G transform="rotate(32 300 590)">
      <Rect x={220} y={578} width={170} height={20} rx={10} fill={K.navy} stroke={K.ink} strokeWidth={3.5} />
      <Rect x={340} y={578} width={50} height={20} rx={10} fill={K.orange} stroke={K.ink} strokeWidth={3.5} />
      <Path d="M220 588 L200 588" stroke={K.ink} strokeWidth={4} strokeLinecap="round" />
    </G>
    <Path d="M70 150 L70 214 Q70 226 82 226 Q94 226 94 214 L94 160 Q94 152 86 152 Q78 152 78 160 L78 206" stroke="#C4CCD4" strokeWidth={4} fill="none" strokeLinecap="round" />
  </G>
);

/** Where a place falls inside a WallMap drawn at (x, y, w, h); matches the layout in parts.tsx. */
function onWallMap(id: string, x: number, y: number, w: number, h: number) {
  const mh = h - 30, s = mh / 440;
  const p = BY[id];
  return { x: x + w / 2 - (184 * s) / 2 + (p.x + 82) * s, y: y + 15 + (p.y + 212) * s };
}

/** Names written in marker beside the ringed cities; `west` ones go to the left of the dot. */
function CityLabels({ x, y, w, h, names, west }: { x: number; y: number; w: number; h: number; names: Record<string, string>; west: string[] }) {
  return (
    <G>
      {Object.entries(names).map(([id, name]) => {
        const p = onWallMap(id, x, y, w, h), left = west.includes(id);
        const lx = left ? p.x - 19 : p.x + 19;
        return (
          <G key={id}>
            <SvgText x={lx} y={p.y + 5} fontSize={14} fontFamily={F.black} textAnchor={left ? 'end' : 'start'} fill={K.paper} stroke={K.paper} strokeWidth={5} strokeLinejoin="round">{name}</SvgText>
            <SvgText x={lx} y={p.y + 5} fontSize={14} fontFamily={F.black} textAnchor={left ? 'end' : 'start'} fill={K.red}>{name}</SvgText>
          </G>
        );
      })}
    </G>
  );
}

const jlm = onWallMap('jlm', 30, 56, 240, 470);
const grip = { x: 214, y: 392 };
/* 8. Zvi points at the six big cities. */
const pointer = (
  <G>
    <Halftone />
    <Rect x={0} y={0} width={400} height={700} fill={K.wall} />
    <Rect x={0} y={460} width={400} height={240} fill="url(#dotsBig)" />
    <WallMap x={30} y={56} w={240} h={470} dots={BIG} ring />
    <CityLabels x={30} y={56} w={240} h={470} west={['hfa', 'ntn', 'tlv', 'asd', 'bsh']}
      names={{ jlm: 'ירושלים', tlv: 'תל אביב', hfa: 'חיפה', bsh: 'באר שבע', asd: 'אשדוד', ntn: 'נתניה' }} />
    <Zvi x={306} y={408} s={0.9} mood="talk" look={[-6, -2]} />
    <Arm d={`M232 510 Q200 470 ${grip.x} ${grip.y}`} color={K.navy} />
    <Line x1={grip.x} y1={grip.y} x2={jlm.x + 7} y2={jlm.y + 14} stroke={K.ink} strokeWidth={10} strokeLinecap="round" />
    <Line x1={grip.x} y1={grip.y} x2={jlm.x + 7} y2={jlm.y + 14} stroke={K.wood} strokeWidth={5} strokeLinecap="round" />
    <Hand x={grip.x} y={grip.y} s={0.8} rot={-28} />
  </G>
);
/* 10. Proud Zvi, sleeves rolled up, the six cities lit. */
const proud = (
  <G>
    <Halftone />
    <Rays cx={230} cy={330} n={24} a={K.yellow} b={K.pale} />
    <IsraelMap x={40} y={150} h={340} dots={BIG} glow />
    <Zvi x={214} y={432} s={1.12} mood="proud" />
    <Arm d="M322 548 Q352 492 344 438" color={K.navy} />
    <Arm d="M344 438 Q332 380 308 330" color={K.skin} />
    <Ellipse cx={344} cy={440} rx={24} ry={13} fill={K.navyLight} stroke={K.ink} strokeWidth={3.5} />
    <Fist x={304} y={300} s={1.25} rot={-10} />
    <Spark x={350} y={244} r={16} fill="#FFFFFF" />
    <Spark x={268} y={266} r={11} fill="#FFFFFF" />
  </G>
);

/* 9. The Old Man on the wall. */
const oldMan = (
  <G>
    <Halftone />
    <Rays cx={200} cy={200} n={30} a={K.wall} b="#F1DCB1" />
    <OldManPortrait x={84} y={56} w={232} h={300} />
    <Rect x={146} y={370} width={108} height={28} rx={3} fill="#C9A24A" stroke={K.ink} strokeWidth={3} />
    <SvgText x={200} y={390} fontSize={14} fontFamily={F.black} textAnchor="middle" fill={K.ink}>בן־גוריון</SvgText>
    <Rect x={0} y={470} width={400} height={230} fill="url(#dotsBig)" />
    <Zvi x={286} y={470} s={0.8} look={[-5, -8]} />
  </G>
);

/** The opening comic. `t` resolves the {masculine|feminine} forms. */
export function chapterOne(t: (s: string) => string): Panel[] {
  return [
    {
      art: exterior, focus: [0.61, 0.49], amount: 1.16,
      bubbles: [
        { kind: 'cap', text: 'יום ראשון, 08:00.', x: 0.05, y: 0.04, w: 0.5 },
        { kind: 'cap', text: 'קומה 3. צבי כבר בפנים.', x: 0.38, y: 0.2, w: 0.58 },
      ],
    },
    {
      art: elevator, focus: [0.52, 0.34], amount: 1.12,
      bubbles: [
        { kind: 'cap', text: 'המעלית, כרגיל, תקועה.', x: 0.03, y: 0.04, w: 0.47 },
        { kind: 'cap', text: 'קומה 3, ברגל.', x: 0.5, y: 0.87, w: 0.44 },
      ],
    },
    {
      art: desk, focus: [0.56, 0.5],
      bubbles: [
        { kind: 'say', text: '31 שנה אני מצייר את המדינה הזאת.', x: 0.04, y: 0.04, w: 0.64, tail: { at: 0.78, lean: 0.6 } },
        { kind: 'say', text: t('{אתה החדש|את החדשה}? מעולה.'), x: 0.4, y: 0.21, w: 0.56, tail: { at: 0.4, lean: -0.3 } },
      ],
    },
    {
      art: worried, focus: [0.5, 0.56], amount: 1.2,
      bubbles: [{ kind: 'shout', text: 'יש אסון.', x: 0.22, y: 0.06, w: 0.56 }],
    },
    {
      art: server, focus: [0.56, 0.32], amount: 1.14,
      bubbles: [{ kind: 'cap', text: 'מישהו שפך שוקו על השרת.', x: 0.36, y: 0.88, w: 0.6 }],
    },
    {
      art: empty, focus: [0.5, 0.48], zoom: 'out', amount: 1.3,
      bubbles: [
        { kind: 'say', text: 'כל היישובים נמחקו מהמפה.', x: 0.04, y: 0.03, w: 0.62 },
        { kind: 'shout', text: 'כולם.', x: 0.06, y: 0.83, w: 0.34 },
      ],
    },
    {
      art: mission, focus: [0.5, 0.52], amount: 1.14,
      bubbles: [
        { kind: 'cap', text: 'המשימה שלך: להחזיר את היישובים למפה, אחד אחד.', x: 0.05, y: 0.04, w: 0.9 },
        { kind: 'cap', text: 'כל גלויה, אזור אחד.', x: 0.06, y: 0.87, w: 0.5 },
      ],
    },
    {
      art: pointer, focus: [0.32, 0.4], amount: 1.08,
      bubbles: [
        { kind: 'say', text: 'מתחילים מהגדולות: שש ערים, שש עוגנים.', x: 0.4, y: 0.03, w: 0.57, tail: { at: 0.72, lean: 0.2 } },
        { kind: 'you', text: 'למה דווקא הגדולות?', x: 0.05, y: 0.85, w: 0.56, tail: { at: 0.3 } },
      ],
    },
    {
      art: oldMan, focus: [0.55, 0.36], amount: 1.1,
      bubbles: [
        { kind: 'say', text: 'כמו שאמר הזקן:', x: 0.04, y: 0.62, w: 0.46, tail: { at: 0.85, lean: 0.9 } },
        { kind: 'cap', big: true, text: '״עתידו של נוער זה הוא בעבודה.״\n— דוד בן־גוריון', x: 0.05, y: 0.8, w: 0.9 },
      ],
    },
    {
      art: proud, focus: [0.52, 0.45], amount: 1.08,
      bubbles: [
        { kind: 'say', text: 'קודם עובדים קשה על הגדולות. אחר כך כל השאר ייתלה עליהן.', x: 0.04, y: 0.03, w: 0.7, tail: { at: 0.8, lean: 0.4 } },
        { kind: 'shout', text: t('{בוא|בואי} לעבודה!'), x: 0.16, y: 0.84, w: 0.62 },
      ],
    },
  ];
}
