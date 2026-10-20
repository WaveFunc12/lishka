import { Circle, Ellipse, G, Line, Path, Rect } from 'react-native-svg';
import type { Panel } from '../ComicPlayer';
import { Halftone, K, Rays, Sfx } from '../parts';
import { Dunes, House, Person, Rider, Sun } from '../people';

/* Be'er Sheva: Abraham's well and the oath, the Ottoman grid town of 1900, and the Light Horse charge of 1917. */

/** A lamb: a white cloud of wool with a dark face. */
const Lamb = ({ x, y, s = 1, flip }: { x: number; y: number; s?: number; flip?: boolean }) => (
  <G transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
    {[[-6, 22], [14, 22]].map(([lx, ly], i) => <Line key={i} x1={lx} y1={ly - 8} x2={lx} y2={ly + 6} stroke={K.ink} strokeWidth={5} strokeLinecap="round" />)}
    {[[-14, 0, 13], [0, -6, 14], [14, 0, 13], [0, 8, 14], [-8, 10, 11], [10, 10, 11]].map(([cx, cy, r], i) => (
      <Circle key={i} cx={cx} cy={cy} r={r} fill="#FFFFFF" stroke={K.ink} strokeWidth={3} />
    ))}
    {[[-14, 0, 11], [0, -6, 12], [14, 0, 11], [0, 8, 12]].map(([cx, cy, r], i) => <Circle key={'f' + i} cx={cx} cy={cy} r={r} fill="#FFFFFF" />)}
    <Ellipse cx={-26} cy={-4} rx={9} ry={11} fill="#3A2A1E" stroke={K.ink} strokeWidth={2.5} />
    <Circle cx={-29} cy={-6} r={2} fill="#FFFFFF" />
  </G>
);

/** A stone well with a wooden beam and a rope. */
const Well = ({ x, y }: { x: number; y: number }) => (
  <G>
    <Line x1={x - 56} y1={y - 10} x2={x - 50} y2={y - 110} stroke={K.ink} strokeWidth={10} />
    <Line x1={x + 56} y1={y - 10} x2={x + 50} y2={y - 110} stroke={K.ink} strokeWidth={10} />
    <Line x1={x - 56} y1={y - 10} x2={x - 50} y2={y - 110} stroke={K.wood} strokeWidth={5} />
    <Line x1={x + 56} y1={y - 10} x2={x + 50} y2={y - 110} stroke={K.wood} strokeWidth={5} />
    <Rect x={x - 64} y={y - 118} width={128} height={14} fill={K.wood} stroke={K.ink} strokeWidth={3} />
    <Line x1={x} y1={y - 104} x2={x} y2={y - 40} stroke={K.ink} strokeWidth={2.5} />
    <Path d={`M${x - 12} ${y - 40} L${x + 12} ${y - 40} L${x + 9} ${y - 22} L${x - 9} ${y - 22}Z`} fill={K.wood} stroke={K.ink} strokeWidth={3} />
    <Path d={`M${x - 70} ${y - 10} L${x + 70} ${y - 10} L${x + 66} ${y + 40} Q${x} ${y + 52} ${x - 66} ${y + 40}Z`} fill="#CDB68A" stroke={K.ink} strokeWidth={4} />
    <Ellipse cx={x} cy={y - 10} rx={70} ry={14} fill="#3A2A1E" stroke={K.ink} strokeWidth={4} />
    {[-50, -16, 18, 52].map((d) => <Path key={d} d={`M${x + d} ${y + 6} L${x + d + 24} ${y + 6} M${x + d - 14} ${y + 24} L${x + d + 10} ${y + 24}`} stroke="#9C8458" strokeWidth={2.5} />)}
  </G>
);

/* 1. Abraham and Abimelech at the well. */
const oath = (
  <G>
    <Halftone />
    <Rect x={0} y={0} width={400} height={700} fill="#F7DFA8" />
    <Sun x={320} y={120} r={52} />
    <Dunes y={330} fill="#E9C98C" />
    <Well x={200} y={460} />
    <Person x={84} y={600} s={1.1} robe coat="#E8DDC8" hat="cloth" hatColor="#F4F1EA" beard="#F4F1EA" hair="#F4F1EA" pose="hold" />
    <Person x={316} y={600} s={1.1} robe coat="#7A2E5A" hat="crown" beard="#3A2A1E" pose="hold" flip />
    {Array.from({ length: 7 }, (_, i) => <Lamb key={i} x={44 + i * 52} y={628 - (i % 2) * 14} s={0.9} flip={i % 3 === 0} />)}
  </G>
);

/* 2. 1900: an Ottoman town laid out on a grid in the desert. */
const grid = (
  <G>
    <Halftone />
    <Rect x={0} y={0} width={400} height={700} fill="#F7DFA8" />
    <Rect x={0} y={0} width={400} height={300} fill="url(#dotsBig)" />
    {/* Bedouin tents far off. */}
    <Path d="M20 300 L50 276 L80 300Z M320 296 L346 274 L372 296Z" fill="#3A2A1E" stroke={K.ink} strokeWidth={3} />
    <Rect x={-10} y={300} width={420} height={410} fill="#E9C98C" stroke={K.ink} strokeWidth={4} />
    {/* The grid of straight streets, in perspective. */}
    {[0, 1, 2, 3, 4].map((i) => <Line key={'h' + i} x1={-10} y1={330 + i * i * 18 + i * 20} x2={410} y2={330 + i * i * 18 + i * 20} stroke="#C9A866" strokeWidth={4} />)}
    {[-3, -2, -1, 0, 1, 2, 3].map((i) => <Line key={'v' + i} x1={200 + i * 40} y1={310} x2={200 + i * 150} y2={700} stroke="#C9A866" strokeWidth={4} />)}
    {/* The Governor's House with its arches, and the mosque. */}
    <Rect x={50} y={250} width={150} height={90} fill="#EADAB4" stroke={K.ink} strokeWidth={4} />
    {[70, 105, 140, 175].map((x) => <Path key={x} d={`M${x - 12} 340 L${x - 12} 312 Q${x} 296 ${x + 12} 312 L${x + 12} 340Z`} fill={K.navyLight} stroke={K.ink} strokeWidth={2.5} />)}
    {[70, 105, 140, 175].map((x) => <Rect key={'w' + x} x={x - 8} y={264} width={16} height={22} fill={K.navyLight} stroke={K.ink} strokeWidth={2.5} />)}
    <Rect x={50} y={250} width={24} height={90} fill="url(#dots)" />
    <House x={240} y={270} w={90} h={70} fill="#F0E2C2" dome windows={2} />
    <Rect x={336} y={180} width={20} height={160} fill="#F0E2C2" stroke={K.ink} strokeWidth={4} />
    <Path d="M332 180 L346 150 L360 180Z" fill={K.teal} stroke={K.ink} strokeWidth={3.5} strokeLinejoin="round" />
    <Rect x={330} y={222} width={32} height={8} fill="#F0E2C2" stroke={K.ink} strokeWidth={3} />
    {/* The official with the plan. */}
    <Person x={110} y={700} s={1.25} coat="#2B3A55" hat="fez" moustache pose="hold" />
    <G transform="rotate(-8 190 560)">
      <Rect x={130} y={500} width={130} height={100} fill="#FFFFFF" stroke={K.ink} strokeWidth={4} />
      {[1, 2, 3, 4].map((i) => <Line key={'a' + i} x1={130 + i * 26} y1={500} x2={130 + i * 26} y2={600} stroke={K.navyLight} strokeWidth={2} />)}
      {[1, 2, 3].map((i) => <Line key={'b' + i} x1={130} y1={500 + i * 25} x2={260} y2={500 + i * 25} stroke={K.navyLight} strokeWidth={2} />)}
    </G>
  </G>
);

/* 3. 31 October 1917, toward sunset: the charge. */
const charge = (
  <G>
    <Halftone />
    <Rays cx={200} cy={330} n={24} a="#F4A04A" b="#F7C873" />
    <Sun x={200} y={330} r={70} fill="#FCE3A8" />
    {/* The town and its minaret on the skyline. */}
    <Path d="M120 380 L120 350 L160 350 L160 336 L200 336 L200 352 L250 352 L250 380Z" fill="#5A3A22" />
    <Rect x={262} y={300} width={10} height={80} fill="#5A3A22" />
    <Path d="M258 300 L267 284 L276 300Z" fill="#5A3A22" />
    <Rect x={-10} y={380} width={420} height={330} fill="#D98A3E" stroke={K.ink} strokeWidth={4} />
    <Rect x={-10} y={380} width={420} height={330} fill="url(#dotsBig)" />
    {/* Dust behind the horses. */}
    {[[330, 470, 40], [370, 520, 46], [300, 560, 34], [380, 600, 50], [330, 640, 40]].map(([x, y, r], i) => <Circle key={i} cx={x} cy={y} r={r} fill="#E8B878" opacity={0.85} />)}
    <Rider x={240} y={470} s={0.72} />
    <Rider x={150} y={560} s={0.92} />
    <Rider x={270} y={646} s={1.05} />
    <Sfx x={110} y={430} text="דגדג דגדג" size={44} rot={-8} fill={K.yellow} />
  </G>
);

export const beersheva = {
  title: 'באר שבע',
  panels: (t: (s: string) => string, today: string): Panel[] => [
    {
      art: oath, focus: [0.5, 0.7],
      bubbles: [
        { kind: 'cap', text: 'לפי התנ״ך: אברהם ואבימלך כורתים ברית ליד באר. שבע כבשות לעדות, ושבועה אחת.', x: 0.04, y: 0.03, w: 0.92 },
        { kind: 'say', text: 'מעכשיו קוראים למקום ״באר שבע״.', x: 0.04, y: 0.33, w: 0.56, tail: { at: 0.25, lean: -0.3 } },
      ],
    },
    {
      art: grid, focus: [0.45, 0.62],
      bubbles: [
        { kind: 'cap', text: '1900. העות׳מאנים מקימים עיר במדבר, כדי לשלוט בשבטי הבדואים. הרחובות ישרים, כמו משבצות.', x: 0.04, y: 0.03, w: 0.92 },
        { kind: 'say', text: 'עד שבית המושל יהיה מוכן, אני גר באוהל ששאלתי משייח׳.', x: 0.42, y: 0.47, w: 0.54, tail: { at: 0.12, lean: -0.7 } },
      ],
    },
    {
      art: charge, focus: [0.45, 0.65],
      bubbles: [
        { kind: 'cap', text: '31 באוקטובר 1917, לפני השקיעה. כ־500 פרשים אוסטרלים דוהרים לעיר ותופסים את הבארות.', x: 0.04, y: 0.03, w: 0.92 },
        { kind: 'cap', text: today, x: 0.44, y: 0.89, w: 0.52 },
      ],
    },
  ],
};
