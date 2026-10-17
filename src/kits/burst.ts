// Confetti burst (PLAN 5.1): a reusable piece system for `confetti` and
// `countdown`. Pieces fly out, fall with gravity and drag, spin, and flutter
// (their width shrinks and grows like a tumbling card). Plain math plus one draw.

import { Batch } from './render';

export type PieceShape = 'square' | 'ribbon' | 'circle';

export interface BurstOptions {
  count: number;
  /** Center direction in radians (−π/2 is straight up) and total spread. */
  direction: number;
  spread: number;
  speed: number;
  speedRange: number;
  size: number;
  spin: number;
  flutter: number;
  shapes: PieceShape[];
}

interface Piece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  a: number;
  va: number;
  phase: number;
  shape: number;
  ink: number;
  size: number;
}

export class Burst {
  pieces: Piece[] = [];

  /**
   * Adds `count` pieces at (x, y). Math.random() calls per piece, in order:
   * angle, speed, spin, flutter phase, shape, color.
   */
  fire(x: number, y: number, o: BurstOptions, inks: number, rand: () => number = Math.random): void {
    for (let i = 0; i < o.count; i++) {
      const ang = o.direction + (rand() - 0.5) * o.spread;
      const sp = o.speed + rand() * o.speedRange;
      this.pieces.push({
        x,
        y,
        vx: Math.cos(ang) * sp,
        vy: Math.sin(ang) * sp,
        a: 0,
        va: (rand() - 0.5) * 2 * o.spin,
        phase: rand() * Math.PI * 2,
        shape: Math.floor(rand() * o.shapes.length),
        ink: Math.floor(rand() * inks),
        size: o.size,
      });
    }
  }

  /** One frame: gravity, drag, move, spin, flutter; drops pieces below `floor`. */
  step(f: number, gravity: number, drag: number, wobble: number, flutterSpeed: number, floor: number): void {
    const d = drag ** f;
    for (const p of this.pieces) {
      p.vy += gravity * f;
      p.vx *= d;
      p.vy *= d;
      p.phase += flutterSpeed * f;
      p.x += (p.vx + Math.sin(p.phase) * wobble) * f;
      p.y += p.vy * f;
      p.a += p.va * f;
    }
    this.pieces = this.pieces.filter((p) => p.y - p.size < floor);
  }

  /** Draws every piece, one path per color, into `batch` (which it resets). */
  draw(
    ctx: CanvasRenderingContext2D,
    batch: Batch,
    colors: string[],
    shapes: PieceShape[],
    ribbonRatio: number,
  ): void {
    batch.reset();
    const corners = new Float32Array(8);
    for (const p of this.pieces) {
      const shape = shapes[p.shape] ?? 'square';
      if (shape === 'circle') {
        batch.dot(p.ink, p.x, p.y, (p.size / 2) * Math.max(0.2, Math.abs(Math.cos(p.phase))));
        continue;
      }
      // A tumbling card: its width follows cos(phase), then it is turned by its angle.
      const w = (p.size / 2) * Math.cos(p.phase);
      const h = (shape === 'ribbon' ? p.size * ribbonRatio : p.size) / 2;
      const c = Math.cos(p.a);
      const s = Math.sin(p.a);
      const pts = [
        [-w, -h],
        [w, -h],
        [w, h],
        [-w, h],
      ];
      pts.forEach(([lx, ly], k) => {
        corners[2 * k] = p.x + lx! * c - ly! * s;
        corners[2 * k + 1] = p.y + lx! * s + ly! * c;
      });
      batch.poly(p.ink, corners);
    }
    batch.fill(ctx, colors);
  }
}
