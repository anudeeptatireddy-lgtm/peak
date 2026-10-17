// `filings`: Iron filings (SCENES.md #34). Short lines turn to follow the summed
// field of a few poles (inverse square), one magnet following the pointer.

import { createCanvas } from '../../engine/canvas';
import { createPointer } from '../../engine/pointer';
import { frameFactor } from '../../engine/time';
import { Batch } from '../../kits/render';
import type { Theme } from '../../theme/worlds';
import { SHARED } from '../shared';
import type { Params, SceneContext, SceneInstance, SceneModule } from '../types';
import { FIXED } from './constants';
import { meta } from './meta';
import { params } from './params';
import { followUps } from './prompt';

interface Magnet {
  x: number;
  y: number;
  angle: number;
}

/** Wraps an angle into −π … π. */
const wrap = (a: number) => a - SHARED.TAU * Math.round(a / SHARED.TAU);

function create(host: HTMLElement, initial: Params, ctx: SceneContext): SceneInstance {
  let p = { ...initial };
  const n = (id: string) => Number(p[id]);
  let theme: Theme = ctx.theme;
  const c = createCanvas(host);
  const ptr = createPointer(host);
  const batch = new Batch(SHARED.INKS);

  let count = 0;
  let xs = new Float32Array(0);
  let ys = new Float32Array(0);
  let th = new Float32Array(0);
  let pull = new Float32Array(0);
  const cursor: Magnet = { x: 0, y: 0, angle: 0 };
  let placed: Magnet[] = [];
  let started = false;
  let settled = false;

  function build(): void {
    const small = c.w < SHARED.SMALL_SCREEN;
    const scale = ctx.quality === 'preview' ? SHARED.PREVIEW_SCALE : 1;
    count = Math.round((small ? n('countSmall') : n('count')) * scale);
    xs = new Float32Array(count);
    ys = new Float32Array(count);
    th = new Float32Array(count);
    pull = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      xs[i] = Math.random() * c.w;
      ys[i] = Math.random() * c.h;
      th[i] = Math.random() * Math.PI;
    }
  }

  /** Every pole of these magnets: north has charge 1, south −1. */
  function poles(magnets: Magnet[]): { x: number; y: number; q: number }[] {
    const out: { x: number; y: number; q: number }[] = [];
    const half = n('barLength') / 2;
    for (const m of magnets) {
      if (p.magnet === 'pole') {
        out.push({ x: m.x, y: m.y, q: 1 });
        continue;
      }
      const dx = Math.cos(m.angle) * half;
      const dy = Math.sin(m.angle) * half;
      out.push({ x: m.x + dx, y: m.y + dy, q: 1 }, { x: m.x - dx, y: m.y - dy, q: -1 });
    }
    return out;
  }

  function turn(f: number, magnets: Magnet[]): void {
    const pl = poles(magnets);
    const s2 = n('soften') ** 2;
    const k = n('reach') ** 2 * n('strength');
    const sp = n('turnSpeed');
    for (let i = 0; i < count; i++) {
      const x = xs[i]!;
      const y = ys[i]!;
      let bx = 0;
      let by = 0;
      for (const pole of pl) {
        const dx = x - pole.x;
        const dy = y - pole.y;
        const r2 = dx * dx + dy * dy + s2;
        const inv = pole.q / (r2 * Math.sqrt(r2));
        bx += dx * inv;
        by += dy * inv;
      }
      const s = Math.min(1, Math.hypot(bx, by) * k);
      pull[i] = s;
      // A filing is a line: aim for whichever end is closer.
      let d = wrap(Math.atan2(by, bx) - th[i]!);
      if (d > Math.PI / 2) d -= Math.PI;
      else if (d < -Math.PI / 2) d += Math.PI;
      th[i] = th[i]! + d * sp * s * f;
    }
  }

  function drawMagnet(g: CanvasRenderingContext2D, m: Magnet): void {
    const mw = n('magnetWidth');
    if (p.magnet === 'pole') {
      g.fillStyle = theme.c2;
      g.beginPath();
      g.arc(m.x, m.y, mw / 2, 0, SHARED.TAU);
      g.fill();
      return;
    }
    const half = n('barLength') / 2;
    const dx = Math.cos(m.angle) * half;
    const dy = Math.sin(m.angle) * half;
    g.lineWidth = mw;
    for (const [sign, color] of [
      [1, theme.c2],
      [-1, theme.c3],
    ] as const) {
      g.strokeStyle = color;
      g.beginPath();
      g.moveTo(m.x, m.y);
      g.lineTo(m.x + dx * sign, m.y + dy * sign);
      g.stroke();
    }
  }

  function draw(magnets: Magnet[]): void {
    const g = c.ctx;
    c.clear();
    batch.reset();
    const half = n('length') / 2;
    const weak = n('weakAt');
    const strong = n('strongAt');
    for (let i = 0; i < count; i++) {
      const s = pull[i]!;
      const k = s < weak ? 0 : s < strong ? 1 : 2;
      const dx = Math.cos(th[i]!) * half;
      const dy = Math.sin(th[i]!) * half;
      batch.line(k, xs[i]! - dx, ys[i]! - dy, xs[i]! + dx, ys[i]! + dy);
    }
    g.lineCap = 'round';
    g.globalCompositeOperation = theme.blend;
    batch.stroke(g, [theme.inkSoft, theme.c3, theme.c1], n('lineWidth'));
    g.globalCompositeOperation = 'source-over';
    for (const m of magnets) drawMagnet(g, m);
  }

  return {
    resize() {
      c.fit();
      if (!started) {
        cursor.x = c.w / 2;
        cursor.y = c.h / 2;
        started = true;
      }
      build();
      settled = false;
    },
    update(dt) {
      const f = frameFactor(dt);
      ptr.sync();
      if (ptr.active) {
        const mx = ptr.x - cursor.x;
        const my = ptr.y - cursor.y;
        if (Math.hypot(mx, my) / f > FIXED.TURN_MIN_SPEED)
          cursor.angle += wrap(Math.atan2(my, mx) - cursor.angle) * n('magnetTurn') * f;
        cursor.x = ptr.x;
        cursor.y = ptr.y;
      }
      for (const tap of ptr.takeTaps()) {
        placed.push({ x: tap.x, y: tap.y, angle: cursor.angle });
        while (placed.length > n('maxMagnets')) placed.shift();
      }
      const all = [...placed, cursor];
      turn(f, all);
      draw(all);
    },
    still() {
      ptr.takeTaps();
      const one: Magnet = { x: c.w / 2, y: c.h / 2, angle: 0 };
      if (!settled) {
        build();
        for (let i = 0; i < FIXED.STILL_FRAMES; i++) turn(1, [one]);
        settled = true;
      }
      draw([one]);
    },
    setParams(next) {
      const rebuild = params.some((q) => q.rebuild && next[q.id] !== p[q.id]);
      p = { ...next };
      while (placed.length > n('maxMagnets')) placed.shift();
      if (rebuild && c.w) build();
      settled = false;
    },
    setTheme(t) {
      theme = t;
    },
    restart() {
      placed = [];
      cursor.x = c.w / 2;
      cursor.y = c.h / 2;
      cursor.angle = 0;
      build();
    },
    destroy() {
      ptr.destroy();
      c.destroy();
      count = 0;
      placed = [];
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
