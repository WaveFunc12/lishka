import { Circle, Ellipse, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import { F } from '../../theme';
import type { Panel } from '../ComicPlayer';
import { Halftone, K, Rays } from '../parts';
import { Dunes, House, Person, Sun } from '../people';
import { Donkey, Fire, Flag, Hanukkiah, Plane, Sign } from '../props';
import { Eucalyptus, Field, Hills, Mosquito, Swamp, Tent } from '../scenery';
import type { Tale } from './index';

/* Region stories, part 1: Gush Dan, the Sharon and Emek Hefer, the Shfela, Petah Tikva and the Carmel. */

const sky = (fill = '#CDE7EA') => <Rect x={0} y={0} width={400} height={700} fill={fill} />;

/** A watermelon, striped. */
const Melon = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <G transform={`translate(${x} ${y}) scale(${s})`}>
    <Ellipse cx={0} cy={0} rx={26} ry={18} fill="#3E8A3A" stroke={K.ink} strokeWidth={3} />
    <Path d="M-18 -10 Q-22 0 -18 10 M-6 -16 Q-10 0 -6 16 M8 -16 Q4 0 8 16 M20 -10 Q16 0 20 10" stroke="#1F5A22" strokeWidth={3} fill="none" />
  </G>
);

/* ---------- Gush Dan ---------- */

const ramatGan = (
  <G>
    <Halftone />
    {sky()}
    <Sun x={320} y={110} r={40} />
    {[30, 80, 130, 180, 230].map((x, i) => (
      <G key={x}>
        <Rect x={x} y={300 - (i % 2) * 14} width={40} height={40 + (i % 2) * 14} fill="#F0E2C2" stroke={K.ink} strokeWidth={3} />
        <Path d={`M${x - 4} ${300 - (i % 2) * 14} L${x + 20} ${284 - (i % 2) * 14} L${x + 44} ${300 - (i % 2) * 14}Z`} fill={K.red} stroke={K.ink} strokeWidth={3} />
      </G>
    ))}
    <Field y={340} fill="#D9B85A" rows="#B8963A" />
    {[[60, 520], [150, 470], [300, 500], [250, 600], [90, 640], [350, 640]].map(([x, y], i) => <Melon key={i} x={x} y={y} s={0.9 + (i % 3) * 0.15} />)}
    <Person x={250} y={690} s={1.15} coat="#FFFFFF" pants="#C8B27A" hat="tembel" pose="hold" />
    <Melon x={270} y={566} s={1.1} />
    <Person x={110} y={700} s={1} dress coat={K.teal} hat="scarf" hatColor={K.orange} flip />
  </G>
);

/** The wooden frame of a building going up. */
const Frame = ({ x, y, w, h }: { x: number; y: number; w: number; h: number }) => (
  <G>
    {[0, 0.33, 0.66, 1].map((f) => <Line key={f} x1={x + w * f} y1={y} x2={x + w * f} y2={y + h} stroke={K.ink} strokeWidth={9} />)}
    {[0, 0.33, 0.66, 1].map((f) => <Line key={'i' + f} x1={x + w * f} y1={y} x2={x + w * f} y2={y + h} stroke={K.wood} strokeWidth={5} />)}
    <Line x1={x - 10} y1={y} x2={x + w + 10} y2={y} stroke={K.ink} strokeWidth={9} />
    <Line x1={x - 10} y1={y} x2={x + w + 10} y2={y} stroke={K.wood} strokeWidth={5} />
    <Path d={`M${x - 10} ${y} L${x + w / 2} ${y - h * 0.4} L${x + w + 10} ${y}`} stroke={K.ink} strokeWidth={9} fill="none" />
    <Path d={`M${x - 10} ${y} L${x + w / 2} ${y - h * 0.4} L${x + w + 10} ${y}`} stroke={K.wood} strokeWidth={5} fill="none" />
    <Line x1={x} y1={y + h} x2={x + w * 0.33} y2={y} stroke={K.wood} strokeWidth={4} />
  </G>
);

const bneiBrak = (
  <G>
    <Halftone />
    {sky('#F6D9A0')}
    <Dunes y={330} />
    <Frame x={180} y={250} w={190} h={150} />
    {/* A cart with the families' belongings. */}
    <Path d="M20 470 L170 470 L160 500 L30 500Z" fill={K.wood} stroke={K.ink} strokeWidth={4} />
    <Circle cx={50} cy={510} r={22} fill="none" stroke={K.ink} strokeWidth={6} />
    <Circle cx={140} cy={510} r={22} fill="none" stroke={K.ink} strokeWidth={6} />
    <Rect x={40} y={430} width={44} height={40} rx={4} fill="#7A3B2A" stroke={K.ink} strokeWidth={3} />
    <Rect x={90} y={440} width={56} height={30} rx={4} fill={K.navyLight} stroke={K.ink} strokeWidth={3} />
    <Person x={150} y={700} s={1.2} coat="#1E1E1E" pants="#1E1E1E" hat="shtreimel" beard="#5A3A22" pose="point" />
    <Person x={300} y={690} s={1} coat="#1E1E1E" pants="#1E1E1E" hat="fedora" hatColor="#1E1E1E" beard="#2B2B2B" flip />
    <Person x={360} y={700} s={0.9} dress coat="#5A6E8C" hat="scarf" hatColor="#2B3A55" flip />
  </G>
);

const holon = (
  <G>
    <Halftone />
    {sky()}
    <Dunes y={250} />
    {/* Wind-blown sand. */}
    {[[60, 200], [140, 160], [260, 210], [330, 170]].map(([x, y], i) => <Path key={i} d={`M${x} ${y} q20 -8 40 0 q20 8 40 0`} stroke="#E6C78C" strokeWidth={4} fill="none" strokeLinecap="round" />)}
    {/* The cornerstone. */}
    <Rect x={150} y={470} width={110} height={60} fill="#D9CBB0" stroke={K.ink} strokeWidth={4} />
    <SvgText x={205} y={508} fontSize={16} fontFamily={F.black} textAnchor="middle" fill={K.ink}>אבן פינה</SvgText>
    <Person x={90} y={680} s={1.1} coat="#E8E2D6" pants="#C8B27A" hat="boater" pose="hold" />
    <G transform="rotate(-6 150 560)">
      <Rect x={110} y={530} width={110} height={70} fill="#2F5FB3" stroke={K.ink} strokeWidth={3.5} />
      <Path d="M122 550 L208 550 M122 566 L180 566 M122 582 L196 582 M160 540 L160 590" stroke="#FFFFFF" strokeWidth={2} />
    </G>
    <Person x={320} y={690} s={1.05} coat={K.navy} hat="fedora" moustache flip pose="hips" />
  </G>
);

/* ---------- The Sharon and Emek Hefer ---------- */

const hankin = (
  <G>
    <Halftone />
    <Rect x={0} y={0} width={400} height={700} fill="#E9D2A6" />
    <Rect x={0} y={0} width={400} height={700} fill="url(#dotsBig)" />
    {/* A map of the valley pinned to the wall. */}
    <Rect x={200} y={130} width={170} height={210} fill="#F6E3BA" stroke={K.ink} strokeWidth={4} />
    <Path d="M210 330 Q240 260 230 200 Q236 160 220 140" stroke={K.teal} strokeWidth={4} fill="none" />
    <Path d="M250 180 L340 170 L350 290 L260 300Z" fill="#8FB86A" stroke={K.ink} strokeWidth={3} opacity={0.8} />
    <SvgText x={300} y={240} fontSize={15} fontFamily={F.black} textAnchor="middle" fill={K.ink}>ואדי</SvgText>
    <SvgText x={300} y={258} fontSize={15} fontFamily={F.black} textAnchor="middle" fill={K.ink}>חווארת</SvgText>
    {/* The desk and the deed. */}
    <Rect x={-10} y={520} width={420} height={190} fill={K.wood} stroke={K.ink} strokeWidth={4} />
    <Rect x={-10} y={520} width={420} height={14} fill={K.woodDark} stroke={K.ink} strokeWidth={3} />
    <Person x={120} y={640} s={1.25} coat="#3A3A3A" hat="fedora" beard="#D9D2C4" pose="hold" />
    <G transform="rotate(-4 260 560)">
      <Rect x={190} y={530} width={150} height={100} fill="#FFFFFF" stroke={K.ink} strokeWidth={3.5} />
      {[548, 564, 580, 596].map((y) => <Line key={y} x1={202} y1={y} x2={326} y2={y} stroke="#9AA3AD" strokeWidth={2} />)}
      <Path d="M220 616 q10 -14 20 0 t20 0 t20 -6" stroke={K.navy} strokeWidth={3} fill="none" />
    </G>
    <Line x1={330} y1={600} x2={380} y2={560} stroke={K.ink} strokeWidth={6} strokeLinecap="round" />
  </G>
);

const ussishkin = (
  <G>
    <Halftone />
    <Rays cx={200} cy={330} n={26} a="#F7C873" b="#FBE7B9" />
    {/* The podium and the crowd. */}
    <Person x={200} y={560} s={1.3} coat="#2B2B2B" hat="none" hair="#E8E8E4" moustache pose="wave" mouth="shout" />
    <G transform="translate(266 240) rotate(10)">
      <Rect x={0} y={0} width={70} height={90} fill="#F6E3BA" stroke={K.ink} strokeWidth={3.5} />
      {[22, 38, 54, 70].map((y) => <Line key={y} x1={10} y1={y} x2={60} y2={y} stroke="#9AA3AD" strokeWidth={2} />)}
    </G>
    <Path d="M110 520 L290 520 L270 700 L130 700Z" fill={K.woodDark} stroke={K.ink} strokeWidth={4} />
    <Rect x={110} y={520} width={180} height={18} fill={K.wood} stroke={K.ink} strokeWidth={3} />
    {[30, 70, 330, 370].map((x, i) => (
      <G key={x}>
        <Circle cx={x} cy={640} r={26} fill={i % 2 ? '#3A3A3A' : '#5A4636'} stroke={K.ink} strokeWidth={3} />
        <Path d={`M${x - 40} 700 Q${x - 36} 664 ${x} 664 Q${x + 36} 664 ${x + 40} 700Z`} fill={i % 2 ? K.navy : '#3A3A3A'} stroke={K.ink} strokeWidth={3} />
      </G>
    ))}
  </G>
);

const vitkin = (
  <G>
    <Halftone />
    {sky()}
    {/* The old stone house the twenty lived in. */}
    <House x={250} y={250} w={120} h={90} fill="#D9CBB0" windows={2} />
    <Eucalyptus x={60} y={360} s={1.1} />
    <Rect x={-10} y={340} width={420} height={60} fill="#B48F55" stroke={K.ink} strokeWidth={4} />
    <Swamp y={400} />
    {[[90, 420, 1.2], [140, 380, 1], [300, 410, 1.1], [340, 440, 0.9], [200, 360, 1]].map(([x, y, s], i) => <Mosquito key={i} x={x} y={y} s={s} />)}
    <Person x={120} y={690} s={1.05} coat="#FFFFFF" pants="#C8B27A" hat="tembel" pose="hold" mouth="open" />
    <Line x1={150} y1={570} x2={190} y2={680} stroke={K.ink} strokeWidth={7} />
    <Line x1={150} y1={570} x2={190} y2={680} stroke={K.wood} strokeWidth={3} />
    <Path d="M176 676 L204 690 L196 702 L170 690Z" fill={K.steel} stroke={K.ink} strokeWidth={3} />
    <Person x={290} y={700} s={1} coat={K.teal} pants="#C8B27A" hat="cap" pose="cheer" flip />
  </G>
);

/* ---------- The Shfela ---------- */

const rishon = (
  <G>
    <Halftone />
    {sky('#F6D9A0')}
    <Sun x={320} y={110} r={44} />
    <Dunes y={300} />
    {/* The well rig and the water. */}
    <Path d="M140 470 L200 260 L260 470 M160 400 L240 400" stroke={K.ink} strokeWidth={8} fill="none" />
    <Path d="M140 470 L200 260 L260 470" stroke={K.wood} strokeWidth={4} fill="none" />
    <Circle cx={200} cy={262} r={10} fill={K.steel} stroke={K.ink} strokeWidth={3} />
    <Path d="M200 470 Q170 380 150 340 Q190 360 200 300 Q210 360 250 340 Q230 380 200 470Z" fill="#9FD3DA" stroke={K.ink} strokeWidth={3.5} />
    {[[150, 330], [250, 330], [130, 380], [270, 380]].map(([x, y], i) => <Path key={i} d={`M${x} ${y} q6 -14 12 0 q-6 8 -12 0Z`} fill="#9FD3DA" stroke={K.ink} strokeWidth={2} />)}
    <Ellipse cx={200} cy={480} rx={90} ry={18} fill="#9FD3DA" stroke={K.ink} strokeWidth={3.5} />
    <Person x={70} y={690} s={1.05} coat="#FFFFFF" pants="#5A4636" hat="fedora" beard="#5A3A22" pose="cheer" mouth="shout" />
    <Person x={330} y={690} s={1.05} dress coat={K.orange} hat="scarf" hatColor="#FFFFFF" pose="cheer" mouth="shout" flip />
  </G>
);

const gedera = (
  <G>
    <Halftone />
    <Rect x={0} y={0} width={400} height={700} fill="#1B2A4A" />
    <Rect x={0} y={0} width={400} height={700} fill="url(#dotsBig)" />
    {[[40, 60], [120, 120], [300, 70], [360, 160], [220, 40], [80, 200]].map(([x, y], i) => <Circle key={i} cx={x} cy={y} r={3} fill="#FFFFFF" />)}
    <Circle cx={320} cy={130} r={26} fill="#FBE7B9" stroke={K.ink} strokeWidth={3} />
    <Hills y={360} />
    <Tent x={310} y={420} s={0.8} />
    {/* The candles stand on a crate on the hilltop, above the settlers' heads. */}
    <Circle cx={190} cy={370} r={80} fill={K.lit} opacity={0.25} />
    <Rect x={150} y={400} width={80} height={40} fill={K.wood} stroke={K.ink} strokeWidth={3} />
    <Hanukkiah x={190} y={360} s={1} n={8} />
    <Person x={90} y={690} s={1.05} coat="#5A4636" pants="#3A3A3A" hat="cap" pose="hold" />
    <Person x={190} y={710} s={1.05} dress coat="#2B3A55" hair="#3A2A1E" />
    <Person x={300} y={690} s={1.05} coat="#7A3B2A" pants="#3A3A3A" hat="fedora" moustache flip pose="wave" />
  </G>
);

const nessZiona = (
  <G>
    <Halftone />
    <Rays cx={220} cy={240} n={24} a="#CDE7EA" b="#E4F2F4" />
    <Hills y={380} green />
    <Flag x={130} y={450} h={300} w={180} />
    <Person x={110} y={690} s={1.1} coat="#FFFFFF" pants="#5A4636" hat="fedora" moustache pose="cheer" />
    <Person x={300} y={690} s={1.05} coat={K.navy} pants="#3A3A3A" hat="cap" flip pose="wave" />
  </G>
);

/* ---------- Petah Tikva and Rosh HaAyin ---------- */

const petahTikva = (
  <G>
    <Halftone />
    {sky()}
    <Sun x={80} y={110} r={40} />
    <Rect x={-10} y={330} width={420} height={380} fill="#B9A06A" stroke={K.ink} strokeWidth={4} />
    <Path d="M-10 420 Q120 400 220 430 T410 420" stroke={K.teal} strokeWidth={14} fill="none" />
    <Path d="M-10 420 Q120 400 220 430 T410 420" stroke={K.ink} strokeWidth={2} fill="none" />
    <House x={260} y={250} w={110} h={90} fill="#EFE2C2" windows={2} />
    <Sign x={200} y={500} text="פתח תקווה" w={170} />
    <Person x={60} y={700} s={1.05} coat="#5A4636" pants="#3A3A3A" hat="fedora" beard="#3A2A1E" pose="point" />
    <Person x={300} y={700} s={1.05} coat="#3A3A3A" pants="#3A3A3A" hat="kippah" beard="#8A4B22" flip pose="hold" />
  </G>
);

const malaria = (
  <G>
    <Halftone />
    {sky('#D7E4C4')}
    <Swamp y={330} to={470} />
    <Rect x={-10} y={470} width={420} height={240} fill="#B9A06A" stroke={K.ink} strokeWidth={4} />
    {Array.from({ length: 16 }, (_, i) => <Mosquito key={i} x={40 + ((i * 53) % 330)} y={150 + ((i * 41) % 170)} s={0.8 + (i % 3) * 0.25} />)}
    {/* Back again, digging drainage ditches. */}
    <Path d="M-10 560 L410 540 L410 580 L-10 600Z" fill="#5B7A5A" stroke={K.ink} strokeWidth={3} />
    <Person x={90} y={690} s={1.05} coat="#FFFFFF" pants="#5A4636" hat="tembel" pose="hold" />
    <Line x1={120} y1={580} x2={150} y2={680} stroke={K.ink} strokeWidth={7} />
    <Line x1={120} y1={580} x2={150} y2={680} stroke={K.wood} strokeWidth={3} />
    <Person x={300} y={690} s={1.05} coat={K.navy} pants="#3A3A3A" hat="cap" pose="cheer" mouth="shout" flip />
  </G>
);

const roshHaAyin = (
  <G>
    <Halftone />
    {sky()}
    <Plane x={240} y={140} s={0.85} />
    {/* The old fortress by the springs. */}
    <Rect x={20} y={280} width={150} height={80} fill="#C9B489" stroke={K.ink} strokeWidth={4} />
    {[20, 60, 100, 140].map((x) => <Rect key={x} x={x} y={266} width={20} height={16} fill="#C9B489" stroke={K.ink} strokeWidth={3} />)}
    <Rect x={-10} y={360} width={420} height={350} fill="#B9A06A" stroke={K.ink} strokeWidth={4} />
    <Ellipse cx={300} cy={420} rx={90} ry={22} fill={K.teal} stroke={K.ink} strokeWidth={3.5} />
    <Tent x={110} y={470} s={0.8} />
    <Tent x={360} y={500} s={0.7} />
    <Person x={150} y={700} s={1.1} coat="#E8E2D6" pants="#5A4636" hat="kippah" beard="#2B2B2B" pose="hold" />
    <Person x={250} y={700} s={1.05} dress coat="#7A2E5A" hat="scarf" hatColor="#3A2A1E" flip />
    <Person x={320} y={700} s={0.6} coat={K.orange} flip />
  </G>
);

/* ---------- The Carmel ---------- */

const elijah = (
  <G>
    <Halftone />
    <Rays cx={250} cy={-40} n={24} a="#F4A04A" b="#F7C873" />
    <Hills y={430} green />
    {/* The altar of twelve stones, soaked, and the fire from the sky. */}
    <Path d="M230 -10 L250 250 L290 -10" fill={K.lit} opacity={0.7} />
    {Array.from({ length: 12 }, (_, i) => (
      <Rect key={i} x={190 + (i % 4) * 30} y={420 - Math.floor(i / 4) * 24} width={30} height={24} fill="#A8A29A" stroke={K.ink} strokeWidth={3} />
    ))}
    <Fire x={250} y={350} s={1.2} />
    {/* Elijah, and the prophets of Baal still shouting in the distance. */}
    <Person x={100} y={690} s={1.2} robe coat="#8A5A3A" hat="cloth" hatColor="#C9B489" hair="#5A3A22" beard="#5A3A22" pose="point" />
    {[300, 340, 380].map((x, i) => <Person key={x} x={x} y={600 + i * 10} s={0.5} robe coat="#7A2E5A" hat="cloth" hatColor="#D9431A" pose="cheer" mouth="shout" flip />)}
  </G>
);

const daliyat = (
  <G>
    <Halftone />
    {sky()}
    <Rect x={-10} y={300} width={140} height={60} fill={K.teal} stroke={K.ink} strokeWidth={3} />
    <Hills y={300} green />
    {/* Old ruins on the hilltop, olive trees around. */}
    {[[210, 330, 60], [250, 320, 40], [290, 336, 50]].map(([x, y, h], i) => <Rect key={i} x={x} y={y - h} width={30} height={h} fill="#C9B489" stroke={K.ink} strokeWidth={3} />)}
    {[[90, 430], [350, 440], [160, 470]].map(([x, y], i) => (
      <G key={i}>
        <Path d={`M${x} ${y} Q${x - 6} ${y - 30} ${x + 4} ${y - 50}`} stroke={K.woodDark} strokeWidth={8} fill="none" />
        <Ellipse cx={x + 4} cy={y - 66} rx={36} ry={22} fill="#7F9A6A" stroke={K.ink} strokeWidth={3} />
      </G>
    ))}
    <Donkey x={330} y={640} s={1.1} load />
    <Person x={60} y={700} s={0.95} dress coat="#2B3A55" hat="scarf" hatColor="#FFFFFF" />
    <Person x={160} y={700} s={1.15} coat="#1E1E1E" pants="#1E1E1E" hat="turban" moustache pose="point" />
  </G>
);

const zichron = (
  <G>
    <Halftone />
    {sky()}
    <Rect x={-10} y={260} width={140} height={40} fill={K.teal} stroke={K.ink} strokeWidth={3} />
    <Hills y={280} />
    {[[60, 420], [130, 450], [300, 430], [350, 470]].map(([x, y], i) => <Ellipse key={i} cx={x} cy={y} rx={30} ry={16} fill="#A8A29A" stroke={K.ink} strokeWidth={3} />)}
    <Person x={90} y={700} s={1.05} coat="#5A4636" pants="#3A3A3A" hat="cap" beard="#3A2A1E" pose="hold" />
    {/* The Baron's official with a street plan. */}
    <Person x={300} y={700} s={1.2} coat="#1E1E1E" pants="#1E1E1E" hat="fedora" hatColor="#1E1E1E" moustache flip pose="hold" />
    <G transform="rotate(4 200 560)">
      <Rect x={150} y={500} width={120} height={90} fill="#FFFFFF" stroke={K.ink} strokeWidth={3.5} />
      <Path d="M210 500 L210 590 M150 545 L270 545 M180 500 L180 590 M240 500 L240 590" stroke={K.navyLight} strokeWidth={2} />
    </G>
  </G>
);

const cap = (text: string, y = 0.03): Panel['bubbles'][number] => ({ kind: 'cap', text, x: 0.04, y, w: 0.92 });
const end = (today: string): Panel['bubbles'][number] => ({ kind: 'cap', text: today, x: 0.04, y: 0.89, w: 0.56 });

export const regions1: Record<string, Tale> = {
  dan: {
    title: 'גוש דן',
    panels: (t, today) => [
      { art: ramatGan, focus: [0.6, 0.6], bubbles: [cap('1921. אגודת ״עיר גנים״ מקימה מושבה חקלאית ליד תל אביב: חיטה, שעורה ואבטיחים. ב־1923 היא נקראת רמת גן.'),
        { kind: 'say', text: 'רמת גן? בינתיים זה בעיקר אבטיחים.', x: 0.42, y: 0.5, w: 0.54, tail: { at: 0.4, lean: -0.2 } }] },
      { art: bneiBrak, focus: [0.55, 0.5], bubbles: [cap('1924. שמונה משפחות חסידים מפולין, בראשות יצחק גרשטנקורן, מקימות את בני ברק. את השם לקחו מספר יהושע.'),
        { kind: 'say', text: 'קודם בית מדרש. אחר כך נחשוב איפה לישון.', x: 0.04, y: 0.48, w: 0.56, tail: { at: 0.4, lean: -0.1 } }] },
      { art: holon, focus: [0.5, 0.62], bubbles: [cap('אמצע שנות ה־30. על הדיונות שמדרום לתל אביב קמה חולון.'),
        { kind: 'say', text: 'יש פה המון חול. נקרא לה חולון.', x: 0.4, y: 0.52, w: 0.56, tail: { at: 0.7, lean: 0.3 } }, end(today)] },
    ],
  },
  shr: {
    title: 'השרון ועמק חפר',
    panels: (t, today) => [
      { art: hankin, focus: [0.5, 0.6], bubbles: [cap('1927. יהושע חנקין, ״גואל האדמות״, חותם על קניית אדמות ואדי חווארת. היום זה עמק חפר.'),
        { kind: 'say', text: 'חתמנו. עכשיו רק צריך למצוא את הכסף.', x: 0.04, y: 0.38, w: 0.46, tail: { at: 0.5 } }] },
      { art: ussishkin, focus: [0.5, 0.42], amount: 1.16, bubbles: [cap('1929, הקונגרס הציוני. מנחם אוסישקין, שגייס חלק גדול מהכסף בקנדה, מכריז:'),
        { kind: 'shout', text: 'עמק חפר בידינו!', x: 0.12, y: 0.16, w: 0.76 }] },
      { art: vitkin, focus: [0.5, 0.6], bubbles: [cap('1930. עשרים צעירים גרים בבית אבן נטוש, מייבשים את הביצות, וב־1933 בונים את בתי כפר ויתקין.'),
        { kind: 'say', text: 'יתושים 1, חלוצים 0. בינתיים.', x: 0.36, y: 0.44, w: 0.56, tail: { at: 0.2, lean: -0.6 } }, end(today)] },
    ],
  },
  shf: {
    title: 'השפלה',
    panels: (t, today) => [
      { art: rishon, focus: [0.5, 0.5], bubbles: [cap('1883. אחרי חודשים של חול ויובש, מתיישבי ראשון לציון מוצאים מים. המילים האלה נמצאות עד היום בסמל העיר.'),
        { kind: 'shout', text: 'מצאנו מים!', x: 0.22, y: 0.2, w: 0.56 }] },
      { art: gedera, focus: [0.5, 0.62], bubbles: [cap('חנוכה 1884. חלוצי ביל״ו מגיעים לגבעה ריקה ומקימים את גדרה.'),
        { kind: 'say', text: 'חנוכה שמח, וברוכים הבאים לגדרה!', x: 0.44, y: 0.22, w: 0.52, tail: { at: 0.6, lean: 0.4 } }] },
      { art: nessZiona, focus: [0.52, 0.42], bubbles: [cap('1891. בנס ציונה מניפים דגל כחול־לבן עם מגן דוד, דומה מאוד לדגל המדינה של היום.'),
        { kind: 'say', text: 'שימו לב לצבעים. זה עוד יתפוס.', x: 0.04, y: 0.46, w: 0.5, tail: { at: 0.4 } }, end(today)] },
    ],
  },
  ptk: {
    title: 'פתח תקווה וראש העין',
    panels: (t, today) => [
      { art: petahTikva, focus: [0.45, 0.6], bubbles: [cap('1878. המייסדים רצו להתיישב ליד יריחו, אבל השלטון העות׳מאני ביטל את הקנייה. הם קנו אדמה ליד הירקון, והשם נשאר.'),
        { kind: 'say', text: 'המקום השתנה. השם נשאר: פתח תקווה, מספר הושע.', x: 0.04, y: 0.36, w: 0.62, tail: { at: 0.2 } }] },
      { art: malaria, focus: [0.5, 0.45], bubbles: [cap('הקדחת מבריחה את המתיישבים ליהוד. ב־1883 הם חוזרים, והברון רוטשילד מממן ייבוש ביצות. ״אם המושבות״ ניצלה.'),
        { kind: 'shout', text: 'יתושים? חזרנו!', x: 0.44, y: 0.44, w: 0.5 }] },
      { art: roshHaAyin, focus: [0.55, 0.55], bubbles: [cap('1949. עולים מתימן שהגיעו במבצע ״על כנפי נשרים״ מקימים מעברה ליד מעיינות הירקון. משם צומחת ראש העין.'),
        { kind: 'say', text: 'טסנו על כנפי נשרים, ונחתנו ליד מעיין.', x: 0.04, y: 0.5, w: 0.56, tail: { at: 0.4 } }, end(today)] },
    ],
  },
  hfa: {
    title: 'הכרמל',
    panels: (t, today) => [
      { art: elijah, focus: [0.5, 0.5], amount: 1.16, bubbles: [cap('לפי התנ״ך: על הכרמל אליהו מתמודד מול 450 נביאי הבעל. הם צועקים מהבוקר ועד הצהריים. אצלו יורדת אש מהשמיים.'),
        { kind: 'say', text: 'קראו בקול גדול! אולי אלוהיכם ישן?', x: 0.02, y: 0.42, w: 0.46, tail: { at: 0.4 } }] },
      { art: daliyat, focus: [0.5, 0.55], bubbles: [cap('לפי המסורת המקומית, משפחה דרוזית מאזור חלב מגיעה לחורבות עתיקות בכרמל, ומקימה את דאלית אל־כרמל.'),
        { kind: 'say', text: 'נוף לים, ואבנים מוכנות. נשארים.', x: 0.2, y: 0.5, w: 0.56, tail: { at: 0.4 } }] },
      { art: zichron, focus: [0.5, 0.6], bubbles: [cap('1882. כמאה חלוצים מרומניה עולים לזמרין שבכרמל. ב־1883 הברון רוטשילד מאמץ את המושבה וקורא לה זכרון יעקב.'),
        { kind: 'say', text: 'הברון קרא לה על שם אבא שלו, יעקב.', x: 0.04, y: 0.5, w: 0.56, tail: { at: 0.3 } }, end(today)] },
    ],
  },
};

