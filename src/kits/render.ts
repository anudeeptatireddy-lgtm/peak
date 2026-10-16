// Render kit (PRD §16.8): batched dots, lines and trails (one path per color),
// a low-resolution metaball renderer, and glow through blend modes and stacked
// strokes (never shadowBlur in hot loops). Colors always come from the theme.

/**
 * Collects dots and line segments into one Path2D per color slot, then fills or
 * strokes each slot once: thousands of shapes cost a handful of draw calls.
 */
export class Batch {
  private paths: Path2D[];

  constructor(readonly slots: number) {
    this.paths = Array.from({ length: slots }, () => new Path2D());
  }

  /** Starts a new frame: every slot empty. */
  reset(): void {
    for (let i = 0; i < this.slots; i++) this.paths[i] = new Path2D();
  }

  dot(slot: number, x: number, y: number, r: number): void {
    const p = this.paths[slot]!;
    p.moveTo(x + r, y);
    p.arc(x, y, r, 0, Math.PI * 2);
  }

  line(slot: number, x0: number, y0: number, x1: number, y1: number): void {
    const p = this.paths[slot]!;
    p.moveTo(x0, y0);
    p.lineTo(x1, y1);
  }

  /** A closed polygon from flat [x0, y0, x1, y1, …] coordinates. */
  poly(slot: number, pts: ArrayLike<number>): void {
    const p = this.paths[slot]!;
    p.moveTo(pts[0]!, pts[1]!);
    for (let i = 2; i < pts.length; i += 2) p.lineTo(pts[i]!, pts[i + 1]!);
    p.closePath();
  }

  fill(ctx: CanvasRenderingContext2D, colors: string[], alpha = 1): void {
    ctx.globalAlpha = alpha;
    for (let i = 0; i < this.slots; i++) {
      ctx.fillStyle = colors[i % colors.length]!;
      ctx.fill(this.paths[i]!);
    }
    ctx.globalAlpha = 1;
  }

  stroke(ctx: CanvasRenderingContext2D, colors: string[], width: number, alpha = 1): void {
    ctx.globalAlpha = alpha;
    ctx.lineWidth = width;
    for (let i = 0; i < this.slots; i++) {
      ctx.strokeStyle = colors[i % colors.length]!;
      ctx.stroke(this.paths[i]!);
    }
    ctx.globalAlpha = 1;
  }
}

/**
 * Glow without shadowBlur: the same path stroked several times, widest and
 * faintest first, with additive or screen blending, then a thin bright core.
 */
export function glowStroke(
  ctx: CanvasRenderingContext2D,
  path: Path2D,
  color: string,
  core: string,
  width: number,
  layers: number,
  spread: number,
  strength: number,
  blend: GlobalCompositeOperation = 'lighter',
): void {
  const prev = ctx.globalCompositeOperation;
  ctx.globalCompositeOperation = blend;
  ctx.strokeStyle = color;
  for (let i = layers; i >= 1; i--) {
    ctx.globalAlpha = (strength / layers) * (1 - (i - 1) / layers);
    ctx.lineWidth = width + i * spread;
    ctx.stroke(path);
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = prev;
  ctx.strokeStyle = core;
  ctx.lineWidth = width;
  ctx.stroke(path);
}

export interface Ball {
  x: number;
  y: number;
  r: number;
}

/**
 * Metaball field on a coarse grid: sum of r² / d² for every ball at each cell.
 * Pure, so it is unit-tested; the renderer below turns it into pixels.
 */
export function metaballField(
  balls: Ball[],
  cols: number,
  rows: number,
  cell: number,
  out = new Float32Array(cols * rows),
): Float32Array {
  out.fill(0);
  for (const b of balls) {
    const r2 = b.r * b.r;
    // Each ball only matters within a few radii; skip the rest of the grid.
    const reach = b.r * 4;
    const x0 = Math.max(0, Math.floor((b.x - reach) / cell));
    const x1 = Math.min(cols - 1, Math.ceil((b.x + reach) / cell));
    const y0 = Math.max(0, Math.floor((b.y - reach) / cell));
    const y1 = Math.min(rows - 1, Math.ceil((b.y + reach) / cell));
    for (let j = y0; j <= y1; j++)
      for (let i = x0; i <= x1; i++) {
        const dx = (i + 0.5) * cell - b.x;
        const dy = (j + 0.5) * cell - b.y;
        out[j * cols + i]! += r2 / (dx * dx + dy * dy + 1);
      }
  }
  return out;
}

/**
 * Draws metaballs as one solid color: computes the field at 1/cell resolution,
 * thresholds it with a soft edge into an offscreen canvas, and scales that up
 * with smoothing (the low resolution is what keeps it fast).
 */
export class MetaballRenderer {
  private canvas = document.createElement('canvas');
  private ctx = this.canvas.getContext('2d')!;
  private field = new Float32Array(0);
  private img: ImageData | null = null;

  constructor(public cell: number) {}

  draw(
    target: CanvasRenderingContext2D,
    w: number,
    h: number,
    balls: Ball[],
    rgb: [number, number, number],
    threshold: number,
    softness: number,
  ): void {
    const cols = Math.ceil(w / this.cell);
    const rows = Math.ceil(h / this.cell);
    if (this.canvas.width !== cols || this.canvas.height !== rows || !this.img) {
      this.canvas.width = cols;
      this.canvas.height = rows;
      this.img = this.ctx.createImageData(cols, rows);
      this.field = new Float32Array(cols * rows);
    }
    metaballField(balls, cols, rows, this.cell, this.field);
    const d = this.img.data;
    for (let k = 0; k < cols * rows; k++) {
      const a = Math.min(1, Math.max(0, (this.field[k]! - threshold) / softness + 0.5));
      d[k * 4] = rgb[0];
      d[k * 4 + 1] = rgb[1];
      d[k * 4 + 2] = rgb[2];
      d[k * 4 + 3] = a * 255;
    }
    this.ctx.putImageData(this.img, 0, 0);
    target.imageSmoothingEnabled = true;
    target.drawImage(this.canvas, 0, 0, cols * this.cell, rows * this.cell);
  }

  destroy(): void {
    this.canvas.width = 0;
    this.canvas.height = 0;
  }
}
