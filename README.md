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
