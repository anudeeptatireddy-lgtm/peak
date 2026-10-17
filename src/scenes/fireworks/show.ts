// The fireworks simulation, with no drawing, so tests/unit/flash.test.ts can run
// it at extreme settings: rockets rise on an ease-out curve, burst into sparks
// (with trails of their past positions), and bursts never start closer together
// than FIXED.MIN_GAP.

import { frameFactor } from '../../engine/time';
import { cubicOut } from '../../kits/easing';
import { SHARED } from '../shared';
import { FIXED } from './constants';

export type BurstShape = 'sphere' | 'ring' | 'willow';
const SHAPES: BurstShape[] = ['sphere', 'ring', 'willow'];

export interface ShowOptions {
  sparks: number;
  shape: BurstShape | 'mixed';
  trail: number;
  gravity: number;
  drag: number;
  speed: number;
  life: number;
  rise: number;
  autoEvery: number;
  willowDrag: number;
  willowLife: number;
  ringTilt: number;
  autoTop: number;
  autoBottom: number;
  autoMargin: number;
}

export interface Rocket {
  x: number;
  y: number;
  /** Where it was `trail` frames ago (for its streak). */
  ty: number;
  target: number;
  age: number;
  ink: number;
}

export interface Shell {
  x: number;
  y: number;
  age: number;
  life: number;
  drag: number;
  ink: number;
  n: number;
  /** x, y per spark. */
  pos: Float32Array;
  vel: Float32Array;
  /** Past positions: `trail` slots of x, y per spark, a ring buffer. */
  hist: Float32Array;
  trail: number;
  head: number;
  filled: number;
}

export class Show {
  rockets: Rocket[] = [];
  shells: Shell[] = [];
  queue: { x: number; y: number }[] = [];
  /** Start times of every burst (seconds), for the safety test. */
  log: number[] = [];
  time = 0;
  private lastLaunch = -Infinity;
  private lastBurst = -Infinity;
  private nextAuto: number = FIXED.FIRST_AUTO;

  tap(x: number, y: number): void {
    if (this.queue.length < FIXED.MAX_QUEUE) this.queue.push({ x, y });
  }

  step(dt: number, w: number, h: number, o: ShowOptions, rand: () => number = Math.random): void {
    this.time += dt;
    const t = this.time;
    const f = frameFactor(dt);
    if (o.autoEvery > 0 && t >= this.nextAuto && !this.queue.length) {
      const x = (o.autoMargin + rand() * (1 - 2 * o.autoMargin)) * w;
      const y = (o.autoTop + rand() * (o.autoBottom - o.autoTop)) * h;
      this.queue.push({ x, y });
    }
    if (this.queue.length && t - this.lastLaunch >= FIXED.MIN_GAP) {
      const q = this.queue.shift()!;
      this.launch(q.x, q.y, h, rand);
    }
    for (const r of this.rockets) {
      r.age += dt;
      const at = (age: number) =>
        h + (r.target - h) * cubicOut(Math.min(1, Math.max(0, age / o.rise)));
      r.y = at(r.age);
      r.ty = at(r.age - o.trail / SHARED.FPS);
    }
    this.rockets = this.rockets.filter((r) => {
      if (r.age < o.rise || t - this.lastBurst < FIXED.MIN_GAP) return true;
      this.burst(r.x, r.target, r.ink, o, rand);
      return false;
    });
    for (const s of this.shells) this.stepShell(s, dt, f, o.gravity);
    this.shells = this.shells.filter((s) => s.age < s.life);
  }

  launch(x: number, y: number, h: number, rand: () => number = Math.random): void {
    this.lastLaunch = this.time;
    this.rockets.push({ x, y: h, ty: h, target: y, age: 0, ink: Math.floor(rand() * SHARED.INKS) });
  }

  /** Bursts at (x, y). Math.random() calls: the shape (only when mixed), then per spark. */
  burst(x: number, y: number, ink: number, o: ShowOptions, rand: () => number = Math.random): void {
    this.lastBurst = this.time;
    this.log.push(this.time);
    const shape = o.shape === 'mixed' ? SHAPES[Math.floor(rand() * SHAPES.length)]! : o.shape;
    const n = o.sparks;
    const willow = shape === 'willow';
    const s: Shell = {
      x,
      y,
      age: 0,
      life: o.life * (willow ? o.willowLife : 1),
      drag: willow ? o.willowDrag : o.drag,
      ink,
      n,
      pos: new Float32Array(n * 2),
      vel: new Float32Array(n * 2),
      hist: new Float32Array(n * 2 * Math.max(1, o.trail)),
      trail: o.trail,
      head: 0,
      filled: 0,
    };
    const turn = shape === 'ring' ? rand() * SHARED.TAU : 0;
    for (let i = 0; i < n; i++) {
      let a: number;
      let sp: number;
      if (shape === 'ring') {
        a = turn + (i / n) * SHARED.TAU;
        sp = o.speed;
      } else {
        a = rand() * SHARED.TAU;
        const u = rand() * 2 - 1;
        sp = o.speed * Math.sqrt(1 - u * u);
      }
      s.pos[2 * i] = x;
      s.pos[2 * i + 1] = y;
      s.vel[2 * i] = Math.cos(a) * sp;
      s.vel[2 * i + 1] = Math.sin(a) * sp * (shape === 'ring' ? o.ringTilt : 1);
    }
    this.shells.push(s);
  }

  stepShell(s: Shell, dt: number, f: number, gravity: number): void {
    s.age += dt;
    const d = s.drag ** f;
    const { pos, vel, hist, n } = s;
    const slot = s.head * n * 2;
    if (s.trail > 0) hist.set(pos, slot);
    s.head = (s.head + 1) % Math.max(1, s.trail);
    s.filled = Math.min(s.trail, s.filled + 1);
    for (let i = 0; i < n * 2; i += 2) {
      vel[i] *= d;
      vel[i + 1] = vel[i + 1]! * d + gravity * f;
      pos[i] += vel[i]! * f;
      pos[i + 1] += vel[i + 1]! * f;
    }
  }
}
