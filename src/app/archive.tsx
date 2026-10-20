import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { mastery, nextShift, regionProgress, storyDone } from '@/engine';
import { useStart } from '@/state/actions';
import { useStore, useT } from '@/state/store';
import { regionTale, TALES } from '@/ui/comic/tales';
import { H1, Kicker, LinkBtn, Meter, Screen, T_, ZviSays } from '@/ui/kit';
import { BW, C, F, SHADOW_SM } from '@/ui/theme';

/* The archive: after the story, the rest of the country region by region. Pick which region the next postcards come from. */
export default function Archive() {
  const { s, update } = useStore();
  const t = useT();
  const start = useStart();
  const regions = regionProgress(s);
  const cur = nextShift(s)?.u.region;
  const pickRegion = (id: string) => {
    update((d) => { d.focus = id; });
    router.back();
  };
  return (
    <Screen>
      <LinkBtn label="חזרה לשולחן" onPress={() => router.back()} />
      <View><Kicker>מרתף הלשכה · מדף אחרי מדף</Kicker><H1>הארכיון</H1></View>
      <ZviSays text={t(storyDone(s)
        ? 'המטרה: כל הארץ על המפה. כל אזור הוא מדף. {בחר|בחרי} מאיזה מדף הגלויות הבאות יגיעו. אני ממליץ להתחיל ממה שקרוב לבית.'
        : 'הארכיון נפתח אחרי שבע הגלויות של הסיפור. קודם {תחזיר|תחזירי} את הגדולות.')} />
      <View style={{ gap: 10 }}>
        {regions.map((g) => {
          const full = g.done === g.units.length, here = g.id === cur;
          return (
            <Pressable key={g.id} disabled={!storyDone(s) || full} onPress={() => pickRegion(g.id)} accessibilityRole="button"
              accessibilityLabel={`${g.t}, ${g.done} מתוך ${g.units.length} גלויות`}
              style={({ pressed }) => [st.row, here && { borderColor: g.col, borderWidth: BW + 1 }, pressed && { transform: [{ translateY: 2 }] }]}>
              <View style={[st.tab, { backgroundColor: g.col }]} />
              <View style={{ flex: 1, gap: 4 }}>
                <View style={st.line}>
                  <T_ style={{ fontFamily: F.black, fontSize: 17, flex: 1 }}>{g.t}</T_>
                  <T_ style={{ fontSize: 13, color: here ? g.col : C.muted, fontFamily: F.bold }}>
                    {full ? 'מתויק ✓' : here ? 'עובדים עליו' : `${g.places} יישובים`}
                  </T_>
                </View>
                <Meter pct={(g.done / g.units.length) * 100} color={g.col} />
                <T_ style={{ fontSize: 12, color: C.muted }}>{g.done}/{g.units.length} גלויות · {g.known}/{g.places} יישובים חזרו למפה</T_>
                {s.tales.includes(regionTale(g.id)) && TALES[regionTale(g.id)] && (
                  <LinkBtn label="איך הכול התחיל: הקומיקס" onPress={() => router.push(`/tale/${regionTale(g.id)}`)} />
                )}
                {g.known >= 4 && (
                  <LinkBtn label={`לתרגל את ${g.known} היישובים שחזרו`}
                    onPress={() => start.review(g.units.flatMap((u) => u.items).filter((id) => mastery(s, id) >= 1))} />
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

const st = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, alignItems: 'center', borderWidth: BW, borderColor: C.ink, borderRadius: 12, padding: 12, backgroundColor: C.surface, ...SHADOW_SM },
  tab: { width: 10, alignSelf: 'stretch', borderRadius: 4, borderWidth: 2, borderColor: C.ink },
  line: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
