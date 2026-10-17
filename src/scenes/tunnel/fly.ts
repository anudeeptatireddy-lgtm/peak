// The flight of `tunnel` with no drawing, so the flash test can run it. Rings sit one
// "spacing" apart along the tunnel. The spacing grows with speed, so rings never pass
// any spot on screen faster than FIXED.RATE_CAP times a second (PRD §8.2).

import { FIXED } from './constants';

export interface Flight {
  /** How far through the gap between two rings the camera is (0 to 1). */
  frac: number;
  /** Rings passed so far (the ring colors flow with this). */
  passed: number;
  /** Distance flown (world units): where on the noise path the camera is. */
  travel: number;
  /** Seconds since the last ring passed. */
  since: number;
}

/** Ring spacing in world units for a flight speed (world units per second). */
export function spacingFor(speed: number, base: number): number {
  return Math.max(base, speed / FIXED.RATE_CAP);
}

/** Flies for dt seconds at `speed`; returns how many rings passed the camera (0 or 1). */
export function fly(s: Flight, speed: number, base: number, dt: number): number {
  const gap = spacingFor(speed, base);
  s.travel += speed * dt;
  s.since += dt;
  s.frac += (speed * dt) / gap;
  if (s.frac < 1) return 0;
  // A ring may pass only if the last one passed long enough ago; otherwise it waits
  // just short of the camera (too close to see), whatever the speed did meanwhile.
  if (s.since * FIXED.RATE_CAP >= FIXED.INTERVAL_MARGIN) {
    s.frac -= 1;
    s.passed++;
    s.since = 0;
    return 1;
  }
  s.frac = 1 - Number.EPSILON * gap;
  return 0;
}
