# גלויות מהלשכה

Hebrew map-learning game for iPhone. Episode 1: Israel's cities and towns.
Built with Expo (SDK 58), React Native, TypeScript and Expo Router.

## Run it

```sh
npm install
npx expo start        # scan the QR code with Expo Go on your iPhone
npx expo start --web  # or play in a browser
```

## Build for iPhone (EAS)

```sh
npx eas-cli@latest build --profile development --platform ios   # dev build with Sign in with Apple and reminders
npx eas-cli@latest build --profile production --platform ios    # App Store build (version number counts up by itself)
npx eas-cli@latest submit --platform ios                        # send it to App Store Connect
```

The first run asks to log in to Expo and to the Apple Developer account, and creates the signing certificates.

## Check it

```sh
npm test              # game rules (vitest)
npm run typecheck
EXPO_OFFLINE=1 npx expo lint
bash supabase/tests/run.sh   # rooms database rules, on a throwaway local Postgres (run as a non-root user)
```

## Where things are

- `src/engine/` — all game rules as plain TypeScript, no React: shifts, scoring, memory decay,
  attendance days and the sick day, settlement of the day. Ported from the prototype's `pc.js`
  and covered by `engine.test.ts`.
- `src/data/` — the 500 biggest places (CBS 2023, built by `tools/places/build_places.py`) and the map data.
  The first 42 are the story's seven postcards; the rest are the archive's 83 regional postcards.
- `src/app/` — screens (Expo Router): hello, story, home, shift, result, daily, archive, atlas (my map),
  roads (the road quiz), rooms and room/[id], file, about.
- `src/net/` — sign-in and private rooms (Supabase). Off unless the project is configured (below).
- `src/ui/` — the map (`MapView`, react-native-svg), Zvi, buttons, theme.
- `src/state/` — the store; progress is saved on the phone with AsyncStorage.

Days roll over at midnight Israel time. Zvi's daily reminder (set in the personnel file) is a local
notification, planned a week ahead and skipped on days already played (`src/state/reminders.ts`). Developer tools (skipping days) appear only in development builds.

## Rooms (online)

Private rooms let friends and family compare their daily: sign in (Sign in with Apple on iPhone, or a
code by email), pick a display name, create a room and share its 6-letter code. Signing in also backs up
progress, so a new phone picks up the old one's game (the save with more xp wins on first sign-in).
The database rules are in `supabase/migrations/` and tested by `supabase/tests/run.sh`.

To turn it on:
1. Create a free project at supabase.com and run the migration (SQL editor, or `supabase db push`).
2. Auth: enable Email (with "email OTP", 6 digits) and Apple (bundle id `com.wavefunc12.lishka`).
3. Put the project's URL and publishable key in `.env` as `EXPO_PUBLIC_SUPABASE_URL` and
   `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (and in EAS environment variables for builds).

Without them the app stays fully offline and the rooms screen says rooms aren't connected yet.

## The map

The basemap is shaded relief (terrain, coast, lakes and borders) with main roads, streams and region names on top. Numbered roads get their red route shield, and every label is placed again for the part of the map in view, so a shield or name stays visible at any zoom. The relief is pre-rendered into `assets/map/` (tiles at 16 px per km plus a whole-country overview); roads, streams, regions and the game are drawn in SVG (`src/ui/MapOverlay.tsx`, `src/ui/MapView.tsx`). Pinch to zoom, drag once zoomed, or use the + / − buttons.

To rebuild it (downloads the elevation data on first run):

```sh
python3 -m pip install numpy pillow scipy scikit-image shapely tifffile imagecodecs
python3 tools/map/build.py
```

Elevation data: Copernicus DEM GLO-90, © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018, provided under COPERNICUS by the European Union and ESA. This credit has to appear in the app (an "about" line is enough).

Roads, streams and region names come from `src/data/overlay.json`. To rebuild it, fetch roads and water from Overture Maps into a folder (see the usage line at the top of `tools/map/fetch_overture.py`), then run `python3 tools/map/build_overlays.py <that folder>`. Numbered routes are traced between waypoints listed in `build_overlays.py`; check them against the preview after any change.

Roads and streams: © OpenStreetMap contributors, via Overture Maps, under the ODbL. This credit also has to appear in the app.
