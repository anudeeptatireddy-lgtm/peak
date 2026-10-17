// The safety gate of `glitch` with no drawing, so the flash test can run it. Every burst
// changes the picture twice (tear, then snap clean). A burst is allowed only if those two
// changes, together with the recent ones, never make more than FIXED.RATE_CAP changes in
// any one-second window (PRD §8.2).

import { FIXED } from './constants';

export class BurstGate {
  /** Times (seconds) of recent abrupt changes, including the end of a burst still running. */
  readonly log: number[] = [];

  /** True if a burst of `length` seconds starting at `t` keeps the cap. */
  allows(t: number, length: number): boolean {
    const times = [...this.log.filter((x) => x > t - 2), t, t + length].sort((a, b) => a - b);
    const window = FIXED.WINDOW_MARGIN;
    for (let i = 0; i + FIXED.RATE_CAP < times.length; i++)
      if (times[i + FIXED.RATE_CAP]! - times[i]! < window) return false;
    return true;
  }

  /** Starts a burst if allowed; returns whether it started. */
  start(t: number, length: number): boolean {
    if (!this.allows(t, length)) return false;
    this.log.push(t, t + length);
    if (this.log.length > FIXED.RATE_CAP * FIXED.CHANGES_PER_BURST * 2)
      this.log.splice(0, this.log.length - FIXED.RATE_CAP * FIXED.CHANGES_PER_BURST * 2);
    return true;
  }
}
