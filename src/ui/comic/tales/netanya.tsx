import { Circle, ClipPath, Defs, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import { F } from '../../theme';
import type { Panel } from '../ComicPlayer';
import { Halftone, K, Rays } from '../parts';
import { Person, Sea, Sun } from '../people';

/* Netanya: water on the cliff in 1929, the name taken from Nathan Straus, and the diamond polishers of 1939. */

/* 1. 1929: the first settlers on the cliff above the sea. */
const cliff = (
  <G>
    <Halftone />
    <Rect x={0} y={0} width={400} height={700} fill="#CDE7EA" />
    <Sun x={320} y={110} r={44} />
    <Sea y={330} to={710} x1={170} x0={-10} />
    {/* The sandstone cliff, the town's trademark. */}
    <Path d="M120 330 Q140 420 120 520 Q140 620 110 710 L410 710 L410 300 Q260 296 120 330Z" fill="#D9A866" stroke={K.ink} strokeWidth={4} />
    <Path d="M120 330 Q140 420 120 520 Q140 620 110 710 L170 710 Q190 600 170 520 Q186 420 160 326Z" fill="url(#dots)" />
    <Path d="M150 380 L190 384 M140 460 L180 470 M148 560 L190 566" stroke="#A9783A" strokeWidth={3} />
    <Path d="M120 330 Q260 290 410 300 L410 360 Q260 340 130 360Z" fill="#F0D79E" stroke={K.ink} strokeWidth={4} />
    {/* The well rig, and a tent. */}
    <Path d="M300 340 L330 220 L360 340 M312 290 L348 290" stroke={K.ink} strokeWidth={6} fill="none" />
    <Path d="M300 340 L330 220 L360 340" stroke={K.wood} strokeWidth={3} fill="none" />
    <Circle cx={330} cy={222} r={8} fill={K.steel} stroke={K.ink} strokeWidth={3} />
    <Path d="M190 340 L230 290 L270 340Z" fill="#E9E1C8" stroke={K.ink} strokeWidth={4} strokeLinejoin="round" />
    <Path d="M230 290 L230 340" stroke={K.ink} strokeWidth={2.5} />
    {/* The five, one of them with a bucket of water. */}
    {[[190, 560, K.navy, 'tembel'], [250, 580, '#FFFFFF', 'none'], [310, 556, K.teal, 'tembel'], [360, 590, '#C8B27A', 'cap'], [220, 650, K.orange, 'none']].map(([x, y, c, h], i) => (
      <Person key={i} x={x as number} y={y as number} s={0.8} coat={c as string} pants="#C8B27A" hat={h as 'cap'} pose={i === 1 ? 'cheer' : i === 2 ? 'wave' : 'down'} mouth={i === 1 ? 'shout' : 'smile'} flip={i > 2} dress={i === 4} hair={i === 4 ? '#6B3B1E' : '#3A2A1E'} />
    ))}
    <Path d="M262 380 L294 380 L290 412 L266 412Z" fill={K.steel} stroke={K.ink} strokeWidth={3} />
    <Path d="M264 384 Q278 378 292 384" stroke="#BFE3EA" strokeWidth={5} />
  </G>
);

/** A milk bottle with its paper cap. */
const Bottle = ({ x, y }: { x: number; y: number }) => (
  <G>
    <Path d={`M${x - 14} ${y} L${x - 14} ${y - 50} Q${x - 14} ${y - 64} ${x - 6} ${y - 70} L${x - 6} ${y - 84} L${x + 6} ${y - 84} L${x + 6} ${y - 70} Q${x + 14} ${y - 64} ${x + 14} ${y - 50} L${x + 14} ${y}Z`}
      fill="#FFFFFF" stroke={K.ink} strokeWidth={3.5} strokeLinejoin="round" />
    <Rect x={x - 8} y={y - 90} width={16} height={8} fill={K.red} stroke={K.ink} strokeWidth={2.5} />
  </G>
);

/* 2. The name: Nathan Straus, who funded milk stations for babies. */
const straus = (
  <G>
    <Halftone />
    <Rays cx={200} cy={250} n={26} a="#BFE0EC" b="#D9EEF4" />
    <G transform="translate(0 56)">
    {/* Straus's portrait in a gilt frame. */}
    <Rect x={88} y={70} width={224} height={280} fill={K.ink} />
    <Rect x={80} y={62} width={224} height={280} fill="#C9A24A" stroke={K.ink} strokeWidth={5} />
    <Rect x={96} y={78} width={192} height={248} fill="#EADBC0" stroke={K.ink} strokeWidth={3} />
    <Rect x={96} y={78} width={192} height={248} fill="url(#dotsBig)" />
    <Defs>
      <ClipPath id="portrait"><Rect x={96} y={78} width={192} height={222} /></ClipPath>
    </Defs>
    <G clipPath="url(#portrait)">
      <Person x={192} y={420} s={1.2} coat="#2B2B2B" hair="#E8E8E4" beard="#E8E8E4" moustache />
    </G>
    <Rect x={80} y={300} width={224} height={42} fill="#C9A24A" stroke={K.ink} strokeWidth={5} />
    <SvgText x={192} y={328} fontSize={18} fontFamily={F.black} textAnchor="middle" fill={K.ink}>נתן שטראוס</SvgText>
    </G>
    <Rect x={-10} y={452} width={420} height={260} fill="#9A6A3E" stroke={K.ink} strokeWidth={4} />
    <Rect x={-10} y={452} width={420} height={260} fill="url(#dotsBig)" />
    <Bottle x={310} y={500} />
    <Bottle x={340} y={510} />
    {/* Settlers writing to him. */}
    <Person x={110} y={720} s={1.05} coat="#FFFFFF" pants="#C8B27A" hat="tembel" pose="hold" mouth="open" />
    <G transform="rotate(-6 220 560)">
      <Rect x={170} y={520} width={110} height={80} fill="#FFFFFF" stroke={K.ink} strokeWidth={3.5} />
      {[540, 556, 572, 588].map((y) => <Line key={y} x1={182} y1={y} x2={268} y2={y} stroke="#9AA3AD" strokeWidth={2} />)}
    </G>
  </G>
);

/* 3. 1939: the first diamond polishing plant. */
const diamonds = (
  <G>
    <Halftone />
    <Rect x={0} y={0} width={400} height={700} fill="#2B3A55" />
    <Rect x={0} y={0} width={400} height={700} fill="url(#dotsBig)" />
    {/* A lamp over the bench. */}
    <Path d="M200 0 L200 120" stroke={K.ink} strokeWidth={4} />
    <Path d="M150 160 L170 120 L230 120 L250 160Z" fill={K.teal} stroke={K.ink} strokeWidth={4} strokeLinejoin="round" />
    <Path d="M150 160 L60 520 L340 520 L250 160Z" fill={K.lit} opacity={0.25} />
    <Rect x={-10} y={520} width={420} height={190} fill="#6F4826" stroke={K.ink} strokeWidth={4} />
    {/* The polishing wheel. */}
    <Path d="M70 520 L90 470 L210 470 L230 520Z" fill={K.steel} stroke={K.ink} strokeWidth={4} />
    <Rect x={100} y={456} width={100} height={14} rx={7} fill="#C4CCD4" stroke={K.ink} strokeWidth={3} />
    {/* The polisher with his loupe. */}
    <Person x={300} y={720} s={1.3} coat="#E8E2D6" hat="cap" hatColor="#4A4A4A" glasses moustache pose="hold" flip />
    {/* The stone, shining. */}
    <G transform="translate(150 330)">
      <Circle cx={0} cy={0} r={70} fill="#FFFFFF" opacity={0.25} />
      <Path d="M-44 -14 L-26 -38 L26 -38 L44 -14 L0 48Z" fill="#E8F6F7" stroke={K.ink} strokeWidth={4} strokeLinejoin="round" />
      <Path d="M-44 -14 L44 -14 M-26 -38 L-12 -14 L0 -38 L12 -14 L26 -38 M-12 -14 L0 48 L12 -14" stroke={K.ink} strokeWidth={2.5} fill="none" />
      <Path d="M-26 -38 L-44 -14 L-12 -14Z" fill={K.glass} />
      {[[60, -50, 14], [-64, 30, 10], [50, 40, 8]].map(([x, y, r], i) => (
        <Path key={i} d={`M${x} ${y - r} L${x + r * 0.3} ${y - r * 0.3} L${x + r} ${y} L${x + r * 0.3} ${y + r * 0.3} L${x} ${y + r} L${x - r * 0.3} ${y + r * 0.3} L${x - r} ${y} L${x - r * 0.3} ${y - r * 0.3}Z`}
          fill="#FFFFFF" stroke={K.ink} strokeWidth={2} />
      ))}
    </G>
  </G>
);

export const netanya = {
  title: 'נתניה',
  panels: (t: (s: string) => string, today: string): Panel[] => [
    {
      art: cliff, focus: [0.62, 0.52],
      bubbles: [
        { kind: 'cap', text: '1929. אגודת ״בני בנימין״ קנתה חולות על הצוק מול הים. מצאו מים, וחמשת המתיישבים הראשונים עולים לקרקע.', x: 0.04, y: 0.03, w: 0.92 },
        { kind: 'shout', text: 'יש מים!', x: 0.06, y: 0.62, w: 0.36 },
      ],
    },
    {
      art: straus, focus: [0.48, 0.4],
      bubbles: [
        { kind: 'cap', text: 'השם: על שם נתן שטראוס, נדבן יהודי מאמריקה ומבעלי ״מייסיס״, שמימן בארץ תחנות חלב לתינוקות.', x: 0.04, y: 0.03, w: 0.92 },
        { kind: 'say', text: 'אם נקרא לעיר על שמו, אולי הוא יתרום?', x: 0.36, y: 0.66, w: 0.6, tail: { at: 0.1, lean: -0.6 } },
        { kind: 'cap', text: 'הוא ענה שאין לו כסף. השם נשאר.', x: 0.04, y: 0.89, w: 0.62 },
      ],
    },
    {
      art: diamonds, focus: [0.4, 0.5], amount: 1.16,
      bubbles: [
        { kind: 'cap', text: '1939. בהזמנת עובד בן־עמי נפתח בנתניה מפעל לליטוש יהלומים, ואחריו באה תעשייה שלמה מבלגיה.', x: 0.04, y: 0.03, w: 0.92 },
        { kind: 'cap', text: today, x: 0.04, y: 0.88, w: 0.52 },
      ],
    },
  ],
};
