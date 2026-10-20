import { Circle, G, Line, Path, Rect } from 'react-native-svg';
import type { Panel } from '../ComicPlayer';
import { Halftone, K, Sfx } from '../parts';
import { Dunes, Person, Sea, Ship, Sun } from '../people';

/* Ashdod: the Philistine city and the fall of Dagon, the new city on the dunes in 1956, and the first ship in the port. */

/** The Ark of the Covenant: a gold chest with two winged cherubim and its carrying poles. */
const Ark = ({ x, y }: { x: number; y: number }) => (
  <G>
    <Circle cx={x} cy={y - 30} r={90} fill={K.lit} opacity={0.35} />
    <Line x1={x - 110} y1={y + 10} x2={x + 110} y2={y + 10} stroke={K.ink} strokeWidth={10} strokeLinecap="round" />
    <Line x1={x - 110} y1={y + 10} x2={x + 110} y2={y + 10} stroke="#C9962A" strokeWidth={5} strokeLinecap="round" />
    <Rect x={x - 70} y={y - 20} width={140} height={70} fill="#E9B935" stroke={K.ink} strokeWidth={4} />
    <Rect x={x - 70} y={y - 20} width={140} height={70} fill="url(#dots)" />
    <Rect x={x - 76} y={y - 30} width={152} height={14} fill="#F2C230" stroke={K.ink} strokeWidth={4} />
    {[-1, 1].map((d) => (
      <G key={d}>
        <Circle cx={x + d * 34} cy={y - 50} r={12} fill="#F2C230" stroke={K.ink} strokeWidth={3} />
        <Path d={`M${x + d * 34} ${y - 34} Q${x + d * 30} ${y - 60} ${x + d * 4} ${y - 80} Q${x + d * 40} ${y - 74} ${x + d * 56} ${y - 34}Z`} fill="#F2C230" stroke={K.ink} strokeWidth={3} strokeLinejoin="round" />
      </G>
    ))}
  </G>
);

/* 1. Dagon on the floor before the Ark. */
const dagon = (
  <G>
    <Halftone />
    <Rect x={0} y={0} width={400} height={700} fill="#3A2C3E" />
    <Rect x={0} y={0} width={400} height={700} fill="url(#dotsBig)" />
    {[30, 330].map((x) => (
      <G key={x}>
        <Rect x={x} y={120} width={44} height={420} fill="#8C7A64" stroke={K.ink} strokeWidth={4} />
        <Rect x={x - 8} y={110} width={60} height={20} fill="#A08C72" stroke={K.ink} strokeWidth={4} />
        <Rect x={x} y={120} width={14} height={420} fill="url(#dots)" />
      </G>
    ))}
    <Rect x={-10} y={540} width={420} height={170} fill="#6B5A48" stroke={K.ink} strokeWidth={4} />
    <Rect x={140} y={300} width={180} height={40} fill="#8C7A64" stroke={K.ink} strokeWidth={4} />
    <Ark x={230} y={270} />
    {/* Dagon, the fish-tailed idol, face down and broken. */}
    <G transform="rotate(-6 200 560)">
      <Path d="M70 560 Q120 520 220 530 L270 532 Q320 520 350 500 L346 540 L370 566 Q320 560 270 570 L220 576 Q120 590 70 560Z" fill="#7FA6A0" stroke={K.ink} strokeWidth={4} strokeLinejoin="round" />
      {[150, 190, 230, 270].map((x) => <Path key={x} d={`M${x} 540 q10 10 0 22`} stroke={K.ink} strokeWidth={2} fill="none" />)}
      <Path d="M70 560 Q90 540 116 544" stroke={K.ink} strokeWidth={3} fill="none" />
    </G>
    <Circle cx={66} cy={610} r={24} fill="#7FA6A0" stroke={K.ink} strokeWidth={4} />
    <Path d="M52 600 L58 606 M72 600 L78 606 M60 620 Q66 616 72 620" stroke={K.ink} strokeWidth={3} />
    <Path d="M330 600 L350 590 L360 610 L340 618Z M110 612 L124 604 L130 618Z" fill="#7FA6A0" stroke={K.ink} strokeWidth={3} />
    {/* A Philistine guard in his feather crown. */}
    <Person x={322} y={720} s={1} coat="#9C3B2A" hat="feathers" pose="cheer" mouth="shout" flip />
    <Sfx x={130} y={470} text="בום!" size={62} rot={-12} fill={K.orange} />
  </G>
);

/** A theodolite on its tripod, for the surveyors laying out the new city. */
const Theodolite = ({ x, y }: { x: number; y: number }) => (
  <G>
    <Path d={`M${x} ${y - 90} L${x - 34} ${y} M${x} ${y - 90} L${x + 34} ${y} M${x} ${y - 90} L${x + 4} ${y}`} stroke={K.ink} strokeWidth={6} />
    <Path d={`M${x} ${y - 90} L${x - 34} ${y} M${x} ${y - 90} L${x + 34} ${y}`} stroke={K.wood} strokeWidth={3} />
    <Rect x={x - 16} y={y - 120} width={32} height={30} rx={4} fill={K.yellow} stroke={K.ink} strokeWidth={3.5} />
    <Rect x={x - 30} y={y - 116} width={22} height={12} rx={4} fill={K.ink} />
  </G>
);

/* 2. 1956: a port city planned on the sand, and the first families. */
const dunes = (
  <G>
    <Halftone />
    <Rect x={0} y={0} width={400} height={700} fill="#CDE7EA" />
    <Sun x={80} y={110} r={44} />
    <Sea y={240} to={300} />
    <Dunes y={290} />
    {/* Survey stakes with flags, where the streets will go. */}
    {[[90, 360], [170, 350], [250, 360], [330, 352]].map(([x, y], i) => (
      <G key={i}>
        <Line x1={x} y1={y} x2={x} y2={y - 46} stroke={K.ink} strokeWidth={3} />
        <Path d={`M${x} ${y - 46} L${x + 22} ${y - 40} L${x} ${y - 34}Z`} fill={K.red} stroke={K.ink} strokeWidth={2} />
      </G>
    ))}
    <Path d="M90 360 L330 352" stroke={K.red} strokeWidth={2} strokeDasharray="6 6" />
    <Theodolite x={150} y={560} />
    <Person x={96} y={600} s={0.95} coat="#C8B27A" pants="#C8B27A" hat="tembel" pose="hold" flip />
    {/* A family with suitcases. */}
    <Person x={250} y={660} s={1} coat="#5A6E8C" hat="fedora" moustache />
    <Person x={318} y={664} s={0.95} dress coat={K.orange} hat="scarf" hatColor="#FFFFFF" flip />
    <Person x={286} y={680} s={0.55} coat={K.teal} />
    <Rect x={200} y={612} width={34} height={44} rx={4} fill={K.wood} stroke={K.ink} strokeWidth={3.5} />
    <Rect x={348} y={622} width={30} height={40} rx={4} fill="#7A3B2A" stroke={K.ink} strokeWidth={3.5} />
  </G>
);

/* 3. 21 November 1965: the first ship comes into the new port. */
const port = (
  <G>
    <Halftone />
    <Rect x={0} y={0} width={400} height={700} fill="#CDE7EA" />
    <Rect x={0} y={0} width={400} height={260} fill="url(#dotsBig)" />
    <Sea y={260} to={560} />
    {/* The breakwater. */}
    <Path d="M-10 300 L180 300 L190 320 L-10 320Z" fill="#9AA3AD" stroke={K.ink} strokeWidth={4} />
    {Array.from({ length: 8 }, (_, i) => <Rect key={i} x={i * 24} y={292} width={18} height={12} fill="#B8C1CA" stroke={K.ink} strokeWidth={2} transform={`rotate(${(i * 23) % 30 - 15} ${i * 24 + 9} 298)`} />)}
    <Ship x={204} y={400} s={0.8} name="VINGALAND" />
    <Path d="M272 316 q-6 -20 6 -34 q14 -14 4 -34" stroke="#FFFFFF" strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.85} />
    {/* The quay and the crowd. */}
    <Rect x={-10} y={540} width={420} height={170} fill="#B9B2A4" stroke={K.ink} strokeWidth={4} />
    <Rect x={-10} y={540} width={420} height={18} fill="#8E877A" stroke={K.ink} strokeWidth={3} />
    {[[50, 700, K.navy, 'cap'], [120, 690, '#FFFFFF', 'none'], [200, 700, K.orange, 'none'], [280, 690, '#5A6E8C', 'kippah'], [350, 700, K.teal, 'tembel']].map(([x, y, c, h], i) => (
      <Person key={i} x={x as number} y={y as number} s={0.72} coat={c as string} hat={h as 'cap'} pose={i % 2 ? 'cheer' : 'wave'} mouth="open" dress={i === 2} flip={i > 2} />
    ))}
    <Sfx x={290} y={216} text="טווווט!" size={44} rot={8} fill="#FFFFFF" />
  </G>
);

export const ashdod = {
  title: 'אשדוד',
  panels: (t: (s: string) => string, today: string): Panel[] => [
    {
      art: dagon, focus: [0.5, 0.6],
      bubbles: [
        { kind: 'cap', text: 'לפני כ־3,000 שנה אשדוד היא אחת מחמש ערי הפלשתים. לפי התנ״ך, הם מכניסים את ארון הברית לבית האל דגון.', x: 0.04, y: 0.03, w: 0.92 },
        { kind: 'cap', text: 'בבוקר: דגון על הרצפה.', x: 0.44, y: 0.88, w: 0.52 },
      ],
    },
    {
      art: dunes, focus: [0.5, 0.62],
      bubbles: [
        { kind: 'cap', text: '1956. על החולות מתכננים עיר נמל חדשה. מי שמוביל: עובד בן־עמי, שהקים לפני כן את נתניה.', x: 0.04, y: 0.03, w: 0.92 },
        { kind: 'cap', text: 'בנובמבר מגיעות המשפחות הראשונות: 22 משפחות ממרוקו.', x: 0.04, y: 0.88, w: 0.92 },
      ],
    },
    {
      art: port, focus: [0.5, 0.52],
      bubbles: [
        { kind: 'cap', text: '21 בנובמבר 1965. האונייה הראשונה נכנסת לנמל אשדוד: ״וינגלנד״ השוודית, עם 3,000 טון סוכר.', x: 0.04, y: 0.03, w: 0.92 },
        { kind: 'cap', text: today, x: 0.04, y: 0.66, w: 0.5 },
      ],
    },
  ],
};
