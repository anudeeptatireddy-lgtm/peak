// Frame timing helpers shared by the scheduler and the scenes (PRD §16.4).

export const MAX_DT = 0.05;

/** Seconds since the last frame, clamped to 0.05; null when no time has passed. */
export function computeDt(now: number, last: number): number | null {
  const dt = (now - last) / 1000;
  if (!(dt > 0)) return null;
  return Math.min(dt, MAX_DT);
}

/** Physics frame factor: 1 at 60Hz, 0.5 at 120Hz, capped at 2.5. */
export function frameFactor(dt: number): number {
  return Math.min(dt * 60, 2.5);
}

/** Frame-rate independent smoothing: the per-frame lerp amount `k` at frame factor `f`. */
export function ease(k: number, f: number): number {
  return 1 - Math.pow(1 - k, f);
}
