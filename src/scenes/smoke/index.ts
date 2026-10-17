// `smoke`: Smoke (SCENES.md #33). A coarse stable-fluids grid (kits/field) with
// three dye channels, vorticity confinement, and a smooth upscale to the screen.

import { createCanvas } from '../../engine/canvas';
import { createPointer } from '../../engine/pointer';
import { frameFactor } from '../../engine/time';
import { Fluid } from '../../kits/field';
import { offscreen } from '../../kits/text';
import { parseHex } from '../../theme/color';
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

  let fluid = new Fluid(1, 1);
  let img: ReturnType<typeof offscreen> | null = null;
  let pixels: ImageData | null = null;
  let time = 0;
  let away = 0;
  let settled = false;
  const weights = [1, 0, 0];

  function build(): void {
    const cols = c.w < SHARED.SMALL_SCREEN ? n('detailSmall') : n('detail');
    const rows = Math.max(1, Math.round((cols * c.h) / c.w));
    fluid = new Fluid(cols, rows, n('passes'), SHARED.INKS);
    img?.free();
    img = offscreen(cols, rows);
    pixels = img.ctx.createImageData(cols, rows);
    time = 0;
    away = n('plumeDelay');
  }

  function colorWeights(): void {
    if (!p.colorCycle) {
      weights.fill(0);
      weights[0] = 1;
      return;
    }
    const ph = (time / n('cycleTime')) % SHARED.INKS;
    for (let k = 0; k < SHARED.INKS; k++) {
      const d0 = Math.abs(ph - k);
      weights[k] = Math.max(0, 1 - Math.min(d0, SHARED.INKS - d0));
    }
  }

  /** Adds velocity (domain units per second) and dye around (x, y) in px. */
  function splat(x: number, y: number, ux: number, uy: number, dye: number): void {
    const { w: cols, h: rows } = fluid;
    const cw = c.w / cols;
    const ch = c.h / rows;
    const r = n('splat');
    const i0 = Math.max(1, Math.floor((x - r) / cw) + 1);
    const i1 = Math.min(cols, Math.ceil((x + r) / cw) + 1);
    const j0 = Math.max(1, Math.floor((y - r) / ch) + 1);
    const j1 = Math.min(rows, Math.ceil((y + r) / ch) + 1);
    for (let j = j0; j <= j1; j++)
      for (let i = i0; i <= i1; i++) {
        const d = Math.hypot((i - 0.5) * cw - x, (j - 0.5) * ch - y);
        if (d >= r) continue;
        const wgt = 1 - d / r;
        fluid.addVelocity(i, j, ux * wgt, uy * wgt);
        for (let k = 0; k < SHARED.INKS; k++)
          if (weights[k]) fluid.addDensity(i, j, dye * wgt * weights[k]!, k);
      }
  }

  function step(dt: number, f: number, pointer: boolean): void {
    time += dt;
    colorWeights();
    if (pointer) {
      away = 0;
      const mx = (ptr.x - ptr.px) / f;
      const my = (ptr.y - ptr.py) / f;
      const k = n('force') * SHARED.FPS;
      const pour = n('dyeAmount') * Math.min(1, Math.hypot(mx, my) / n('dyeSpeed'));
      splat(ptr.x, ptr.y, (mx * k) / c.w, (my * k) / c.h, pour);
    } else {
      away += dt;
      const pl = n('plume');
      if (pl > 0 && away >= n('plumeDelay'))
        splat(
          c.w * (0.5 + n('plumeSway') * Math.sin(time * n('plumeWander'))),
          c.h - n('splat'),
          0,
          -n('plumeLift') * pl,
          n('plumeDye') * pl,
        );
    }
    fluid.confine(n('swirl'), dt);
    fluid.step(dt, 0, n('thickness') * n('viscScale'), n('fade') ** f);
  }

  function draw(): void {
    const g = c.ctx;
    c.clear();
    if (!img || !pixels) return;
    const { w: cols, h: rows, dyes } = fluid;
    const inks = [theme.c1, theme.c2, theme.c3].map(parseHex);
    const data = pixels.data;
    const op = n('opacity');
    const B = FIXED.BYTE;
    for (let j = 1; j <= rows; j++)
      for (let i = 1; i <= cols; i++) {
        const k = fluid.ix(i, j);
        let total = 0;
        let r = 0;
        let gg = 0;
        let b = 0;
        for (let q = 0; q < SHARED.INKS; q++) {
          const v = Math.max(0, dyes[q]![k]!);
          total += v;
          r += v * inks[q]!.r;
          gg += v * inks[q]!.g;
          b += v * inks[q]!.b;
        }
        const o = ((j - 1) * cols + (i - 1)) * SHARED.RGBA;
        if (total <= 0) {
          data[o + FIXED.ALPHA] = 0;
          continue;
        }
        data[o] = (r / total) * B;
        data[o + 1] = (gg / total) * B;
        data[o + 2] = (b / total) * B;
        data[o + FIXED.ALPHA] = Math.min(1, total * op) * B;
      }
    img.ctx.putImageData(pixels, 0, 0);
    g.imageSmoothingEnabled = true;
    g.globalCompositeOperation = theme.blend;
    g.drawImage(img.canvas, 0, 0, c.w, c.h);
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
      step(dt, frameFactor(dt), ptr.active);
      draw();
    },
    still() {
      ptr.takeTaps();
      if (!settled) {
        build();
        for (let i = 0; i < FIXED.STILL_FRAMES; i++) step(1 / SHARED.FPS, 1, false);
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
      img?.free();
      img = null;
      pixels = null;
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
