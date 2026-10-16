// Smoothed scroll velocity and direction (ported from the prototype), readable
// from the window or from an inner scroller (scene pages, PRD §8.3 velocity).

export interface ScrollTuning {
  /** Raw speeds beyond this (px per 60Hz frame) are clamped. */
  maxSpeed: number;
  /** How much of the gap to the raw speed is closed each frame (0–1). */
  smoothing: number;
  /** Raw speeds above this change the remembered direction. */
  dirThreshold: number;
}

/** The prototype's scroll tuning. */
export const DEFAULT_SCROLL_TUNING: ScrollTuning = {
  maxSpeed: 140,
  smoothing: 0.2,
  dirThreshold: 0.4,
};

export class ScrollVelocity {
  /** Smoothed velocity in px per 60Hz frame (positive = scrolling down). */
  vel = 0;
  /** Last clear direction: 1 down, -1 up. */
  dir: 1 | -1 = 1;
  private lastY: number | null = null;
  tuning: ScrollTuning = { ...DEFAULT_SCROLL_TUNING };

  /** Feed the current scroll position each frame. */
  tick(y: number, dt: number): void {
    if (this.lastY === null) {
      this.lastY = y;
      return;
    }
    const { maxSpeed, smoothing, dirThreshold } = this.tuning;
    const raw = Math.max(-maxSpeed, Math.min(maxSpeed, (y - this.lastY) / Math.max(dt * 60, 0.25)));
    this.lastY = y;
    this.vel += (raw - this.vel) * smoothing;
    if (Math.abs(raw) > dirThreshold) this.dir = raw > 0 ? 1 : -1;
  }

  reset(y?: number): void {
    this.vel = 0;
    this.lastY = y ?? null;
  }
}

export interface ScrollSource {
  velocity: ScrollVelocity;
  read(): number;
}

/** A scroll source for the window (default) or an element that scrolls itself. */
export function createScrollSource(el?: HTMLElement): ScrollSource {
  return {
    velocity: new ScrollVelocity(),
    read: () => (el ? el.scrollTop : window.scrollY),
  };
}
