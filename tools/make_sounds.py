"""Make the game's three short sound effects (assets/sounds/*.wav), synthesised so there is nothing to license.

  python3 tools/make_sounds.py
"""
import os, wave
import numpy as np

SR = 22050
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'assets', 'sounds')

def tone(f, dur, decay, amp=1.0):
    t = np.arange(int(SR * dur)) / SR
    # A bell-ish tone: the note plus a soft octave, fading out.
    return amp * np.exp(-t * decay) * (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t))

def at(sig, start, total):
    out = np.zeros(int(SR * total)); i = int(SR * start)
    out[i:i + len(sig)] += sig[: len(out) - i]
    return out

def thump(dur=0.12):
    # The stamp hitting the desk: a low thud with a little paper noise.
    t = np.arange(int(SR * dur)) / SR
    rng = np.random.default_rng(7)
    return np.exp(-t * 40) * (np.sin(2 * np.pi * 110 * t) + 0.25 * rng.standard_normal(len(t)) * np.exp(-t * 90))

def save(name, sig):
    sig = sig / np.max(np.abs(sig)) * 0.6
    fade = np.linspace(1, 0, int(SR * 0.01)); sig[-len(fade):] *= fade
    with wave.open(os.path.join(OUT, name + '.wav'), 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((sig * 32767).astype(np.int16).tobytes())

os.makedirs(OUT, exist_ok=True)
# Right: stamp, then a bright two-note ding.
save('ok', at(thump(), 0, 0.42) + at(tone(1046.5, 0.3, 12, 0.5), 0.06, 0.42) + at(tone(1568, 0.3, 10, 0.5), 0.13, 0.42))
# Wrong: two soft low notes going down.
save('bad', at(tone(311, 0.2, 14, 0.8), 0, 0.36) + at(tone(233, 0.22, 12, 0.8), 0.12, 0.36))
# A postcard arrives: four rising notes.
save('card', sum(at(tone(f, 0.45, 6, 0.5), i * 0.09, 0.75) for i, f in enumerate([784, 988, 1175, 1568])))
