import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

/* The game's sound effects (made by tools/make_sounds.py). Players are created on first use and kept,
   since the same few sounds repeat all game long. They follow the phone's silent switch. */

const SRC = {
  ok: require('../../assets/sounds/ok.wav'),
  bad: require('../../assets/sounds/bad.wav'),
  card: require('../../assets/sounds/card.wav'),
  flip: require('../../assets/sounds/flip.wav'),
};
export type Sfx = keyof typeof SRC;

const players: Partial<Record<Sfx, AudioPlayer>> = {};
let moded = false;

export function sfx(name: Sfx) {
  try {
    if (!moded) {
      moded = true;
      setAudioModeAsync({ playsInSilentMode: false, interruptionMode: 'mixWithOthers' }).catch(() => {});
    }
    const p = (players[name] ??= createAudioPlayer(SRC[name]));
    p.seekTo(0).then(() => p.play(), () => p.play());
  } catch {
    // Sound is a nicety; never let it break a turn.
  }
}
