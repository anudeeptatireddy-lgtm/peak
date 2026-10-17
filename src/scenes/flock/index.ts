// `flock`: Flock (SCENES.md #31). Boids (separation, alignment, cohesion) with
// a spatial hash for neighbors; the pointer is a predator.

import { createCanvas } from '../../engine/canvas';
import { createPointer } from '../../engine/pointer';
import { frameFactor } from '../../engine/time';
import { SpatialHash } from '../../kits/physics';
import { Batch } from '../../kits/render';
import type { Theme } from '../../theme/worlds';
import { SHARED } from '../shared';
import type { Params, SceneContext, SceneInstance, SceneModule } from '../types';
import { FIXED } from './constants';
import { meta } from './meta';
import { params } from './params';
import { followUps } from './prompt';

function create(host: HTMLElement, initial: Params, ctx: SceneContext): SceneInstance {
  let p = { ...initial };
  const n = (id: string) => Number(p[id]);
  let theme: Theme = ctx.theme;
  const c = createCanvas(host);
  const ptr = createPointer(host);
  const batch = new Batch(SHARED.INKS);
  const hash = new SpatialHash(1);

  let count = 0;
  let xs = new Float32Array(0);
  let ys = new Float32Array(0);
  let vx = new Float32Array(0);
  let vy = new Float32Array(0);
  let ax = new Float32Array(0);
  let ay = new Float32Array(0);
  let settled = false;

  function build(): void {
    const small = c.w < SHARED.SMALL_SCREEN;
    const scale = ctx.quality === 'preview' ? SHARED.PREVIEW_SCALE : 1;
    count = Math.round((small ? n('countSmall') : n('count')) * scale);
    xs = new Float32Array(count);
    ys = new Float32Array(count);
    vx = new Float32Array(count);
    vy = new Float32Array(count);
    ax = new Float32Array(count);
    ay = new Float32Array(count);
    const sp = n('speed');
    for (let i = 0; i < count; i++) {
      xs[i] = Math.random() * c.w;
      ys[i] = Math.random() * c.h;
      const a = Math.random() * SHARED.TAU;
      vx[i] = Math.cos(a) * sp;
      vy[i] = Math.sin(a) * sp;
    }
  }

  function step(f: number, pointer: { x: number; y: number } | null): void {
    const view = n('view');
    const personal = n('personal');
    const turn = n('turn');
    const sp = n('speed');
    const sepW = n('separation') * sp;
    const alignW = n('alignment');
    const cohW = (n('cohesion') / view) * sp;
    const fearR = n('fearRadius');
    const fearW = turn * n('fear') * n('fearBoost') * sp;
    hash.cell = view;
    hash.build(xs, ys, count, c.w, c.h);
    for (let i = 0; i < count; i++) {
      const x = xs[i]!;
      const y = ys[i]!;
      let k = 0;
      let avx = 0;
      let avy = 0;
      let cx = 0;
      let cy = 0;
      let sx = 0;
      let sy = 0;
      hash.query(x, y, view, (j) => {
        if (j === i) return;
        const dx = x - xs[j]!;
        const dy = y - ys[j]!;
        const d2 = dx * dx + dy * dy;
        if (d2 >= view * view || d2 === 0) return;
        k++;
        avx += vx[j]!;
        avy += vy[j]!;
        cx += xs[j]!;
        cy += ys[j]!;
        const d = Math.sqrt(d2);
        if (d < personal) {
          const s = (1 - d / personal) / d;
          sx += dx * s;
          sy += dy * s;
        }
      });
      let gx = 0;
      let gy = 0;
      if (k) {
        gx = turn * (sepW * sx + alignW * (avx / k - vx[i]!) + cohW * (cx / k - x));
        gy = turn * (sepW * sy + alignW * (avy / k - vy[i]!) + cohW * (cy / k - y));
      }
      if (pointer) {
        const dx = x - pointer.x;
        const dy = y - pointer.y;
        const d = Math.hypot(dx, dy);
        if (d < fearR && d > 0) {
          const s = (fearW * (1 - d / fearR)) / d;
          gx += dx * s;
          gy += dy * s;
        }
      }
      ax[i] = gx;
      ay[i] = gy;
    }
    const lo = n('minSpeed') * sp;
    const m = n('size');
    for (let i = 0; i < count; i++) {
      let nx = vx[i]! + ax[i]! * f;
      let ny = vy[i]! + ay[i]! * f;
      const v = Math.hypot(nx, ny) || 1;
      const s = v > sp ? sp / v : v < lo ? lo / v : 1;
      nx *= s;
      ny *= s;
      vx[i] = nx;
      vy[i] = ny;
      let x = xs[i]! + nx * f;
      let y = ys[i]! + ny * f;
      if (x < -m) x += c.w + 2 * m;
      else if (x > c.w + m) x -= c.w + 2 * m;
      if (y < -m) y += c.h + 2 * m;
      else if (y > c.h + m) y -= c.h + 2 * m;
      xs[i] = x;
      ys[i] = y;
    }
  }

  function draw(): void {
    const g = c.ctx;
    c.clear();
    batch.reset();
    const s = n('size');
    const shape = p.look === 'fish' ? FIXED.FISH : FIXED.BIRD;
    const pts = new Float32Array(shape.length);
    for (let i = 0; i < count; i++) {
      const x = xs[i]!;
      const y = ys[i]!;
      const k = i % SHARED.INKS;
      if (p.look === 'dots') {
        batch.dot(k, x, y, s / 2);
        continue;
      }
      const v = Math.hypot(vx[i]!, vy[i]!) || 1;
      const ux = (vx[i]! / v) * s;
      const uy = (vy[i]! / v) * s;
      for (let q = 0; q < shape.length; q += 2) {
        const a = shape[q]!;
        const b = shape[q + 1]!;
        pts[q] = x + a * ux - b * uy;
        pts[q + 1] = y + a * uy + b * ux;
      }
      batch.poly(k, pts);
    }
    g.globalCompositeOperation = theme.blend;
    batch.fill(g, [theme.c1, theme.c2, theme.c3]);
    g.globalCompositeOperation = 'source-over';
  }

  return {
    resize() {
      // Only a real size change rebuilds (the engine also calls this when the font loads).
      if (!c.fit()) return;
      build();
      settled = false;
    },
    update(dt) {
      ptr.sync();
      ptr.takeTaps();
      step(frameFactor(dt), ptr.active ? { x: ptr.x, y: ptr.y } : null);
      draw();
    },
    still() {
      ptr.takeTaps();
      if (!settled) {
        build();
        for (let i = 0; i < FIXED.STILL_FRAMES; i++) step(1, null);
        settled = true;
      }
      draw();
    },
    setParams(next) {
      const rebuild = params.some((q) => q.rebuild && next[q.id] !== p[q.id]);
      p = { ...next };
      if (rebuild && c.w) build();
      settled = false;
    },
    setTheme(t) {
      theme = t;
    },
    restart() {
      build();
    },
    destroy() {
      ptr.destroy();
      c.destroy();
      count = 0;
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
