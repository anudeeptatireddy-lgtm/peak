// `sand`: Sand text (SCENES.md #17). Text-kit homes, grains in parallel arrays,
// blown by fast pointer movement and pulled home on a spring after a pause.

import { createCanvas } from '../../engine/canvas';
import { fontsReady } from '../../engine/fonts';
import { createPointer } from '../../engine/pointer';
import { frameFactor } from '../../engine/time';
import { Batch } from '../../kits/render';
import { fontString, offscreen, samplePointsUnder } from '../../kits/text';
import type { Theme } from '../../theme/worlds';
import { SHARED } from '../shared';
import type { Params, SceneContext, SceneInstance, SceneModule } from '../types';
import { FIXED } from './constants';
import { meta } from './meta';
import { params } from './params';
import { followUps } from './prompt';

interface Grains {
  n: number;
  hx: Float32Array;
  hy: Float32Array;
  x: Float32Array;
  y: Float32Array;
  vx: Float32Array;
  vy: Float32Array;
  hit: Float32Array;
  ink: Uint8Array;
}

const makeGrains = (n: number): Grains => ({
  n,
  hx: new Float32Array(n),
  hy: new Float32Array(n),
  x: new Float32Array(n),
  y: new Float32Array(n),
  vx: new Float32Array(n),
  vy: new Float32Array(n),
  hit: new Float32Array(n).fill(-Infinity),
  ink: new Uint8Array(n),
});

function create(host: HTMLElement, initial: Params, ctx: SceneContext): SceneInstance {
  let p = { ...initial };
  const n = (id: string) => Number(p[id]);
  let theme: Theme = ctx.theme;
  const c = createCanvas(host);
  const ptr = createPointer(host);
  let fontsOk = false;
  fontsReady().then(() => {
    fontsOk = true;
  });

  let g: Grains = makeGrains(0);
  let gap = 1;
  let time = 0;
  const batch = new Batch(SHARED.INKS);

  function sample(): number[] {
    const W = c.w;
    const H = c.h;
    const off = offscreen(W, H);
    const o = off.ctx;
    const text = String(p.text || ' ');
    let size = Math.min(H * n('textHeight'), W * n('textWidth'));
    const setFont = () => {
      o.font = fontString({ size, weight: n('weight') });
      try {
        o.fontStretch = String(p.letterWidth) as CanvasFontStretch;
      } catch {
        /* older browsers */
      }
    };
    setFont();
    if (o.measureText(text).width > W * n('fitWidth')) {
      size *= (W * n('fitWidth')) / o.measureText(text).width;
      setFont();
    }
    o.textAlign = 'center';
    o.textBaseline = 'middle';
    o.fillStyle = FIXED.MASK;
    o.fillText(text, W / 2, H * n('textY'));
    const data = o.getImageData(0, 0, W, H).data;
    off.free();
    const max =
      (W < SHARED.SMALL_SCREEN ? n('grainsSmall') : n('grains')) *
      (ctx.quality === 'preview' ? SHARED.PREVIEW_SCALE : 1);
    const res = samplePointsUnder(
      data,
      W,
      H,
      FIXED.START_GAP,
      FIXED.ALPHA_CUTOFF,
      max,
      FIXED.MAX_GAP,
    );
    gap = res.gap;
    return res.pts;
  }

  function build(): void {
    const pts = sample();
    const old = g;
    g = makeGrains(pts.length / 2);
    for (let i = 0; i < g.n; i++) {
      g.hx[i] = pts[2 * i]!;
      g.hy[i] = pts[2 * i + 1]!;
      const keep = i < old.n;
      g.x[i] = keep ? old.x[i]! : g.hx[i]!;
      g.y[i] = keep ? old.y[i]! : g.hy[i]!;
      g.vx[i] = keep ? old.vx[i]! : 0;
      g.vy[i] = keep ? old.vy[i]! : 0;
      g.hit[i] = keep ? old.hit[i]! : -Infinity;
      g.ink[i] = keep ? old.ink[i]! : Math.floor(Math.random() * SHARED.INKS);
    }
  }

  function draw(): void {
    const ctx2 = c.ctx;
    c.clear();
    const s = n('grainSize') * gap;
    batch.reset();
    for (let i = 0; i < g.n; i++) batch.square(g.ink[i]!, g.x[i]!, g.y[i]!, s);
    ctx2.globalCompositeOperation = theme.blend;
    batch.fill(ctx2, [theme.c1, theme.c2, theme.c3]);
    ctx2.globalCompositeOperation = 'source-over';
  }

  return {
    resize() {
      c.fit();
      if (!fontsOk) {
        g = makeGrains(0);
        return;
      }
      build();
    },
    update(dt) {
      time += dt;
      ptr.sync();
      ptr.takeTaps();
      const f = frameFactor(dt);
      const mx = ptr.x - ptr.px;
      const my = ptr.y - ptr.py;
      const R = n('windRadius');
      const blowing = ptr.active && Math.hypot(mx, my) > n('minSpeed');
      const drag = n('airDrag') ** f;
      const damp = n('returnDamping') ** f;
      const k = n('returnSpeed');
      const drift = n('drift');
      for (let i = 0; i < g.n; i++) {
        if (blowing) {
          const dx = g.x[i]! - ptr.x;
          const dy = g.y[i]! - ptr.y;
          const d = Math.hypot(dx, dy);
          if (d < R) {
            const w = n('wind') * (1 - d / R);
            g.vx[i]! += mx * w;
            g.vy[i]! += my * w;
            g.hit[i] = time;
          }
        }
        if (time - g.hit[i]! >= n('returnDelay')) {
          g.vx[i] = (g.vx[i]! + (g.hx[i]! - g.x[i]!) * k * f) * damp;
          g.vy[i] = (g.vy[i]! + (g.hy[i]! - g.y[i]!) * k * f) * damp;
        } else {
          const away = Math.abs(g.x[i]! - g.hx[i]!) + Math.abs(g.y[i]! - g.hy[i]!) > 0.5;
          if (away) {
            g.vx[i]! += (Math.random() - 0.5) * drift * f;
            g.vy[i]! += (Math.random() - 0.5) * drift * f;
          }
          g.vx[i]! *= drag;
          g.vy[i]! *= drag;
        }
        g.x[i]! += g.vx[i]! * f;
        g.y[i]! += g.vy[i]! * f;
      }
      draw();
    },
    still() {
      ptr.takeTaps();
      const keepX = g.x.slice();
      const keepY = g.y.slice();
      g.x.set(g.hx);
      g.y.set(g.hy);
      const from = Math.floor(g.n * (1 - n('stillDrift')));
      const spread = n('stillSpread');
      for (let i = from; i < g.n; i++) {
        g.x[i]! += Math.random() * spread;
        g.y[i]! += ((Math.random() - 0.5) * spread) / (2 * 2);
      }
      draw();
      g.x.set(keepX);
      g.y.set(keepY);
    },
    setParams(next) {
      const rebuild = params.some((q) => q.rebuild && next[q.id] !== p[q.id]);
      p = { ...next };
      if (rebuild && fontsOk && c.w) build();
    },
    setTheme(t) {
      theme = t;
    },
    restart() {
      g.x.set(g.hx);
      g.y.set(g.hy);
      g.vx.fill(0);
      g.vy.fill(0);
      g.hit.fill(-Infinity);
    },
    destroy() {
      ptr.destroy();
      c.destroy();
      g = makeGrains(0);
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
