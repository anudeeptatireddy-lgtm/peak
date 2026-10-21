// `stringart`: String Art (SCENES.md #69). Nails sit along the name's outlines; a route
// planned greedily (each line covers the most still-empty letter and avoids background)
// is laid as straight threads, so the name builds by density. Scroll lays more thread;
// crossing a thread plucks it, and a damped spring lets it vibrate back to rest.

import { createCanvas } from '../../engine/canvas';
import { fontsReady } from '../../engine/fonts';
import { innerScroller } from '../../engine/inner-scroll';
import { createPointer } from '../../engine/pointer';
import { addScrollSource } from '../../engine/scheduler';
import { createScrollSource } from '../../engine/scroll';
import { frameFactor } from '../../engine/time';
import { seededRandom } from '../../kits/field';
import {
  alphaChannel,
  groupHoles,
  loopArea,
  simplifyLoop,
  textMask,
  traceContours,
  type Pt,
} from '../../kits/text';
import { mixOklab } from '../../theme/color';
import type { Theme } from '../../theme/worlds';
import { SHARED } from '../shared';
import type { Params, SceneContext, SceneInstance, SceneModule } from '../types';
import { FIXED } from './constants';
import { meta } from './meta';
import { params } from './params';
import { followUps } from './prompt';

type Idle = 'draw' | 'rest' | 'unwind';

function create(host: HTMLElement, initial: Params, ctx: SceneContext): SceneInstance {
  let p = { ...initial };
  const n = (id: string) => Number(p[id]);
  let theme: Theme = ctx.theme;
  const c = createCanvas(host);
  const ptr = createPointer(host);
  const inner =
    host.dataset.innerScroll === 'true'
      ? innerScroller(host, {
          screens: FIXED.INNER_SCREENS,
          low: FIXED.RECENTER_LOW,
          high: FIXED.RECENTER_HIGH,
        })
      : null;
  const source = inner ? inner.source : createScrollSource();
  const removeSource = addScrollSource(source);
  let fontsOk = false;
  let stillShown = false;
  let lastScroll: number | null = null;
  let planned = '';

  let nailX = new Float32Array(0);
  let nailY = new Float32Array(0);
  // Per thread: ends, unit normal, bow and its speed.
  let total = 0;
  let ax = new Float32Array(0);
  let ay = new Float32Array(0);
  let bx = new Float32Array(0);
  let by = new Float32Array(0);
  let nx = new Float32Array(0);
  let ny = new Float32Array(0);
  let bow = new Float32Array(0);
  let vel = new Float32Array(0);
  /** 1 where the thread hops (unseen) from one letter to the next. */
  let hop = new Uint8Array(0);
  let threadInk = '';

  let D = 0;
  let quiet = 0;
  let idle: Idle = 'draw';
  let held = 0;

  function inks(): void {
    threadInk = mixOklab(theme.ink, theme.c1, n('threadColor'));
  }

  function plan(): void {
    const w = Math.round(c.w);
    const h = Math.round(c.h);
    const small = c.w < SHARED.SMALL_SCREEN;
    const preview = ctx.quality === 'preview' ? SHARED.PREVIEW_SCALE : 1;
    const nails = Math.round(n(small ? 'nailsSmall' : 'nails'));
    const threads = Math.round(n(small ? 'threadsSmall' : 'threads') * preview);
    const { data } = textMask(w, h, String(p.text || ' '), {
      heightShare: n('textHeight'),
      fitShare: n('fitWidth'),
      weight: n('weight'),
    });
    const loops = traceContours(alphaChannel(data, w, h), w, h, FIXED.ALPHA_CUTOFF)
      .map((l) => simplifyLoop(l, FIXED.SIMPLIFY))
      .filter((l) => l.length > 2);
    const lengthOf = (l: Pt[]) =>
      l.reduce((sum, q, i) => {
        const r = l[(i + 1) % l.length]!;
        return sum + Math.hypot(r.x - q.x, r.y - q.y);
      }, 0);
    const pieces = groupHoles(loops);
    const all = pieces.flatMap((pc) => [pc.outer, ...pc.holes]);
    const sum = all.reduce((a, l) => a + lengthOf(l), 0) || 1;
    const xs: number[] = [];
    const ys: number[] = [];
    // Nails of each piece (a letter with its holes), in order.
    const pieceNails = pieces.map((pc) => {
      const mine: number[] = [];
      for (const l of [pc.outer, ...pc.holes]) {
        const len = lengthOf(l);
        const count = Math.max(FIXED.MIN_NAILS, Math.round((len / sum) * nails));
        const step = len / count;
        let next = 0;
        let walked = 0;
        for (let i = 0; i < l.length; i++) {
          const a = l[i]!;
          const b = l[(i + 1) % l.length]!;
          const seg = Math.hypot(b.x - a.x, b.y - a.y);
          while (next < walked + seg && next < len - step * 0.5) {
            const t = seg ? (next - walked) / seg : 0;
            mine.push(xs.length);
            xs.push(a.x + (b.x - a.x) * t);
            ys.push(a.y + (b.y - a.y) * t);
            next += step;
          }
          walked += seg;
        }
      }
      return mine;
    });
    nailX = Float32Array.from(xs);
    nailY = Float32Array.from(ys);

    // Coverage grid: which cells are letter, and how often threads crossed them.
    const gw = Math.ceil(w / FIXED.CELL);
    const gh = Math.ceil(h / FIXED.CELL);
    const isIn = new Uint8Array(gw * gh);
    const cover = new Uint16Array(gw * gh);
    for (let gy = 0; gy < gh; gy++)
      for (let gx = 0; gx < gw; gx++) {
        const px = Math.min(w - 1, Math.floor((gx + 0.5) * FIXED.CELL));
        const py = Math.min(h - 1, Math.floor((gy + 0.5) * FIXED.CELL));
        isIn[gy * gw + gx] =
          data[(py * w + px) * SHARED.RGBA + SHARED.RGBA - 1]! > FIXED.ALPHA_CUTOFF ? 1 : 0;
      }
    const walk = (i: number, j: number, fn: (cell: number) => void) => {
      const dx = nailX[j]! - nailX[i]!;
      const dy = nailY[j]! - nailY[i]!;
      const steps = Math.max(1, Math.ceil(Math.hypot(dx, dy) / FIXED.CELL));
      for (let s = 1; s < steps; s++) {
        const gx = Math.floor((nailX[i]! + (dx * s) / steps) / FIXED.CELL);
        const gy = Math.floor((nailY[i]! + (dy * s) / steps) / FIXED.CELL);
        if (gx >= 0 && gy >= 0 && gx < gw && gy < gh) fn(gy * gw + gx);
      }
    };
    // Each piece gets threads in proportion to its area; the thread hops (unseen) between pieces.
    const areas = pieces.map((pc) =>
      Math.max(
        0,
        Math.abs(loopArea(pc.outer)) - pc.holes.reduce((a, l) => a + Math.abs(loopArea(l)), 0),
      ),
    );
    const areaSum = areas.reduce((a, b) => a + b, 0) || 1;
    const rand = seededRandom(FIXED.SEED);
    const route: number[] = [];
    const hops: boolean[] = [];
    pieceNails.forEach((mine, k) => {
      if (mine.length < 2) return;
      if (route.length) hops.push(true);
      route.push(mine[0]!);
      const share = Math.max(1, Math.round((threads * areas[k]!) / areaSum));
      for (let t = 0; t < share; t++) {
        const at = route[route.length - 1]!;
        const before = hops.length && !hops[hops.length - 1] ? route[route.length - 2]! : -1;
        let best = -1;
        let bestScore = -Infinity;
        for (let s = 0; s < n('search'); s++) {
          const j = mine[Math.floor(rand() * mine.length)]!;
          if (j === at || j === before) continue;
          let score = 0;
          walk(at, j, (cell) => {
            score += isIn[cell] ? 1 / (1 + cover[cell]!) : -FIXED.OUT_PENALTY;
          });
          if (score > bestScore) [best, bestScore] = [j, score];
        }
        if (best < 0) best = mine[(mine.indexOf(at) + 1) % mine.length]!;
        walk(at, best, (cell) => {
          cover[cell] = cover[cell]! + 1;
        });
        route.push(best);
        hops.push(false);
      }
    });
    hop = Uint8Array.from(hops, (b) => (b ? 1 : 0));
    total = Math.max(0, route.length - 1);
    ax = new Float32Array(total);
    ay = new Float32Array(total);
    bx = new Float32Array(total);
    by = new Float32Array(total);
    nx = new Float32Array(total);
    ny = new Float32Array(total);
    bow = new Float32Array(total);
    vel = new Float32Array(total);
    for (let k = 0; k < total; k++) {
      ax[k] = nailX[route[k]!]!;
      ay[k] = nailY[route[k]!]!;
      bx[k] = nailX[route[k + 1]!]!;
      by[k] = nailY[route[k + 1]!]!;
      const len = Math.hypot(bx[k]! - ax[k]!, by[k]! - ay[k]!) || 1;
      nx[k] = -(by[k]! - ay[k]!) / len;
      ny[k] = (bx[k]! - ax[k]!) / len;
    }
    D = Math.min(D, total);
  }

  function layout(): void {
    inks();
    if (!fontsOk || !c.w) return;
    const key = [
      p.text,
      p.nails,
      p.nailsSmall,
      p.threads,
      p.threadsSmall,
      p.search,
      p.textHeight,
      p.fitWidth,
      p.weight,
      c.w,
      c.h,
    ].join('|');
    if (key === planned) return;
    planned = key;
    plan();
  }

  fontsReady().then(() => {
    fontsOk = true;
    layout();
    if (stillShown) still();
  });

  function pluck(): void {
    if (n('pluck') <= 0 || (ptr.x === ptr.px && ptr.y === ptr.py)) return;
    const x0 = ptr.px;
    const y0 = ptr.py;
    const x1 = ptr.x;
    const y1 = ptr.y;
    const kick = n('pluck') * FIXED.PLUCK_V;
    const drawn = Math.floor(D);
    for (let k = 0; k < drawn; k++) {
      // The pointer's step and the thread cross when each one's ends lie on both sides of the other.
      const s0 = (bx[k]! - ax[k]!) * (y0 - ay[k]!) - (by[k]! - ay[k]!) * (x0 - ax[k]!);
      const s1 = (bx[k]! - ax[k]!) * (y1 - ay[k]!) - (by[k]! - ay[k]!) * (x1 - ax[k]!);
      if (hop[k] || s0 * s1 >= 0) continue;
      const t0 = (x1 - x0) * (ay[k]! - y0) - (y1 - y0) * (ax[k]! - x0);
      const t1 = (x1 - x0) * (by[k]! - y0) - (y1 - y0) * (bx[k]! - x0);
      if (t0 * t1 >= 0) continue;
      vel[k] += s1 > 0 ? kick : -kick;
    }
  }

  function vibrate(f: number): void {
    const k = n('tension') * FIXED.TENSION_K;
    const damp = n('damping');
    for (let i = 0; i < total; i++) {
      if (vel[i] === 0 && bow[i] === 0) continue;
      vel[i] += (-k * bow[i]! - damp * vel[i]!) * f;
      bow[i] = Math.max(-FIXED.MAX_BOW, Math.min(FIXED.MAX_BOW, bow[i]! + vel[i]! * f));
      if (Math.abs(bow[i]!) < FIXED.REST && Math.abs(vel[i]!) < FIXED.REST) bow[i] = vel[i] = 0;
    }
  }

  function draw(): void {
    const g = c.ctx;
    c.clear();
    if (!nailX.length) return;
    const drawn = Math.min(total, Math.floor(D));
    const frac = D - drawn;
    g.lineWidth = n('threadWidth');
    g.lineCap = 'round';
    g.strokeStyle = threadInk;
    g.globalAlpha = FIXED.THREAD_ALPHA;
    let batch = new Path2D();
    let inBatch = 0;
    const bowed = new Path2D();
    for (let k = 0; k < drawn; k++) {
      if (hop[k]) continue;
      if (Math.abs(bow[k]!) >= FIXED.REST) {
        const mx = (ax[k]! + bx[k]!) * 0.5 + nx[k]! * bow[k]! * 2;
        const my = (ay[k]! + by[k]!) * 0.5 + ny[k]! * bow[k]! * 2;
        bowed.moveTo(ax[k]!, ay[k]!);
        bowed.quadraticCurveTo(mx, my, bx[k]!, by[k]!);
        continue;
      }
      batch.moveTo(ax[k]!, ay[k]!);
      batch.lineTo(bx[k]!, by[k]!);
      if (++inBatch >= FIXED.BATCH) {
        g.stroke(batch);
        batch = new Path2D();
        inBatch = 0;
      }
    }
    let tip: { x: number; y: number } | null = null;
    if (drawn < total && frac > 0 && !hop[drawn]) {
      tip = {
        x: ax[drawn]! + (bx[drawn]! - ax[drawn]!) * frac,
        y: ay[drawn]! + (by[drawn]! - ay[drawn]!) * frac,
      };
      batch.moveTo(ax[drawn]!, ay[drawn]!);
      batch.lineTo(tip.x, tip.y);
    }
    g.stroke(batch);
    g.stroke(bowed);
    g.globalAlpha = 1;
    const heads = new Path2D();
    const r = n('nailSize') * 0.5;
    for (let i = 0; i < nailX.length; i++) {
      heads.moveTo(nailX[i]! + r, nailY[i]!);
      heads.arc(nailX[i]!, nailY[i]!, r, 0, SHARED.TAU);
    }
    g.fillStyle = theme.inkSoft;
    g.fill(heads);
    if (tip) {
      g.fillStyle = theme.c2;
      g.beginPath();
      g.arc(tip.x, tip.y, FIXED.TIP * 0.5, 0, SHARED.TAU);
      g.fill();
    }
  }

  function still(): void {
    stillShown = true;
    ptr.takeTaps();
    D = total;
    bow.fill(0);
    vel.fill(0);
    draw();
  }

  return {
    resize() {
      if (!c.fit()) return;
      layout();
    },
    update(dt) {
      stillShown = false;
      const f = frameFactor(dt);
      ptr.sync();
      ptr.takeTaps();
      const pos = source.read();
      const scrolled = lastScroll === null ? 0 : pos - lastScroll;
      lastScroll = pos;
      let moved = scrolled / n('scrub');
      if (ptr.down) moved += (ptr.x - ptr.px) / n('scrub');
      if (moved) {
        D = Math.min(total, Math.max(0, D + moved * total));
        quiet = held = 0;
        idle = 'draw';
      } else {
        quiet += dt;
        if (quiet >= n('idleWait')) {
          const rate = n('speed') * FIXED.BASE_RATE * dt;
          if (idle === 'draw') {
            D = Math.min(total, D + rate);
            if (D >= total) [idle, held] = ['rest', 0];
          } else if (idle === 'rest') {
            held += dt;
            if (held >= n('idleHold')) idle = 'unwind';
          } else {
            D = Math.max(0, D - rate * FIXED.UNWIND);
            if (D <= 0) idle = 'draw';
          }
        }
      }
      pluck();
      vibrate(f);
      draw();
    },
    still,
    setParams(next) {
      p = { ...next };
      layout();
      inks();
      if (stillShown) still();
    },
    setTheme(th) {
      theme = th;
      inks();
      if (stillShown) still();
    },
    restart() {
      D = 0;
      quiet = held = 0;
      idle = 'draw';
      bow.fill(0);
      vel.fill(0);
    },
    destroy() {
      ptr.destroy();
      removeSource();
      inner?.el.remove();
      c.destroy();
      total = 0;
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
