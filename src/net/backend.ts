import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type Session } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';
import { squares, totalKm, points, type DailyPick, type PlayerState } from '@/engine';

/* The online side: sign-in, private rooms and the daily table, on Supabase (supabase/migrations).
   With no project configured (EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY unset)
   `sb` is null and the app stays fully offline. */

const url = process.env.EXPO_PUBLIC_SUPABASE_URL, key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const sb = url && key
  ? createClient(url, key, { auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false } })
  : null;

// Refresh the session only while the app is in front.
if (sb && Platform.OS !== 'web') {
  AppState.addEventListener('change', (st) => (st === 'active' ? sb.auth.startAutoRefresh() : sb.auth.stopAutoRefresh()));
}

export type { Session };
export type Profile = { id: string; name: string };
export type Room = { id: string; code: string; name: string; owner: string };
export type DayRow = { user_id: string; name: string; points: number | null; total_km: number | null; squares: string | null; me: boolean };
export type WeekRow = { user_id: string; name: string; points: number; total_km: number; days: number; me: boolean };

/** Errors from the server, in words a player can act on. */
const WORDS: [RegExp, string][] = [
  [/no such room/, 'אין חדר עם הקוד הזה. כדאי לבדוק שוב את האותיות.'],
  [/room is full/, 'החדר מלא (50 משתתפים).'],
  [/too many rooms/, 'אפשר להיות בעד 20 חדרים.'],
  [/fetch|network|Failed to fetch/i, 'אין חיבור לשרת כרגע. כדאי לנסות שוב עוד מעט.'],
  [/Token has expired|invalid/i, 'הקוד לא נכון או שפג תוקפו. אפשר לבקש קוד חדש.'],
];
export const say = (e: unknown): string => {
  const m = e instanceof Error ? e.message : String((e as { message?: string })?.message ?? e);
  return WORDS.find(([re]) => re.test(m))?.[1] ?? 'משהו השתבש. כדאי לנסות שוב.';
};

const need = () => {
  if (!sb) throw new Error('offline');
  return sb;
};
/** Unwrap a Supabase reply: throw its error, or return its data (never null once the error is gone). */
function ok<R extends { data: unknown; error: unknown }>(r: R): NonNullable<R['data']> {
  if (r.error) throw r.error;
  return r.data as NonNullable<R['data']>;
}

/** Sign in with the token from Sign in with Apple (iOS). */
export const signInApple = async (identityToken: string) => ok(await need().auth.signInWithIdToken({ provider: 'apple', token: identityToken }));
/** Email a 6-digit sign-in code; on web and Android this is the way in. */
export const sendEmailCode = async (email: string) => ok(await need().auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: true } }));
export const verifyEmailCode = async (email: string, code: string) =>
  ok(await need().auth.verifyOtp({ email: email.trim(), token: code.trim(), type: 'email' }));
export const signOut = async () => { await need().auth.signOut(); };

export async function myProfile(uid: string): Promise<Profile | null> {
  const { data, error } = await need().from('profiles').select('id, name').eq('id', uid).maybeSingle();
  if (error) throw error;
  return data;
}
export async function saveName(uid: string, name: string): Promise<Profile> {
  return ok(await need().from('profiles').upsert({ id: uid, name: name.trim() }).select('id, name').single());
}

export async function myRooms(): Promise<Room[]> {
  return ok(await need().from('rooms').select('id, code, name, owner').order('created_at'));
}
export async function getRoom(id: string): Promise<Room | null> {
  const { data, error } = await need().from('rooms').select('id, code, name, owner').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}
export const createRoom = async (name: string): Promise<Room> => ok(await need().rpc('create_room', { p_name: name.trim() }));
export const joinRoom = async (code: string): Promise<Room> => ok(await need().rpc('join_room', { p_code: code }));
export async function leaveRoom(room: string, uid: string) {
  ok(await need().from('room_members').delete().eq('room_id', room).eq('user_id', uid));
}
export const roomDay = async (room: string, day: string): Promise<DayRow[]> => ok(await need().rpc('room_day', { p_room: room, p_day: day }));
export const roomWeek = async (room: string, end: string): Promise<WeekRow[]> => ok(await need().rpc('room_week', { p_room: room, p_end: end }));

/** Post today's daily once; posting again is quietly ignored. */
export async function submitDaily(uid: string, day: string, picks: DailyPick[]) {
  const { error } = await need().from('daily_results')
    .insert({ user_id: uid, day, points: points(picks), total_km: Math.round(totalKm(picks) * 10) / 10, squares: squares(picks) });
  if (error && (error as { code?: string }).code !== '23505') throw error;
}

/** The saved game backed up for this account, if any. */
export async function loadProgress(uid: string): Promise<{ state: unknown; xp: number } | null> {
  const { data, error } = await need().from('progress').select('state, xp').eq('user_id', uid).maybeSingle();
  if (error) throw error;
  return data;
}
export async function saveProgress(uid: string, state: PlayerState) {
  ok(await need().from('progress').upsert({ user_id: uid, state, xp: state.xp, updated_at: new Date().toISOString() }));
}
