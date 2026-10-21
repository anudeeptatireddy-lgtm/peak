// Torch flicker and the celebration glow for `torchmap` (⚠, PRD §8.2). Pure functions
// of time, so tests/unit/flash.test.ts can run them at the most extreme settings.

import { smoothstep } from '../../kits/easing';
import { SHARED } from '../shared';
import { FIXED } from './constants';

/**
 * The torch radius multiplier at time t: two slow waves, the faster at `rate` per
 * second (capped at 3 by the schema), changing the radius by at most
 * amount × FLICKER_CAP. Never more than `rate` brightenings a second.
 */
export function torchScale(t: number, amount: number, rate: number): number {
  const a = Math.sin(SHARED.TAU * rate * t);
  const b = Math.sin(SHARED.TAU * rate * FIXED.FLICKER_SLOW * t + FIXED.FLICKER_PHASE);
  const wave = a * FIXED.FLICKER_MIX + b * (1 - FIXED.FLICKER_MIX);
  return 1 + amount * FIXED.FLICKER_CAP * wave;
}

/** The celebration glow (0–1) `since` seconds after the last letter was found: a slow rise. */
export function glowLevel(since: number, rise: number): number {
  return since < 0 ? 0 : smoothstep(0, rise, since);
}
