// Flicker timing for `neon`, kept pure so tests/unit/flash.test.ts can run it at
// the most extreme settings (PRD §8.2: never more than 3 flashes a second).

import { FIXED } from './constants';

export interface Dim {
  letter: number;
  start: number;
}

export interface FlickerTiming {
  /** Seconds before the first letter starts. */
  firstDelay: number;
  /** Seconds between letters turning on (and each letter's warm-up). */
  turnOn: number;
  /** 0–1: how often letters stutter and dim. */
  flicker: number;
  /** Random dims per minute at full flicker. */
  dimsPerMinute: number;
  /** How long a dim lasts, in seconds. */
  dimTime: number;
  /** Brightness during a dim (0 = off). */
  dimLevel: number;
  /** Turn-on stutters on/off. */
  stutter: boolean;
}

export class Flicker {
  dims: Dim[] = [];
  /** When the last flash (a dim) started; every flash goes through tryFlash. */
  lastFlash = -Infinity;
  /** Every flash start, for the safety test. */
  log: number[] = [];

  constructor(public letters: number) {}

  /** Starts a dim on a letter if the 3-per-second budget allows. */
  tryFlash(letter: number, t: number, dimTime: number): boolean {
    if (t - this.lastFlash < FIXED.MIN_FLASH_GAP) return false;
    this.lastFlash = t;
    this.dims.push({ letter, start: t });
    this.log.push(t);
    this.dims = this.dims.filter((d) => t - d.start < dimTime);
    return true;
  }

  /**
   * Advances the timing to time t (seconds since the sign started): turn-on
   * stutters as each letter warms up, then random dims on lit letters.
   * `rand` is Math.random (one call per possible dim per frame).
   */
  step(t: number, dt: number, o: FlickerTiming, rand: () => number = Math.random): void {
    if (o.flicker <= 0) return;
    for (let i = 0; i < this.letters; i++) {
      const mid = o.firstDelay + i * o.turnOn + o.turnOn * FIXED.FADE_SHARE * 0.5;
      if (o.stutter && t - dt < mid && t >= mid && rand() < o.flicker)
        this.tryFlash(i, t, o.dimTime);
    }
    const allOn = t >= o.firstDelay + this.letters * o.turnOn;
    if (allOn && rand() < (o.flicker * o.dimsPerMinute * dt) / FIXED.MINUTE)
      this.tryFlash(Math.floor(rand() * this.letters), t, o.dimTime);
  }

  /** Brightness 0–1 of a letter at time t: its warm-up times any dim on it. */
  brightness(letter: number, t: number, o: FlickerTiming): number {
    const start = o.firstDelay + letter * o.turnOn;
    const warm = Math.min(1, Math.max(0, (t - start) / (o.turnOn * FIXED.FADE_SHARE)));
    const dimmed = this.dims.some(
      (d) => d.letter === letter && t >= d.start && t - d.start < o.dimTime,
    );
    return warm * (dimmed ? o.dimLevel : 1);
  }
}
