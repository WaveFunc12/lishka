import { router } from 'expo-router';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import {
  BY, chapter, fading, learned, mastery, nextMilestone, nextShift, PLACES, shiftItems, storyDone, strength, UNITS, zviSays,
  shortName,
} from '@/engine';
import { useStart } from '@/state/actions';
import { useStore, useT } from '@/state/store';
import { MapView, type MapDot } from '@/ui/MapView';
import { Btn, LinkBtn, Meter, Screen, T_, ZviSays } from '@/ui/kit';
import { BW, C, F, SHADOW } from '@/ui/theme';

/* Home, variant A from the prototype: one big postcard, one button, a quiet status line. */
export default function Home() {
  const { s, now, today } = useStore();
  const t = useT();
  const start = useStart();
  const winH = useWindowDimensions().height;
  const ns = nextShift(s);
  const u = ns ? ns.u : UNITS[UNITS.length - 1];
  const d = s.daily.day === today() ? s.daily : { shifts: 0, reviews: 0, picks: [] };
  const quota = d.shifts > 0 || d.reviews > 0;
  const fad = fading(s, now()).length;
  const fresh = !s.xp;
  const act = s.welcome ? 'review' : ns ? 'shift' : 'exam';
  const label = s.welcome ? 'לחמם מנועים' : !ns ? 'למבחן הקביעות' : fresh ? 'להחתים כרטיס' : 'למשמרת הבאה';
  // Progress is shown for the current chapter: the story's seven postcards, then one region at a time.
  const story = storyDone(s), ch = chapter(s, u.region ?? null);
  const examDue = story && !s.legendary && act !== 'exam';
  // The postcard takes the room the screen has left, so tall phones get a bigger map instead of a gap.
  const mapH = Math.round(Math.min(540, Math.max(240, winH - (examDue ? 566 : 500))));

  const cur = ns ? shiftItems(u, ns.s) : [];
  const pts = u.items.map((id) => BY[id]);
  const lit = (id: string) => mastery(s, id) >= 1;
  const dots: MapDot[] = [
    ...PLACES.filter((p) => lit(p.id) && !u.items.includes(p.id)).map((p): MapDot => ({ ...p, state: 'ctx', size: 0.7, label: shortName(p) })),
    ...pts.map((p): MapDot => (lit(p.id) ? { ...p, state: 'lit', label: shortName(p) } : cur.includes(p.id) ? { ...p, state: 'mystery', size: 1.1, num: '?' } : { ...p, state: 'dim', size: 0.7 })),
  ];
  const reveal = learned(s).map((p) => ({ x: p.x, y: p.y, s: strength(s, p.id, now()) }));

  const goal = nextMilestone(learned(s).length);
  const go = () => (act === 'review' ? start.review() : act === 'exam' ? start.exam() : start.shift());

  return (
    <Screen tab>
      <View style={styles.top}>
        <T_ style={{ fontFamily: F.display, fontSize: 20 }}>הלשכה למיפוי</T_>
        <View style={[styles.streak, s.streak > 0 && { backgroundColor: C.orange }]}
          accessibilityLabel={`${s.streak} ימי נוכחות ברצף${s.sick ? ', ויום מחלה אחד שמור' : ''}`}>
          <Svg width={18} height={18} viewBox="0 0 24 24"><Path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-7 0 3 2 4 3 4 0-4-1-6 0-9z" fill={C.ink} /></Svg>
          <T_ style={{ fontFamily: F.black, fontSize: 18 }}>{s.streak}</T_>
          <T_ style={{ fontSize: 12 }}>{s.streak === 1 ? 'יום נוכחות' : 'ימי נוכחות'}</T_>
          {s.sick > 0 && <T_ style={{ fontSize: 12 }}>· יום מחלה שמור</T_>}
        </View>
      </View>

      <View style={styles.pcard} accessibilityLabel={`הגלויה הבאה: ${u.t}`}>
        <MapView zoom={false} view={{ fit: pts, pad: 0.55, minW: 34 }} dots={dots} dotPx={5} reveal={reveal} revealR={0.6} style={{ height: mapH }} cornerCard={{ w: 0.66, h: 100 }} label="מפת האזור של הגלויה הבאה">
          <View style={styles.region} pointerEvents="none">
            <T_ style={{ fontSize: 13 }}>ד״ש מ</T_>
            <T_ style={{ fontFamily: F.display, fontSize: 22, lineHeight: 26 }}>{u.t}</T_>
            {!!u.parts && u.parts > 1 && <T_ style={{ fontSize: 12, color: C.muted }}>גלויה {u.part} מתוך {u.parts} באזור</T_>}
          </View>
          {ns && (
            <View style={styles.hint} pointerEvents="none">
              <T_ style={{ fontFamily: F.black, fontSize: 12 }}>משמרת {ns.s + 1} מתוך 2</T_>
            </View>
          )}
        </MapView>
        <View style={{ marginTop: 12 }}>
          <ZviSays text={t(zviSays(s, today(), ns, fad, quota))}>
            {fad >= 3 && !s.welcome && <LinkBtn label="ביקורת פתע" onPress={() => start.review()} />}
          </ZviSays>
        </View>
      </View>

      <View style={{ gap: 10, marginTop: 'auto' }}>
        <Btn big label={label} onPress={go}
          right={act === 'exam' ? undefined : <T_ style={styles.xp}>+{(s.welcome ? 8 : 14) * 10} ותק · 2 דק׳</T_>} />
        {examDue && <Btn alt label="למבחן הקביעות" onPress={() => start.exam()} />}
        <View>
          <View style={styles.segLbl}>
            <T_ style={{ fontFamily: F.black, fontSize: 14 }}>{u.region ? u.s : 'הסיפור'} · {ch.done}/{ch.units.length} גלויות</T_>
            <T_ style={{ fontSize: 14, color: quota ? C.ok : C.muted }}>{quota ? '✓ המכסה של היום בוצעה' : 'המכסה של היום: משמרת אחת'}</T_>
          </View>
          <View style={styles.segs} accessibilityLabel={`${ch.done} מתוך ${ch.units.length} גלויות הושלמו`}>
            {ch.units.map((x) => {
              const sh = s.shifts[x.id] || [];
              const f = s.units[x.id] ? 1 : sh.filter(Boolean).length / 2;
              return (
                <View key={x.id} style={[styles.seg, ns?.u.id === x.id && { borderColor: C.orange }]}>
                  {f > 0 && <View style={{ width: `${f * 100}%`, height: '100%', backgroundColor: x.col }} />}
                </View>
              );
            })}
          </View>
        </View>
        {/* The goal of the whole game, always in view: every place in the country back on the map. */}
        <Pressable onPress={() => router.push(learned(s).length ? '/atlas' : '/file')} accessibilityRole="button"
          accessibilityLabel={`המטרה: כל הארץ על המפה. ${learned(s).length} מתוך ${PLACES.length} יישובים כבר חזרו`}>
          <View style={styles.segLbl}>
            <T_ style={{ fontFamily: F.black, fontSize: 14 }}>המטרה: כל הארץ על המפה</T_>
            <T_ style={{ fontSize: 14, color: C.muted }}>{learned(s).length}/{PLACES.length} יישובים</T_>
          </View>
          <Meter pct={(learned(s).length / PLACES.length) * 100} color={C.accent} />
          {!!goal && <T_ style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>אבן הדרך הבאה: {goal.short}, עוד {goal.at - learned(s).length}</T_>}
        </Pressable>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', columnGap: 22, rowGap: 6 }}>
          {story && <LinkBtn label="הארכיון" onPress={() => router.push('/archive')} />}
          {!fresh && <LinkBtn label="כבישים" onPress={() => router.push('/roads')} />}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  streak: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 2, borderColor: C.ink, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: C.surface },
  pcard: { backgroundColor: C.surface, borderWidth: BW, borderColor: C.ink, borderRadius: 6, padding: 10, transform: [{ rotate: '-0.6deg' }], ...SHADOW },
  region: { position: 'absolute', bottom: 10, right: 10, backgroundColor: C.surface, borderWidth: 2, borderColor: C.ink, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4, maxWidth: '62%', direction: 'rtl' },
  hint: { position: 'absolute', top: 8, left: 8, backgroundColor: C.surface, borderWidth: 2, borderColor: C.ink, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, direction: 'rtl' },
  xp: { color: C.accentInk, fontSize: 13, fontFamily: F.bold },
  segLbl: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  segs: { flexDirection: 'row', gap: 4 },
  seg: { flex: 1, height: 12, borderWidth: 2, borderColor: C.ink, borderRadius: 4, backgroundColor: C.track, overflow: 'hidden' },
});
