// Easing library (PRD §16.8): pure functions from t in [0, 1] to progress, plus
// smoothstep, smootherstep and a damped spring. Curves follow the common
// easings.net definitions, so a prompt can name them ("ease-out-back") and any
// builder gets the same shape.

export type Ease = (t: number) => number;

const BACK = 1.70158;
const BACK_IO = BACK * 1.525;
const ELASTIC = (2 * Math.PI) / 3;
const ELASTIC_IO = (2 * Math.PI) / 4.5;
const BOUNCE_N = 7.5625;
const BOUNCE_D = 2.75;

export const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const linear: Ease = (t) => t;

export const quadIn: Ease = (t) => t * t;
export const quadOut: Ease = (t) => 1 - (1 - t) * (1 - t);
export const quadInOut: Ease = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

export const cubicIn: Ease = (t) => t * t * t;
export const cubicOut: Ease = (t) => 1 - (1 - t) ** 3;
export const cubicInOut: Ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

export const quartIn: Ease = (t) => t ** 4;
export const quartOut: Ease = (t) => 1 - (1 - t) ** 4;
export const quartInOut: Ease = (t) => (t < 0.5 ? 8 * t ** 4 : 1 - (-2 * t + 2) ** 4 / 2);

export const expoIn: Ease = (t) => (t === 0 ? 0 : 2 ** (10 * t - 10));
export const expoOut: Ease = (t) => (t === 1 ? 1 : 1 - 2 ** (-10 * t));
export const expoInOut: Ease = (t) =>
  t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? 2 ** (20 * t - 10) / 2 : (2 - 2 ** (-20 * t + 10)) / 2;

export const backIn: Ease = (t) => (BACK + 1) * t ** 3 - BACK * t * t;
export const backOut: Ease = (t) => 1 + (BACK + 1) * (t - 1) ** 3 + BACK * (t - 1) ** 2;
export const backInOut: Ease = (t) =>
  t < 0.5
    ? ((2 * t) ** 2 * ((BACK_IO + 1) * 2 * t - BACK_IO)) / 2
    : ((2 * t - 2) ** 2 * ((BACK_IO + 1) * (t * 2 - 2) + BACK_IO) + 2) / 2;

export const elasticIn: Ease = (t) =>
  t === 0 ? 0 : t === 1 ? 1 : -(2 ** (10 * t - 10)) * Math.sin((t * 10 - 10.75) * ELASTIC);
export const elasticOut: Ease = (t) =>
  t === 0 ? 0 : t === 1 ? 1 : 2 ** (-10 * t) * Math.sin((t * 10 - 0.75) * ELASTIC) + 1;
export const elasticInOut: Ease = (t) =>
  t === 0
    ? 0
    : t === 1
      ? 1
      : t < 0.5
        ? -(2 ** (20 * t - 10) * Math.sin((20 * t - 11.125) * ELASTIC_IO)) / 2
        : (2 ** (-20 * t + 10) * Math.sin((20 * t - 11.125) * ELASTIC_IO)) / 2 + 1;

export const bounceOut: Ease = (t) => {
  if (t < 1 / BOUNCE_D) return BOUNCE_N * t * t;
  if (t < 2 / BOUNCE_D) return BOUNCE_N * (t -= 1.5 / BOUNCE_D) * t + 0.75;
  if (t < 2.5 / BOUNCE_D) return BOUNCE_N * (t -= 2.25 / BOUNCE_D) * t + 0.9375;
  return BOUNCE_N * (t -= 2.625 / BOUNCE_D) * t + 0.984375;
};
export const bounceIn: Ease = (t) => 1 - bounceOut(1 - t);
export const bounceInOut: Ease = (t) =>
  t < 0.5 ? (1 - bounceOut(1 - 2 * t)) / 2 : (1 + bounceOut(2 * t - 1)) / 2;

/** Hermite smoothstep of x between edges a and b (0 below a, 1 above b). */
export function smoothstep(a: number, b: number, x: number): number {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
}

/** Ken Perlin's smootherstep on [0, 1]: zero first and second derivatives at both ends. */
export function smootherstep(x: number): number {
  const t = clamp01(x);
  return t * t * t * (t * (t * 6 - 15) + 10);
}

/** Every curve by its prompt name, e.g. EASINGS['back-out']. */
export const EASINGS: Record<string, Ease> = {
  linear,
  'quad-in': quadIn,
  'quad-out': quadOut,
  'quad-in-out': quadInOut,
  'cubic-in': cubicIn,
  'cubic-out': cubicOut,
  'cubic-in-out': cubicInOut,
  'quart-in': quartIn,
  'quart-out': quartOut,
  'quart-in-out': quartInOut,
  'expo-in': expoIn,
  'expo-out': expoOut,
  'expo-in-out': expoInOut,
  'back-in': backIn,
  'back-out': backOut,
  'back-in-out': backInOut,
  'elastic-in': elasticIn,
  'elastic-out': elasticOut,
  'elastic-in-out': elasticInOut,
  'bounce-in': bounceIn,
  'bounce-out': bounceOut,
  'bounce-in-out': bounceInOut,
};

/** A value on a damped spring (PRD §16.4 conventions: per-60Hz-frame units). */
export interface Spring {
  x: number;
  v: number;
}

/**
 * One frame of a damped spring toward `target`: v += (target − x) × stiffness × f,
 * v ×= damping^f, x += v × f. `f` is the frame factor (1 at 60Hz).
 */
export function springStep(
  s: Spring,
  target: number,
  stiffness: number,
  damping: number,
  f: number,
): void {
  s.v += (target - s.x) * stiffness * f;
  s.v *= damping ** f;
  s.x += s.v * f;
}
