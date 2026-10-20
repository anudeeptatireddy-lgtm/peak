// `signalpaths`: Signal Paths (SCENES.md #80). A node graph; the pointer fires
// signals that strengthen the connections they use, biased toward the name.

import { createCanvas } from '../../engine/canvas';
import { fontsReady } from '../../engine/fonts';
import { createPointer } from '../../engine/pointer';
import { frameFactor } from '../../engine/time';
import { samplePointsUnder, textMask } from '../../kits/text';
import type { Theme } from '../../theme/worlds';
import { SHARED } from '../shared';
import type { Params, SceneContext, SceneInstance, SceneModule } from '../types';
import { FIXED } from './constants';
import { meta } from './meta';
import { params } from './params';
import { followUps } from './prompt';

interface Edge {
  a: number;
  b: number;
  len: number;
  name: boolean;
  w: number;
}

interface Signal {
  e: number;
  /** Node it is heading to. */
  to: number;
  s: number;
  /** Distance travelled so far, px. */
  dist: number;
}

function create(host: HTMLElement, initial: Params, ctx: SceneContext): SceneInstance {
  let p = { ...initial };
  const n = (id: string) => Number(p[id]);
  let theme: Theme = ctx.theme;
  const c = createCanvas(host);
  const ptr = createPointer(host);
  let fontsOk = false;

  let xs: number[] = [];
  let ys: number[] = [];
  let edges: Edge[] = [];
  let adj: number[][] = [];
  /** Each node's distance to the nearest name node. */
  let toName: number[] = [];
  let signals: Signal[] = [];
  let budget = 0;
  let away = 0;
  let time = 0;
  let last: { x: number; y: number } | null = null;

  function build(): void {
    if (!fontsOk || !c.w) return;
    const W = Math.round(c.w);
    const H = Math.round(c.h);
    const small = c.w < SHARED.SMALL_SCREEN;
    const scale = ctx.quality === 'preview' ? SHARED.PREVIEW_SCALE : 1;
    const total = Math.round((small ? n('nodesSmall') : n('nodes')) * scale);
    const { data } = textMask(W, H, String(p.text || ' '), {
      heightShare: n('textHeight'),
      fitShare: n('fitWidth'),
      weight: n('weight'),
    });
    const { pts, gap } = samplePointsUnder(
      data,
      W,
      H,
      FIXED.START_GAP,
      FIXED.ALPHA_CUTOFF,
      Math.round(total * n('nameShare')),
      FIXED.MAX_GAP,
    );
    const named = pts.length / 2;
    xs = [];
    ys = [];
    for (let i = 0; i < named; i++) {
      xs.push(pts[2 * i]!);
      ys.push(pts[2 * i + 1]!);
    }
    while (xs.length < total) {
      xs.push(Math.random() * c.w);
      ys.push(Math.random() * c.h);
    }
    edges = [];
    adj = xs.map(() => []);
    const seen = new Set<number>();
    const range2 = n('range') ** 2;
    const link = (FIXED.NAME_LINK * gap) ** 2;
    for (let i = 0; i < xs.length; i++) {
      const near: [number, number][] = [];
      for (let j = 0; j < xs.length; j++) {
        if (j === i) continue;
        const d2 = (xs[i]! - xs[j]!) ** 2 + (ys[i]! - ys[j]!) ** 2;
        if (d2 <= range2) near.push([d2, j]);
      }
      near.sort((u, v) => u[0] - v[0]);
      for (const [d2, j] of near.slice(0, n('links'))) {
        const key = Math.min(i, j) * xs.length + Math.max(i, j);
        if (seen.has(key)) continue;
        seen.add(key);
        adj[i]!.push(edges.length);
        adj[j]!.push(edges.length);
        edges.push({
          a: i,
          b: j,
          len: Math.sqrt(d2),
          name: i < named && j < named && d2 < link,
          w: 0,
        });
      }
    }
    toName = xs.map((x, i) => {
      let best = Infinity;
      for (let j = 0; j < named; j++)
        best = Math.min(best, Math.hypot(x - xs[j]!, ys[i]! - ys[j]!));
      return best;
    });
    signals = [];
  }

  fontsReady().then(() => {
    fontsOk = true;
    build();
  });

  /** A weighted random connection out of node `at`, not `skip`. */
  function pick(at: number, skip: number): number {
    const out = adj[at]!.filter((e) => e !== skip);
    if (!out.length) return -1;
    const wt = (e: number) => {
      const ed = edges[e]!;
      const to = ed.a === at ? ed.b : ed.a;
      const closer = Math.max(0, (toName[at]! - toName[to]!) / n('range'));
      return 1 + (ed.name ? n('nameBias') : 0) + n('follow') * ed.w + n('seek') * closer;
    };
    let r = Math.random() * out.reduce((s, e) => s + wt(e), 0);
    for (const e of out) {
      r -= wt(e);
      if (r <= 0) return e;
    }
    return out[out.length - 1]!;
  }

  function fire(x: number, y: number, moved: number): void {
    budget += n('fireRate') * Math.min(moved, n('fireRadius'));
    let best = -1;
    let bd = n('fireRadius') ** 2;
    for (let i = 0; i < xs.length; i++) {
      const d2 = (xs[i]! - x) ** 2 + (ys[i]! - y) ** 2;
      if (d2 < bd) {
        bd = d2;
        best = i;
      }
    }
    while (budget >= 1) {
      budget -= 1;
      if (best < 0 || signals.length >= n('maxSignals')) continue;
      const e = pick(best, -1);
      if (e < 0) continue;
      const ed = edges[e]!;
      signals.push({ e, to: ed.a === best ? ed.b : ed.a, s: 0, dist: 0 });
    }
  }

  function step(dt: number, f: number): void {
    const fade = n('fade') * n('fadeRate') * f;
    for (const e of edges) e.w = Math.max(0, e.w - fade);
    const v = n('speed') * n('pxPerFrame') * f;
    const gain = n('learning') * n('learnStep');
    signals = signals.filter((sg) => {
      const e = edges[sg.e]!;
      sg.s += v / (e.len || 1);
      if (sg.s < 1) return true;
      e.w = Math.min(1, e.w + gain);
      sg.dist += e.len;
      if (sg.dist >= n('travel')) return false;
      const next = pick(sg.to, sg.e);
      if (next < 0) return false;
      const ne = edges[next]!;
      sg.e = next;
      sg.to = ne.a === sg.to ? ne.b : ne.a;
      sg.s = 0;
      return true;
    });
    time += dt;
  }

  function draw(): void {
    const g = c.ctx;
    c.clear();
    if (!xs.length) return;
    g.globalCompositeOperation = theme.blend;
    g.lineCap = 'round';
    const L = FIXED.EDGE_LEVELS;
    const paths = Array.from({ length: L }, () => new Path2D());
    for (const e of edges) {
      const k = Math.min(L - 1, Math.floor(e.w * L));
      paths[k]!.moveTo(xs[e.a]!, ys[e.a]!);
      paths[k]!.lineTo(xs[e.b]!, ys[e.b]!);
    }
    const ba = n('baseAlpha');
    g.strokeStyle = theme.c1;
    paths.forEach((path, k) => {
      const s = (k + 0.5) / L;
      g.globalAlpha = ba + s * (1 - ba);
      g.lineWidth = n('baseWidth') + s * n('thick');
      g.stroke(path);
    });
    g.globalAlpha = 1;
    const r = n('nodeSize');
    if (r > 0) {
      const dots = new Path2D();
      for (let i = 0; i < xs.length; i++) {
        dots.moveTo(xs[i]! + r, ys[i]!);
        dots.arc(xs[i]!, ys[i]!, r, 0, SHARED.TAU);
      }
      g.fillStyle = theme.inkSoft;
      g.fill(dots);
    }
    const tails = new Path2D();
    const heads = new Path2D();
    const hr = n('headSize');
    for (const sg of signals) {
      const e = edges[sg.e]!;
      const from = sg.to === e.b ? e.a : e.b;
      const ux = (xs[sg.to]! - xs[from]!) / (e.len || 1);
      const uy = (ys[sg.to]! - ys[from]!) / (e.len || 1);
      const d = sg.s * e.len;
      const x = xs[from]! + ux * d;
      const y = ys[from]! + uy * d;
      const back = Math.min(d, n('tail'));
      tails.moveTo(x - ux * back, y - uy * back);
      tails.lineTo(x, y);
      heads.moveTo(x + hr, y);
      heads.arc(x, y, hr, 0, SHARED.TAU);
    }
    g.strokeStyle = theme.c2;
    g.globalAlpha = 0.5;
    g.lineWidth = hr;
    g.stroke(tails);
    g.globalAlpha = 1;
    g.fillStyle = theme.ink;
    g.fill(heads);
    g.globalCompositeOperation = 'source-over';
  }

  return {
    resize() {
      if (!c.fit()) return;
      build();
    },
    update(dt) {
      const f = frameFactor(dt);
      ptr.sync();
      ptr.takeTaps();
      const on = ptr.pointerType === 'mouse' ? ptr.active : ptr.down;
      let at: { x: number; y: number } | null = null;
      if (on) {
        away = 0;
        at = { x: ptr.x, y: ptr.y };
      } else {
        away += dt;
        if (away >= n('idleDelay')) {
          const sp = n('idleSpeed');
          at = {
            x: c.w * (0.5 + FIXED.IDLE_X * Math.sin(time * sp)),
            y: c.h * (0.5 + FIXED.IDLE_Y * Math.sin(time * sp * FIXED.IDLE_RATIO)),
          };
        }
      }
      if (at && last) fire(at.x, at.y, Math.hypot(at.x - last.x, at.y - last.y));
      last = at;
      step(dt, f);
      draw();
    },
    still() {
      ptr.takeTaps();
      const keep = edges.map((e) => e.w);
      const live = signals;
      for (const e of edges) e.w = e.name ? 1 : 0;
      signals = [];
      draw();
      edges.forEach((e, i) => (e.w = keep[i]!));
      signals = live;
    },
    setParams(next) {
      const rebuild = [
        'text',
        'nodes',
        'nodesSmall',
        'nameShare',
        'links',
        'range',
        'textHeight',
        'fitWidth',
        'weight',
      ].some((k) => next[k] !== p[k]);
      p = { ...next };
      if (rebuild) build();
    },
    setTheme(t) {
      theme = t;
    },
    restart() {
      for (const e of edges) e.w = 0;
      signals = [];
      budget = 0;
    },
    destroy() {
      ptr.destroy();
      c.destroy();
      signals = [];
      edges = [];
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
