import { Circle, Ellipse, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import { F } from '../../theme';
import type { Panel } from '../ComicPlayer';
import { Halftone, K, Rays } from '../parts';
import { Dunes, House, Person, Sea, Sun } from '../people';
import { Barrack, Fire, Flag, Ostracon, Ruin, Sign } from '../props';
import { Hills, TowerStockade, Truck, WaterTower } from '../scenery';
import type { Tale } from './index';

/* Region stories, part 3: the southern coast, the Negev, Samaria, Binyamin and Gush Etzion, and the Golan. */

const sky = (fill = '#CDE7EA') => <Rect x={0} y={0} width={400} height={700} fill={fill} />;
const night = (
  <G>
    <Rect x={0} y={0} width={400} height={700} fill="#1B2A4A" />
    <Rect x={0} y={0} width={400} height={700} fill="url(#dotsBig)" />
    {[[40, 150], [120, 190], [300, 160], [360, 230], [220, 140], [80, 250], [260, 240]].map(([x, y], i) => <Circle key={i} cx={x} cy={y} r={3} fill="#FFFFFF" />)}
  </G>
);

/** A sheep, side on, facing left. */
const Sheep = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <G transform={`translate(${x} ${y}) scale(${s})`}>
    {[-20, -8, 12, 24].map((lx) => <Line key={lx} x1={lx} y1={-16} x2={lx} y2={0} stroke={K.ink} strokeWidth={5} strokeLinecap="round" />)}
    <Path d="M-34 -30 Q-40 -50 -20 -54 Q-10 -66 6 -58 Q24 -66 34 -50 Q48 -40 36 -24 Q30 -12 10 -16 Q-6 -10 -20 -16 Q-38 -14 -34 -30Z" fill="#F4F1EA" stroke={K.ink} strokeWidth={3} />
    <Ellipse cx={-40} cy={-42} rx={11} ry={8} fill="#3A3A3A" stroke={K.ink} strokeWidth={2.5} />
    <Circle cx={-44} cy={-44} r={2} fill="#FFFFFF" />
  </G>
);

/** An oak with a broad round crown (the lone oak of Gush Etzion). */
const Oak = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <G transform={`translate(${x} ${y}) scale(${s})`}>
    <Path d="M-10 0 Q-8 -40 -4 -70 L8 -70 Q10 -40 12 0Z" fill={K.woodDark} stroke={K.ink} strokeWidth={3} />
    {[[-34, -86, 30], [0, -104, 36], [34, -86, 30], [-14, -74, 24], [18, -72, 24]].map(([cx, cy, r], i) => (
      <Ellipse key={i} cx={cx} cy={cy} rx={r} ry={r * 0.8} fill="#4F7A3A" stroke={K.ink} strokeWidth={3} />
    ))}
  </G>
);

/* ---------- The southern coast ---------- */

/* 1. About 588 BCE: a letter on a potsherd to Lachish, watching for its fire signals. */
const lachish = (
  <G>
    <Halftone />
    {night}
    <Hills y={400} near="#3E4A3A" far="#56624A" />
    {/* Lachish still signals; Azekah has gone dark. */}
    <Fire x={90} y={380} s={0.5} />
    <SvgText x={90} y={410} fontSize={16} fontFamily={F.black} textAnchor="middle" fill="#FBE7B9">לכיש</SvgText>
    <SvgText x={330} y={400} fontSize={16} fontFamily={F.black} textAnchor="middle" fill="#9AA3AD">עזקה</SvgText>
    <Person x={280} y={690} s={1.1} robe coat="#7A5A3A" hat="cloth" hatColor="#C9B489" beard="#3A2A1E" pose="hold" mouth="flat" flip />
    <Ostracon x={190} y={580} s={0.6} />
  </G>
);

/* 2. 1951: Afridar, built by Jews from South Africa on the dunes by the sea. */
const afridar = (
  <G>
    <Halftone />
    {sky()}
    <Sun x={330} y={170} r={36} />
    <Sea y={300} x0={-10} x1={140} />
    <Dunes y={320} />
    <House x={170} y={330} w={90} h={70} fill="#F4EFE4" windows={2} />
    <House x={290} y={320} w={90} h={80} fill="#EFE2C2" windows={2} />
    <Sign x={240} y={434} text="אפרידר" w={150} />
    <Person x={100} y={690} s={1.05} coat="#E8E2D6" pants="#C8B27A" hat="boater" pose="point" />
    <Person x={320} y={700} s={1} dress coat={K.teal} hat="scarf" hatColor={K.orange} flip />
  </G>
);

/* 3. 1955: Kiryat Gat, by a tell they thought was Philistine Gath. */
const kiryatGat = (
  <G>
    <Halftone />
    {sky()}
    {/* The tell. */}
    <Path d="M-10 400 Q60 400 110 300 L250 290 Q300 390 410 400 L410 710 L-10 710Z" fill="#C9A76B" stroke={K.ink} strokeWidth={4} />
    <Path d="M110 300 L250 290 Q300 390 410 400 L410 430 Q290 420 240 330Z" fill="url(#dots)" />
    <Rect x={-10} y={430} width={420} height={280} fill="#D9B85A" stroke={K.ink} strokeWidth={4} />
    <Truck x={300} y={500} s={0.7} />
    <Person x={70} y={690} s={1.05} coat="#5A4636" pants="#3A3A3A" hat="fedora" moustache pose="hold" />
    <Person x={160} y={700} s={0.95} dress coat="#7A2E5A" hat="scarf" hatColor="#F4F1EA" />
    <Person x={310} y={700} s={1.05} coat="#E8E2D6" pants="#C8B27A" hat="slouch" glasses pose="point" flip mouth="open" />
  </G>
);

/* ---------- The Negev ---------- */

/* 1. The night after Yom Kippur, 1946: eleven new places in one night. */
const elevenPoints = (
  <G>
    <Halftone />
    {night}
    <Circle cx={330} cy={180} r={24} fill="#FBE7B9" stroke={K.ink} strokeWidth={3} />
    <Rect x={-10} y={420} width={420} height={290} fill="#C9A76B" stroke={K.ink} strokeWidth={4} />
    <Rect x={-10} y={420} width={420} height={290} fill="url(#dotsBig)" />
    <TowerStockade x={270} y={480} s={0.85} light />
    <Truck x={110} y={490} s={0.75} />
    <Person x={110} y={700} s={1.05} coat="#C8B27A" pants="#5A4636" hat="tembel" pose="hold" />
    <Line x1={30} y1={560} x2={210} y2={590} stroke={K.ink} strokeWidth={12} strokeLinecap="round" />
    <Line x1={30} y1={560} x2={210} y2={590} stroke={K.wood} strokeWidth={7} strokeLinecap="round" />
    <Person x={310} y={700} s={1.05} coat={K.navy} pants="#3A3A3A" hat="cap" pose="point" flip />
  </G>
);

/* 2. 10 March 1949: the ink flag at Umm Rashrash. */
const inkFlag = (
  <G>
    <Halftone />
    {sky('#F6D9A0')}
    {/* The red mountains of Edom across the gulf. */}
    <Path d="M-10 340 L40 280 L90 320 L150 250 L220 310 L280 240 L340 300 L410 260 L410 380 L-10 380Z" fill="#B5653A" stroke={K.ink} strokeWidth={4} strokeLinejoin="round" />
    <Sea y={380} to={440} />
    <Rect x={-10} y={440} width={420} height={270} fill="#E3C48A" stroke={K.ink} strokeWidth={4} />
    <Flag x={150} y={500} h={320} w={150} />
    {/* The ink ran a little. */}
    <Path d="M190 236 l2 10 M240 236 l-1 8 M276 235 l2 12" stroke="#2F5FB3" strokeWidth={3} strokeLinecap="round" />
    <Person x={90} y={690} s={1.05} coat="#8C7A54" pants="#6E5F40" hat="tembel" pose="cheer" mouth="shout" />
    <Person x={310} y={700} s={1.05} coat="#8C7A54" pants="#6E5F40" hat="cloth" hatColor="#8C7A54" moustache pose="wave" flip />
  </G>
);

/* 3. 1953: Ben-Gurion moves to Sde Boker. */
const sdeBoker = (
  <G>
    <Halftone />
    {sky('#F6D9A0')}
    <Sun x={320} y={180} r={40} />
    <Hills y={340} near="#C98455" far="#D9A866" />
    <Barrack x={200} y={360} w={160} h={70} />
    <Person x={130} y={690} s={1.1} coat="#C8B27A" pants="#8C7A54" hair="#E8E8E4" pose="hold" />
    <Sheep x={260} y={640} s={1.1} />
    <Sheep x={330} y={600} s={0.9} />
    <Sheep x={310} y={680} s={1.2} />
  </G>
);

/* ---------- Samaria ---------- */

/** Two talents of silver. */
const Talent = ({ x, y }: { x: number; y: number }) => (
  <G>
    <Ellipse cx={x} cy={y} rx={22} ry={12} fill="#C4CCD4" stroke={K.ink} strokeWidth={3} />
    <Ellipse cx={x - 6} cy={y - 4} rx={8} ry={3} fill="#FFFFFF" />
  </G>
);

/* 1. Omri buys the hill from Shemer (1 Kings 16:24). */
const omri = (
  <G>
    <Halftone />
    {sky()}
    <Hills y={330} green />
    <Person x={110} y={690} s={1.1} robe coat="#8A5A3A" hat="cloth" hatColor="#E8DDC8" beard="#5A3A22" pose="hold" mouth="open" />
    <Person x={290} y={690} s={1.15} robe coat="#7A2E5A" hat="crown" beard="#3A2A1E" pose="hold" flip />
    <Talent x={195} y={570} />
    <Talent x={210} y={555} />
  </G>
);

/** A temple front: steps, six columns and a pediment. */
const Temple = ({ x, y, w }: { x: number; y: number; w: number }) => (
  <G>
    <Rect x={x - w / 2 - 14} y={y} width={w + 28} height={16} fill="#EDE3CC" stroke={K.ink} strokeWidth={3} />
    <Rect x={x - w / 2 - 6} y={y - 12} width={w + 12} height={14} fill="#EDE3CC" stroke={K.ink} strokeWidth={3} />
    {Array.from({ length: 6 }, (_, i) => (
      <Rect key={i} x={x - w / 2 + 6 + i * ((w - 30) / 5)} y={y - 182} width={18} height={170} fill="#F4EFE4" stroke={K.ink} strokeWidth={3} />
    ))}
    <Rect x={x - w / 2 - 6} y={y - 200} width={w + 12} height={20} fill="#EDE3CC" stroke={K.ink} strokeWidth={3} />
    <Path d={`M${x - w / 2 - 10} ${y - 200} L${x} ${y - 250} L${x + w / 2 + 10} ${y - 200}Z`} fill="#EDE3CC" stroke={K.ink} strokeWidth={3.5} strokeLinejoin="round" />
    <Rect x={x - w / 2} y={y - 182} width={w * 0.3} height={170} fill="url(#dots)" />
  </G>
);

/* 2. About 27 BCE: Herod rebuilds the city as Sebaste. */
const sebaste = (
  <G>
    <Halftone />
    <Rays cx={200} cy={250} n={24} a="#F7C873" b="#FBE7B9" />
    <Path d="M-10 420 Q100 370 200 380 Q300 370 410 420 L410 710 L-10 710Z" fill="#9FB86A" stroke={K.ink} strokeWidth={4} />
    <Temple x={210} y={380} w={220} />
    <Person x={110} y={690} s={1.1} robe coat="#5A2E7A" hat="crown" beard="#3A2A1E" pose="point" />
    <Person x={310} y={690} s={1} robe coat="#E8DDC8" hat="none" hair="#5A3A22" pose="hold" flip />
  </G>
);

/* 3. 1978: forty families set up Ariel, and the school opens on 1 September. */
const ariel = (
  <G>
    <Halftone />
    {sky()}
    <Hills y={300} />
    <Barrack x={110} y={330} w={220} h={80} label="בית ספר" />
    <Person x={70} y={690} s={1.05} coat="#3A5A8C" pants="#3A3A3A" hat="kippah" beard="#3A2A1E" pose="hold" />
    <Person x={160} y={700} s={1} dress coat="#C86A4A" hat="scarf" hatColor="#2B3A55" />
    <Person x={300} y={690} s={0.7} coat={K.orange} pants="#3A5A8C" pose="wave" mouth="open" flip />
    <Rect x={318} y={565} width={34} height={40} rx={6} fill={K.red} stroke={K.ink} strokeWidth={3} />
  </G>
);

/* ---------- Binyamin, Judea and Gush Etzion ---------- */

/* 1. Jacob's ladder at Beit El (Genesis 28). */
const jacob = (
  <G>
    <Halftone />
    {night}
    <Path d="M230 690 L300 120 L360 120 L250 690Z" fill={K.lit} opacity={0.3} />
    {/* The ladder. */}
    <Path d="M220 560 L300 120 M262 560 L342 120" stroke={K.ink} strokeWidth={9} />
    <Path d="M220 560 L300 120 M262 560 L342 120" stroke={K.wood} strokeWidth={5} />
    {Array.from({ length: 10 }, (_, i) => {
      const f = (i + 0.5) / 10, y = 560 - f * 440;
      return <Line key={i} x1={220 + f * 80} y1={y} x2={262 + f * 80} y2={y} stroke={K.wood} strokeWidth={5} />;
    })}
    {[[300, 300, false], [270, 460, true], [325, 190, true]].map(([x, y, f], i) => (
      <G key={i}>
        <Path d={`M${(x as number) - 4} ${(y as number) - 50} q-30 -10 -34 20 q20 -4 34 0Z M${(x as number) + 4} ${(y as number) - 50} q30 -10 34 20 q-20 -4 -34 0Z`} fill="#FFFFFF" stroke={K.ink} strokeWidth={2} />
        <Person x={x as number} y={y as number} s={0.35} robe coat="#FFFFFF" hair="#E9CF8E" flip={f as boolean} />
      </G>
    ))}
    <Rect x={-10} y={560} width={420} height={150} fill="#6B5A44" stroke={K.ink} strokeWidth={4} />
    {/* Jacob asleep, his head on a stone. */}
    <Ellipse cx={110} cy={596} rx={30} ry={16} fill="#A8A29A" stroke={K.ink} strokeWidth={3} />
    <G transform="translate(310 604) rotate(-90)">
      <Person x={0} y={0} s={0.85} robe coat="#8A5A3A" hair="#3A2A1E" beard="#3A2A1E" mouth="flat" />
    </G>
  </G>
);

/* 2. 1943: Kfar Etzion, named for Holzmann ("Holz" is wood: Etz). */
const kfarEtzion = (
  <G>
    <Halftone />
    {sky()}
    <Hills y={320} />
    <Oak x={300} y={400} s={1} />
    <House x={70} y={330} w={100} h={80} fill="#D9CBB0" windows={2} />
    <Sign x={200} y={470} text="כפר עציון" w={160} />
    <Person x={90} y={690} s={1.05} coat="#FFFFFF" pants="#C8B27A" hat="tembel" pose="point" mouth="open" />
    <Person x={310} y={700} s={1} dress coat={K.teal} hat="scarf" hatColor="#F4F1EA" flip pose="hips" />
  </G>
);

/* 3. 1975: Ma'ale Adumim, a water tower and a hut in the Judean desert. */
const maaleAdumim = (
  <G>
    <Halftone />
    {sky('#F6D9A0')}
    <Sun x={80} y={190} r={36} />
    <Hills y={330} near="#B5653A" far="#C98455" />
    <WaterTower x={300} y={430} s={1.1} />
    <Barrack x={60} y={360} w={130} h={64} />
    <Person x={80} y={690} s={1.05} coat="#3A5A8C" pants="#C8B27A" hat="tembel" pose="point" />
    <Person x={190} y={700} s={0.95} dress coat="#E8DDC8" hat="scarf" hatColor={K.red} />
    <Person x={320} y={690} s={1.05} coat="#5A4636" pants="#3A3A3A" hat="kippah" beard="#3A2A1E" flip />
  </G>
);

/* ---------- The Golan ---------- */

/* 1. 67 CE: Gamla on its camel-hump ridge, facing Vespasian's legions. */
const gamla = (
  <G>
    <Halftone />
    {sky('#E8D9B8')}
    <Path d="M-10 330 Q100 300 200 320 Q300 300 410 330 L410 710 L-10 710Z" fill="#8A8A6A" stroke={K.ink} strokeWidth={4} />
    {/* The ridge, a camel's hump between two gorges. */}
    <Path d="M70 640 Q120 330 210 300 Q300 330 340 640Z" fill="#B48F55" stroke={K.ink} strokeWidth={4} />
    <Path d="M70 640 Q120 330 210 300 L200 340 Q140 380 110 640Z" fill="url(#dots)" />
    {[[170, 350, 34, 24], [200, 328, 40, 26], [236, 346, 34, 24], [150, 388, 30, 22], [250, 384, 34, 22], [196, 370, 46, 30]].map(([x, y, w, h], i) => (
      <Rect key={i} x={x - w / 2} y={y - h} width={w} height={h} fill="#6B655E" stroke={K.ink} strokeWidth={2.5} />
    ))}
    {/* The legion below: shields and an eagle standard. */}
    <Rect x={-10} y={600} width={420} height={110} fill="#6B6B50" stroke={K.ink} strokeWidth={4} />
    <Line x1={330} y1={640} x2={330} y2={520} stroke={K.ink} strokeWidth={5} />
    <Path d="M314 520 L330 504 L346 520 L330 530Z" fill="#C9962A" stroke={K.ink} strokeWidth={2.5} />
    {[250, 290, 330, 370].map((x, i) => (
      <G key={x}>
        <Circle cx={x} cy={622 + (i % 2) * 6} r={13} fill="#9AA3AD" stroke={K.ink} strokeWidth={2.5} />
        <Rect x={x - 16} y={634 + (i % 2) * 6} width={32} height={46} rx={4} fill={K.red} stroke={K.ink} strokeWidth={3} />
      </G>
    ))}
  </G>
);

/* 2. 14 July 1967: settlers move into an abandoned Syrian army camp. */
const meromGolan = (
  <G>
    <Halftone />
    {sky()}
    {/* The Hermon, snow on top. */}
    <Path d="M180 300 L300 180 L410 280 L410 320 L180 320Z" fill="#8A8F96" stroke={K.ink} strokeWidth={4} strokeLinejoin="round" />
    <Path d="M262 218 L300 180 L344 220 L322 230 L302 216 L282 230Z" fill="#FFFFFF" stroke={K.ink} strokeWidth={3} strokeLinejoin="round" />
    <Rect x={-10} y={320} width={420} height={390} fill="#7A8A55" stroke={K.ink} strokeWidth={4} />
    <Rect x={-10} y={320} width={420} height={390} fill="url(#dotsBig)" />
    <Barrack x={30} y={350} w={160} h={70} fill="#B9B2A0" />
    <Barrack x={220} y={370} w={150} h={64} fill="#B9B2A0" />
    {[[60, 470], [330, 480], [200, 500]].map(([x, y], i) => <Ellipse key={i} cx={x} cy={y} rx={22} ry={12} fill="#3E3B38" stroke={K.ink} strokeWidth={2.5} />)}
    <Person x={110} y={690} s={1.05} coat="#3A5A8C" pants="#C8B27A" hat="tembel" pose="hips" />
    <Person x={300} y={700} s={1.05} coat="#FFFFFF" pants="#5A4636" hat="cap" moustache pose="wave" flip />
  </G>
);

/* 3. 1977: Katzrin, beside a Talmudic-era village ruined in the earthquake of 749. */
const katzrin = (
  <G>
    <Halftone />
    {sky()}
    <Rect x={-10} y={330} width={420} height={380} fill="#8A9A60" stroke={K.ink} strokeWidth={4} />
    {/* The new town going up behind. */}
    <House x={230} y={300} w={70} h={60} fill="#F4EFE4" windows={1} />
    <House x={310} y={290} w={80} h={70} fill="#EFE2C2" windows={2} />
    <Ruin x={130} y={530} s={0.9} />
    <Person x={300} y={690} s={1.05} coat="#E8E2D6" pants="#5A4636" hat="tembel" pose="point" flip mouth="open" />
  </G>
);

const cap = (text: string, y = 0.03): Panel['bubbles'][number] => ({ kind: 'cap', text, x: 0.04, y, w: 0.92 });
const end = (today: string): Panel['bubbles'][number] => ({ kind: 'cap', text: today, x: 0.04, y: 0.89, w: 0.56 });

export const regions3: Record<string, Tale> = {
  dch: {
    title: 'מישור החוף הדרומי',
    panels: (t, today) => [
      { art: lachish, focus: [0.55, 0.6], bubbles: [cap('בערך 588 לפנה״ס. צבא בבל צר על ממלכת יהודה. מפקד מוצב שולח ללכיש מכתב על שבר חרס. המכתב נמצא בתל לכיש ב־1935.'),
        { kind: 'say', text: '״אל משאת לכש נחנו שמרם... כי לא נראה את עזקה.״', x: 0.3, y: 0.42, w: 0.64, tail: { at: 0.6 } }] },
      { art: afridar, focus: [0.5, 0.55], bubbles: [cap('1951. יהודים מדרום אפריקה בונים מול הים את שכונת אפרידר. ב־1953 היא מתאחדת עם מגדל אשקלון, והעיר נקראת אשקלון.'),
        { kind: 'say', text: 'אפרי־דר: אפריקה ודרום. השם כבר מוכן.', x: 0.04, y: 0.46, w: 0.52, tail: { at: 0.4 } }] },
      { art: kiryatGat, focus: [0.5, 0.6], bubbles: [cap('1955. 18 משפחות עולים ממרוקו מקימות את קריית גת, ליד תל שחשבו שהוא גת של הפלשתים.'),
        { kind: 'say', text: 'חדשות מהחפירות: גת בכלל במקום אחר. השם נשאר.', x: 0.38, y: 0.46, w: 0.58, tail: { at: 0.65 } }, end(today)] },
    ],
  },
  ngv: {
    title: 'הנגב והערבה',
    panels: (t, today) => [
      { art: elevenPoints, focus: [0.55, 0.55], bubbles: [cap('מוצאי יום כיפור, 5–6 באוקטובר 1946. בלילה אחד עולים בנגב 11 יישובים חדשים, לפני שהבריטים מספיקים לעצור.'),
        { kind: 'say', text: 'עד הבוקר צריכים לעמוד פה גדר, צריף ומגדל.', x: 0.04, y: 0.46, w: 0.56, tail: { at: 0.4 } }] },
      { art: inkFlag, focus: [0.5, 0.45], bubbles: [cap('10 במרץ 1949. חיילי צה״ל מגיעים לאום רשרש, היום אילת. דגל אין להם, אז הם מציירים פסים בדיו על סדין ותופרים מגן דוד מערכת עזרה ראשונה: ״דגל הדיו״.'),
        { kind: 'say', text: 'עקום קצת. אבל שלנו.', x: 0.5, y: 0.5, w: 0.46, tail: { at: 0.6 } }] },
      { art: sdeBoker, focus: [0.45, 0.6], bubbles: [cap('1953. ראש הממשלה דוד בן־גוריון עוזב את התפקיד ועובר עם פולה לקיבוץ שדה בוקר, לעבוד בדיר.'),
        { kind: 'say', text: 'לגדל כבשים זה הרבה יותר פשוט מממשלה.', x: 0.04, y: 0.46, w: 0.56, tail: { at: 0.45 } }, end(today)] },
    ],
  },
  smr: {
    title: 'השומרון',
    panels: (t, today) => [
      { art: omri, focus: [0.5, 0.6], bubbles: [cap('לפי התנ״ך: המלך עמרי קונה את ההר משמר בשני ככרי כסף, בונה עליו את עירו וקורא לה שומרון, על שם המוכר.'),
        { kind: 'say', text: 'לפחות תקרא לה על שמי.', x: 0.04, y: 0.5, w: 0.46, tail: { at: 0.5 } }] },
      { art: sebaste, focus: [0.5, 0.45], bubbles: [cap('בערך 27 לפנה״ס. הורדוס בונה מחדש את שומרון, עם מקדש לקיסר, וקורא לה סבסטיה, על שם אוגוסטוס.'),
        { kind: 'say', text: '״סבסטוס״ זה אוגוסטוס ביוונית. הקיסר יאהב את זה.', x: 0.04, y: 0.5, w: 0.6, tail: { at: 0.4 } }] },
      { art: ariel, focus: [0.5, 0.6], bubbles: [cap('1978. 40 משפחות מתיישבות על גבעה ומקימות את אריאל. אחרי שבועיים בערך נפתח בה בית ספר.'),
        { kind: 'say', text: 'רגע, אחרי שבועיים כבר יש בית ספר?', x: 0.48, y: 0.6, w: 0.48, tail: { at: 0.6 } }, end(today)] },
    ],
  },
  bnm: {
    title: 'בנימין, יהודה וגוש עציון',
    panels: (t, today) => [
      { art: jacob, focus: [0.55, 0.5], amount: 1.14, bubbles: [cap('לפי התנ״ך: יעקב נרדם בדרך, ראשו על אבן, וחולם על סולם שמלאכים עולים ויורדים בו. בבוקר הוא אומר ״אכן יש ה׳ במקום הזה״, וקורא למקום בית אל.')] },
      { art: kfarEtzion, focus: [0.5, 0.55], bubbles: [cap('1943. מתיישבים חוזרים להרי חברון ומקימים מחדש את כפר עציון. השם על שם שמואל צבי הולצמן, שקנה כאן אדמה.'),
        { kind: 'say', text: '״הולץ״ בגרמנית זה עץ. הולצמן, עץ, עציון!', x: 0.04, y: 0.46, w: 0.56, tail: { at: 0.35 } }] },
      { art: maaleAdumim, focus: [0.5, 0.55], bubbles: [cap('1975. אחרי ניסיון ראשון שפונה, 23 משפחות מקבלות אישור להקים מחנה עבודה על גבעה במדבר יהודה. השם מהתנ״ך, מעלה אדומים, בגלל הסלעים האדומים.'),
        { kind: 'say', text: 'אדומים בגלל הסלעים. תסתכלו עליהם בשקיעה.', x: 0.04, y: 0.48, w: 0.54, tail: { at: 0.3 } }, end(today)] },
    ],
  },
  gol: {
    title: 'רמת הגולן',
    panels: (t, today) => [
      { art: gamla, focus: [0.5, 0.5], bubbles: [cap('67 לספירה, המרד הגדול ברומאים. העיר היהודית גמלא, על רכס תלול בגולן, עומדת מול הלגיונות של אספסיאנוס.'),
        { kind: 'cap', text: 'השם גמלא בא מהרכס, שנראה כמו דבשת של גמל.', x: 0.04, y: 0.86, w: 0.6 }] },
      { art: meromGolan, focus: [0.5, 0.55], bubbles: [cap('14 ביולי 1967, חודש אחרי מלחמת ששת הימים. קבוצה קטנה עולה לרמה ונכנסת למחנה צבאי סורי נטוש. כך מתחיל מרום גולן.'),
        { kind: 'say', text: 'יש מיטות, יש גג. חסרות רק פרות.', x: 0.44, y: 0.5, w: 0.52, tail: { at: 0.6 } }] },
      { art: katzrin, focus: [0.5, 0.55], bubbles: [cap('1977. ליד כפר יהודי מימי התלמוד, שנחרב ברעידת אדמה בשנת 749, קמה קצרין, ״בירת הגולן״.'),
        { kind: 'say', text: 'שכנים ותיקים. בערך 1,200 שנה.', x: 0.4, y: 0.5, w: 0.56, tail: { at: 0.65 } }, end(today)] },
    ],
  },
};
