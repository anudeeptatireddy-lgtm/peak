// The motion of `moire` with no drawing and no DOM, so the flash test can run it.
// The second layer slides and turns toward a target; the speed of both is capped so
// the interference bands never beat faster than FIXED.RATE_CAP times a second
// at any spot (PRD §8.2).

import { FIXED } from './constants';

export interface Motion {
  ox: number;
  oy: number;
  ang: number;
}

export interface Limits {
  /** Line or ring spacing in px. */
  spacing: number;
  /** Distance from the turning center to the farthest corner, in px. */
  radius: number;
  /** 2 or 3 layers: a third layer moves relative to the second too. */
  layers: number;
  /** Share of the cursor's follow each frame (0 to 1). */
  follow: number;
}

/** Fastest the first moving layer may slide (px/s) and turn (rad/s): each gets half the cap. */
export function maxSpeeds(l: Limits): { slide: number; turn: number } {
  const relative = l.layers > 2 ? 1 + Math.abs(FIXED.SECOND_SCALE) : 1;
  const half = FIXED.RATE_CAP / 2 / relative;
  return { slide: half * l.spacing, turn: (half * l.spacing) / l.radius };
}

/** Moves `m` toward the target by the follow share, never faster than the caps. */
export function step(m: Motion, target: Motion, dt: number, f: number, l: Limits): void {
  const k = 1 - Math.pow(1 - l.follow, f);
  const speeds = maxSpeeds(l);
  let dx = (target.ox - m.ox) * k;
  let dy = (target.oy - m.oy) * k;
  const len = Math.hypot(dx, dy);
  const most = speeds.slide * dt;
  if (len > most) {
    dx *= most / len;
    dy *= most / len;
  }
  m.ox += dx;
  m.oy += dy;
  const da = (target.ang - m.ang) * k;
  const lim = speeds.turn * dt;
  m.ang += Math.max(-lim, Math.min(lim, da));
}

/** The beats per second the bands make at the worst spot between two layers' motions. */
export function beatRate(
  before: Motion,
  after: Motion,
  scaleA: number,
  scaleB: number,
  dt: number,
  l: Limits,
): number {
  const dx = (after.ox - before.ox) * (scaleA - scaleB);
  const dy = (after.oy - before.oy) * (scaleA - scaleB);
  const da = (after.ang - before.ang) * (scaleA - scaleB);
  return (Math.hypot(dx, dy) / l.spacing + (Math.abs(da) * l.radius) / l.spacing) / dt;
}
