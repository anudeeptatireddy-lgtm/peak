// Living colors (PRD §6.7 item 3): the three accent colors drift slowly in hue
// (±12° in OKLCH over a 30-second loop, phases 0°/120°/240°). Text colors never
// drift. Runs at most 20 times a second, only while enabled and not paused.

import { onPausedChange } from '../engine/motion';
import { getPref, onPref } from '../state/prefs';
import { rotateHue } from './color';
import { refresh, setTransform } from './store';
import type { Theme } from './worlds';

export const DRIFT_DEGREES = 12;
export const DRIFT_PERIOD_S = 30;
const PHASES = [0, 120, 240].map((d) => (d * Math.PI) / 180);
const TICK_MS = 50;

/** Hue offset in degrees for accent `i` (0–2) at `seconds`. */
export function driftOffset(i: number, seconds: number): number {
  return DRIFT_DEGREES * Math.sin((2 * Math.PI * seconds) / DRIFT_PERIOD_S + PHASES[i]!);
}

/** The theme with its accents drifted; every other token is untouched. */
export function drift(theme: Theme, seconds: number): Theme {
  return {
    ...theme,
    c1: rotateHue(theme.c1, driftOffset(0, seconds)),
    c2: rotateHue(theme.c2, driftOffset(1, seconds)),
    c3: rotateHue(theme.c3, driftOffset(2, seconds)),
  };
}

let started = false;

/** Starts living colors for this page. Safe to call more than once. */
export function startLivingColors(): void {
  if (started || typeof window === 'undefined') return;
  started = true;
  let seconds = 0;
  let last = 0;
  let timer = 0;
  let enabled = getPref('living');
  let paused = false;

  const tick = () => {
    const now = performance.now();
    seconds += Math.min(0.25, (now - last) / 1000);
    last = now;
    refresh();
  };
  const sync = () => {
    const run = enabled && !paused && !document.hidden;
    if (run && !timer) {
      last = performance.now();
      timer = window.setInterval(tick, TICK_MS);
    } else if (!run && timer) {
      clearInterval(timer);
      timer = 0;
    }
  };

  setTransform((base) => (enabled ? drift(base, seconds) : base));
  onPref('living', (v) => {
    enabled = v;
    refresh();
    sync();
  });
  onPausedChange((v) => {
    paused = v;
    sync();
  });
  document.addEventListener('visibilitychange', sync);
  sync();
}
