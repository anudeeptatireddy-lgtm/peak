// Sound (PRD §9.8): off by default, synthesized with the Web Audio API (no audio files),
// and silent until the visitor has touched the page. Scenes call `ctx.sound.play(name)`;
// this is the one place that turns a name into a tiny synthesized sound.

import { getPref } from '../state/prefs';
import type { SoundHooks } from '../scenes/types';

type Voice = (ac: AudioContext, out: AudioNode, t: number, pitch: number) => void;

/** A tone that starts at `f0` Hz, glides to `f1`, and fades out over `dur` seconds. */
function tone(
  ac: AudioContext,
  out: AudioNode,
  t: number,
  type: OscillatorType,
  f0: number,
  f1: number,
  dur: number,
  gain: number,
): void {
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f0, t);
  o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(out);
  o.start(t);
  o.stop(t + dur + 0.02);
}

export const VOICES: Record<string, Voice> = {
  /** A soft click for buttons. */
  click: (ac, out, t, p) => tone(ac, out, t, 'triangle', 900 * p, 500 * p, 0.05, 0.5),
  /** A pop (particles, confetti, marbles). */
  pop: (ac, out, t, p) => tone(ac, out, t, 'sine', 420 * p, 90 * p, 0.14, 0.9),
  /** A water drop (ripple). */
  drop: (ac, out, t, p) => {
    tone(ac, out, t, 'sine', 600 * p, 1100 * p, 0.12, 0.7);
    tone(ac, out, t + 0.05, 'sine', 300 * p, 500 * p, 0.2, 0.25);
  },
  /** A plucked string. */
  pluck: (ac, out, t, p) => tone(ac, out, t, 'triangle', 330 * p, 320 * p, 0.35, 0.7),
  /** A rising whoosh (warp). */
  whoosh: (ac, out, t, p) => tone(ac, out, t, 'sawtooth', 120 * p, 900 * p, 0.6, 0.12),
  /** A little tick (countdown flips). */
  tick: (ac, out, t, p) => tone(ac, out, t, 'square', 1500 * p, 1200 * p, 0.03, 0.12),
};

let ac: AudioContext | null = null;
let master: GainNode | null = null;
let gesture = false;

/** Browsers only allow audio after a touch, so wait for one before ever making sound. */
function listenForGesture(): void {
  if (typeof window === 'undefined') return;
  const mark = () => {
    gesture = true;
    for (const e of ['pointerdown', 'keydown', 'touchstart'])
      window.removeEventListener(e, mark, true);
  };
  for (const e of ['pointerdown', 'keydown', 'touchstart'])
    window.addEventListener(e, mark, { capture: true, passive: true });
}
listenForGesture();

function context(): AudioContext | null {
  if (!ac) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ac = new Ctor();
    master = ac.createGain();
    master.gain.value = 0.25; // quiet by default
    master.connect(ac.destination);
  }
  if (ac.state === 'suspended') void ac.resume();
  return ac;
}

/** Play a named sound. Does nothing when sound is off, before a gesture, or for unknown names. */
export function play(name: string, opts: { volume?: number; pitch?: number } = {}): void {
  if (!getPref('sound') || !gesture) return;
  const voice = VOICES[name];
  if (!voice) return;
  const a = context();
  if (!a || !master) return;
  const out = a.createGain();
  out.gain.value = opts.volume ?? 1;
  out.connect(master);
  voice(a, out, a.currentTime, opts.pitch ?? 1);
}

export const sound: SoundHooks = { play };

/** Soft clicks for buttons: one listener for the whole page. */
export function installButtonClicks(): void {
  document.addEventListener(
    'click',
    (e) => {
      const el = (e.target as HTMLElement | null)?.closest('button, .btn');
      if (el && !el.hasAttribute('data-no-sound')) play('click');
    },
    { passive: true },
  );
}
