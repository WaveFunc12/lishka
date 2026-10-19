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

The basemap is shaded relief only: terrain, coast, lakes and borders, with no names, roads or built-up areas, so it never gives an answer away. It's pre-rendered into `assets/map/` (tiles at 16 px per km plus a whole-country overview) and the game is drawn on top in SVG (`src/ui/MapView.tsx`). Pinch to zoom, drag once zoomed, or use the + / − buttons.

To rebuild it (downloads the elevation data on first run):

```sh
python3 -m pip install numpy pillow scipy scikit-image shapely tifffile imagecodecs
python3 tools/map/build.py
```

Elevation data: Copernicus DEM GLO-90, © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018, provided under COPERNICUS by the European Union and ESA. This credit has to appear in the app (an "about" line is enough).
