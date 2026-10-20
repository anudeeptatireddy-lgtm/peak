// Text kit (PRD §16.8): text to points, text to per-letter boxes, and letter
// outlines as paths. The only kit that touches the DOM, and only through an
// offscreen canvas. Everything that measures or samples text waits for Anybody
// (engine/fonts.ts) and is meant to run again once the font arrives.

import { fontsReady } from '../engine/fonts';

/** Anybody first; the rest only show if it fails to load (scenes wait for it). */
export const FONT_STACK = 'Anybody, "Arial Black", Arial, sans-serif';

export interface FontSpec {
  size: number;
  weight?: number | string;
  italic?: boolean;
  family?: string;
}

export function fontString(f: FontSpec): string {
  return `${f.italic ? 'italic ' : ''}${f.weight ?? 400} ${f.size}px ${f.family ?? FONT_STACK}`;
}

/** Canvas only accepts keyword stretches; Anybody's 50–150% axis maps to these. */
const STRETCHES: [number, CanvasFontStretch][] = [
  [50, 'ultra-condensed'],
  [62.5, 'extra-condensed'],
  [75, 'condensed'],
  [87.5, 'semi-condensed'],
  [100, 'normal'],
  [112.5, 'semi-expanded'],
  [125, 'expanded'],
  [150, 'extra-expanded'],
];

/** The canvas keyword nearest to a font-stretch percentage. */
export function stretchKeyword(percent: number): CanvasFontStretch {
  let best = STRETCHES[0]!;
  for (const s of STRETCHES) if (Math.abs(s[0] - percent) < Math.abs(best[0] - percent)) best = s;
  return best[1];
}

/** Sets font and (where supported) stretch on a 2D context. */
export function applyFont(ctx: CanvasRenderingContext2D, f: FontSpec, stretch = 100): void {
  ctx.font = fontString(f);
  try {
    ctx.fontStretch = stretchKeyword(stretch);
  } catch {
    /* older browsers: normal width */
  }
}

/** A hidden canvas for measuring and sampling. Call free() when done. */
export function offscreen(w: number, h: number) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(w));
  canvas.height = Math.max(1, Math.round(h));
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  return {
    canvas,
    ctx,
    free() {
      canvas.width = 0;
      canvas.height = 0;
    },
  };
}

/** Grid points (x, y pairs) whose alpha is above `cutoff`, scanning rows from the top. */
export function samplePoints(
  rgba: ArrayLike<number>,
  w: number,
  h: number,
  gap: number,
  cutoff: number,
): number[] {
  const pts: number[] = [];
  for (let y = 0; y < h; y += gap)
    for (let x = 0; x < w; x += gap) if (rgba[(y * w + x) * 4 + 3]! > cutoff) pts.push(x, y);
  return pts;
}

/** Like samplePoints, but widens the gap one pixel at a time until at most `max` points remain. */
export function samplePointsUnder(
  rgba: ArrayLike<number>,
  w: number,
  h: number,
  gap: number,
  cutoff: number,
  max: number,
  maxGap: number,
): { pts: number[]; gap: number } {
  let pts: number[];
  do pts = samplePoints(rgba, w, h, gap, cutoff);
  while (pts.length / 2 > max && ++gap < maxGap);
  return { pts, gap };
}

export interface LetterBox {
  /** The character and its index in the text. */
  ch: string;
  i: number;
  /** Left edge of the letter's advance box and its baseline, in canvas pixels. */
  x: number;
  y: number;
  /** Advance width (kerning included, measured from prefixes). */
  w: number;
  /** Ink extents above and below the baseline. */
  ascent: number;
  descent: number;
}

/**
 * Per-letter boxes for `text` drawn with the context's current font at baseline y.
 * Positions come from measuring each prefix, so kerning matches fillText(text).
 * `align` places the whole line: its left edge or its center at x.
 */
export function letterBoxes(
  ctx: Pick<CanvasRenderingContext2D, 'measureText'>,
  text: string,
  x: number,
  y: number,
  align: 'left' | 'center' = 'left',
): LetterBox[] {
  const chars = [...text];
  const total = ctx.measureText(text).width;
  const x0 = align === 'center' ? x - total / 2 : x;
  const boxes: LetterBox[] = [];
  let prefix = '';
  let left = 0;
  chars.forEach((ch, i) => {
    prefix += ch;
    const right = ctx.measureText(prefix).width;
    const m = ctx.measureText(ch);
    boxes.push({
      ch,
      i,
      x: x0 + left,
      y,
      w: right - left,
      ascent: m.actualBoundingBoxAscent ?? 0,
      descent: m.actualBoundingBoxDescent ?? 0,
    });
    left = right;
  });
  return boxes;
}

/** One alpha byte per pixel from an RGBA buffer. */
export function alphaChannel(rgba: ArrayLike<number>, w: number, h: number): Uint8Array {
  const out = new Uint8Array(w * h);
  for (let i = 0; i < out.length; i++) out[i] = rgba[i * 4 + 3]!;
  return out;
}

export interface Pt {
  x: number;
  y: number;
}

/**
 * Outlines of every shape in an alpha mask (marching squares, edges interpolated
 * at `threshold`). Returns closed loops; holes (like the inside of an "o") are
 * loops too. Pure, so it is unit-tested without a browser.
 */
export function traceContours(
  alpha: ArrayLike<number>,
  w: number,
  h: number,
  threshold = 128,
): Pt[][] {
  const at = (x: number, y: number) =>
    x < 0 || y < 0 || x >= w || y >= h ? 0 : (alpha[y * w + x] as number);
  // Edge points are keyed by the lattice edge they sit on, so neighbors link up exactly.
  const key = (x: number, y: number, horizontal: boolean) =>
    (y * (w + 2) + x) * 2 + (horizontal ? 0 : 1);
  const pos = new Map<number, Pt>();
  const next = new Map<number, number>();
  const edgePoint = (x0: number, y0: number, x1: number, y1: number): number => {
    const horizontal = y0 === y1;
    const k = key(Math.min(x0, x1), Math.min(y0, y1), horizontal);
    if (!pos.has(k)) {
      const a = at(x0, y0);
      const b = at(x1, y1);
      const t = a === b ? 0.5 : (threshold - a) / (b - a);
      pos.set(k, { x: x0 + (x1 - x0) * t, y: y0 + (y1 - y0) * t });
    }
    return k;
  };
  // Cells span pixel centers (x, y)–(x + 1, y + 1); one ring of padding closes edge shapes.
  for (let y = -1; y < h; y++)
    for (let x = -1; x < w; x++) {
      const tl = at(x, y) >= threshold ? 1 : 0;
      const tr = at(x + 1, y) >= threshold ? 1 : 0;
      const br = at(x + 1, y + 1) >= threshold ? 1 : 0;
      const bl = at(x, y + 1) >= threshold ? 1 : 0;
      const code = tl * 8 + tr * 4 + br * 2 + bl;
      if (code === 0 || code === 15) continue;
      const T = () => edgePoint(x, y, x + 1, y);
      const R = () => edgePoint(x + 1, y, x + 1, y + 1);
      const B = () => edgePoint(x, y + 1, x + 1, y + 1);
      const L = () => edgePoint(x, y, x, y + 1);
      // Segments run with the inside on their left, so every loop is consistently oriented.
      const seg = (a: number, b: number) => next.set(a, b);
      switch (code) {
        case 1:
          seg(L(), B());
          break;
        case 2:
          seg(B(), R());
          break;
        case 3:
          seg(L(), R());
          break;
        case 4:
          seg(R(), T());
          break;
        case 5:
          seg(L(), T());
          seg(R(), B());
          break;
        case 6:
          seg(B(), T());
          break;
        case 7:
          seg(L(), T());
          break;
        case 8:
          seg(T(), L());
          break;
        case 9:
          seg(T(), B());
          break;
        case 10:
          seg(T(), R());
          seg(B(), L());
          break;
        case 11:
          seg(T(), R());
          break;
        case 12:
          seg(R(), L());
          break;
        case 13:
          seg(R(), B());
          break;
        case 14:
          seg(B(), L());
          break;
      }
    }
  const loops: Pt[][] = [];
  const seen = new Set<number>();
  for (const start of next.keys()) {
    if (seen.has(start)) continue;
    const loop: Pt[] = [];
    let k: number | undefined = start;
    while (k !== undefined && !seen.has(k)) {
      seen.add(k);
      loop.push(pos.get(k)!);
      k = next.get(k);
    }
    if (loop.length > 2) loops.push(loop);
  }
  return loops;
}

/** Ramer–Douglas–Peucker simplification of a closed loop (keeps points within `tolerance` px). */
export function simplifyLoop(loop: Pt[], tolerance: number): Pt[] {
  if (loop.length < 4) return loop.slice();
  const rdp = (pts: Pt[]): Pt[] => {
    if (pts.length < 3) return pts;
    const a = pts[0]!;
    const b = pts[pts.length - 1]!;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    let worst = 0;
    let index = 0;
    for (let i = 1; i < pts.length - 1; i++) {
      const p = pts[i]!;
      const d = Math.abs((p.x - a.x) * dy - (p.y - a.y) * dx) / len;
      if (d > worst) {
        worst = d;
        index = i;
      }
    }
    if (worst <= tolerance) return [a, b];
    return [...rdp(pts.slice(0, index + 1)).slice(0, -1), ...rdp(pts.slice(index))];
  };
  // Split the loop at its farthest point from the first, so both halves are open paths.
  const first = loop[0]!;
  let far = 0;
  let farD = -1;
  loop.forEach((p, i) => {
    const d = (p.x - first.x) ** 2 + (p.y - first.y) ** 2;
    if (d > farD) {
      farD = d;
      far = i;
    }
  });
  const a = rdp(loop.slice(0, far + 1));
  const b = rdp([...loop.slice(far), first]);
  return [...a.slice(0, -1), ...b.slice(0, -1)];
}

/** Signed area of a loop (positive and negative loops are opposite windings). */
export function loopArea(loop: Pt[]): number {
  let s = 0;
  for (let i = 0; i < loop.length; i++) {
    const a = loop[i]!;
    const b = loop[(i + 1) % loop.length]!;
    s += a.x * b.y - b.x * a.y;
  }
  return s / 2;
}

/** Runs `fn` once the font is ready (or the wait timed out), unless cancelled first. */
export function whenFontReady(fn: () => void): () => void {
  let live = true;
  fontsReady().then(() => {
    if (live) fn();
  });
  return () => {
    live = false;
  };
}

export interface MaskOptions {
  /** Font size as a share of the height, before fitting. */
  heightShare: number;
  /** Widest the text may be, as a share of the width. */
  fitShare: number;
  weight: number;
  /** Anybody width axis, 50–150. */
  stretch?: number;
  /** Text center as a share of the height. */
  centerY?: number;
}

/**
 * Draws `text` centered on a hidden canvas the size of the stage (font size =
 * height × heightShare, shrunk to fit width × fitShare) and returns its RGBA pixels
 * and the font size used. Used by name-tracing scenes (pendulum, domino, signalpaths).
 */
export function textMask(
  w: number,
  h: number,
  text: string,
  o: MaskOptions,
): { data: Uint8ClampedArray; size: number } {
  const off = offscreen(w, h);
  const g = off.ctx;
  let size = h * o.heightShare;
  applyFont(g, { size, weight: o.weight }, o.stretch);
  const width = g.measureText(text).width;
  if (width > w * o.fitShare) {
    size *= (w * o.fitShare) / width;
    applyFont(g, { size, weight: o.weight }, o.stretch);
  }
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = '#000';
  g.fillText(text, w / 2, h * (o.centerY ?? 0.5));
  const data = g.getImageData(0, 0, Math.round(w), Math.round(h)).data;
  off.free();
  return { data, size };
}
