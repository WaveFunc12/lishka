import { Circle, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import { F } from '../../theme';
import type { Panel } from '../ComicPlayer';
import { Halftone, K } from '../parts';
import { House, Person, Sea, Sun, TownWall } from '../people';

/* Haifa: Daher al-Omar's new walled town, the Templers' colony under the Carmel, and the War of the Languages. */

/** Mount Carmel: a long green ridge falling to the sea on the left. */
const Carmel = ({ y, to = 520 }: { y: number; to?: number }) => (
  <G>
    <Path d={`M-10 ${y + 160} Q60 ${y + 40} 180 ${y + 10} Q300 ${y - 10} 410 ${y + 20} L410 ${to} L-10 ${to}Z`} fill="#6E9A4E" stroke={K.ink} strokeWidth={4} />
    <Path d={`M-10 ${y + 160} Q60 ${y + 40} 180 ${y + 10} Q300 ${y - 10} 410 ${y + 20} L410 ${to} L-10 ${to}Z`} fill="url(#dotsBig)" />
    {Array.from({ length: 14 }, (_, i) => (
      <Circle key={i} cx={20 + i * 28} cy={y + 60 + ((i * 37) % 50)} r={9} fill="#4E7A36" stroke={K.ink} strokeWidth={2} />
    ))}
  </G>
);

/* 1. 1761: the new walled town by the bay. */
const daher = (
  <G>
    <Halftone />
    <Rect x={0} y={0} width={400} height={700} fill="#CDE7EA" />
    <Sun x={330} y={110} r={40} />
    <Carmel y={190} to={420} />
    <Sea y={420} to={560} />
    {/* The walled town on the shore, with its tower. */}
    <TownWall x0={150} x1={380} y={370} to={440} fill="#E2CFA0" />
    <Rect x={250} y={300} width={50} height={80} fill="#E2CFA0" stroke={K.ink} strokeWidth={4} />
    {[0, 1].map((i) => <Rect key={i} x={250 + i * 32} y={288} width={18} height={14} fill="#E2CFA0" stroke={K.ink} strokeWidth={3} />)}
    <House x={170} y={330} w={60} h={40} fill="#EADAB4" windows={1} dome />
    <House x={310} y={334} w={56} h={36} fill="#F0E2C2" windows={1} />
    <Path d="M160 452 L120 470 L140 476Z" fill="#FFFFFF" stroke={K.ink} strokeWidth={3} />
    <Line x1={140} y1={476} x2={140} y2={440} stroke={K.ink} strokeWidth={3} />
    <Path d="M140 442 L162 470 L140 470Z" fill="#FFFFFF" stroke={K.ink} strokeWidth={3} />
    <Path d="M112 476 L172 476 L162 490 L120 490Z" fill={K.wood} stroke={K.ink} strokeWidth={3} />
    <Rect x={-10} y={560} width={420} height={150} fill={K.sand} stroke={K.ink} strokeWidth={4} />
    {/* Daher al-Omar. */}
    <Person x={100} y={700} s={1.3} robe coat="#1E5A4A" hat="turban" beard="#3A2A1E" pose="point" />
  </G>
);

/** A Templer house: stone, a red tiled roof, and the year over the door. */
function TemplerHouse({ x, y, w, year }: { x: number; y: number; w: number; year: string }) {
  return (
    <G>
      <Rect x={x} y={y} width={w} height={w * 0.7} fill="#EFE2C2" stroke={K.ink} strokeWidth={4} />
      <Path d={`M${x - 8} ${y} L${x + w / 2} ${y - w * 0.4} L${x + w + 8} ${y}Z`} fill={K.red} stroke={K.ink} strokeWidth={4} strokeLinejoin="round" />
      <Rect x={x + w / 2 - 9} y={y + w * 0.32} width={18} height={w * 0.38} fill={K.wood} stroke={K.ink} strokeWidth={3} />
      <SvgText x={x + w / 2} y={y + w * 0.26} fontSize={w * 0.14} fontFamily={F.black} textAnchor="middle" fill={K.ink}>{year}</SvgText>
      <Rect x={x + 8} y={y + w * 0.3} width={w * 0.16} height={w * 0.2} fill={K.navyLight} stroke={K.ink} strokeWidth={2.5} />
      <Rect x={x + w - 8 - w * 0.16} y={y + w * 0.3} width={w * 0.16} height={w * 0.2} fill={K.navyLight} stroke={K.ink} strokeWidth={2.5} />
    </G>
  );
}

/* 2. 1868: the German Colony, its avenue running from the mountain to the sea. */
const templers = (
  <G>
    <Halftone />
    <Rect x={0} y={0} width={400} height={700} fill="#CDE7EA" />
    <Carmel y={80} to={330} />
    <Path d="M170 300 L230 300 L410 700 L-10 700Z" fill={K.sand} stroke={K.ink} strokeWidth={4} />
    <Path d="M-10 330 L170 300 L-10 700Z M410 330 L230 300 L410 700Z" fill="#CBB98A" stroke={K.ink} strokeWidth={4} />
    <TemplerHouse x={70} y={330} w={80} year="1869" />
    <TemplerHouse x={250} y={330} w={80} year="1870" />
    <TemplerHouse x={-20} y={420} w={110} year="1871" />
    <TemplerHouse x={310} y={420} w={110} year="1872" />
    {[[164, 320, 0.5], [236, 320, 0.5], [176, 440, 0.8], [224, 440, 0.8]].map(([x, y, s], i) => (
      <G key={i}>
        <Line x1={x} y1={y} x2={x} y2={y - 60 * s} stroke={K.wood} strokeWidth={6} />
        <Circle cx={x} cy={y - 74 * s} r={22 * s} fill="#4E9A54" stroke={K.ink} strokeWidth={3} />
      </G>
    ))}
    <Person x={140} y={690} s={1.1} coat="#3B4A3A" hat="cap" hatColor="#2B2B2B" beard="#B08A5A" pose="wave" />
    <Person x={260} y={690} s={1.05} dress coat="#5A6E8C" hair="#C99A4A" flip />
  </G>
);

/** The first Technion building: a long stone front, a tall middle with a pointed roof, arched windows. */
function Technion({ x, y }: { x: number; y: number }) {
  return (
    <G>
      <Rect x={x - 180} y={y + 40} width={360} height={130} fill="#E8D9B8" stroke={K.ink} strokeWidth={4} />
      <Rect x={x - 50} y={y - 10} width={100} height={180} fill="#EFE2C2" stroke={K.ink} strokeWidth={4} />
      <Path d={`M${x - 58} ${y - 10} L${x} ${y - 70} L${x + 58} ${y - 10}Z`} fill={K.red} stroke={K.ink} strokeWidth={4} strokeLinejoin="round" />
      {Array.from({ length: 14 }, (_, i) => i % 2 === 0 && <Rect key={i} x={x - 180 + i * 26} y={y + 28} width={26} height={14} fill="#E8D9B8" stroke={K.ink} strokeWidth={3} />)}
      {[-150, -110, 70, 110, 150].map((d) => (
        <Path key={d} d={`M${x + d - 12} ${y + 130} L${x + d - 12} ${y + 82} Q${x + d} ${y + 66} ${x + d + 12} ${y + 82} L${x + d + 12} ${y + 130}Z`} fill={K.navy} stroke={K.ink} strokeWidth={2.5} />
      ))}
      <Path d={`M${x - 22} ${y + 170} L${x - 22} ${y + 90} Q${x} ${y + 64} ${x + 22} ${y + 90} L${x + 22} ${y + 170}Z`} fill={K.navy} stroke={K.ink} strokeWidth={3} />
      <Circle cx={x} cy={y + 30} r={16} fill={K.glass} stroke={K.ink} strokeWidth={3} />
      <Rect x={x - 180} y={y + 40} width={40} height={130} fill="url(#dots)" />
    </G>
  );
}

/* 3. 1913: the War of the Languages. */
const languages = (
  <G>
    <Halftone />
    <Rect x={0} y={0} width={400} height={700} fill="#F6D9A0" />
    <Rect x={0} y={0} width={400} height={380} fill="url(#dotsBig)" />
    <Technion x={200} y={240} />
    <Rect x={-10} y={410} width={420} height={300} fill="#CBB98A" stroke={K.ink} strokeWidth={4} />
    {/* The protest. */}
    {[[50, 640, K.navy, 'cap', false], [130, 660, '#FFFFFF', 'none', false], [270, 660, K.teal, 'none', true], [350, 640, '#7A3B2A', 'tembel', true]].map(([x, y, c, h, f], i) => (
      <Person key={i} x={x as number} y={y as number} s={0.95} coat={c as string} hat={h as 'cap'} flip={f as boolean} pose={i % 2 ? 'cheer' : 'wave'} mouth="shout" dress={i === 2} hair={i === 2 ? '#6B3B1E' : '#3A2A1E'} />
    ))}
    <G transform="rotate(-6 200 470)">
      <Line x1={200} y1={500} x2={200} y2={650} stroke={K.wood} strokeWidth={8} />
      <Rect x={120} y={430} width={160} height={80} fill="#FFFFFF" stroke={K.ink} strokeWidth={4} />
      <SvgText x={200} y={484} fontSize={40} fontFamily={F.display} textAnchor="middle" fill={K.red}>עברית!</SvgText>
    </G>
  </G>
);

export const haifa = {
  title: 'חיפה',
  panels: (t: (s: string) => string, today: string): Panel[] => [
    {
      art: daher, focus: [0.62, 0.5], amount: 1.12,
      bubbles: [
        { kind: 'cap', text: '1761. השליט דאהר אל־עמר הורס את חיפה הישנה, ובונה עיר חדשה עם חומה, בערך שני קילומטרים וחצי מזרחה.', x: 0.04, y: 0.03, w: 0.92 },
        { kind: 'say', text: 'עיר חדשה, על המפרץ.', x: 0.44, y: 0.6, w: 0.5, tail: { at: 0.15, lean: -0.7 } },
      ],
    },
    {
      art: templers, focus: [0.5, 0.5],
      bubbles: [
        { kind: 'cap', text: '1868. הטמפלרים, נוצרים מגרמניה, בונים מושבה למרגלות הכרמל.', x: 0.04, y: 0.03, w: 0.92 },
        { kind: 'cap', text: 'השדרה שלהם היא היום ״המושבה הגרמנית״.', x: 0.3, y: 0.88, w: 0.66 },
      ],
    },
    {
      art: languages, focus: [0.5, 0.62],
      bubbles: [
        { kind: 'cap', text: '1913. ההנהלה מחליטה שבטכניון החדש ילמדו בגרמנית. מורים ותלמידים בכל הארץ מוחים: ״מלחמת השפות״.', x: 0.04, y: 0.03, w: 0.92 },
        { kind: 'cap', text: 'ב־1914 העברית ניצחה, והלימודים נפתחו ב־1924.', x: 0.04, y: 0.79, w: 0.7 },
        { kind: 'cap', text: today, x: 0.44, y: 0.89, w: 0.52 },
      ],
    },
  ],
};
