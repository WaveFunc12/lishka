import { Circle, Ellipse, G, Line, Path, Rect } from 'react-native-svg';
import type { Panel } from '../ComicPlayer';
import { Halftone, K, Rays } from '../parts';
import { House, Person, Sea, Sun, TownWall } from '../people';
import { Chariot, Donkey, Jeep, Sack, Sapling, StoneLion } from '../props';
import { Eucalyptus, Field, Hills, Lake, Swamp, Tent, TowerStockade } from '../scenery';
import type { Tale } from './index';

/* Region stories, part 2: the Jerusalem hills, the valleys, the western and upper Galilee, and Hadera with Wadi Ara. */

const sky = (fill = '#CDE7EA') => <Rect x={0} y={0} width={400} height={700} fill={fill} />;
const INK = { stroke: K.ink, strokeWidth: 4, strokeLinejoin: 'round' as const };

/** An olive tree: a twisted trunk and a flat grey-green crown. */
const Olive = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <G transform={`translate(${x} ${y}) scale(${s})`}>
    <Path d="M-6 0 Q-14 -30 -2 -50 L6 -50 Q0 -30 8 0Z" fill={K.woodDark} stroke={K.ink} strokeWidth={3} />
    <Ellipse cx={0} cy={-66} rx={40} ry={22} fill="#7F9A6A" stroke={K.ink} strokeWidth={3} />
  </G>
);

/** A cow, side on, facing right. */
const Cow = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <G transform={`translate(${x} ${y}) scale(${s})`}>
    {[-40, -26, 26, 40].map((lx) => <Line key={lx} x1={lx} y1={-34} x2={lx} y2={0} stroke={K.ink} strokeWidth={8} strokeLinecap="round" />)}
    <Rect x={-56} y={-86} width={110} height={56} rx={24} fill="#FFFFFF" {...INK} />
    <Path d="M-30 -86 Q-10 -70 -24 -50 Q-44 -56 -40 -80Z M10 -60 Q30 -70 34 -48 Q16 -36 10 -60Z" fill={K.ink} />
    <Path d="M50 -80 L82 -96 Q100 -94 98 -74 L90 -60 Q80 -54 72 -60 L52 -56Z" fill="#FFFFFF" {...INK} />
    <Ellipse cx={92} cy={-64} rx={10} ry={7} fill="#E9A6A0" stroke={K.ink} strokeWidth={2.5} />
    <Path d="M78 -98 L74 -112 M88 -98 L94 -110" stroke={K.ink} strokeWidth={4} strokeLinecap="round" />
    <Circle cx={84} cy={-84} r={3} fill={K.ink} />
    <Path d="M-56 -76 Q-70 -60 -64 -40" stroke={K.ink} strokeWidth={4} fill="none" />
  </G>
);

/* ---------- The Jerusalem hills ---------- */

/* 1. 1854: Shaul Yehuda buys land at Motza, one of the first Jewish farms outside the walls. */
const motza = (
  <G>
    <Halftone />
    {sky()}
    <Hills y={300} />
    <House x={230} y={350} w={120} h={80} fill="#E6D7B4" windows={1} dome />
    {[[70, 420], [180, 450], [360, 470]].map(([x, y], i) => <Olive key={i} x={x} y={y} s={0.9} />)}
    <Donkey x={300} y={640} s={1} load />
    <Person x={130} y={700} s={1.15} robe coat="#5A4636" hat="turban" beard="#3A2A1E" pose="hold" />
    <G transform="rotate(-6 200 590)">
      <Rect x={150} y={560} width={86} height={60} fill="#F6E3BA" stroke={K.ink} strokeWidth={3} />
      {[576, 590, 604].map((y) => <Line key={y} x1={160} y1={y} x2={226} y2={y} stroke="#9AA3AD" strokeWidth={2} />)}
    </G>
  </G>
);

/** Stone terraces stepping up a hillside, with young vines. */
const Terraces = () => (
  <G>
    {[300, 380, 460, 540].map((y, i) => (
      <G key={y}>
        <Rect x={-10} y={y} width={420} height={90} fill={i % 2 ? '#B48F55' : '#C9A76B'} {...INK} />
        <Path d={`M-10 ${y + 10} L410 ${y + 10}`} stroke="#8C6E40" strokeWidth={10} strokeDasharray="22 6" />
        {Array.from({ length: 7 }, (_, j) => (
          <G key={j}>
            <Line x1={30 + j * 56} y1={y} x2={30 + j * 56} y2={y - 22} stroke={K.woodDark} strokeWidth={4} />
            <Circle cx={30 + j * 56} cy={y - 26} r={9} fill="#5E8C45" stroke={K.ink} strokeWidth={2.5} />
          </G>
        ))}
      </G>
    ))}
  </G>
);

/* 2. 1920: Kiryat Anavim, the first kibbutz in the Judean hills, on terraces of vines. */
const anavim = (
  <G>
    <Halftone />
    {sky()}
    <Path d="M-10 300 Q120 210 230 250 Q320 200 410 240 L410 320 L-10 320Z" fill="#9C8E6A" {...INK} />
    <Tent x={250} y={300} s={0.7} />
    <Tent x={330} y={296} s={0.6} />
    <Terraces />
    <Person x={110} y={700} s={1.05} coat="#FFFFFF" pants="#C8B27A" hat="tembel" pose="hold" />
    <Line x1={130} y1={580} x2={170} y2={690} stroke={K.ink} strokeWidth={7} />
    <Line x1={130} y1={580} x2={170} y2={690} stroke={K.wood} strokeWidth={3} />
    <Person x={300} y={700} s={1} dress coat={K.teal} hat="scarf" hatColor={K.orange} pose="cheer" flip />
  </G>
);

/* 3. 1948: the "Burma Road" through the hills at night, with porters carrying flour where jeeps could not climb. */
const burma = (
  <G>
    <Halftone />
    <Rect x={0} y={0} width={400} height={700} fill="#1B2A4A" />
    <Rect x={0} y={0} width={400} height={700} fill="url(#dotsBig)" />
    {[[40, 180], [120, 220], [300, 190], [360, 250], [220, 170]].map(([x, y], i) => <Circle key={i} cx={x} cy={y} r={3} fill="#FFFFFF" />)}
    <Circle cx={320} cy={250} r={24} fill="#FBE7B9" stroke={K.ink} strokeWidth={3} />
    <Path d="M-10 420 Q140 300 260 340 Q340 300 410 330 L410 710 L-10 710Z" fill="#3E4A3A" {...INK} />
    {/* The steep track, and a jeep stuck on it. */}
    <Path d="M-10 640 Q120 560 200 470 Q260 400 410 380" stroke="#8C7A54" strokeWidth={40} fill="none" />
    <Path d="M-10 640 Q120 560 200 470 Q260 400 410 380" stroke={K.ink} strokeWidth={3} fill="none" strokeDasharray="10 14" />
    <Jeep x={300} y={410} s={0.8} rot={-24} />
    <Person x={110} y={690} s={1.05} coat="#5A4636" pants="#3A3A3A" hat="cap" pose="wave" mouth="open" />
    <G transform="rotate(70 160 520)"><Sack x={160} y={560} s={0.9} /></G>
    <Person x={240} y={640} s={0.85} coat="#3A3A3A" pants="#3A3A3A" hat="none" pose="wave" />
    <G transform="rotate(70 280 490)"><Sack x={280} y={524} s={0.75} /></G>
  </G>
);

/* ---------- The valleys and the lower Galilee ---------- */

/* 1. By the Bible: Gideon at the spring of Harod chooses the 300 who lapped the water. */
const gideon = (
  <G>
    <Halftone />
    {sky()}
    {/* Mount Gilboa behind. */}
    <Path d="M-10 330 Q100 220 220 260 Q300 230 410 290 L410 360 L-10 360Z" fill="#8FA36A" {...INK} />
    <Field y={360} fill="#9CB86A" rows="#7FA055" />
    <Ellipse cx={240} cy={470} rx={130} ry={40} fill={K.teal} {...INK} />
    <Ellipse cx={240} cy={470} rx={130} ry={40} fill="url(#dotsBig)" />
    {[[300, 610, 0.75], [360, 640, 0.7]].map(([x, y, s], i) => <Person key={i} x={x} y={y} s={s} robe coat="#8A6A4A" hat="cloth" hatColor="#D9CBB0" pose="hold" flip />)}
    <Person x={110} y={700} s={1.15} robe coat="#7A3B2A" hat="cloth" hatColor="#E8DDC8" beard="#3A2A1E" pose="point" />
  </G>
);

/* 2. 1921: the Labour Battalion's tent camp by the spring under the Gilboa, the start of Ein Harod. */
const gdud = (
  <G>
    <Halftone />
    {sky()}
    <Sun x={80} y={200} r={36} />
    <Path d="M-10 320 Q100 200 220 250 Q300 220 410 280 L410 380 L-10 380Z" fill="#8FA36A" {...INK} />
    <Rect x={-10} y={370} width={420} height={340} fill="#C9A76B" {...INK} />
    {[[70, 450, 0.8], [170, 430, 0.75], [270, 440, 0.8], [350, 470, 0.85]].map(([x, y, s], i) => <Tent key={i} x={x} y={y} s={s} />)}
    <Ellipse cx={330} cy={540} rx={60} ry={16} fill={K.teal} stroke={K.ink} strokeWidth={3} />
    <Person x={110} y={700} s={1.05} coat="#FFFFFF" pants="#C8B27A" hat="tembel" pose="wave" />
    <Person x={280} y={700} s={1} coat="#3A5A8C" pants="#C8B27A" hat="cap" pose="hips" flip />
  </G>
);

/* 3. 11 September 1921: Nahalal, the first workers' moshav, drawn by Richard Kauffmann as a circle. */
const nahalal = (
  <G>
    <Halftone />
    <Rect x={0} y={0} width={400} height={700} fill="#8DB06A" />
    <Rect x={0} y={0} width={400} height={700} fill="url(#dotsBig)" />
    {/* Seen from above: fields fanning out from a ring of farmyards. */}
    {Array.from({ length: 16 }, (_, i) => {
      const a = (i / 16) * Math.PI * 2;
      return <Line key={i} x1={200 + Math.cos(a) * 70} y1={330 + Math.sin(a) * 48} x2={200 + Math.cos(a) * 260} y2={330 + Math.sin(a) * 180} stroke="#6E8F50" strokeWidth={4} />;
    })}
    <Ellipse cx={200} cy={330} rx={150} ry={100} fill="none" stroke="#D9C69C" strokeWidth={14} />
    <Ellipse cx={200} cy={330} rx={150} ry={100} fill="none" stroke={K.ink} strokeWidth={2} />
    {Array.from({ length: 14 }, (_, i) => {
      const a = (i / 14) * Math.PI * 2;
      return <Rect key={i} x={200 + Math.cos(a) * 118 - 9} y={330 + Math.sin(a) * 78 - 7} width={18} height={14} fill="#F0E2C2" stroke={K.ink} strokeWidth={2.5} />;
    })}
    <Ellipse cx={200} cy={330} rx={64} ry={40} fill="#F0D79E" stroke={K.ink} strokeWidth={3} />
    {[[180, 322], [214, 336]].map(([x, y], i) => <Rect key={i} x={x - 12} y={y - 8} width={24} height={16} fill="#FFFFFF" stroke={K.ink} strokeWidth={2.5} />)}
    {/* The architect with his compass. */}
    <Person x={110} y={710} s={1.15} coat="#E8E2D6" hat="boater" glasses moustache pose="point" />
    <Path d="M210 500 L240 600 M210 500 L190 600" stroke={K.ink} strokeWidth={5} strokeLinecap="round" />
    <Circle cx={210} cy={498} r={7} fill={K.steel} stroke={K.ink} strokeWidth={2.5} />
  </G>
);

/* ---------- The western Galilee ---------- */

/** A cannon on its carriage, facing right. */
const Cannon = ({ x, y }: { x: number; y: number }) => (
  <G>
    <Path d={`M${x - 40} ${y - 30} L${x + 50} ${y - 46} L${x + 54} ${y - 30} L${x - 36} ${y - 14}Z`} fill="#3A3A3A" stroke={K.ink} strokeWidth={3.5} />
    <Circle cx={x - 20} cy={y - 8} r={18} fill={K.wood} stroke={K.ink} strokeWidth={3.5} />
    <Circle cx={x - 20} cy={y - 8} r={5} fill={K.ink} />
  </G>
);

/* 1. 1799: Napoleon besieges Acre for two months and cannot break the wall. */
const acre = (
  <G>
    <Halftone />
    {sky('#F6D9A0')}
    <Sea y={300} to={420} x0={-10} x1={410} />
    <TownWall x0={180} x1={410} y={260} to={430} />
    <House x={260} y={180} w={70} h={80} fill="#E6D7B4" dome windows={1} />
    {/* Smoke puffs over the wall. */}
    {[[220, 220, 26], [250, 196, 20], [330, 230, 22]].map(([x, y, r], i) => <Circle key={i} cx={x} cy={y} r={r} fill="#FFFFFF" stroke={K.ink} strokeWidth={3} opacity={0.9} />)}
    <Rect x={-10} y={420} width={420} height={290} fill="#D9B97A" {...INK} />
    <Rect x={-10} y={420} width={420} height={290} fill="url(#dots)" />
    <Cannon x={260} y={560} />
    <Person x={110} y={700} s={1.2} coat="#24365C" pants="#FFFFFF" hat="bicorne" pose="hips" mouth="flat" />
  </G>
);

/* 2. 1935: Nahariya, founded by Jews from Germany; doctors and lawyers turned dairy farmers. */
const nahariya = (
  <G>
    <Halftone />
    {sky()}
    <Sea y={300} to={360} x0={-10} x1={410} />
    <Rect x={-10} y={350} width={420} height={360} fill="#9CB86A" {...INK} />
    {/* The stream through the middle of town. */}
    <Path d="M120 710 Q160 560 220 470 Q260 400 300 350" stroke={K.teal} strokeWidth={30} fill="none" />
    <Path d="M120 710 Q160 560 220 470 Q260 400 300 350" stroke={K.ink} strokeWidth={2} fill="none" />
    <Eucalyptus x={340} y={480} s={0.8} />
    <House x={30} y={380} w={80} h={60} fill="#FFFFFF" windows={2} />
    <Cow x={230} y={640} s={1} />
    <Person x={90} y={700} s={1.1} coat="#3A3A3A" hat="fedora" glasses moustache pose="hold" />
    <Path d="M108 588 L134 588 L130 624 L112 624Z" fill={K.steel} stroke={K.ink} strokeWidth={3} />
  </G>
);

/** A man carrying a beam on his shoulder. */
const Carrier = ({ x, y, s, coat }: { x: number; y: number; s: number; coat: string }) => (
  <G>
    <Person x={x} y={y} s={s} coat={coat} pants="#C8B27A" hat="tembel" pose="hold" flip />
    <Line x1={x - 100 * s} y1={y - 162 * s} x2={x + 90 * s} y2={y - 146 * s} stroke={K.ink} strokeWidth={14 * s} strokeLinecap="round" />
    <Line x1={x - 100 * s} y1={y - 162 * s} x2={x + 90 * s} y2={y - 146 * s} stroke={K.wood} strokeWidth={8 * s} strokeLinecap="round" />
  </G>
);

/* 3. 21 March 1938: some 400 people carry Hanita up the hill on their backs, and raise it in a day. */
const hanita = (
  <G>
    <Halftone />
    {sky()}
    <Path d="M-10 420 Q120 300 240 300 Q320 290 410 330 L410 710 L-10 710Z" fill="#7FA65A" {...INK} />
    <Path d="M-10 420 Q120 300 240 300 Q320 290 410 330 L410 710 L-10 710Z" fill="url(#dotsBig)" />
    <TowerStockade x={280} y={340} s={0.75} />
    {/* The line of carriers up the slope. */}
    {[[60, 480, 0.42], [110, 450, 0.38], [160, 420, 0.34]].map(([x, y, s], i) => <Carrier key={i} x={x} y={y} s={s} coat={i % 2 ? '#3A5A8C' : '#FFFFFF'} />)}
    <Carrier x={150} y={710} s={1} coat="#FFFFFF" />
    <Person x={320} y={700} s={0.95} coat="#5A4636" pants="#3A3A3A" hat="cap" pose="point" flip />
  </G>
);

/* ---------- The upper Galilee and the Kinneret ---------- */

/* 1. 1882: Rosh Pina on a stony slope above the Hula. */
const roshPina = (
  <G>
    <Halftone />
    {sky()}
    <Path d="M-10 300 L410 300 L410 400 L-10 400Z" fill="#9CB86A" {...INK} />
    <Lake x={260} y={340} rx={90} ry={22} />
    <Path d="M-10 380 Q200 340 410 400 L410 710 L-10 710Z" fill="#B48F55" {...INK} />
    {[[50, 430, 20], [220, 440, 16], [330, 420, 22], [210, 640, 20], [240, 680, 16], [380, 600, 18]].map(([x, y, r], i) => (
      <Ellipse key={i} cx={x} cy={y} rx={r * 1.3} ry={r} fill="#A8A29A" stroke={K.ink} strokeWidth={3} />
    ))}
    <Person x={120} y={700} s={1.1} coat="#5A4636" pants="#3A3A3A" hat="fedora" beard="#3A2A1E" pose="hold" mouth="open" />
    <Ellipse cx={150} cy={576} rx={34} ry={22} fill="#A8A29A" stroke={K.ink} strokeWidth={3.5} />
    <Person x={300} y={700} s={1} dress coat="#7A3B2A" hat="scarf" hatColor="#E8DDC8" pose="hips" flip />
  </G>
);

/* 2. 1910: Degania, the first kvutza, on the shore of the Kinneret. */
const degania = (
  <G>
    <Halftone />
    {sky()}
    <Path d="M-10 260 Q120 200 240 240 Q330 210 410 250 L410 300 L-10 300Z" fill="#8C7A54" {...INK} />
    <Lake x={200} y={330} rx={260} ry={60} />
    <Rect x={-10} y={390} width={420} height={320} fill="#C9A76B" {...INK} />
    <House x={250} y={400} w={120} h={70} fill="#B98A55" windows={2} />
    {[[40, 470], [70, 460]].map(([x, y], i) => <Sapling key={i} x={x} y={y} s={0.8} />)}
    {[[90, 700, 1.05, '#FFFFFF', false], [190, 690, 0.95, K.teal, true], [290, 700, 1.05, '#3A5A8C', false]].map(([x, y, s, c, d], i) => (
      <Person key={i} x={x as number} y={y as number} s={s as number} coat={c as string} pants="#C8B27A" dress={d as boolean}
        hat={d ? 'scarf' : 'tembel'} hatColor={d ? K.orange : undefined} pose={i === 1 ? 'cheer' : 'down'} flip={i === 2} />
    ))}
  </G>
);

/* 3. 1 March 1920: Tel Hai. The roaring lion over the eight who fell. No joke here. */
const telHai = (
  <G>
    <Halftone />
    <Rays cx={200} cy={560} n={22} a="#F2B566" b="#F7D39A" />
    <Path d="M-10 560 Q120 500 220 520 Q320 500 410 540 L410 710 L-10 710Z" fill="#5E7A45" {...INK} />
    <StoneLion x={200} y={560} s={1.25} />
    {[[110, 600], [290, 604], [150, 640], [250, 640]].map(([x, y], i) => (
      <G key={i}>
        <Line x1={x} y1={y} x2={x} y2={y - 20} stroke="#3E5A32" strokeWidth={3} />
        <Circle cx={x} cy={y - 24} r={6} fill={i % 2 ? K.red : K.yellow} stroke={K.ink} strokeWidth={2} />
      </G>
    ))}
  </G>
);

/* ---------- Hadera and Wadi Ara ---------- */

/* 1. The 15th century BCE: Thutmose III leads his army through the narrow pass of Wadi Ara to surprise Megiddo. */
const thutmose = (
  <G>
    <Halftone />
    {sky('#F6D9A0')}
    <Sun x={200} y={240} r={50} />
    {/* The narrow pass between two ridges. */}
    <Path d="M-10 200 L120 260 Q160 400 150 520 L-10 560Z" fill="#B48F55" {...INK} />
    <Path d="M410 220 L290 270 Q240 400 250 520 L410 560Z" fill="#9C7A46" {...INK} />
    <Path d="M-10 200 L120 260 Q160 400 150 520 L-10 560Z" fill="url(#dotsBig)" />
    <Rect x={-10} y={500} width={420} height={210} fill="#D9B97A" {...INK} />
    {[[180, 320, 0.35], [196, 380, 0.45], [176, 450, 0.6]].map(([x, y, s], i) => <Chariot key={i} x={x} y={y} s={s} />)}
    <Person x={300} y={700} s={1.15} robe coat="#FFFFFF" hat="crown" hatColor="#F2C230" pose="point" flip />
    <Person x={90} y={690} s={0.95} robe coat="#E8DDC8" hat="none" hair="#1E1E1E" pose="hold" mouth="open" />
  </G>
);

/** The old khan of Hadera: a long stone building with an arched gate. */
const Khan = ({ x, y }: { x: number; y: number }) => (
  <G>
    <Rect x={x} y={y} width={260} height={120} fill="#D9CBB0" {...INK} />
    <Rect x={x} y={y} width={260} height={120} fill="url(#dots)" />
    <Rect x={x - 6} y={y - 12} width={272} height={14} fill="#B9A882" {...INK} strokeWidth={3} />
    <Path d={`M${x + 100} ${y + 120} L${x + 100} ${y + 60} Q${x + 130} ${y + 30} ${x + 160} ${y + 60} L${x + 160} ${y + 120}Z`} fill={K.woodDark} {...INK} strokeWidth={3} />
    {[30, 200].map((dx) => <Rect key={dx} x={x + dx} y={y + 40} width={26} height={30} fill={K.navyLight} stroke={K.ink} strokeWidth={2.5} />)}
  </G>
);

/* 2. 24 January 1891: Hadera's first settlers move in together in an old khan by the swamps. */
const hadera = (
  <G>
    <Halftone />
    {sky()}
    <Rect x={-10} y={360} width={420} height={350} fill="#B9A06A" {...INK} />
    <Khan x={70} y={250} />
    <Swamp y={420} to={480} />
    <Person x={90} y={700} s={1.05} coat="#5A4636" pants="#3A3A3A" hat="fedora" beard="#3A2A1E" pose="point" />
    <Person x={210} y={700} s={0.95} dress coat="#7A2E5A" hat="scarf" hatColor="#E8DDC8" />
    <Person x={300} y={700} s={0.6} coat={K.orange} flip />
    <Person x={350} y={700} s={0.7} dress coat={K.teal} hair="#6B3B1E" flip />
  </G>
);

/* 3. Eucalyptus trees planted on the swamps to drain them; they still stand in Hadera. */
const eucalyptus = (
  <G>
    <Halftone />
    {sky()}
    {[[50, 420, 1.1], [150, 400, 1], [260, 410, 1.05], [360, 430, 1.1]].map(([x, y, s], i) => <Eucalyptus key={i} x={x} y={y} s={s} />)}
    <Swamp y={420} to={540} />
    <Rect x={-10} y={540} width={420} height={170} fill="#B9A06A" {...INK} />
    <Person x={110} y={700} s={1.05} coat="#FFFFFF" pants="#5A4636" hat="tembel" pose="hold" />
    <Sapling x={160} y={604} s={1.1} />
    <Person x={300} y={700} s={1} coat="#3A5A8C" pants="#3A3A3A" hat="cap" pose="hips" flip />
  </G>
);

const cap = (text: string, y = 0.03): Panel['bubbles'][number] => ({ kind: 'cap', text, x: 0.04, y, w: 0.92 });
const end = (today: string): Panel['bubbles'][number] => ({ kind: 'cap', text: today, x: 0.04, y: 0.89, w: 0.56 });

export const regions2: Record<string, Tale> = {
  jrs: {
    title: 'הרי ירושלים',
    panels: (t, today) => [
      { art: motza, focus: [0.5, 0.6], bubbles: [cap('1854. שאול יהודה, יהודי יוצא בגדד, קונה אדמה במוצא. אחת החוות היהודיות הראשונות מחוץ לחומות ירושלים.'),
        { kind: 'say', text: 'בתוך החומות צפוף. פה יש מקום, וגם המון אבנים.', x: 0.04, y: 0.44, w: 0.6, tail: { at: 0.3 } }] },
      { art: anavim, focus: [0.5, 0.55], bubbles: [cap('1920. חלוצי העלייה השלישית עולים להר ומקימים את קריית ענבים, הקיבוץ הראשון בהרי יהודה. את המדרונות הם הופכים לטרסות.'),
        { kind: 'say', text: 'אמרו שבהר אי אפשר לעבד. אז בנינו מדרגות.', x: 0.04, y: 0.5, w: 0.56, tail: { at: 0.3 } }] },
      { art: burma, focus: [0.5, 0.6], bubbles: [cap('1948. ירושלים במצור. בלילות פורצים בהרים דרך עוקפת, ״דרך בורמה״. איפה שהג׳יפים לא מטפסים, אנשים סוחבים שקים על הגב.'),
        { kind: 'say', text: 'עוד עלייה אחת, והקמח הזה יהיה לחם בירושלים.', x: 0.04, y: 0.44, w: 0.58, tail: { at: 0.3 } }, end(today)] },
    ],
  },
  emk: {
    title: 'העמקים',
    panels: (t, today) => [
      { art: gideon, focus: [0.5, 0.55], bubbles: [cap('לפי התנ״ך: גדעון חונה ליד עין חרוד. רק 300 לוחמים, אלה שלקקו את המים מכף היד, יוצאים איתו נגד מדיין.'),
        { kind: 'say', text: 'מי שלוקק בא איתי. כל השאר הביתה.', x: 0.04, y: 0.48, w: 0.56, tail: { at: 0.3 } }] },
      { art: gdud, focus: [0.5, 0.6], bubbles: [cap('1921. חלוצי ״גדוד העבודה״ מקימים מחנה אוהלים ליד המעיין, למרגלות הגלבוע. מכאן צומח קיבוץ עין חרוד.'),
        { kind: 'say', text: 'יש מעיין, יש אוהלים. מיטות יגיעו מתישהו.', x: 0.04, y: 0.5, w: 0.56, tail: { at: 0.3 } }] },
      { art: nahalal, focus: [0.5, 0.5], bubbles: [cap('11 בספטמבר 1921. בעמק יזרעאל עולה לקרקע נהלל, מושב העובדים הראשון. האדריכל ריכרד קאופמן מתכנן אותו כמעגל.'),
        { kind: 'say', text: 'למה עיגול? ככה כולם קרובים לכולם.', x: 0.36, y: 0.6, w: 0.56, tail: { at: 0.2, lean: -0.6 } }, end(today)] },
    ],
  },
  wgl: {
    title: 'הגליל המערבי',
    panels: (t, today) => [
      { art: acre, focus: [0.45, 0.6], bubbles: [cap('1799. נפוליאון מטיל מצור על עכו במשך חודשיים, ולא מצליח לפרוץ את החומה. במאי הוא מוותר וחוזר למצרים.'),
        { kind: 'say', text: 'חומה? איזו חומה? אה. החומה הזאת.', x: 0.04, y: 0.45, w: 0.56, tail: { at: 0.3 } }] },
      { art: nahariya, focus: [0.5, 0.6], bubbles: [cap('1935. עולים מגרמניה מקימים את נהריה, משני צדי הנחל. רבים מהם אנשי עיר משכילים, שניסו להפוך לחקלאים.'),
        { kind: 'say', text: 'בברלין לא ראיתי פרה מקרוב.', x: 0.04, y: 0.5, w: 0.6, tail: { at: 0.3 } }] },
      { art: hanita, focus: [0.5, 0.6], bubbles: [cap('21 במרץ 1938. כ־400 איש עולים ברגל להר שליד גבול לבנון, סוחבים קורות וקרשים, ומקימים ביום אחד חומה ומגדל: חניתה.'),
        { kind: 'say', text: 'עד הערב זה צריך לעמוד.', x: 0.44, y: 0.5, w: 0.5, tail: { at: 0.7, lean: 0.2 } }, end(today)] },
    ],
  },
  ugl: {
    title: 'הגליל העליון',
    panels: (t, today) => [
      { art: roshPina, focus: [0.5, 0.6], bubbles: [cap('1882. עולים מרומניה מקימים מושבה במדרון מעל עמק החולה. את השם לקחו מתהילים: ״אבן מאסו הבונים היתה לראש פינה״.'),
        { kind: 'say', text: 'יש פה בעיקר אבנים. אז נקרא לה על שם אבן.', x: 0.04, y: 0.48, w: 0.58, tail: { at: 0.3 } }] },
      { art: degania, focus: [0.5, 0.58], bubbles: [cap('1910. עשרה צעירים ושתי צעירות מקימים על שפת הכנרת את דגניה, ״אם הקבוצות״. הכול משותף.'),
        { kind: 'say', text: 'הכול משותף. גם התורנות במטבח.', x: 0.28, y: 0.48, w: 0.5, tail: { at: 0.4 } }] },
      { art: telHai, focus: [0.5, 0.6], bubbles: [cap('1 במרץ 1920. בקרב על תל חי נופלים שישה מגינים, ובהם יוסף טרומפלדור. קריית שמונה נקראת על שם שמונת הנופלים של אותו חורף. מאז 1934 שומר עליהם אריה שואג מאבן.'),
        end(today)] },
    ],
  },
  hdr: {
    title: 'חדרה וואדי ערה',
    panels: (t, today) => [
      { art: thutmose, focus: [0.5, 0.55], bubbles: [cap('המאה ה־15 לפנה״ס. פרעה תחותמס השלישי בוחר להוביל את צבאו בנתיב הצר של ואדי ערה, ומפתיע את אויביו במגידו.'),
        { kind: 'say', text: 'הדרך צרה? בגלל זה לא מחכים לנו שם.', x: 0.4, y: 0.42, w: 0.56, tail: { at: 0.6, lean: 0.2 } }] },
      { art: hadera, focus: [0.5, 0.6], bubbles: [cap('ינואר 1891. המתיישבים הראשונים של חדרה מגיעים, והמשפחות גרות יחד בח׳אן ישן אחד ליד הביצות. הח׳אן עומד שם עד היום.'),
        { kind: 'say', text: 'יש ביצה, אבל יש גג.', x: 0.04, y: 0.5, w: 0.46, tail: { at: 0.3 } }] },
      { art: eucalyptus, focus: [0.5, 0.6], bubbles: [cap('הקדחת קשה מאוד. כדי לייבש את הביצות שותלים מאות אלפי עצי אקליפטוס. הם עומדים בחדרה עד היום.'),
        { kind: 'say', text: 'העצים האלה שותים כמו גמלים.', x: 0.36, y: 0.5, w: 0.56, tail: { at: 0.6, lean: 0.2 } }, end(today)] },
    ],
  },
};

