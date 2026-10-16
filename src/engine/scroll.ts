// Smoothed scroll velocity and direction (ported from the prototype), readable
// from the window or from an inner scroller (scene pages, PRD §8.3 velocity).

export class ScrollVelocity {
  /** Smoothed velocity in px per 60Hz frame (positive = scrolling down). */
  vel = 0;
  /** Last clear direction: 1 down, -1 up. */
  dir: 1 | -1 = 1;
  private lastY: number | null = null;

  /** Feed the current scroll position each frame. */
  tick(y: number, dt: number): void {
    if (this.lastY === null) {
      this.lastY = y;
      return;
    }
    const raw = Math.max(-140, Math.min(140, (y - this.lastY) / Math.max(dt * 60, 0.25)));
    this.lastY = y;
    this.vel += (raw - this.vel) * 0.2;
    if (Math.abs(raw) > 0.4) this.dir = raw > 0 ? 1 : -1;
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
