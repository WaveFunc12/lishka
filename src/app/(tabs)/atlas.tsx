import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { BY, COUNTRY, learned, mastery, PLACES, popText, REGIONS, shortName, strength, UNIT_BY } from '@/engine';
import { useStore } from '@/state/store';
import { TALES } from '@/ui/comic/tales';
import { MapView, type MapDot } from '@/ui/MapView';
import { Btn, Card, H1, Kicker, LinkBtn, Meter, Screen, T_ } from '@/ui/kit';
import { C, F } from '@/ui/theme';

/* My map: every place the player has brought back, in its region's colour, to wander around freely. Tap a dot for its file,
   or a region below the map to fly there. `?v=x,y,w` opens at a given view (km). */
export default function Atlas() {
  const { s, now } = useStore();
  const { v: vq } = useLocalSearchParams<{ v?: string }>();
  const [sel, setSel] = useState<string | null>(null);
  const [all, setAll] = useState(false);
  const [area, setArea] = useState<string | null>(null);
  const known = learned(s), it = sel ? BY[sel] : null;
  const [x, y, w] = (vq || '').split(',').map(Number);
  // Every place counts toward its region here, the story's cities too, so the regions add up to the whole country.
  const regions = REGIONS.map((g) => {
    const ps = PLACES.filter((p) => p.region === g.id);
    return { ...g, places: ps.length, known: ps.filter((p) => mastery(s, p.id) >= 1).length };
  });
  const col = Object.fromEntries(REGIONS.map((g) => [g.id, g.col]));
  const inArea = area ? PLACES.filter((p) => p.region === area) : [];
  const view = area ? { fit: inArea, pad: 0.15, minW: 30 } : w > 0 ? { x, y, w, h: w } : COUNTRY;
  const reveal = known.map((p) => ({ x: p.x, y: p.y, s: strength(s, p.id, now()) }));

  const dots: MapDot[] = [
    ...(all ? PLACES.filter((p) => mastery(s, p.id) < 1 && p.id !== sel).map((p): MapDot => ({ ...p, state: 'dim', size: 0.55 })) : []),
    ...known.filter((p) => p.id !== sel).map((p): MapDot => ({ ...p, state: 'lit', size: 0.9, label: shortName(p), col: col[p.region] })),
    ...(it ? [{ ...it, state: 'target' as const, size: 1.3, label: it.name }] : []),
  ];
  const m = it ? mastery(s, it.id) : 0, unit = it ? UNIT_BY[it.unit] : null;
  const region = it ? REGIONS.find((g) => g.id === it.region) : null;

  return (
    <Screen tab>
      <View><Kicker>{known.length} מתוך {PLACES.length} יישובים חזרו למפה</Kicker><H1>המפה שלי</H1></View>
      <MapView key={area ?? 'all'} view={view} dots={dots} pickAny onPressDot={setSel} dotPx={5} mini reveal={reveal} revealR={1.2} style={{ height: 440 }}
        label="המפה שלי. אפשר ללחוץ על יישוב" />
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Btn style={{ flex: 1 }} alt={all} label={`מוכרים לי (${known.length})`} onPress={() => setAll(false)} />
        <Btn style={{ flex: 1 }} alt={!all} label={`כל ה־${PLACES.length.toLocaleString('en-US')}`} onPress={() => setAll(true)} />
      </View>
      {it ? (
        <Card style={{ gap: 6 }}>
          <T_ style={{ fontFamily: F.display, fontSize: 26 }}>{it.name}</T_>
          <T_ style={{ color: C.muted, fontSize: 14 }}>{it.type} · {it.district} · {popText(it.pop)}</T_>
          {m >= 1 ? (
            <>
              <T_>{it.hint}</T_>
              <T_ style={{ fontFamily: F.black, fontSize: 14, marginTop: 4 }}>כמה טוב זה זכור: רמה {m} מתוך 5</T_>
              <Meter pct={strength(s, it.id, now()) * 100} color={C.ok} />
              {TALES[it.id] && <LinkBtn label="איך הכול התחיל: הקומיקס" onPress={() => router.push(`/tale/${it.id}`)} />}
            </>
          ) : (
            <T_ style={{ color: C.muted }}>
              עוד לא חזר למפה. הוא מחכה {unit?.region ? `באזור ${region?.t}, בגלויה ${unit.part} מתוך ${unit.parts}` : 'בגלויות של הסיפור'}.
            </T_>
          )}
        </Card>
      ) : (
        <T_ style={{ color: C.muted }}>{known.length ? 'לגעת ביישוב כדי לפתוח את התיק שלו.' : 'המפה עוד ריקה. כל משמרת מחזירה אליה יישובים.'}</T_>
      )}
      <T_ style={{ fontFamily: F.display, fontSize: 22 }}>האזורים</T_>
      {/* Regions in their colours, with how much of each is back. Tapping one flies the map there. */}
      <View style={st.chips}>
        <Pressable onPress={() => setArea(null)} accessibilityRole="button" accessibilityLabel="כל הארץ"
          style={[st.chip, !area && st.on]}>
          <T_ style={st.chipT}>כל הארץ</T_>
          <T_ style={st.chipN}>{known.length}/{PLACES.length}</T_>
        </Pressable>
        {regions.map((g) => (
          <Pressable key={g.id} onPress={() => { setArea(g.id); setSel(null); }} accessibilityRole="button"
            accessibilityLabel={`${g.t}: ${g.known} מתוך ${g.places} יישובים`} style={[st.chip, area === g.id && st.on]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <View style={[st.sw, { backgroundColor: g.col }]} />
              <T_ style={st.chipT}>{g.s}</T_>
            </View>
            <T_ style={st.chipN}>{g.known}/{g.places}</T_>
            <View style={st.bar}><View style={{ width: `${(g.known / Math.max(1, g.places)) * 100}%`, height: '100%', backgroundColor: g.col }} /></View>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const st = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { flexGrow: 1, flexBasis: 76, borderWidth: 2, borderColor: C.ink, borderRadius: 10, backgroundColor: C.surface, paddingHorizontal: 8, paddingVertical: 5, gap: 1 },
  on: { borderWidth: 3, borderColor: C.kicker },
  chipT: { fontFamily: F.black, fontSize: 14, lineHeight: 18 },
  chipN: { fontSize: 12, lineHeight: 15, color: C.muted },
  sw: { width: 10, height: 10, borderRadius: 5, borderWidth: 1, borderColor: C.ink },
  bar: { height: 4, borderRadius: 2, backgroundColor: C.track, overflow: 'hidden', marginTop: 2 },
});
