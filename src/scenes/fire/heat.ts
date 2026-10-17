// The flame simulation for `fire`, kept pure so tests/unit/flash.test.ts can run
// it at the most extreme settings and check for large brightness jumps (PRD §8.2).

import { FIXED } from './constants';

export interface HeatOptions {
  /** 0–2: how far flames reach (divides the heat lost per cell). */
  height: number;
  /** 0.5–3: how fast flames cool. */
  cooling: number;
  /** Heat lost per cell at cooling 1 and height 1. */
  burn: number;
  /** 0–2: how far heat may jump sideways per step, in cells. */
  turbulence: number;
  /** Heat of fuel cells. */
  seed: number;
}

export interface Fan {
  /** Pointer position in cells, or null when no pointer. */
  x: number;
  y: number;
  radius: number;
  strength: number;
}

export class HeatGrid {
  heat: Float32Array;
  constructor(
    public cols: number,
    public rows: number,
    public fuel: Uint8Array = new Uint8Array(cols * rows),
  ) {
    this.heat = new Float32Array(cols * rows);
  }

  /**
   * One step, rows from the top down: each cell takes the heat of a cell in the
   * row below (shifted sideways by turbulence and the fan) minus a random loss.
   * Fuel cells are reset to the seed heat first. `rand` is Math.random.
   */
  step(o: HeatOptions, fan: Fan | null, rand: () => number = Math.random): void {
    const { cols, rows, heat, fuel } = this;
    for (let i = 0; i < heat.length; i++) if (fuel[i]) heat[i] = o.seed;
    const loss = (o.cooling * o.burn) / Math.max(0.05, o.height);
    for (let y = 0; y < rows - 1; y++)
      for (let x = 0; x < cols; x++) {
        let shift = (rand() - 0.5) * 2 * o.turbulence;
        let keep = 1;
        if (fan && fan.strength > 0) {
          const d = Math.hypot(x - fan.x, y - fan.y);
          if (d < fan.radius) {
            const near = 1 - d / fan.radius;
            shift += Math.sign(fan.x - x) * fan.strength * near;
            keep = 1 - Math.min(FIXED.FAN_LIFT_MAX, fan.strength * near * 0.5);
          }
        }
        const sx = Math.min(cols - 1, Math.max(0, x + Math.round(shift)));
        const below = heat[(y + 1) * cols + sx]!;
        const i = y * cols + x;
        if (fuel[i]) continue;
        heat[i] = Math.max(0, below - rand() * loss * keep);
      }
  }

  mean(): number {
    let s = 0;
    for (let i = 0; i < this.heat.length; i++) s += this.heat[i]!;
    return s / this.heat.length;
  }
}
