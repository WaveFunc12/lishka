import { Circle, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import { F } from '../../theme';
import type { Panel } from '../ComicPlayer';
import { Halftone, K } from '../parts';
import { Dunes, House, Person, Sea, Sun } from '../people';

/* Tel Aviv: Ahuzat Bayit in crowded Jaffa, the seashell lottery on the dunes, and the name. */

/** The Jaffa clock tower, finished in 1906. */
function ClockTower({ x, y }: { x: number; y: number }) {
  return (
    <G>
      <Rect x={x - 26} y={y} width={52} height={160} fill="#E3CFA4" stroke={K.ink} strokeWidth={4} />
      <Rect x={x - 32} y={y + 150} width={64} height={30} fill="#D7C08F" stroke={K.ink} strokeWidth={4} />
      <Rect x={x - 22} y={y - 50} width={44} height={52} fill="#E3CFA4" stroke={K.ink} strokeWidth={4} />
      <Path d={`M${x - 26} ${y - 50} L${x} ${y - 82} L${x + 26} ${y - 50}Z`} fill={K.red} stroke={K.ink} strokeWidth={4} strokeLinejoin="round" />
      <Circle cx={x} cy={y - 24} r={15} fill="#FFFFFF" stroke={K.ink} strokeWidth={3} />
      <Path d={`M${x} ${y - 24} L${x} ${y - 34} M${x} ${y - 24} L${x + 7} ${y - 22}`} stroke={K.ink} strokeWidth={2.5} strokeLinecap="round" />
      {[30, 80].map((d) => <Path key={d} d={`M${x - 8} ${y + d + 30} L${x - 8} ${y + d} Q${x} ${y + d - 10} ${x + 8} ${y + d} L${x + 8} ${y + d + 30}Z`} fill={K.navy} stroke={K.ink} strokeWidth={2.5} />)}
      <Rect x={x - 26} y={y} width={12} height={160} fill="url(#dots)" />
    </G>
  );
}

/** A laundry line between two points. */
const Laundry = ({ x0, x1, y }: { x0: number; x1: number; y: number }) => (
  <G>
    <Path d={`M${x0} ${y} Q${(x0 + x1) / 2} ${y + 16} ${x1} ${y}`} stroke={K.ink} strokeWidth={2} fill="none" />
    {[0.2, 0.42, 0.66].map((f, i) => (
      <Rect key={i} x={x0 + (x1 - x0) * f - 9} y={y + 8} width={18} height={24} fill={[K.orange, '#FFFFFF', K.teal][i]} stroke={K.ink} strokeWidth={2.5} />
    ))}
  </G>
);

/* 1. Jaffa, 1906. */
const jaffa = (
  <G>
    <Halftone />
    <Rect x={0} y={0} width={400} height={700} fill="#F6D9A0" />
    <Sun x={330} y={120} r={46} />
    <Sea y={300} to={420} x0={250} x1={410} />
    {/* The old town piled up the hill. */}
    <House x={20} y={210} w={90} h={90} dome />
    <House x={100} y={250} w={80} h={80} fill="#F0E2C2" />
    <House x={170} y={230} w={90} h={100} dome fill="#E2CFA6" />
    <House x={-10} y={290} w={110} h={110} fill="#EBDDBA" windows={3} />
    <House x={90} y={320} w={100} h={100} fill="#E5D3AC" />
    <House x={180} y={320} w={90} h={110} fill="#EEDFBE" />
    <ClockTower x={300} y={300} />
    <Laundry x0={44} x1={150} y={296} />
    <House x={-10} y={410} w={130} h={120} fill="#E9D8B2" windows={3} />
    <House x={110} y={420} w={120} h={110} fill="#E0CB9E" windows={2} />
    <House x={220} y={470} w={190} h={80} fill="#EADAB4" windows={3} />
    <Rect x={0} y={530} width={400} height={170} fill="#C9B489" stroke={K.ink} strokeWidth={4} />
    <Rect x={0} y={530} width={400} height={170} fill="url(#dotsBig)" />
    {/* A crowded street. */}
    <Person x={60} y={660} s={0.62} coat={K.wood} hat="fez" moustache />
    <Person x={120} y={650} s={0.56} dress coat={K.teal} hat="scarf" hatColor={K.orange} flip />
    {/* Akiva Aryeh Weiss with the plan. */}
    <Person x={250} y={700} s={1.25} coat={K.navy} hat="fedora" moustache pose="point" mouth="open" />
  </G>
);

/** A seashell, white or grey, with what is written on it. */
function Shell({ x, y, s = 1, fill, text, rot = 0 }: { x: number; y: number; s?: number; fill: string; text: string; rot?: number }) {
  return (
    <G transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <Path d="M-40 10 Q-44 -30 0 -40 Q44 -30 40 10 Q20 26 0 24 Q-20 26 -40 10Z" fill={fill} stroke={K.ink} strokeWidth={4} strokeLinejoin="round" />
      {[-26, -13, 0, 13, 26].map((dx) => <Path key={dx} d={`M0 22 L${dx} -34`} stroke={K.ink} strokeWidth={1.6} opacity={0.4} />)}
      <Path d="M-10 22 L-14 34 L14 34 L10 22Z" fill={fill} stroke={K.ink} strokeWidth={3} strokeLinejoin="round" />
      <SvgText x={0} y={4} fontSize={20} fontFamily={F.black} textAnchor="middle" fill={K.ink}>{text}</SvgText>
    </G>
  );
}

/* 2. The shell lottery, 11 April 1909. */
const lottery = (
  <G>
    <Halftone />
    <Rect x={0} y={0} width={400} height={700} fill="#CDE7EA" />
    <Sea y={250} to={300} />
    <Dunes y={290} />
    {/* The families on the dune. */}
    {[[40, 452, K.navy, 'fedora'], [92, 444, '#7A3B2A', 'boater'], [148, 450, K.teal, 'scarf'], [258, 444, '#4A4A4A', 'cap'], [312, 452, K.wood, 'fedora'], [362, 446, K.navyLight, 'boater']].map(([x, y, c, h], i) => (
      <Person key={i} x={x as number} y={y as number} s={0.5} coat={c as string} hat={h as 'fedora'} dress={h === 'scarf'} flip={i > 3} mouth={i === 1 ? 'open' : 'smile'} />
    ))}
    {/* Two baskets of shells: names in one, plot numbers in the other. */}
    <G>
      <Path d="M30 560 L170 560 L156 660 L44 660Z" fill="#C49A55" stroke={K.ink} strokeWidth={4} strokeLinejoin="round" />
      <Path d="M36 590 L164 590 M40 620 L160 620" stroke="#8C6630" strokeWidth={3} />
      <Shell x={70} y={546} s={0.7} fill="#FFFFFF" text="" rot={-10} />
      <Shell x={128} y={548} s={0.7} fill="#FFFFFF" text="" rot={14} />
      <Path d="M230 560 L370 560 L356 660 L244 660Z" fill="#C49A55" stroke={K.ink} strokeWidth={4} strokeLinejoin="round" />
      <Path d="M236 590 L364 590 M240 620 L360 620" stroke="#8C6630" strokeWidth={3} />
      <Shell x={270} y={548} s={0.7} fill="#A9B0B7" text="" rot={8} />
      <Shell x={328} y={546} s={0.7} fill="#A9B0B7" text="" rot={-12} />
    </G>
    {/* The two shells drawn, held up. */}
    <Shell x={130} y={470} s={1.15} fill="#FFFFFF" text="וייס" rot={-8} />
    <Shell x={272} y={470} s={1.15} fill="#A9B0B7" text="43" rot={8} />
  </G>
);

/** The Herzliya Gymnasium at the top of Herzl Street: a tall arched gate between two towers. */
function Gymnasium({ x, y }: { x: number; y: number }) {
  return (
    <G>
      <Rect x={x - 110} y={y + 40} width={220} height={110} fill="#F1E3C4" stroke={K.ink} strokeWidth={4} />
      <Rect x={x - 130} y={y} width={50} height={150} fill="#E9D6AE" stroke={K.ink} strokeWidth={4} />
      <Rect x={x + 80} y={y} width={50} height={150} fill="#E9D6AE" stroke={K.ink} strokeWidth={4} />
      <Path d={`M${x - 136} ${y} L${x - 105} ${y - 34} L${x - 74} ${y}Z M${x + 74} ${y} L${x + 105} ${y - 34} L${x + 136} ${y}Z`} fill={K.red} stroke={K.ink} strokeWidth={4} strokeLinejoin="round" />
      <Path d={`M${x - 50} ${y + 150} L${x - 50} ${y + 30} Q${x} ${y - 40} ${x + 50} ${y + 30} L${x + 50} ${y + 150}Z`} fill="#E9D6AE" stroke={K.ink} strokeWidth={4} />
      <Path d={`M${x - 30} ${y + 150} L${x - 30} ${y + 60} Q${x} ${y + 14} ${x + 30} ${y + 60} L${x + 30} ${y + 150}Z`} fill={K.navy} stroke={K.ink} strokeWidth={3.5} />
      <Rect x={x - 130} y={y} width={16} height={150} fill="url(#dots)" />
      {[-105, 105].map((d) => <Rect key={d} x={x + d - 10} y={y + 40} width={20} height={34} rx={10} fill={K.navy} stroke={K.ink} strokeWidth={2.5} />)}
      {[-80, 60].map((d) => <Rect key={d} x={x + d} y={y + 80} width={20} height={30} fill={K.navy} stroke={K.ink} strokeWidth={2.5} />)}
    </G>
  );
}

/* 3. The name, 1910, and Herzl Street. */
const herzl = (
  <G>
    <Halftone />
    <Rect x={0} y={0} width={400} height={700} fill="#BFE0EC" />
    <Rect x={0} y={0} width={400} height={300} fill="url(#dotsBig)" />
    <Gymnasium x={200} y={190} />
    {/* The street running toward it, with houses and young trees. */}
    <Path d="M140 340 L260 340 L400 700 L0 700Z" fill={K.sand} stroke={K.ink} strokeWidth={4} />
    <Path d="M196 360 L190 380 M204 400 L198 430 M212 470 L204 510 M222 560 L212 620" stroke="#C9A866" strokeWidth={4} strokeLinecap="round" />
    <House x={-10} y={330} w={110} h={110} fill="#F4E8CE" windows={2} />
    <Path d="M-14 330 L45 290 L104 330Z" fill={K.red} stroke={K.ink} strokeWidth={4} strokeLinejoin="round" />
    <House x={300} y={330} w={110} h={110} fill="#EFE0BF" windows={2} />
    <Path d="M296 330 L355 290 L414 330Z" fill={K.red} stroke={K.ink} strokeWidth={4} strokeLinejoin="round" />
    {[[118, 380, 0.7], [282, 380, 0.7], [80, 470, 1], [320, 470, 1]].map(([x, y, s], i) => (
      <G key={i}>
        <Line x1={x} y1={y} x2={x} y2={y - 70 * s} stroke={K.wood} strokeWidth={6} />
        <Circle cx={x} cy={y - 80 * s} r={22 * s} fill="#4E9A54" stroke={K.ink} strokeWidth={3} />
      </G>
    ))}
    {/* A street sign, and two walkers. */}
    <Rect x={90} y={500} width={8} height={110} fill={K.ink} />
    <Rect x={30} y={470} width={130} height={40} rx={6} fill={K.navy} stroke={K.ink} strokeWidth={4} />
    <SvgText x={95} y={498} fontSize={20} fontFamily={F.black} textAnchor="middle" fill={K.paper}>רחוב הרצל</SvgText>
    <Person x={250} y={640} s={0.85} coat="#FFFFFF" pants="#C8B27A" hat="boater" flip />
    <Person x={318} y={650} s={0.85} dress coat={K.orange} hair="#6B3B1E" flip />
  </G>
);

export const telaviv = {
  title: 'תל אביב',
  panels: (t: (s: string) => string, today: string): Panel[] => [
    {
      art: jaffa, focus: [0.7, 0.62], amount: 1.12,
      bubbles: [
        { kind: 'cap', text: 'יפו, 1906. צפוף, רועש ויקר. עקיבא אריה וייס וחבריו מקימים אגודה: ״אחוזת בית״.', x: 0.04, y: 0.03, w: 0.92 },
        { kind: 'say', text: 'נבנה שכונה עברית חדשה, על החולות!', x: 0.3, y: 0.47, w: 0.62, tail: { at: 0.62, lean: -0.2 } },
      ],
    },
    {
      art: lottery, focus: [0.5, 0.66], amount: 1.14,
      bubbles: [
        { kind: 'cap', text: '11 באפריל 1909. 66 משפחות מתאספות על החולות.', x: 0.04, y: 0.03, w: 0.92 },
        { kind: 'cap', text: 'על הצדפים הלבנים: שמות. על האפורים: מספרי מגרשים.', x: 0.04, y: 0.86, w: 0.92 },
        { kind: 'shout', text: 'הגרלה!', x: 0.6, y: 0.14, w: 0.32 },
      ],
    },
    {
      art: herzl, focus: [0.5, 0.42],
      bubbles: [
        { kind: 'cap', text: '1910. השכונה מקבלת שם: תל אביב. כך תרגם נחום סוקולוב את שם הספר של הרצל, ״אלטנוילנד״.', x: 0.04, y: 0.03, w: 0.92 },
        { kind: 'cap', text: today, x: 0.04, y: 0.88, w: 0.5 },
      ],
    },
  ],
};
