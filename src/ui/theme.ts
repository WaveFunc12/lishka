/* Postcard palette from the prototype (pc.css). */
export const C = {
  bg: '#F3DDAE',
  surface: '#FFF6E2',
  ink: '#111111',
  muted: '#5A4E3A',
  kicker: '#A8471A',
  accent: '#1B2A4A',
  accentInk: '#FFF6E2',
  orange: '#EE7B30',
  sea: '#2E9CA8',
  nb: '#D8C49A',
  land: '#F6E3BA',
  wiped: '#E3D7BF',
  litLand: '#F2C25F',
  dot: '#6B5E46',
  dotLit: '#1B2A4A',
  target: '#D9431A',
  pin: '#EE7B30',
  ok: '#2F7D4A',
  bad: '#C0392B',
  sheetOk: '#E3F1DA',
  sheetBad: '#F8DDD3',
  track: '#EBD3A2',
  bronze: '#A5643A',
  silver: '#8E98A3',
  gold: '#C8971C',
  legend: '#6A3FB5',
  road: '#7A2E1C',
  roadCase: '#FFF6E2',
  roadMinor: '#9A6A4E',
  shield: '#D3202A',
  stream: '#3A8DB0',
  streamInk: '#1E5D78',
} as const;

export const F = {
  body: 'Rubik_400Regular',
  bold: 'Rubik_700Bold',
  black: 'Rubik_900Black',
  display: 'SuezOne_400Regular',
  stamp: 'Karantina_700Bold',
} as const;

export const BW = 3;
export const SHADOW = { shadowColor: '#111', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4 } as const;
export const SHADOW_SM = { ...SHADOW, shadowOffset: { width: 3, height: 3 }, elevation: 3 } as const;
