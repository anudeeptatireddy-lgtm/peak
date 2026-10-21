// "Follow cursor" for scenes that don't react to the pointer on their own (owner,
// 2026-10-21). Two kinds, both off by default:
// - sweep: for scroll-driven scenes, moving a mouse sideways over the stage counts
//   as scrolling, so a left-to-right sweep plays the story.
// - lean: for everything else, the whole picture tilts and shifts toward the mouse.
// Mouse only: touch screens already drag or scroll these scenes.

import type { ScrollSource } from '../engine/scroll';
import { ease, frameFactor } from '../engine/time';

export const CURSOR = {
  /** At lean amount 1, the picture turns up to this many degrees side to side… */
  LEAN_DEG: 12,
  /** …this share of that up and down… */
  LEAN_PITCH: 0.6,
  /** …and shifts up to this many px toward the mouse. */
  LEAN_SHIFT: 24,
  /** Perspective distance for the tilt, in px. */
  PERSPECTIVE: 900,
  /** Share of the way to the target pose covered each frame. */
  LEAN_EASE: 0.1,
  /** Below this the pose counts as flat and the transform is removed. */
  LEAN_REST: 0.001,
} as const;

/** Scroll source that adds mouse sweeps to the real scroll position. */
export function cursorSweep(
  host: HTMLElement,
  source: ScrollSource,
  opts: { on: () => boolean; px: () => number },
): { source: ScrollSource; destroy(): void } {
  const ac = new AbortController();
  let offset = 0;
  let lastX: number | null = null;
  host.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType !== 'mouse' || !opts.on()) {
        lastX = null;
        return;
      }
      const w = host.clientWidth || 1;
      if (lastX !== null) offset += ((e.clientX - lastX) / w) * opts.px();
      lastX = e.clientX;
    },
    { signal: ac.signal },
  );
  host.addEventListener(
    'pointerleave',
    () => {
      lastX = null;
    },
    { signal: ac.signal },
  );
  return {
    source: { velocity: source.velocity, read: () => source.read() + offset },
    destroy: () => ac.abort(),
  };
}

/**
 * Tilts everything the scene put in `host` (its canvas or DOM layers, all full-stage)
 * toward the mouse; call update() once per frame. The host itself never moves, so
 * pointer positions stay where they were.
 */
export function cursorLean(host: HTMLElement): {
  update(dt: number, on: boolean, amount: number): void;
  reset(): void;
  destroy(): void;
} {
  const ac = new AbortController();
  let mx = 0;
  let my = 0;
  let inside = false;
  let u = 0;
  let v = 0;
  host.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType !== 'mouse') return;
      const r = host.getBoundingClientRect();
      mx = r.width ? ((e.clientX - r.left) / r.width - 0.5) * 2 : 0;
      my = r.height ? ((e.clientY - r.top) / r.height - 0.5) * 2 : 0;
      inside = true;
    },
    { signal: ac.signal },
  );
  host.addEventListener(
    'pointerleave',
    () => {
      inside = false;
    },
    { signal: ac.signal },
  );
  const layers = () =>
    Array.from(host.children).filter((ch): ch is HTMLElement => ch instanceof HTMLElement);
  let leaning = false;
  const apply = () => {
    if (Math.abs(u) < CURSOR.LEAN_REST && Math.abs(v) < CURSOR.LEAN_REST) {
      if (leaning) for (const el of layers()) el.style.transform = '';
      leaning = false;
      return;
    }
    leaning = true;
    const t =
      `perspective(${CURSOR.PERSPECTIVE}px) rotateY(${u * CURSOR.LEAN_DEG}deg) ` +
      `rotateX(${-v * CURSOR.LEAN_DEG * CURSOR.LEAN_PITCH}deg) ` +
      `translate(${u * CURSOR.LEAN_SHIFT}px, ${v * CURSOR.LEAN_SHIFT}px)`;
    for (const el of layers()) el.style.transform = t;
  };
  return {
    update(dt, on, amount) {
      const k = ease(CURSOR.LEAN_EASE, frameFactor(dt));
      const tu = on && inside ? mx * amount : 0;
      const tv = on && inside ? my * amount : 0;
      u += (tu - u) * k;
      v += (tv - v) * k;
      apply();
    },
    reset() {
      u = v = 0;
      apply();
    },
    destroy() {
      ac.abort();
      u = v = 0;
      apply();
    },
  };
}
