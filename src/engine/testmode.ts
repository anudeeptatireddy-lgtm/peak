// Test mode (owner, 2026-10-17): makes physics run the same every time.
// A test sets `window.__PEAK_TEST__ = <seed>` before the page loads. Then
//  - Math.random is a seeded generator (mulberry32), restartable with __reseed(seed),
//  - the scheduler steps a fixed 16ms (the test clock's frame) per animation frame, so the
//    step never wobbles with timestamps.
// Nothing sets the flag in normal use, so visitors always get real time and real randomness.

/** One frame of the test clock. Playwright's fake clock fires requestAnimationFrame every 16ms,
 * so this is the step the demos and built pages measure too. */
export const TEST_DT = 0.016;

type TestWindow = Window & { __PEAK_TEST__?: number; __reseed?: (seed: number) => void };

const MIX_STEP = 0x6d2b79f5;
const SHIFT_A = 15;
const SHIFT_B = 7;
const SHIFT_C = 14;
const MASK = 61;
const RANGE = 4294967296;

let enabled = false;

export function isTestMode(): boolean {
  return enabled;
}

/** Reads the flag and, when it is set, seeds Math.random. Called once when the engine loads. */
export function initTestMode(): void {
  if (typeof window === 'undefined') return;
  const w = window as TestWindow;
  if (typeof w.__PEAK_TEST__ !== 'number') return;
  enabled = true;
  let a = w.__PEAK_TEST__ >>> 0;
  w.__reseed = (seed) => {
    a = seed >>> 0;
  };
  Math.random = () => {
    a = (a + MIX_STEP) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> SHIFT_A), t | 1);
    t ^= t + Math.imul(t ^ (t >>> SHIFT_B), t | MASK);
    return ((t ^ (t >>> SHIFT_C)) >>> 0) / RANGE;
  };
}
