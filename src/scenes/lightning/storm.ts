// The lightning simulation, with no drawing, so tests/unit/flash.test.ts can run
// it: nodes, strikes on a schedule that never beats FIXED.MIN_GAP, and jagged
// bolts made by midpoint displacement with occasional branches.

import { frameFactor } from '../../engine/time';
import { SHARED } from '../shared';
import { FIXED } from './constants';

export interface StormOptions {
  nodes: number;
  reach: number;
  branching: number;
  crackle: number;
  chain: number;
  strikes: number;
  idleEvery: number;
  arcLife: number;
  segment: number;
  jag: number;
  branchRate: number;
  branchLen: number;
  branchAngle: number;
  chainFade: number;
  nodeFade: number;
  margin: number;
}

export interface Node {
  x: number;
  y: number;
  glow: number;
  ink: number;
}

export interface Arc {
  /** Flat [x0, y0, x1, y1, …] polylines: the bolt first, then its branches. */
  lines: number[][];
  age: number;
  /** 0 for the first arc of a strike, 1 for the first hop onward, and so on. */
  hop: number;
  power: number;
}

/**
 * A jagged line from (x0, y0) to (x1, y1): split every segment in half `levels`
 * times, pushing each new midpoint sideways by (random × 2 − 1) × amount × the
 * segment's length. Math.random() calls: one per new midpoint, in order.
 */
export function bolt(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  levels: number,
  amount: number,
  rand: () => number,
): number[] {
  let pts = [x0, y0, x1, y1];
  for (let l = 0; l < levels; l++) {
    const out = [pts[0]!, pts[1]!];
    for (let i = 0; i + 3 < pts.length; i += 2) {
      const ax = pts[i]!;
      const ay = pts[i + 1]!;
      const bx = pts[i + 2]!;
      const by = pts[i + 3]!;
      const off = (rand() * 2 - 1) * amount;
      out.push((ax + bx) / 2 - (by - ay) * off, (ay + by) / 2 + (bx - ax) * off, bx, by);
    }
    pts = out;
  }
  return pts;
}

export class Storm {
  nodes: Node[] = [];
  arcs: Arc[] = [];
  /** Start times of every strike (seconds), for the safety test. */
  log: number[] = [];
  time = 0;
  private last = -Infinity;

  place(w: number, h: number, o: StormOptions, rand: () => number = Math.random): void {
    this.nodes = [];
    const m = o.margin;
    for (let i = 0; i < o.nodes; i++)
      this.nodes.push({
        x: (m + rand() * (1 - 2 * m)) * w,
        y: (m + rand() * (1 - 2 * m)) * h,
        glow: 0,
        ink: 0,
      });
  }

  nearest(x: number, y: number, reach: number, skip: Set<Node>): Node | null {
    let best: Node | null = null;
    let bd = reach * reach;
    for (const n of this.nodes) {
      if (skip.has(n)) continue;
      const d = (n.x - x) ** 2 + (n.y - y) ** 2;
      if (d < bd) {
        bd = d;
        best = n;
      }
    }
    return best;
  }

  /**
   * An arc from (x, y) to the nearest node in reach (not in `hit`), then up to
   * `chain` weaker hops onward, each to the nearest node not yet hit.
   */
  strike(
    x: number,
    y: number,
    o: StormOptions,
    rand: () => number = Math.random,
    hit = new Set<Node>(),
  ): boolean {
    let from = { x, y };
    let power = 1;
    let hops = 0;
    for (let hop = 0; hop <= o.chain; hop++) {
      const to = this.nearest(from.x, from.y, o.reach, hit);
      if (!to) break;
      hit.add(to);
      this.arcs.push({
        lines: this.lines(from.x, from.y, to.x, to.y, o, rand),
        age: 0,
        hop,
        power,
      });
      to.glow = Math.max(to.glow, power);
      to.ink = hop % SHARED.INKS;
      from = to;
      power *= o.chainFade;
      hops++;
    }
    if (!hops) return false;
    this.last = this.time;
    this.log.push(this.time);
    return true;
  }

  /** The bolt's polyline plus its branches. */
  lines(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    o: StormOptions,
    rand: () => number,
  ): number[][] {
    const len = Math.hypot(x1 - x0, y1 - y0);
    const levels = Math.min(
      FIXED.MAX_LEVELS,
      Math.max(1, Math.ceil(Math.log2(Math.max(1, len / o.segment)))),
    );
    const amount = o.jag * o.crackle;
    const main = bolt(x0, y0, x1, y1, levels, amount, rand);
    const out = [main];
    const sub = Math.max(1, levels - FIXED.BRANCH_LEVELS);
    const dir = Math.atan2(y1 - y0, x1 - x0);
    for (let i = 2; i + 2 < main.length; i += 2) {
      if (rand() >= o.branching * o.branchRate) continue;
      const bx = main[i]!;
      const by = main[i + 1]!;
      const ang = dir + (rand() < 0.5 ? -1 : 1) * o.branchAngle;
      const bl = Math.hypot(x1 - bx, y1 - by) * o.branchLen;
      out.push(bolt(bx, by, bx + Math.cos(ang) * bl, by + Math.sin(ang) * bl, sub, amount, rand));
    }
    return out;
  }

  step(
    dt: number,
    pointer: { x: number; y: number } | null,
    o: StormOptions,
    rand: () => number = Math.random,
  ): void {
    this.time += dt;
    const fade = o.nodeFade ** frameFactor(dt);
    for (const a of this.arcs) a.age += dt;
    this.arcs = this.arcs.filter((a) => a.age < o.arcLife);
    for (const n of this.nodes) n.glow *= fade;
    if (this.time - this.last < Math.max(FIXED.MIN_GAP, 1 / o.strikes)) return;
    if (pointer) {
      this.strike(pointer.x, pointer.y, o, rand);
      return;
    }
    if (o.idleEvery > 0 && this.nodes.length > 1 && this.time - this.last >= o.idleEvery) {
      // An idle arc leaves a random node for its nearest neighbor.
      const from = this.nodes[Math.floor(rand() * this.nodes.length)]!;
      if (!this.strike(from.x, from.y, o, rand, new Set([from]))) this.last = this.time;
    }
  }
}
