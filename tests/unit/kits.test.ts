// Shared kits (PLAN 3.1–3.5, PRD §16.8): unit tests for their math plus the
// micro-benchmark spot checks.
import { describe, expect, it } from 'vitest';
import { EASINGS, smootherstep, smoothstep, springStep, type Spring } from '../../src/kits/easing';
import { Fluid, flowAngle, makeNoise, seededRandom } from '../../src/kits/field';
import {
  SpatialHash,
  bodyAngle,
  bodyCenter,
  collideBodies,
  makeBody,
  makeCircles,
  satisfy,
  springPoint,
  stepBodies,
  stepCircles,
  verletBounds,
  verletMove,
  vpoint,
  type CircleWorld,
  type Stick,
} from '../../src/kits/physics';
import { metaballField } from '../../src/kits/render';
import {
  alphaChannel,
  letterBoxes,
  loopArea,
  samplePoints,
  samplePointsUnder,
  simplifyLoop,
  stretchKeyword,
  traceContours,
} from '../../src/kits/text';

// Best of many runs, retried up to 3 times: other test files share the CPU, and
// the fastest run is the one least disturbed by them (a spot check of the code,
// not of the machine's load).
const best = (xs: number[]) => Math.min(...xs);

describe('easing', () => {
  it.each(Object.entries(EASINGS))('%s returns 0 at 0 and 1 at 1', (_, fn) => {
    expect(fn(0)).toBeCloseTo(0, 9);
    expect(fn(1)).toBeCloseTo(1, 9);
  });

  it('in-out curves pass through the middle', () => {
    for (const [name, fn] of Object.entries(EASINGS))
      if (name.endsWith('in-out')) expect(fn(0.5)).toBeCloseTo(0.5, 6);
  });

  it('back overshoots and bounce stays inside [0, 1]', () => {
    const back = EASINGS['back-out']!;
    expect(Math.max(...Array.from({ length: 101 }, (_, i) => back(i / 100)))).toBeGreaterThan(1);
    const bounce = EASINGS['bounce-out']!;
    for (let i = 0; i <= 100; i++) {
      expect(bounce(i / 100)).toBeGreaterThanOrEqual(-1e-9);
      expect(bounce(i / 100)).toBeLessThanOrEqual(1 + 1e-9);
    }
  });

  it('smoothstep and smootherstep clamp and are symmetric', () => {
    expect(smoothstep(2, 4, 1)).toBe(0);
    expect(smoothstep(2, 4, 5)).toBe(1);
    expect(smoothstep(2, 4, 3)).toBeCloseTo(0.5);
    expect(smootherstep(-1)).toBe(0);
    expect(smootherstep(2)).toBe(1);
    for (const x of [0.1, 0.3, 0.45])
      expect(smootherstep(x) + smootherstep(1 - x)).toBeCloseTo(1, 9);
  });

  it('a damped spring settles on its target, the same at 60Hz and 120Hz', () => {
    const run = (f: number, frames: number) => {
      const s: Spring = { x: 0, v: 0 };
      for (let i = 0; i < frames; i++) springStep(s, 100, 0.1, 0.8, f);
      return s;
    };
    const at60 = run(1, 120);
    const at120 = run(0.5, 240);
    expect(at60.x).toBeCloseTo(100, 1);
    expect(at120.x).toBeCloseTo(100, 0);
  });
});

describe('text kit', () => {
  // A 10 × 6 image with a filled 4 × 2 block at x 3–6, y 2–3.
  const W = 10;
  const H = 6;
  const rgba = new Uint8ClampedArray(W * H * 4);
  for (let y = 2; y < 4; y++) for (let x = 3; x < 7; x++) rgba[(y * W + x) * 4 + 3] = 255;

  it('samples grid points inside the shape, row by row', () => {
    expect(samplePoints(rgba, W, H, 1, 128)).toEqual([
      3, 2, 4, 2, 5, 2, 6, 2, 3, 3, 4, 3, 5, 3, 6, 3,
    ]);
    expect(samplePoints(rgba, W, H, 2, 128)).toEqual([4, 2, 6, 2]);
  });

  it('widens the gap until the count fits', () => {
    const s = samplePointsUnder(rgba, W, H, 1, 128, 3, 10);
    expect(s.pts.length / 2).toBeLessThanOrEqual(3);
    expect(s.gap).toBe(2);
  });

  it('maps stretch percentages to canvas keywords', () => {
    expect(stretchKeyword(150)).toBe('extra-expanded');
    expect(stretchKeyword(100)).toBe('normal');
    expect(stretchKeyword(55)).toBe('ultra-condensed');
  });

  it('places letters by measuring prefixes (kerning included)', () => {
    // A fake font: every letter is 10 wide, but "AV" kerns 2px tighter.
    const measureText = (s: string) =>
      ({
        width: s.length * 10 - (s.includes('AV') ? 2 : 0),
        actualBoundingBoxAscent: 7,
        actualBoundingBoxDescent: 1,
      }) as TextMetrics;
    const boxes = letterBoxes({ measureText }, 'AVA', 100, 50, 'center');
    expect(boxes.map((b) => b.x)).toEqual([86, 96, 104]);
    expect(boxes.map((b) => b.w)).toEqual([10, 8, 10]);
    expect(boxes[0]!.ascent).toBe(7);
  });

  it('traces a filled square as one closed loop around it', () => {
    const w = 12;
    const a = new Uint8Array(w * w);
    for (let y = 3; y < 9; y++) for (let x = 3; x < 9; x++) a[y * w + x] = 255;
    const loops = traceContours(a, w, w, 128);
    expect(loops).toHaveLength(1);
    // Edges fall halfway between inside and outside pixels: a 6 × 6 square whose
    // four corners are cut by half a pixel (marching squares), so 36 − 4 × 0.125.
    expect(Math.abs(loopArea(loops[0]!))).toBeCloseTo(35.5, 1);
    const xs = loops[0]!.map((p) => p.x);
    expect(Math.min(...xs)).toBeCloseTo(2.5);
    expect(Math.max(...xs)).toBeCloseTo(8.5);
  });

  it('traces a ring as an outer loop and a hole of opposite winding', () => {
    const w = 14;
    const a = new Uint8Array(w * w);
    for (let y = 2; y < 12; y++) for (let x = 2; x < 12; x++) a[y * w + x] = 255;
    for (let y = 5; y < 9; y++) for (let x = 5; x < 9; x++) a[y * w + x] = 0;
    const loops = traceContours(a, w, w, 128);
    expect(loops).toHaveLength(2);
    const areas = loops.map(loopArea).sort((p, q) => Math.abs(q) - Math.abs(p));
    expect(Math.sign(areas[0]!)).not.toBe(Math.sign(areas[1]!));
  });

  it('simplifies straight runs away and keeps corners', () => {
    const w = 12;
    const a = new Uint8Array(w * w);
    for (let y = 3; y < 9; y++) for (let x = 3; x < 9; x++) a[y * w + x] = 255;
    const loop = traceContours(a, w, w, 128)[0]!;
    const simple = simplifyLoop(loop, 0.2);
    expect(simple.length).toBeLessThan(loop.length);
    expect(simple.length).toBeGreaterThanOrEqual(4);
    expect(Math.abs(loopArea(simple))).toBeCloseTo(Math.abs(loopArea(loop)), 0);
  });

  it('pulls the alpha channel out of RGBA', () => {
    expect([...alphaChannel([0, 0, 0, 9, 0, 0, 0, 200], 2, 1)]).toEqual([9, 200]);
  });
});

describe('physics kit', () => {
  const world = (over: Partial<CircleWorld> = {}): CircleWorld => ({
    w: 400,
    h: 400,
    gravity: 0,
    drag: 1,
    restitution: 1,
    friction: 1,
    walls: { left: false, right: false, floor: false, ceiling: false },
    ...over,
  });

  it('a head-on collision conserves momentum and (when perfectly bouncy) energy', () => {
    const c = makeCircles(2);
    c.x.set([100, 119]);
    c.y.set([200, 200]);
    c.vx.set([3, -1]);
    c.r.set([10, 10]);
    const before = c.vx[0]! + c.vx[1]!;
    const energy = c.vx[0]! ** 2 + c.vx[1]! ** 2;
    stepCircles(c, world(), 1, new SpatialHash(20));
    expect(c.vx[0]! + c.vx[1]!).toBeCloseTo(before, 4);
    expect(c.vx[0]! ** 2 + c.vx[1]! ** 2).toBeCloseTo(energy, 3);
    expect(c.vx[0]!).toBeLessThan(0);
  });

  it('heavier circles push lighter ones (mass is area)', () => {
    const c = makeCircles(2);
    c.x.set([100, 125]);
    c.y.set([200, 200]);
    c.vx.set([2, 0]);
    c.r.set([20, 10]);
    stepCircles(c, world({ restitution: 0.5 }), 1, new SpatialHash(40));
    expect(c.vx[0]! * 400 + c.vx[1]! * 100).toBeCloseTo(2 * 400, 2);
    expect(c.vx[1]!).toBeGreaterThan(c.vx[0]!);
  });

  it('circles under gravity come to rest on the floor without sinking', () => {
    const c = makeCircles(1);
    c.x[0] = 200;
    c.y[0] = 50;
    c.r[0] = 10;
    const w = world({
      gravity: 0.5,
      restitution: 0.4,
      walls: { left: true, right: true, floor: true, ceiling: false },
    });
    const hash = new SpatialHash(20);
    for (let i = 0; i < 600; i++) stepCircles(c, w, 1, hash);
    expect(c.y[0]!).toBeCloseTo(390, 0);
    expect(Math.abs(c.vy[0]!)).toBeLessThan(1);
  });

  it('the spatial hash finds every neighbor a brute-force search finds', () => {
    const rand = seededRandom(7);
    const n = 300;
    const xs = Float32Array.from({ length: n }, () => rand() * 500);
    const ys = Float32Array.from({ length: n }, () => rand() * 300);
    const hash = new SpatialHash(25);
    hash.build(xs, ys, n, 500, 300);
    for (const i of [0, 17, 150, 299]) {
      const found = new Set<number>();
      hash.query(xs[i]!, ys[i]!, 25, (j) => found.add(j));
      for (let j = 0; j < n; j++)
        if (Math.hypot(xs[j]! - xs[i]!, ys[j]! - ys[i]!) < 25) expect(found.has(j)).toBe(true);
    }
  });

  it('spring points settle on their target', () => {
    const p = { x: 0, y: 0, vx: 0, vy: 0 };
    for (let i = 0; i < 300; i++) springPoint(p, 50, -20, 0.05, 0.85, 1);
    expect(p.x).toBeCloseTo(50, 1);
    expect(p.y).toBeCloseTo(-20, 1);
  });

  it('distance constraints converge to their lengths', () => {
    const pts = [vpoint(0, 0, true), vpoint(30, 0), vpoint(80, 10)];
    const sticks: Stick[] = [
      { a: 0, b: 1, len: 20, stiffness: 1 },
      { a: 1, b: 2, len: 20, stiffness: 1 },
    ];
    satisfy(pts, sticks, 50);
    for (const s of sticks) {
      const a = pts[s.a]!;
      const b = pts[s.b]!;
      expect(Math.hypot(b.x - a.x, b.y - a.y)).toBeCloseTo(20, 1);
    }
    expect(pts[0]!.x).toBe(0);
  });

  it('sticks tear when stretched past their limit', () => {
    const pts = [vpoint(0, 0, true), vpoint(100, 0, true)];
    const sticks: Stick[] = [{ a: 0, b: 1, len: 20, stiffness: 1, tearAt: 2 }];
    expect(satisfy(pts, sticks, 1)).toBe(1);
    expect(sticks[0]!.broken).toBe(true);
  });

  it('verlet points fall with gravity and stop on the floor', () => {
    const pts = [vpoint(50, 0)];
    for (let i = 0; i < 200; i++) {
      verletMove(pts, 0.5, 0.99, 1);
      verletBounds(pts, 100, 100, 0.3, 0.5);
    }
    expect(pts[0]!.y).toBeCloseTo(100, 0);
  });

  it('a box keeps its shape while it falls and lands', () => {
    const b = makeBody(50, 20, 40, 20, 0.4);
    const w = { w: 200, h: 200, gravity: 0.5, drag: 0.99, bounce: 0.2, grip: 0.5, iterations: 8 };
    for (let i = 0; i < 300; i++) stepBodies([b], w, 1);
    expect(Math.hypot(b.p[1].x - b.p[0].x, b.p[1].y - b.p[0].y)).toBeCloseTo(40, 0);
    expect(Math.hypot(b.p[2].x - b.p[1].x, b.p[2].y - b.p[1].y)).toBeCloseTo(20, 0);
    // It has tipped flat onto a long side.
    const a = Math.abs(bodyAngle(b)) % Math.PI;
    expect(Math.min(a, Math.PI - a)).toBeLessThan(0.1);
  });

  it('overlapping boxes are pushed apart', () => {
    const a = makeBody(50, 50, 40, 40);
    const b = makeBody(80, 50, 40, 40);
    expect(collideBodies(a, b, 0)).toBe(true);
    for (let i = 0; i < 10; i++) {
      collideBodies(a, b, 0);
      satisfy(a.p, a.sticks, 4);
      satisfy(b.p, b.sticks, 4);
    }
    expect(bodyCenter(b).x - bodyCenter(a).x).toBeGreaterThan(38);
  });

  it('benchmark: 2,000 circles in the spatial hash step in under 2ms', { retry: 3 }, () => {
    const n = 2000;
    const c = makeCircles(n);
    const rand = seededRandom(1);
    for (let i = 0; i < n; i++) {
      c.x[i] = rand() * 1280;
      c.y[i] = rand() * 800;
      c.vx[i] = rand() * 2 - 1;
      c.vy[i] = rand() * 2 - 1;
      c.r[i] = 5;
    }
    const w = world({
      w: 1280,
      h: 800,
      gravity: 0.3,
      restitution: 0.5,
      walls: { left: true, right: true, floor: true, ceiling: true },
    });
    const hash = new SpatialHash(10);
    for (let i = 0; i < 30; i++) stepCircles(c, w, 1, hash);
    const times: number[] = [];
    for (let i = 0; i < 40; i++) {
      const t0 = performance.now();
      stepCircles(c, w, 1, hash);
      times.push(performance.now() - t0);
    }
    expect(best(times)).toBeLessThan(2);
  });
});

describe('field kit', () => {
  it('noise is deterministic for a seed and differs between seeds', () => {
    const a = makeNoise(42);
    const b = makeNoise(42);
    const c = makeNoise(43);
    expect(a.noise2(1.3, 2.7)).toBe(b.noise2(1.3, 2.7));
    expect(a.noise3(1.3, 2.7, 0.4)).toBe(b.noise3(1.3, 2.7, 0.4));
    expect(a.noise2(1.3, 2.7)).not.toBe(c.noise2(1.3, 2.7));
  });

  it('noise is continuous and stays within [−1, 1]', () => {
    const n = makeNoise(5);
    let maxStep2 = 0;
    let maxStep3 = 0;
    for (let i = 0; i < 2000; i++) {
      const x = i * 0.013;
      const v2 = n.noise2(x, 3.1);
      const v3 = n.noise3(x, 3.1, 0.7);
      expect(Math.abs(v2)).toBeLessThanOrEqual(1);
      expect(Math.abs(v3)).toBeLessThanOrEqual(1);
      maxStep2 = Math.max(maxStep2, Math.abs(n.noise2(x + 0.001, 3.1) - v2));
      maxStep3 = Math.max(maxStep3, Math.abs(n.noise3(x + 0.001, 3.1, 0.7) - v3));
    }
    expect(maxStep2).toBeLessThan(0.02);
    expect(maxStep3).toBeLessThan(0.02);
  });

  it('flow angles span about two turns', () => {
    const n = makeNoise(9);
    const angles = Array.from({ length: 500 }, (_, i) => flowAngle(n, i * 7, i * 3, 0, 0.01));
    expect(Math.max(...angles) - Math.min(...angles)).toBeGreaterThan(Math.PI);
  });

  it('fluid projection removes divergence and advection keeps most of the mass', () => {
    const f = new Fluid(32, 32, 20);
    for (let j = 12; j < 20; j++)
      for (let i = 12; i < 20; i++) {
        f.addDensity(i, j, 1);
        f.addVelocity(i, j, 2, 1);
      }
    const mass = f.mass();
    f.step(0.016, 0, 0);
    // Splatting a velocity block creates divergence at its edges; a step projects it out.
    expect(f.divergence()).toBeLessThan(0.05);
    expect(f.mass()).toBeGreaterThan(mass * 0.9);
    expect(f.mass()).toBeLessThan(mass * 1.1);
  });

  it('fluid carries several dye channels with the same flow', () => {
    const f = new Fluid(24, 24, 10, 3);
    f.addDensity(10, 10, 1, 0);
    f.addDensity(10, 10, 2, 2);
    for (let i = 0; i < 5; i++) {
      f.addVelocity(10, 10, 3, 0);
      f.step(0.016, 0, 0);
    }
    const a = f.dyes[0]!;
    const c = f.dyes[2]!;
    let worst = 0;
    for (let k = 0; k < f.size; k++) worst = Math.max(worst, Math.abs(c[k]! - 2 * a[k]!));
    expect(worst).toBeLessThan(1e-4);
    expect(f.dyes[1]!.every((v) => v === 0)).toBe(true);
  });

  it('vorticity confinement strengthens an existing swirl', () => {
    const spin = (strength: number) => {
      const f = new Fluid(32, 32, 10);
      for (let j = 10; j < 22; j++)
        for (let i = 10; i < 22; i++) f.addVelocity(i, j, -(j - 16) * 0.05, (i - 16) * 0.05);
      for (let i = 0; i < 10; i++) {
        f.confine(strength, 0.016);
        f.step(0.016, 0, 0);
      }
      let e = 0;
      for (let k = 0; k < f.size; k++) e += f.vx[k]! ** 2 + f.vy[k]! ** 2;
      return e;
    };
    expect(spin(40)).toBeGreaterThan(spin(0));
  });

  it(
    'benchmark: a smoke-sized fluid step (128 × 80, 3 dyes, swirl) in under 6ms',
    { retry: 3 },
    () => {
      const f = new Fluid(128, 80, 8, 3);
      const times: number[] = [];
      for (let i = 0; i < 40; i++) {
        f.addVelocity(64, 40, 1, 0);
        f.addDensity(64, 40, 1, i % 3);
        const t0 = performance.now();
        f.confine(20, 0.016);
        f.step(0.016, 0, 0.0001, 0.985);
        times.push(performance.now() - t0);
      }
      expect(best(times)).toBeLessThan(6);
    },
  );

  it(
    'benchmark: a 48 × 48 fluid step (the size smoke and fire use) in under 2ms',
    { retry: 3 },
    () => {
      const f = new Fluid(48, 48, 10);
      for (let i = 0; i < 10; i++) {
        f.addVelocity(32, 32, 1, 0);
        f.step(0.016, 0.0001, 0.0001);
      }
      const times: number[] = [];
      for (let i = 0; i < 30; i++) {
        const t0 = performance.now();
        f.step(0.016, 0.0001, 0.0001);
        times.push(performance.now() - t0);
      }
      expect(best(times)).toBeLessThan(2);
    },
  );
});

describe('render kit', () => {
  it('metaball field adds up r²/d² near each ball', () => {
    const field = metaballField([{ x: 5, y: 5, r: 3 }], 10, 10, 1);
    const center = field[5 * 10 + 5]!;
    const far = field[0]!;
    expect(center).toBeGreaterThan(1);
    expect(far).toBeLessThan(center);
    const two = metaballField(
      [
        { x: 5, y: 5, r: 3 },
        { x: 5, y: 5, r: 3 },
      ],
      10,
      10,
      1,
    );
    expect(two[5 * 10 + 5]!).toBeCloseTo(center * 2, 5);
  });

  it('benchmark: 30 metaballs on a 160 × 100 grid in under 2ms', { retry: 3 }, () => {
    const rand = seededRandom(3);
    const balls = Array.from({ length: 30 }, () => ({
      x: rand() * 1280,
      y: rand() * 800,
      r: 40 + rand() * 40,
    }));
    const out = new Float32Array(160 * 100);
    for (let i = 0; i < 10; i++) metaballField(balls, 160, 100, 8, out);
    const times: number[] = [];
    for (let i = 0; i < 30; i++) {
      const t0 = performance.now();
      metaballField(balls, 160, 100, 8, out);
      times.push(performance.now() - t0);
    }
    expect(best(times)).toBeLessThan(2);
  });
});
