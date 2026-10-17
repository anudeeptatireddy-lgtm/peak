// Field kit (PRD §16.8): seeded smooth noise (2D and 3D simplex), flow-field
// angles, and a small low-resolution fluid (advect, diffuse, project) in the
// style of Jos Stam's "Real-Time Fluid Dynamics for Games". Pure math, no DOM.

/** mulberry32: a tiny seeded random number generator (0 ≤ r < 1). */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const GRAD3 = [
  [1, 1, 0],
  [-1, 1, 0],
  [1, -1, 0],
  [-1, -1, 0],
  [1, 0, 1],
  [-1, 0, 1],
  [1, 0, -1],
  [-1, 0, -1],
  [0, 1, 1],
  [0, -1, 1],
  [0, 1, -1],
  [0, -1, -1],
] as const;
const F2 = 0.5 * (Math.sqrt(3) - 1);
const G2 = (3 - Math.sqrt(3)) / 6;
const F3 = 1 / 3;
const G3 = 1 / 6;

export interface Noise {
  /** Smooth noise in about [−1, 1]. */
  noise2(x: number, y: number): number;
  noise3(x: number, y: number, z: number): number;
}

/** Simplex noise with a permutation shuffled from `seed`: the same seed gives the same field. */
export function makeNoise(seed: number): Noise {
  const rand = seededRandom(seed);
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [p[i], p[j]] = [p[j]!, p[i]!];
  }
  const perm = new Uint8Array(512);
  const mod12 = new Uint8Array(512);
  for (let i = 0; i < 512; i++) {
    perm[i] = p[i & 255]!;
    mod12[i] = perm[i]! % 12;
  }

  function noise2(xin: number, yin: number): number {
    const s = (xin + yin) * F2;
    const i = Math.floor(xin + s);
    const j = Math.floor(yin + s);
    const t = (i + j) * G2;
    const x0 = xin - (i - t);
    const y0 = yin - (j - t);
    const i1 = x0 > y0 ? 1 : 0;
    const j1 = x0 > y0 ? 0 : 1;
    const x1 = x0 - i1 + G2;
    const y1 = y0 - j1 + G2;
    const x2 = x0 - 1 + 2 * G2;
    const y2 = y0 - 1 + 2 * G2;
    const ii = i & 255;
    const jj = j & 255;
    const corner = (gi: number, x: number, y: number) => {
      let tt = 0.5 - x * x - y * y;
      if (tt < 0) return 0;
      tt *= tt;
      const g = GRAD3[gi]!;
      return tt * tt * (g[0] * x + g[1] * y);
    };
    const n0 = corner(mod12[ii + perm[jj]!]!, x0, y0);
    const n1 = corner(mod12[ii + i1 + perm[jj + j1]!]!, x1, y1);
    const n2 = corner(mod12[ii + 1 + perm[jj + 1]!]!, x2, y2);
    return 70 * (n0 + n1 + n2);
  }

  function noise3(xin: number, yin: number, zin: number): number {
    const s = (xin + yin + zin) * F3;
    const i = Math.floor(xin + s);
    const j = Math.floor(yin + s);
    const k = Math.floor(zin + s);
    const t = (i + j + k) * G3;
    const x0 = xin - (i - t);
    const y0 = yin - (j - t);
    const z0 = zin - (k - t);
    let i1, j1, k1, i2, j2, k2;
    if (x0 >= y0) {
      if (y0 >= z0) [i1, j1, k1, i2, j2, k2] = [1, 0, 0, 1, 1, 0];
      else if (x0 >= z0) [i1, j1, k1, i2, j2, k2] = [1, 0, 0, 1, 0, 1];
      else [i1, j1, k1, i2, j2, k2] = [0, 0, 1, 1, 0, 1];
    } else if (y0 < z0) [i1, j1, k1, i2, j2, k2] = [0, 0, 1, 0, 1, 1];
    else if (x0 < z0) [i1, j1, k1, i2, j2, k2] = [0, 1, 0, 0, 1, 1];
    else [i1, j1, k1, i2, j2, k2] = [0, 1, 0, 1, 1, 0];
    const x1 = x0 - i1 + G3;
    const y1 = y0 - j1 + G3;
    const z1 = z0 - k1 + G3;
    const x2 = x0 - i2 + 2 * G3;
    const y2 = y0 - j2 + 2 * G3;
    const z2 = z0 - k2 + 2 * G3;
    const x3 = x0 - 1 + 3 * G3;
    const y3 = y0 - 1 + 3 * G3;
    const z3 = z0 - 1 + 3 * G3;
    const ii = i & 255;
    const jj = j & 255;
    const kk = k & 255;
    const corner = (gi: number, x: number, y: number, z: number) => {
      let tt = 0.6 - x * x - y * y - z * z;
      if (tt < 0) return 0;
      tt *= tt;
      const g = GRAD3[gi]!;
      return tt * tt * (g[0] * x + g[1] * y + g[2] * z);
    };
    const n0 = corner(mod12[ii + perm[jj + perm[kk]!]!]!, x0, y0, z0);
    const n1 = corner(mod12[ii + i1 + perm[jj + j1 + perm[kk + k1]!]!]!, x1, y1, z1);
    const n2 = corner(mod12[ii + i2 + perm[jj + j2 + perm[kk + k2]!]!]!, x2, y2, z2);
    const n3 = corner(mod12[ii + 1 + perm[jj + 1 + perm[kk + 1]!]!]!, x3, y3, z3);
    return 32 * (n0 + n1 + n2 + n3);
  }

  return { noise2, noise3 };
}

/** A flow-field direction (radians) at (x, y) and time t: noise turned into an angle. */
export function flowAngle(
  n: Noise,
  x: number,
  y: number,
  t: number,
  scale: number,
  turns = 2,
): number {
  return n.noise3(x * scale, y * scale, t) * Math.PI * turns;
}

/* ---------------- Fluid ---------------- */

/**
 * A stable-fluids grid of w × h cells (plus a one-cell border). Density and
 * velocity live per cell; step() moves them. Coarse on purpose: draw it scaled up.
 */
export class Fluid {
  readonly size: number;
  density: Float32Array;
  vx: Float32Array;
  vy: Float32Array;
  private d0: Float32Array;
  private vx0: Float32Array;
  private vy0: Float32Array;

  constructor(
    readonly w: number,
    readonly h: number,
    /** Gauss–Seidel passes per solve: more is smoother and slower. */
    readonly iterations = 12,
  ) {
    this.size = (w + 2) * (h + 2);
    this.density = new Float32Array(this.size);
    this.vx = new Float32Array(this.size);
    this.vy = new Float32Array(this.size);
    this.d0 = new Float32Array(this.size);
    this.vx0 = new Float32Array(this.size);
    this.vy0 = new Float32Array(this.size);
  }

  /** Index of cell (i, j), 1 ≤ i ≤ w, 1 ≤ j ≤ h. */
  ix(i: number, j: number): number {
    return i + (this.w + 2) * j;
  }

  addDensity(i: number, j: number, amount: number): void {
    this.density[this.ix(i, j)]! += amount;
  }

  addVelocity(i: number, j: number, ux: number, uy: number): void {
    const k = this.ix(i, j);
    this.vx[k]! += ux;
    this.vy[k]! += uy;
  }

  /** One step: dt in seconds; diffusion and viscosity per second; `fade` keeps that share of density. */
  step(dt: number, diffusion: number, viscosity: number, fade = 1): void {
    this.vx0.set(this.vx);
    this.vy0.set(this.vy);
    this.diffuse(1, this.vx, this.vx0, viscosity, dt);
    this.diffuse(2, this.vy, this.vy0, viscosity, dt);
    this.project(this.vx, this.vy, this.vx0, this.vy0);
    this.vx0.set(this.vx);
    this.vy0.set(this.vy);
    this.advect(1, this.vx, this.vx0, this.vx0, this.vy0, dt);
    this.advect(2, this.vy, this.vy0, this.vx0, this.vy0, dt);
    this.project(this.vx, this.vy, this.vx0, this.vy0);
    this.d0.set(this.density);
    this.diffuse(0, this.density, this.d0, diffusion, dt);
    this.d0.set(this.density);
    this.advect(0, this.density, this.d0, this.vx, this.vy, dt);
    if (fade !== 1) for (let k = 0; k < this.size; k++) this.density[k]! *= fade;
  }

  /** Total density (for tests: advection and projection should roughly conserve it). */
  mass(): number {
    let m = 0;
    for (let j = 1; j <= this.h; j++)
      for (let i = 1; i <= this.w; i++) m += this.density[this.ix(i, j)]!;
    return m;
  }

  /** Mean absolute divergence of the velocity field (projection drives it toward 0). */
  divergence(): number {
    let s = 0;
    for (let j = 1; j <= this.h; j++)
      for (let i = 1; i <= this.w; i++)
        s += Math.abs(
          this.vx[this.ix(i + 1, j)]! -
            this.vx[this.ix(i - 1, j)]! +
            this.vy[this.ix(i, j + 1)]! -
            this.vy[this.ix(i, j - 1)]!,
        );
    return s / (this.w * this.h);
  }

  private bounds(b: number, x: Float32Array): void {
    const { w, h } = this;
    for (let i = 1; i <= w; i++) {
      x[this.ix(i, 0)] = b === 2 ? -x[this.ix(i, 1)]! : x[this.ix(i, 1)]!;
      x[this.ix(i, h + 1)] = b === 2 ? -x[this.ix(i, h)]! : x[this.ix(i, h)]!;
    }
    for (let j = 1; j <= h; j++) {
      x[this.ix(0, j)] = b === 1 ? -x[this.ix(1, j)]! : x[this.ix(1, j)]!;
      x[this.ix(w + 1, j)] = b === 1 ? -x[this.ix(w, j)]! : x[this.ix(w, j)]!;
    }
    x[this.ix(0, 0)] = 0.5 * (x[this.ix(1, 0)]! + x[this.ix(0, 1)]!);
    x[this.ix(0, h + 1)] = 0.5 * (x[this.ix(1, h + 1)]! + x[this.ix(0, h)]!);
    x[this.ix(w + 1, 0)] = 0.5 * (x[this.ix(w, 0)]! + x[this.ix(w + 1, 1)]!);
    x[this.ix(w + 1, h + 1)] = 0.5 * (x[this.ix(w, h + 1)]! + x[this.ix(w + 1, h)]!);
  }

  private solve(b: number, x: Float32Array, x0: Float32Array, a: number, c: number): void {
    const { w, h } = this;
    const row = w + 2;
    const inv = 1 / c;
    for (let it = 0; it < this.iterations; it++) {
      for (let j = 1; j <= h; j++)
        for (let i = 1, k = j * row + 1; i <= w; i++, k++)
          x[k] = (x0[k]! + a * (x[k - 1]! + x[k + 1]! + x[k - row]! + x[k + row]!)) * inv;
      this.bounds(b, x);
    }
  }

  private diffuse(b: number, x: Float32Array, x0: Float32Array, rate: number, dt: number): void {
    const a = dt * rate * this.w * this.h;
    if (a === 0) {
      x.set(x0);
      return;
    }
    this.solve(b, x, x0, a, 1 + 4 * a);
  }

  private advect(
    b: number,
    d: Float32Array,
    d0: Float32Array,
    u: Float32Array,
    v: Float32Array,
    dt: number,
  ): void {
    const { w, h } = this;
    const row = w + 2;
    const dtx = dt * w;
    const dty = dt * h;
    for (let j = 1; j <= h; j++)
      for (let i = 1, k = j * row + 1; i <= w; i++, k++) {
        const x = Math.min(w + 0.5, Math.max(0.5, i - dtx * u[k]!));
        const y = Math.min(h + 0.5, Math.max(0.5, j - dty * v[k]!));
        const i0 = x | 0;
        const j0 = y | 0;
        const s1 = x - i0;
        const t1 = y - j0;
        const a = j0 * row + i0;
        d[k] =
          (1 - s1) * ((1 - t1) * d0[a]! + t1 * d0[a + row]!) +
          s1 * ((1 - t1) * d0[a + 1]! + t1 * d0[a + row + 1]!);
      }
    this.bounds(b, d);
  }

  private project(u: Float32Array, v: Float32Array, p: Float32Array, div: Float32Array): void {
    const { w, h } = this;
    const row = w + 2;
    const hx = 1 / Math.max(w, h);
    for (let j = 1; j <= h; j++)
      for (let i = 1, k = j * row + 1; i <= w; i++, k++) {
        div[k] = -0.5 * hx * (u[k + 1]! - u[k - 1]! + v[k + row]! - v[k - row]!);
        p[k] = 0;
      }
    this.bounds(0, div);
    this.bounds(0, p);
    this.solve(0, p, div, 1, 4);
    const g = 0.5 / hx;
    for (let j = 1; j <= h; j++)
      for (let i = 1, k = j * row + 1; i <= w; i++, k++) {
        u[k]! -= g * (p[k + 1]! - p[k - 1]!);
        v[k]! -= g * (p[k + row]! - p[k - row]!);
      }
    this.bounds(1, u);
    this.bounds(2, v);
  }
}
