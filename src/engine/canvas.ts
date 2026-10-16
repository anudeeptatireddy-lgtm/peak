// Canvas helper (PRD §16.4): sized in CSS pixels with devicePixelRatio capped at 2.

export interface CanvasHandle {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  w: number;
  h: number;
  dpr: number;
  /** Matches the host's size. Returns true if the size changed. */
  fit(): boolean;
  /** Fills with a color (or clears to transparent). */
  clear(color?: string): void;
  destroy(): void;
}

export function createCanvas(host: HTMLElement, opts: { cap?: number } = {}): CanvasHandle {
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.className = 'scene-canvas';
  host.prepend(canvas);
  const ctx = canvas.getContext('2d')!;
  const c: CanvasHandle = {
    canvas,
    ctx,
    w: 0,
    h: 0,
    dpr: 1,
    fit() {
      const w = Math.max(1, Math.round(host.clientWidth));
      const h = Math.max(1, Math.round(host.clientHeight));
      const dpr = Math.min(window.devicePixelRatio || 1, opts.cap ?? 2);
      if (w === c.w && h === c.h && dpr === c.dpr) return false;
      c.w = w;
      c.h = h;
      c.dpr = dpr;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return true;
    },
    clear(color) {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      if (color) {
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, c.w, c.h);
      } else ctx.clearRect(0, 0, c.w, c.h);
    },
    destroy() {
      canvas.width = 0;
      canvas.height = 0;
      canvas.remove();
    },
  };
  return c;
}
