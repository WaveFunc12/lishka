import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, TextInput, useWindowDimensions, View } from 'react-native';
import {
  advance, anchorFor, answer, BY, compareAnswer, DIR_WORD, finish, fitView, gradeCompare, gradeName, gradePin, gradeTap,
  gradeType, learned, PIN_LIMIT, PLACES, popText, ANCHORS, shortName, UNIT_BY, viewAround, ZVI_MEMORY, type Grade, type Point, type View as Box,
} from '@/engine';
import { useStore, useT } from '@/state/store';
import { regionTale, TALES } from '@/ui/comic/tales';
import { MapView, type MapDot } from '@/ui/MapView';
import { sfx } from '@/ui/sound';
import { Btn, Card, Kicker, LinkBtn, Meter, Mentor, OkStamp, Screen, T_, ZviSays } from '@/ui/kit';
import { BW, C, F } from '@/ui/theme';

/* The shift: a run of short questions over one map. Ported from the prototype's lesson() and mountLesson(). */
export default function Shift() {
  const { s, update, now, today, session, setSession, setResult } = useStore();
  const t = useT();
  const [typed, setTyped] = useState('');
  const [picked, setPicked] = useState<string | null>(null);
  const [guess, setGuess] = useState<Point | null>(null);
  const winH = useWindowDimensions().height;
  // Founding stories play once: a region's as its first postcard starts, a big city's the first time its file opens.
  const unseen = (k?: string | null) => (k && TALES[k] && !s.tales.includes(k) ? k : null);
  const region = session?.unitId && session.i === 0 ? UNIT_BY[session.unitId]?.region : null;
  const introId = session?.q[session.i]?.t === 'intro' ? session.q[session.i].id : null;
  const tale = unseen(region && regionTale(region)) ?? unseen(introId);
  useEffect(() => {
    if (!tale) return;
    update((d) => { d.tales = [...d.tales, tale]; });
    router.push(`/tale/${tale}`);
  }, [tale, update]);
  if (!session) return null;
  const sess = session, q = sess.q[sess.i], it = BY[q.id], done = !!sess.fb, rng = Math.random;
  const known = new Set(learned(s).map((p) => p.id));

  /** Faint context: places already known plus the big-city anchors, never the ones being asked. */
  const ctxDots = (ex: string[], v: Box): MapDot[] =>
    PLACES.filter((p) => !ex.includes(p.id) && p.x > v.x && p.x < v.x + v.w && p.y > v.y && p.y < v.y + v.h && (known.has(p.id) || ANCHORS.includes(p.id)))
      .map((p) => ({ ...p, state: known.has(p.id) ? 'ctx' : 'anc', size: 0.75, label: shortName(p) }));

  const submit = (g: Grade) => {
    const next = { ...sess, q: sess.q.slice() };
    update((d) => answer(next, d, g, now(), rng));
    setSession(next);
    if (!s.mute) {
      Haptics.notificationAsync(g.ok ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error).catch(() => {});
      sfx(g.ok ? 'ok' : 'bad');
    }
  };

  const goNext = () => {
    const next = { ...sess, q: sess.q.slice() };
    let over = false;
    update((d) => {
      over = advance(next, d, now(), rng);
      if (over) setResult(finish(next, d, today()));
    });
    setTyped('');
    setPicked(null);
    setGuess(null);
    if (over) {
      setSession(null);
      router.replace('/result');
    } else setSession(next);
  };

  const quit = () => {
    setSession(null);
    router.back();
  };

  // Question text and map per type.
  let kind = '', title = '';
  let map: React.ComponentProps<typeof MapView> = { view: viewAround(it, 45), mini: true };
  let body: React.ReactNode = null;

  if (q.t === 'intro') {
    kind = 'יישוב חדש';
    const an = anchorFor(it.id, [...known]), A = an && BY[an.id];
    map = { ...map, view: A ? { fit: [it, A], pad: 0.7, minW: 36 } : viewAround(it, 45), tag: it.district,
      dots: [...(A ? [{ ...A, state: 'ctx' as const, label: shortName(A) }] : []), { ...it, state: 'target', label: it.name, size: 1.2, pulse: true }],
      lines: A ? [[A, it, 'aline']] : [] };
    body = (
      <>
        <Card style={{ gap: 6 }}>
          <Kicker>תיק חדש נפתח</Kicker>
          <T_ style={{ fontFamily: F.display, fontSize: 30 }}>{it.name}</T_>
          <T_ style={{ color: C.muted, fontSize: 14 }}>{it.type} · {it.district} · {popText(it.pop)}</T_>
          {an && <T_ style={{ fontFamily: F.bold }}>🧭 כ־{an.km} ק״מ {an.dir} ל{shortName(BY[an.id])}</T_>}
          <T_><T_ style={{ fontFamily: F.black }}>לזכור:</T_> {it.hint}</T_>
        </Card>
        {ZVI_MEMORY[it.id] && <ZviSays size={40} text={t(ZVI_MEMORY[it.id])} />}
      </>
    );
  }
  if (q.t === 'tap') {
    kind = 'איתור';
    title = `איפה נמצאת ${it.name}?`;
    const pts = q.choices!.map((id) => BY[id]);
    const v0 = fitView(pts, 0.9, 28, 1);
    map = { ...map, view: { fit: pts, pad: 0.9, minW: 28 }, onPressDot: done ? undefined : (id) => { setPicked(id); submit(gradeTap(q, id)); },
      dots: [...ctxDots(q.choices!, v0).map((d) => ({ ...d, label: '' })), ...q.choices!.map((id, i): MapDot => ({ ...BY[id],
        num: done ? '' : i + 1, size: done ? (id === q.id || id === picked ? 1.7 : 0.9) : 2.2,
        state: done ? (id === q.id ? 'right' : id === picked ? 'wrong' : 'ctx') : 'choice',
        label: done && (id === q.id || id === picked) ? BY[id].name : '' }))] };
    body = !done && (
      <View style={styles.opts3}>
        {q.choices!.map((id, i) => <Btn key={id} alt label={String(i + 1)} style={{ flex: 1 }} onPress={() => { setPicked(id); submit(gradeTap(q, id)); }} />)}
      </View>
    );
  }
  if (q.t === 'name' || q.t === 'type') {
    const v = viewAround(it, 40, q.off);
    map = { ...map, view: v, dots: ctxDots(q.choices || [it.id], v), cross: done ? [] : [it] };
    if (done) map.dots = [...map.dots!, { ...it, state: sess.fb!.ok ? 'right' : 'wrong', label: it.name, size: 1.7 }];
  }
  if (q.t === 'name') {
    kind = 'זיהוי';
    title = 'איזה יישוב מסומן בצלב?';
    body = (
      <View style={{ gap: 10 }}>
        {q.choices!.map((id) => (
          <Btn key={id} alt label={BY[id].name} disabled={done} tone={done ? (id === q.id ? 'right' : id === picked ? 'wrong' : undefined) : undefined}
            onPress={() => { setPicked(id); submit(gradeName(q, id)); }} />
        ))}
      </View>
    );
  }
  if (q.t === 'type') {
    kind = 'שליטה מלאה';
    title = 'מה שם היישוב המסומן?';
    body = (
      <View style={{ gap: 6 }}>
        <TextInput maxFontSizeMultiplier={1.3} value={typed} placeholder="שם היישוב" placeholderTextColor={C.muted} onChangeText={setTyped} editable={!done} autoCorrect={false} autoCapitalize="none" style={styles.input}
          onSubmitEditing={() => typed.trim() && submit(gradeType(q, typed))} returnKeyType="done" accessibilityLabel="שם היישוב" />
        {/* Right under the box, so the keyboard never covers them. */}
        {!done && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <LinkBtn label={t('{לא יודע|לא יודעת}, צבי יגלה')} onPress={() => submit({ ok: false, ids: [q.id], text: `התשובה: ${it.name}` })} />
            <Btn label="לבדוק" disabled={!typed.trim()} onPress={() => submit(gradeType(q, typed))} />
          </View>
        )}
      </View>
    );
  }
  if (q.t === 'compare') {
    const A = BY[q.a!], B = BY[q.b!], correct = compareAnswer(q);
    kind = 'מי איפה';
    title = `מי ${DIR_WORD[q.dir!]} יותר?`;
    map = { ...map, view: { fit: [A, B], pad: 0.6, minW: 40 }, tag: done ? undefined : 'התשובה תופיע כאן',
      dots: done ? [{ ...A, state: 'lit', label: A.name }, { ...B, state: 'lit', label: B.name }] : [] };
    body = (
      <View style={{ gap: 10 }}>
        {[A, B].map((x) => (
          <Btn key={x.id} alt label={x.name} disabled={done} tone={done ? (x.id === correct ? 'right' : x.id === picked ? 'wrong' : undefined) : undefined}
            onPress={() => { setPicked(x.id); submit(gradeCompare(q, x.id)); }} />
        ))}
      </View>
    );
  }
  if (q.t === 'pin') {
    const exam = sess.kind === 'exam', lim = PIN_LIMIT[sess.kind];
    kind = exam ? `מבחן הקביעות · ${sess.i + 1}/${sess.q.length}` : 'סימון על מפה ריקה';
    title = t(`{סמן|סמני} את ${it.name}`);
    map = { ...map, view: q.view!, dots: exam ? [] : ctxDots([it.id], q.view!),
      // A touch only places the pin; the guess counts once it is confirmed, so a slip while zooming costs nothing.
      onPressMap: done ? undefined : (g) => setGuess(g), pins: guess ? [guess] : undefined };
    if (done && guess) map = { ...map, dots: [...map.dots!, { ...it, state: sess.fb!.ok ? 'right' : 'wrong', label: it.name, size: 1.2 }],
      pins: [guess], lines: [[guess, it]], rings: [{ x: it.x, y: it.y, r: lim }] };
    body = !done && (
      <T_ style={{ color: C.muted, fontSize: 14 }}>{guess ? 'אפשר לגעת שוב במפה כדי להזיז את הסיכה.' : `לגעת במקום במפה. עד ${lim} ק״מ זו פגיעה, עד 4 ק״מ בול.`}</T_>
    );
  }
  if (q.rev && sess.kind === 'shift') kind = 'תיק דוהה · ' + kind;

  const pct = Math.round((sess.i / sess.q.length) * 100);
  // The map takes the height the question's answers leave free (with room for the feedback sheet), so tall phones show more map.
  const free = { intro: 500, pin: 340, tap: 400, compare: 460, type: 520, name: 640 }[q.t];
  const mapH = Math.round(Math.min(520, Math.max(q.t === 'intro' ? 220 : 300, winH - free)));
  return (
    <Screen>
      <View style={styles.head}>
        <LinkBtn label="✕ הפסקת קפה" onPress={quit} />
        <View style={{ flex: 1 }}><Meter pct={pct} /></View>
        <T_ style={{ fontFamily: F.black, color: C.target, minWidth: 30 }}>{sess.combo >= 2 ? `×${sess.combo}` : ''}</T_>
      </View>
      <View>
        <Kicker>{kind}</Kicker>
        {!!title && <T_ style={{ fontFamily: F.display, fontSize: 26, lineHeight: 32 }}>{title}</T_>}
      </View>
      {/* A new height remounts the map: on the web a resize alone does not re-measure it. */}
      <MapView key={mapH} {...map} style={{ height: mapH }} label="מפת השאלה" />
      {body}
      <View style={{ flex: 1 }} />
      {sess.fb ? (
        <View style={[styles.sheet, { backgroundColor: sess.fb.ok ? C.sheetOk : C.sheetBad }]} accessibilityLiveRegion="polite">
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            {sess.fb.ok ? <OkStamp xp={sess.fb.xp || 0} /> : <Mentor size={56} />}
            <View style={{ flex: 1 }}>
              <T_ style={{ fontFamily: F.display, fontSize: 22 }}>{t(sess.fb.title)}</T_>
              <T_>{sess.fb.text}</T_>
            </View>
          </View>
          <Btn label="הבא בתור" onPress={goNext} />
        </View>
      ) : q.t === 'pin' ? (
        <Btn label="לאשר את המיקום" disabled={!guess} onPress={() => guess && submit(gradePin(q, guess, sess.kind))} />
      ) : q.t === 'intro' ? (
        <Btn label="רשמתי, הבא בתור" onPress={goNext} />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  opts3: { flexDirection: 'row', gap: 10 },
  input: { borderWidth: BW, borderColor: C.ink, borderRadius: 12, backgroundColor: C.surface, fontFamily: F.bold, fontSize: 22, padding: 12, textAlign: 'right', writingDirection: 'rtl' },
  sheet: { borderWidth: BW, borderColor: C.ink, borderRadius: 16, padding: 14, gap: 12 },
});
