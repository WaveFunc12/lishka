import { Circle, Ellipse, G, Line, Path, Rect } from 'react-native-svg';
import type { Panel } from '../ComicPlayer';
import { Halftone, Hand, K, Rays } from '../parts';
import { House, Person, Sun, Tablet, TownWall } from '../people';

/* Jerusalem: a king of "Urusalim" writing to Pharaoh, David's capital, and the first neighbourhood outside the walls. */

/** A clay oil lamp with its flame. */
const Lamp = ({ x, y }: { x: number; y: number }) => (
  <G>
    <Ellipse cx={x} cy={y - 50} rx={26} ry={34} fill={K.lit} opacity={0.5} />
    <Path d={`M${x - 4} ${y - 18} Q${x - 14} ${y - 40} ${x} ${y - 64} Q${x + 14} ${y - 40} ${x + 4} ${y - 18}Z`} fill={K.orange} stroke={K.ink} strokeWidth={3} />
    <Path d={`M${x - 44} ${y} Q${x - 46} ${y - 24} ${x} ${y - 22} Q${x + 30} ${y - 22} ${x + 46} ${y - 12} L${x + 30} ${y + 6} Q${x} ${y + 14} ${x - 44} ${y}Z`} fill="#B8743E" stroke={K.ink} strokeWidth={4} strokeLinejoin="round" />
    <Circle cx={x - 10} cy={y - 14} r={6} fill="#5A3A22" />
  </G>
);

/* 1. About 1350 BCE: a clay letter from Urusalim to Egypt. */
const letter = (
  <G>
    <Halftone />
    <Rays cx={200} cy={340} n={20} a="#3A2414" b="#4A2E1A" />
    <Rect x={0} y={560} width={400} height={140} fill="#6F4826" stroke={K.ink} strokeWidth={4} />
    <Rect x={0} y={560} width={400} height={140} fill="url(#dotsBig)" />
    <Tablet x={86} y={190} w={228} h={330} rot={-4} />
    <Lamp x={96} y={612} />
    {/* The scribe's hand pressing a reed into the clay. */}
    <Line x1={250} y1={420} x2={306} y2={344} stroke={K.ink} strokeWidth={10} strokeLinecap="round" />
    <Line x1={250} y1={420} x2={306} y2={344} stroke="#D9B26A" strokeWidth={5} strokeLinecap="round" />
    <Hand x={316} y={362} s={1.2} rot={-150} sleeve="#F4F1EA" />
  </G>
);

/* 2. About 1000 BCE: David takes the city on the ridge. */
const david = (
  <G>
    <Halftone />
    <Rect x={0} y={0} width={400} height={700} fill="#F6D9A0" />
    <Sun x={300} y={120} r={50} />
    {/* Hills, and the small walled city on its ridge. */}
    <Path d="M-10 420 Q80 330 170 360 Q260 300 410 360 L410 710 L-10 710Z" fill="#C9A76B" stroke={K.ink} strokeWidth={4} />
    <Path d="M-10 500 Q120 440 220 480 Q320 520 410 470 L410 710 L-10 710Z" fill="#B48F55" stroke={K.ink} strokeWidth={4} />
    <Path d="M-10 500 Q120 440 220 480 Q320 520 410 470 L410 710 L-10 710Z" fill="url(#dotsBig)" />
    <TownWall x0={150} x1={330} y={300} to={372} fill="#E2CFA0" />
    <House x={170} y={250} w={50} h={50} fill="#EADAB4" windows={1} />
    <House x={222} y={232} w={60} h={68} fill="#F0E2C2" windows={1} />
    <House x={284} y={256} w={40} h={44} fill="#E2CFA6" windows={1} />
    <Path d="M196 372 Q188 420 150 470 M300 372 Q330 420 360 450" stroke="#8C6E40" strokeWidth={3} fill="none" strokeDasharray="6 6" />
    {/* David, in the foreground. */}
    <Person x={110} y={690} s={1.45} robe coat="#7A2E5A" hatColor="#F2C230" hat="crown" hair="#8A4B22" beard="#8A4B22" pose="point" />
  </G>
);

/** Montefiore's windmill: a stone tower with a cap and four sails. */
function Windmill({ x, y }: { x: number; y: number }) {
  return (
    <G>
      <Path d={`M${x - 34} ${y + 250} L${x - 22} ${y} L${x + 22} ${y} L${x + 34} ${y + 250}Z`} fill="#E5D3AC" stroke={K.ink} strokeWidth={4} strokeLinejoin="round" />
      <Path d={`M${x - 34} ${y + 250} L${x - 22} ${y} L${x - 10} ${y} L${x - 18} ${y + 250}Z`} fill="url(#dots)" />
      <Path d={`M${x - 26} ${y} Q${x} ${y - 36} ${x + 26} ${y}Z`} fill="#6F7780" stroke={K.ink} strokeWidth={4} />
      <Rect x={x - 8} y={y + 190} width={16} height={60} rx={8} fill={K.navy} stroke={K.ink} strokeWidth={3} />
      <Rect x={x - 6} y={y + 90} width={12} height={20} fill={K.navy} stroke={K.ink} strokeWidth={2.5} />
      {[20, 110, 200, 290].map((a) => (
        <G key={a} transform={`rotate(${a} ${x} ${y + 10})`}>
          <Rect x={x - 9} y={y + 10} width={18} height={92} fill="#F4F1EA" stroke={K.ink} strokeWidth={3} />
          <Path d={`M${x} ${y + 10} L${x} ${y + 102} M${x - 9} ${y + 40} L${x + 9} ${y + 40} M${x - 9} ${y + 70} L${x + 9} ${y + 70}`} stroke={K.ink} strokeWidth={2} />
        </G>
      ))}
      <Circle cx={x} cy={y + 10} r={8} fill={K.ink} />
    </G>
  );
}

/* 3. 1860: Mishkenot Sha'ananim, outside the walls, with the windmill. */
const mishkenot = (
  <G>
    <Halftone />
    <Rect x={0} y={0} width={400} height={700} fill="#F2B880" />
    <Rect x={0} y={0} width={400} height={330} fill="url(#dotsBig)" />
    <Sun x={70} y={200} r={40} fill="#FBE7B9" />
    {/* The Old City walls on the hill across the valley. */}
    <Path d="M140 330 Q260 250 410 270 L410 420 L140 420Z" fill="#C9A76B" stroke={K.ink} strokeWidth={4} />
    <TownWall x0={190} x1={410} y={232} to={300} fill="#E2CFA0" />
    <Rect x={330} y={180} width={46} height={70} fill="#E2CFA0" stroke={K.ink} strokeWidth={4} />
    <Path d="M330 180 L353 150 L376 180Z" fill="#E2CFA0" stroke={K.ink} strokeWidth={4} strokeLinejoin="round" />
    <Path d="M-10 420 Q200 380 410 420 L410 710 L-10 710Z" fill="#B48F55" stroke={K.ink} strokeWidth={4} />
    <Path d="M-10 420 Q200 380 410 420 L410 710 L-10 710Z" fill="url(#dots)" />
    <Windmill x={84} y={250} />
    {/* The long row of homes, battlements along the roof. */}
    <Rect x={140} y={430} width={270} height={120} fill="#EFE2C2" stroke={K.ink} strokeWidth={4} />
    {Array.from({ length: 11 }, (_, i) => i % 2 === 0 && <Rect key={i} x={140 + i * 25} y={416} width={25} height={16} fill="#EFE2C2" stroke={K.ink} strokeWidth={3} />)}
    {[160, 210, 260, 310, 360].map((x) => (
      <Path key={x} d={`M${x} 550 L${x} 482 Q${x + 15} 462 ${x + 30} 482 L${x + 30} 550Z`} fill={K.navyLight} stroke={K.ink} strokeWidth={3} />
    ))}
    <Rect x={140} y={430} width={40} height={120} fill="url(#dots)" />
    {/* A resident, not sure about sleeping out here. */}
    <Person x={96} y={700} s={1} coat="#2B2B2B" hat="fedora" hatColor="#1E1E1E" beard="#4A3624" mouth="open" pose="hold" />
    <G>
      <Line x1={130} y1={606} x2={130} y2={584} stroke={K.ink} strokeWidth={3} />
      <Rect x={116} y={606} width={28} height={36} rx={4} fill={K.lit} stroke={K.ink} strokeWidth={3} />
      <Circle cx={130} cy={624} r={26} fill={K.lit} opacity={0.4} />
    </G>
  </G>
);

export const jerusalem = {
  title: 'ירושלים',
  panels: (t: (s: string) => string, today: string): Panel[] => [
    {
      art: letter, focus: [0.5, 0.48], amount: 1.14,
      bubbles: [
        { kind: 'cap', text: 'בערך 1350 לפני הספירה. עבדי־חבה, השליט של ״אורושלים״, כותב לפרעה במצרים. על לוחות חימר.', x: 0.04, y: 0.03, w: 0.92 },
        { kind: 'cap', text: 'אלה מהאזכורים הכתובים הקדומים ביותר של ירושלים.', x: 0.2, y: 0.86, w: 0.76 },
      ],
    },
    {
      art: david, focus: [0.6, 0.42], amount: 1.12,
      bubbles: [
        { kind: 'cap', text: 'בערך 1000 לפני הספירה, לפי התנ״ך: דוד כובש את העיר מהיבוסים וקובע בה את בירתו.', x: 0.04, y: 0.03, w: 0.92 },
        { kind: 'say', text: 'מעכשיו קוראים לה ״עיר דוד״.', x: 0.42, y: 0.58, w: 0.54, tail: { at: 0.2, lean: -0.6 } },
      ],
    },
    {
      art: mishkenot, focus: [0.55, 0.6],
      bubbles: [
        { kind: 'cap', text: '1860. השכונה היהודית הראשונה מחוץ לחומות: משכנות שאננים. לידה, טחנת הרוח של מונטיפיורי.', x: 0.04, y: 0.03, w: 0.92 },
        { kind: 'say', text: 'משלמים לי לגור פה. אבל לישון? אני חוזר לתוך החומות.', x: 0.36, y: 0.44, w: 0.6, tail: { at: 0.15, lean: -0.8 } },
        { kind: 'cap', text: today, x: 0.44, y: 0.88, w: 0.52 },
      ],
    },
  ],
};
