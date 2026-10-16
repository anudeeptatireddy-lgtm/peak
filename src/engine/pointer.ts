// Pointer helper (PRD §16.4, §8.3): pointer position relative to a host element,
// re-synced every frame so a still cursor stays right while the page scrolls.
// On touch, drags that need free movement start only after a short press-and-hold
// unless `immediateDrag` is on (Just play mode), so normal swipes still scroll.

export interface Tap {
  x: number;
  y: number;
}

export interface PointerState {
  /** Position in host coordinates (CSS px), updated by sync(). */
  x: number;
  y: number;
  /** Position at the previous sync(). */
  px: number;
  py: number;
  /** Pointer is over the host (mouse) or touching it (touch/pen). */
  active: boolean;
  /** A button or finger is down. */
  down: boolean;
  /** A free-movement drag is in progress (mouse: while down; touch: after hold). */
  dragging: boolean;
  pointerType: string;
  /** Call once per frame before reading x/y. */
  sync(): void;
  /** Clicks and taps (on release) since the last call, in host coordinates. */
  takeTaps(): Tap[];
  setImmediateDrag(on: boolean): void;
  destroy(): void;
}

export interface PointerOptions {
  /** How long a finger must stay still before a drag starts (ms). */
  holdMs?: number;
  immediateDrag?: boolean;
}

const HOLD_SLOP = 8;

export function createPointer(host: HTMLElement, opts: PointerOptions = {}): PointerState {
  const holdMs = opts.holdMs ?? 250;
  let immediate = !!opts.immediateDrag;
  let cx = 0;
  let cy = 0;
  let fresh = true;
  let holdTimer = 0;
  let downX = 0;
  let downY = 0;
  const taps: { cx: number; cy: number }[] = [];
  const ac = new AbortController();
  const sig = { signal: ac.signal };

  const p: PointerState = {
    x: 0,
    y: 0,
    px: 0,
    py: 0,
    active: false,
    down: false,
    dragging: false,
    pointerType: 'mouse',
    sync() {
      const r = host.getBoundingClientRect();
      p.px = p.x;
      p.py = p.y;
      p.x = cx - r.left;
      p.y = cy - r.top;
      if (fresh) {
        p.px = p.x;
        p.py = p.y;
        fresh = false;
      }
    },
    takeTaps() {
      if (!taps.length) return [];
      const r = host.getBoundingClientRect();
      const out = taps.map((t) => ({ x: t.cx - r.left, y: t.cy - r.top }));
      taps.length = 0;
      return out;
    },
    setImmediateDrag(on) {
      immediate = on;
    },
    destroy() {
      clearTimeout(holdTimer);
      ac.abort();
    },
  };

  const at = (e: PointerEvent) => {
    cx = e.clientX;
    cy = e.clientY;
    p.pointerType = e.pointerType;
    if (!p.active) {
      p.active = true;
      fresh = true;
    }
  };

  host.addEventListener(
    'pointermove',
    (e) => {
      at(e);
      if (p.down && !p.dragging && e.pointerType !== 'mouse') {
        if (Math.hypot(e.clientX - downX, e.clientY - downY) > HOLD_SLOP) clearTimeout(holdTimer);
      }
    },
    sig,
  );
  host.addEventListener(
    'pointerdown',
    (e) => {
      at(e);
      p.down = true;
      downX = e.clientX;
      downY = e.clientY;
      // Just play mode (html.fidget) has no page to scroll, so drags start at once.
      const fidget = document.documentElement.classList.contains('fidget');
      if (e.pointerType === 'mouse' || immediate || fidget) p.dragging = true;
      else {
        clearTimeout(holdTimer);
        holdTimer = window.setTimeout(() => {
          if (p.down) p.dragging = true;
        }, holdMs);
      }
    },
    sig,
  );
  const end = (e: PointerEvent) => {
    p.down = false;
    p.dragging = false;
    clearTimeout(holdTimer);
    if (e.pointerType !== 'mouse') p.active = false;
  };
  host.addEventListener('pointerup', end, sig);
  host.addEventListener('pointercancel', end, sig);
  host.addEventListener(
    'pointerleave',
    (e) => {
      if (e.pointerType === 'mouse') {
        p.active = false;
        p.down = false;
        p.dragging = false;
      }
    },
    sig,
  );
  // Taps are clicks, as in the prototype: they fire on release and never when a
  // touch turns into a scroll.
  host.addEventListener('click', (e) => taps.push({ cx: e.clientX, cy: e.clientY }), sig);
  // Once a touch drag has started, stop the page from scrolling under it.
  host.addEventListener(
    'touchmove',
    (e) => {
      if (p.dragging) e.preventDefault();
    },
    { passive: false, signal: ac.signal },
  );
  return p;
}
