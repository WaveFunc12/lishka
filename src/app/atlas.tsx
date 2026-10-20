import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { BY, COUNTRY, learned, mastery, PLACES, popText, REGIONS, shortName, strength, UNIT_BY } from '@/engine';
import { useStore, useT } from '@/state/store';
import { TALES } from '@/ui/comic/tales';
import { MapView, type MapDot } from '@/ui/MapView';
import { Btn, Card, H1, Kicker, LinkBtn, Meter, Screen, T_ } from '@/ui/kit';
import { C, F } from '@/ui/theme';

/* My map: every place the player has brought back, to wander around freely. Tap a dot for its file.
   `?v=x,y,w` opens at a given view (km). */
export default function Atlas() {
  const { s, now } = useStore();
  const t = useT();
  const { v: vq } = useLocalSearchParams<{ v?: string }>();
  const [sel, setSel] = useState<string | null>(null);
  const [all, setAll] = useState(false);
  const known = learned(s), it = sel ? BY[sel] : null;
  const [x, y, w] = (vq || '').split(',').map(Number);
  const view = w > 0 ? { x, y, w, h: w } : COUNTRY;

  const dots: MapDot[] = [
    ...(all ? PLACES.filter((p) => mastery(s, p.id) < 1 && p.id !== sel).map((p): MapDot => ({ ...p, state: 'dim', size: 0.55 })) : []),
    ...known.filter((p) => p.id !== sel).map((p): MapDot => ({ ...p, state: 'lit', size: 0.8, label: shortName(p) })),
    ...(it ? [{ ...it, state: 'target' as const, size: 1.3, label: it.name }] : []),
  ];
  const m = it ? mastery(s, it.id) : 0, unit = it ? UNIT_BY[it.unit] : null;
  const region = it ? REGIONS.find((g) => g.id === it.region) : null;

  return (
    <Screen>
      <LinkBtn label="חזרה לשולחן" onPress={() => router.back()} />
      <View><Kicker>{known.length} מתוך {PLACES.length} יישובים חזרו למפה</Kicker><H1>המפה שלי</H1></View>
      <MapView view={view} dots={dots} pickAny onPressDot={setSel} dotPx={5} mini style={{ height: 440 }} label="המפה שלי. אפשר ללחוץ על יישוב" />
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Btn style={{ flex: 1 }} alt={all} label={t('מה שאני {יודע|יודעת}')} onPress={() => setAll(false)} />
        <Btn style={{ flex: 1 }} alt={!all} label={`כל ה־${PLACES.length}`} onPress={() => setAll(true)} />
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
        <T_ style={{ color: C.muted }}>{known.length ? 'לחיצה על נקודה פותחת את התיק שלה. אפשר להתקרב עם שתי אצבעות או עם הכפתורים.' : 'המפה עוד ריקה. כל משמרת מחזירה אליה יישובים.'}</T_>
      )}
    </Screen>
  );
}
