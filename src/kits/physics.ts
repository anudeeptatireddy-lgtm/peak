// Physics kit (PRD §16.8): circles with a spatial hash, verlet points with
// distance constraints (ropes, cloth, tearing, and boxes that tumble), springs,
// gravity and drag. Plain TypeScript, no DOM. Units follow PRD §16.4: speeds are
// pixels per 60Hz frame and every step takes the frame factor `f`.

/* ---------------- Springs ---------------- */

/** A point pulled toward a target: v += (target − p) × k × f; v ×= damping^f; p += v × f. */
export function springPoint(
  p: { x: number; y: number; vx: number; vy: number },
  tx: number,
  ty: number,
  k: number,
  damping: number,
  f: number,
): void {
  const d = damping ** f;
  p.vx = (p.vx + (tx - p.x) * k * f) * d;
  p.vy = (p.vy + (ty - p.y) * k * f) * d;
  p.x += p.vx * f;
  p.y += p.vy * f;
}

/* ---------------- Spatial hash ---------------- */

/**
 * A uniform grid over the plane, rebuilt every frame with a counting sort, so
 * neighbor queries cost only the nearby cells. Items are indices into the
 * caller's own arrays.
 */
export class SpatialHash {
  private cols = 1;
  private rows = 1;
  private start = new Int32Array(2);
  private items = new Int32Array(0);
  private cellOf = new Int32Array(0);

  constructor(public cell: number) {}

  /** Indexes n items at (xs[i], ys[i]) inside a w × h area (outside points clamp to the edge cells). */
  build(xs: ArrayLike<number>, ys: ArrayLike<number>, n: number, w: number, h: number): void {
    this.cols = Math.max(1, Math.ceil(w / this.cell));
    this.rows = Math.max(1, Math.ceil(h / this.cell));
    const cells = this.cols * this.rows;
    if (this.start.length < cells + 1) this.start = new Int32Array(cells + 1);
    else this.start.fill(0, 0, cells + 1);
    if (this.items.length < n) {
      this.items = new Int32Array(n);
      this.cellOf = new Int32Array(n);
    }
    for (let i = 0; i < n; i++) {
      const c = this.cellIndex(xs[i]!, ys[i]!);
      this.cellOf[i] = c;
      this.start[c + 1]!++;
    }
    for (let c = 0; c < cells; c++) this.start[c + 1]! += this.start[c]!;
    const fill = this.start.slice(0, cells);
    for (let i = 0; i < n; i++) this.items[fill[this.cellOf[i]!]!++] = i;
  }

  private cellIndex(x: number, y: number): number {
    const cx = Math.min(this.cols - 1, Math.max(0, Math.floor(x / this.cell)));
    const cy = Math.min(this.rows - 1, Math.max(0, Math.floor(y / this.cell)));
    return cy * this.cols + cx;
  }

  /** Calls fn(j) for every item in the cells overlapping the square around (x, y) of half-size r. */
  query(x: number, y: number, r: number, fn: (j: number) => void): void {
    const x0 = Math.max(0, Math.floor((x - r) / this.cell));
    const x1 = Math.min(this.cols - 1, Math.floor((x + r) / this.cell));
    const y0 = Math.max(0, Math.floor((y - r) / this.cell));
    const y1 = Math.min(this.rows - 1, Math.floor((y + r) / this.cell));
    for (let cy = y0; cy <= y1; cy++)
      for (let cx = x0; cx <= x1; cx++) {
        const c = cy * this.cols + cx;
        for (let k = this.start[c]!; k < this.start[c + 1]!; k++) fn(this.items[k]!);
      }
  }
}

/* ---------------- Circles ---------------- */

/** Circles stored as parallel arrays (fast to step thousands of them). */
export interface Circles {
  n: number;
  x: Float32Array;
  y: Float32Array;
  vx: Float32Array;
  vy: Float32Array;
  r: Float32Array;
}

export function makeCircles(n: number): Circles {
  return {
    n,
    x: new Float32Array(n),
    y: new Float32Array(n),
    vx: new Float32Array(n),
    vy: new Float32Array(n),
    r: new Float32Array(n),
  };
}

export interface CircleWorld {
  w: number;
  h: number;
  /** Added to vy every frame (px per frame²). */
  gravity: number;
  /** Velocity kept per frame (1 = no drag). */
  drag: number;
  /** Share of speed kept along the normal after a hit (0 = dead, 1 = perfectly bouncy). */
  restitution: number;
  /** Tangential speed kept per frame while touching the floor (rolling friction). */
  friction: number;
  /** Which walls exist. The floor is y = h. */
  walls: { left: boolean; right: boolean; floor: boolean; ceiling: boolean };
}

/**
 * One frame for every circle whose `active` flag is set (all if omitted):
 * gravity, drag, move, then collisions with each other (via the hash) and the
 * walls. Collisions push overlapping circles apart by mass (area) and exchange
 * momentum along the contact normal with the world's restitution.
 */
export function stepCircles(
  c: Circles,
  world: CircleWorld,
  f: number,
  hash: SpatialHash,
  active?: Uint8Array,
): void {
  const { x, y, vx, vy, r, n } = c;
  const drag = world.drag ** f;
  for (let i = 0; i < n; i++) {
    if (active && !active[i]) continue;
    vy[i]! += world.gravity * f;
    vx[i]! *= drag;
    vy[i]! *= drag;
    x[i]! += vx[i]! * f;
    y[i]! += vy[i]! * f;
  }
  hash.build(x, y, n, world.w, world.h);
  const e = world.restitution;
  for (let i = 0; i < n; i++) {
    if (active && !active[i]) continue;
    const xi = x[i]!;
    const yi = y[i]!;
    const ri = r[i]!;
    hash.query(xi, yi, ri * 2, (j) => {
      if (j <= i || (active && !active[j])) return;
      const dx = x[j]! - x[i]!;
      const dy = y[j]! - y[i]!;
      const rr = ri + r[j]!;
      const d2 = dx * dx + dy * dy;
      if (d2 >= rr * rr || d2 === 0) return;
      const d = Math.sqrt(d2);
      const nx = dx / d;
      const ny = dy / d;
      const mi = ri * ri;
      const mj = r[j]! * r[j]!;
      const total = mi + mj;
      const overlap = rr - d;
      x[i]! -= nx * overlap * (mj / total);
      y[i]! -= ny * overlap * (mj / total);
      x[j]! += nx * overlap * (mi / total);
      y[j]! += ny * overlap * (mi / total);
      const rel = (vx[j]! - vx[i]!) * nx + (vy[j]! - vy[i]!) * ny;
      if (rel >= 0) return;
      const impulse = (-(1 + e) * rel) / (1 / mi + 1 / mj);
      vx[i]! -= (impulse / mi) * nx;
      vy[i]! -= (impulse / mi) * ny;
      vx[j]! += (impulse / mj) * nx;
      vy[j]! += (impulse / mj) * ny;
    });
  }
  const { left, right, floor, ceiling } = world.walls;
  const roll = world.friction ** f;
  for (let i = 0; i < n; i++) {
    if (active && !active[i]) continue;
    const ri = r[i]!;
    if (floor && y[i]! > world.h - ri) {
      y[i] = world.h - ri;
      if (vy[i]! > 0) vy[i] = -vy[i]! * e;
      vx[i]! *= roll;
    }
    if (ceiling && y[i]! < ri) {
      y[i] = ri;
      if (vy[i]! < 0) vy[i] = -vy[i]! * e;
    }
    if (left && x[i]! < ri) {
      x[i] = ri;
      if (vx[i]! < 0) vx[i] = -vx[i]! * e;
    }
    if (right && x[i]! > world.w - ri) {
      x[i] = world.w - ri;
      if (vx[i]! > 0) vx[i] = -vx[i]! * e;
    }
  }
}

/* ---------------- Verlet points and constraints ---------------- */

export interface VPoint {
  x: number;
  y: number;
  /** Position last frame: velocity is (x − px, y − py). */
  px: number;
  py: number;
  pinned?: boolean;
}

export interface Stick {
  a: number;
  b: number;
  len: number;
  /** 0–1: how much of the error to fix per iteration. */
  stiffness: number;
  /** Breaks when stretched beyond len × tearAt (omit for unbreakable). */
  tearAt?: number;
  broken?: boolean;
}

export const vpoint = (x: number, y: number, pinned = false): VPoint => ({
  x,
  y,
  px: x,
  py: y,
  pinned,
});

/** Moves every free point by its velocity times `drag`, plus gravity (px per frame²). */
export function verletMove(points: VPoint[], gravity: number, drag: number, f: number): void {
  const d = drag ** f;
  const g = gravity * f * f;
  for (const p of points) {
    if (p.pinned) {
      p.px = p.x;
      p.py = p.y;
      continue;
    }
    const vx = (p.x - p.px) * d;
    const vy = (p.y - p.py) * d;
    p.px = p.x;
    p.py = p.y;
    p.x += vx;
    p.y += vy + g;
  }
}

/** Relaxes every stick toward its length `iterations` times. Returns how many tore. */
export function satisfy(points: VPoint[], sticks: Stick[], iterations: number): number {
  let torn = 0;
  for (let it = 0; it < iterations; it++)
    for (const s of sticks) {
      if (s.broken) continue;
      const a = points[s.a]!;
      const b = points[s.b]!;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const d = Math.hypot(dx, dy) || 1e-6;
      if (s.tearAt && d > s.len * s.tearAt) {
        s.broken = true;
        torn++;
        continue;
      }
      const diff = ((d - s.len) / d) * s.stiffness;
      const wa = a.pinned ? 0 : b.pinned ? 1 : 0.5;
      const wb = b.pinned ? 0 : a.pinned ? 1 : 0.5;
      a.x += dx * diff * wa;
      a.y += dy * diff * wa;
      b.x -= dx * diff * wb;
      b.y -= dy * diff * wb;
    }
  return torn;
}

/** Keeps free points inside a box, losing `bounce` of the speed into the wall and `grip` along it. */
export function verletBounds(
  points: VPoint[],
  w: number,
  h: number,
  bounce: number,
  grip: number,
): void {
  for (const p of points) {
    if (p.pinned) continue;
    const vx = p.x - p.px;
    const vy = p.y - p.py;
    if (p.y > h) {
      p.y = h;
      p.py = h + vy * bounce;
      p.px = p.x - vx * (1 - grip);
    } else if (p.y < 0) {
      p.y = 0;
      p.py = vy * bounce;
    }
    if (p.x > w) {
      p.x = w;
      p.px = w + vx * bounce;
    } else if (p.x < 0) {
      p.x = 0;
      p.px = vx * bounce;
    }
  }
}

/* ---------------- Boxes (four verlet corners and six sticks) ---------------- */

export interface Body {
  /** Corners in order: top-left, top-right, bottom-right, bottom-left (unrotated). */
  p: [VPoint, VPoint, VPoint, VPoint];
  sticks: Stick[];
  w: number;
  h: number;
}

/** A rigid box of size w × h centered at (cx, cy), turned by `angle` radians. */
export function makeBody(cx: number, cy: number, w: number, h: number, angle = 0): Body {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const corner = (lx: number, ly: number) =>
    vpoint(cx + lx * cos - ly * sin, cy + lx * sin + ly * cos);
  const p: Body['p'] = [
    corner(-w / 2, -h / 2),
    corner(w / 2, -h / 2),
    corner(w / 2, h / 2),
    corner(-w / 2, h / 2),
  ];
  const stick = (a: number, b: number): Stick => ({
    a,
    b,
    len: Math.hypot(p[b]!.x - p[a]!.x, p[b]!.y - p[a]!.y),
    stiffness: 1,
  });
  return {
    p,
    sticks: [stick(0, 1), stick(1, 2), stick(2, 3), stick(3, 0), stick(0, 2), stick(1, 3)],
    w,
    h,
  };
}

export function bodyCenter(b: Body): { x: number; y: number } {
  return {
    x: (b.p[0].x + b.p[1].x + b.p[2].x + b.p[3].x) / 4,
    y: (b.p[0].y + b.p[1].y + b.p[2].y + b.p[3].y) / 4,
  };
}

export function bodyAngle(b: Body): number {
  return Math.atan2(b.p[1].y - b.p[0].y, b.p[1].x - b.p[0].x);
}

/** Separates two overlapping boxes along the axis of least overlap (SAT). Returns true on contact. */
export function collideBodies(a: Body, b: Body, grip: number): boolean {
  const axes = [
    [a.p[0], a.p[1]],
    [a.p[1], a.p[2]],
    [b.p[0], b.p[1]],
    [b.p[1], b.p[2]],
  ] as const;
  let best = Infinity;
  let nx = 0;
  let ny = 0;
  for (const [p, q] of axes) {
    let ax = -(q.y - p.y);
    let ay = q.x - p.x;
    const len = Math.hypot(ax, ay) || 1;
    ax /= len;
    ay /= len;
    let minA = Infinity;
    let maxA = -Infinity;
    let minB = Infinity;
    let maxB = -Infinity;
    for (const v of a.p) {
      const d = v.x * ax + v.y * ay;
      minA = Math.min(minA, d);
      maxA = Math.max(maxA, d);
    }
    for (const v of b.p) {
      const d = v.x * ax + v.y * ay;
      minB = Math.min(minB, d);
      maxB = Math.max(maxB, d);
    }
    const overlap = Math.min(maxA, maxB) - Math.max(minA, minB);
    if (overlap <= 0) return false;
    if (overlap < best) {
      best = overlap;
      nx = ax;
      ny = ay;
    }
  }
  // Point the normal from a to b.
  const ca = bodyCenter(a);
  const cb = bodyCenter(b);
  if ((cb.x - ca.x) * nx + (cb.y - ca.y) * ny < 0) {
    nx = -nx;
    ny = -ny;
  }
  // Push the corners of each box that sit deepest along the normal, half each.
  const push = (body: Body, sign: number) => {
    const depth = body.p.map((v) => (v.x * nx + v.y * ny) * sign);
    const deepest = Math.max(...depth);
    body.p.forEach((v, i) => {
      if (Math.abs(depth[i]! - deepest) > best) return;
      const m = (best / 2) * -sign;
      v.x += nx * m;
      v.y += ny * m;
      // Friction: lose part of the sliding speed along the contact.
      const tx = -ny;
      const ty = nx;
      const slide = (v.x - v.px) * tx + (v.y - v.py) * ty;
      v.px += tx * slide * grip;
      v.py += ty * slide * grip;
    });
  };
  push(a, 1);
  push(b, -1);
  return true;
}

/** Velocity of a body (its center's movement last frame), in px per frame. */
export function bodyVelocity(b: Body): { x: number; y: number } {
  let x = 0;
  let y = 0;
  for (const v of b.p) {
    x += v.x - v.px;
    y += v.y - v.py;
  }
  return { x: x / 4, y: y / 4 };
}

export interface BodyWorld {
  w: number;
  h: number;
  gravity: number;
  drag: number;
  /** Share of the speed into a wall or floor that bounces back. */
  bounce: number;
  /** 0–1: how much sliding speed contact takes away (floor and other boxes). */
  grip: number;
  /** Relaxation passes per frame: more keeps stacks stiffer. */
  iterations: number;
}

/**
 * One frame for a set of boxes: move, then repeatedly restore each box's shape,
 * separate overlapping boxes and keep everything inside the walls. Interleaving
 * these is what lets boxes stack without sinking or squashing.
 */
export function stepBodies(
  bodies: Body[],
  world: BodyWorld,
  f: number,
  skip?: (b: Body) => boolean,
): void {
  for (const b of bodies) if (!skip?.(b)) verletMove(b.p, world.gravity, world.drag, f);
  for (let it = 0; it < world.iterations; it++) {
    for (const b of bodies) satisfy(b.p, b.sticks, 1);
    for (let i = 0; i < bodies.length; i++)
      for (let j = i + 1; j < bodies.length; j++)
        collideBodies(bodies[i]!, bodies[j]!, world.grip / world.iterations);
    for (const b of bodies) verletBounds(b.p, world.w, world.h, world.bounce, world.grip);
  }
}
