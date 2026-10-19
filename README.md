# גלויות מהלשכה

Hebrew map-learning game for iPhone. Episode 1: Israel's cities and towns.
Built with Expo (SDK 58), React Native, TypeScript and Expo Router.

## Run it

```sh
npm install
npx expo start        # scan the QR code with Expo Go on your iPhone
npx expo start --web  # or play in a browser
```

## Check it

```sh
npm test              # game rules (vitest)
npm run typecheck
```

## Where things are

- `src/engine/` — all game rules as plain TypeScript, no React: shifts, scoring, memory decay,
  attendance days and the sick day, settlement of the day. Ported from the prototype's `pc.js`
  and covered by `engine.test.ts`.
- `src/data/` — the 42 sample places and the map outlines. The verified 500 places replace `places.json`.
- `src/app/` — screens (Expo Router): hello, story, home, shift, result, daily, file.
- `src/ui/` — the map (`MapView`, react-native-svg), Zvi, buttons, theme.
- `src/state/` — the store; progress is saved on the phone with AsyncStorage.

Days roll over at midnight Israel time. Developer tools (skipping days) appear only in development builds.

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
