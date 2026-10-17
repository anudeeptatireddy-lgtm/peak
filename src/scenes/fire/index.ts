// `fire`: Burning headline (SCENES.md #20, ⚠ flashing rules in PRD §8.2). A
// coarse heat grid (heat.ts) fed by the letters, drawn small and scaled up.

import { createCanvas } from '../../engine/canvas';
import { fontsReady } from '../../engine/fonts';
import { createPointer } from '../../engine/pointer';
import { fontString, offscreen } from '../../kits/text';
import { mixOklab, parseHex } from '../../theme/color';
import type { Theme } from '../../theme/worlds';
import { SHARED } from '../shared';
import type { Params, SceneContext, SceneInstance, SceneModule } from '../types';
import { FIXED } from './constants';
import { HeatGrid, type HeatOptions } from './heat';
import { meta } from './meta';
import { params } from './params';
import { followUps } from './prompt';

const BYTE = FIXED.BYTE;

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

  let grid = new HeatGrid(1, 1);
  let shown = new Float32Array(1);
  let cell = 1;
  let font = '';
  let img: ReturnType<typeof offscreen> | null = null;
  let data: ImageData | null = null;
  let ramp = new Uint8ClampedArray(FIXED.RAMP * SHARED.RGBA);
  let rampFor = '';

  const options = (): HeatOptions => ({
    height: n('height'),
    cooling: n('cooling'),
    burn: n('burn'),
    turbulence: n('turbulence'),
    seed: n('seed'),
  });

  function buildRamp(): void {
    for (let i = 0; i < FIXED.RAMP; i++) {
      const h = i / (FIXED.RAMP - 1);
      let hex: string;
      let a = 1;
      if (h < FIXED.STOP1) {
        hex = theme.c1;
        a = h / FIXED.STOP1;
      } else if (h < FIXED.STOP2)
        hex = mixOklab(theme.c1, theme.c2, (h - FIXED.STOP1) / (FIXED.STOP2 - FIXED.STOP1));
      else hex = mixOklab(theme.c2, theme.c3, (h - FIXED.STOP2) / (1 - FIXED.STOP2));
      const rgb = parseHex(hex);
      ramp[i * SHARED.RGBA] = rgb.r * BYTE;
      ramp[i * SHARED.RGBA + 1] = rgb.g * BYTE;
      ramp[i * SHARED.RGBA + 2] = rgb.b * BYTE;
      ramp[i * SHARED.RGBA + SHARED.RGBA - 1] = a * BYTE;
    }
    rampFor = theme.c1 + theme.c2 + theme.c3;
  }

  function build(): void {
    cell =
      c.w < SHARED.SMALL_SCREEN
        ? FIXED.CELLS.low!
        : (FIXED.CELLS[String(p.detail)] ?? FIXED.CELLS.medium!);
    const cols = Math.ceil(c.w / cell);
    const rows = Math.ceil(c.h / cell);
    const off = offscreen(c.w, c.h);
    const o = off.ctx;
    const text = String(p.text || ' ');
    let size = c.h * n('textHeight');
    const setFont = () => {
      font = fontString({ size, weight: n('weight') });
      o.font = font;
      try {
        o.fontStretch = String(p.letterWidth) as CanvasFontStretch;
      } catch {
        /* older browsers */
      }
    };
    setFont();
    if (o.measureText(text).width > c.w * n('fitWidth')) {
      size *= (c.w * n('fitWidth')) / o.measureText(text).width;
      setFont();
    }
    o.textAlign = 'center';
    o.textBaseline = 'middle';
    o.fillStyle = FIXED.MASK;
    o.fillText(text, c.w / 2, c.h * n('textY'));
    const px = o.getImageData(0, 0, c.w, c.h).data;
    off.free();
    const fuel = new Uint8Array(cols * rows);
    for (let y = 0; y < rows; y++)
      for (let x = 0; x < cols; x++) {
        const sx = Math.min(c.w - 1, Math.floor(x * cell + cell / 2));
        const sy = Math.min(c.h - 1, Math.floor(y * cell + cell / 2));
        if (px[(sy * c.w + sx) * SHARED.RGBA + SHARED.RGBA - 1]! > FIXED.ALPHA_CUTOFF)
          fuel[y * cols + x] = 1;
      }
    grid = new HeatGrid(cols, rows, fuel);
    shown = new Float32Array(cols * rows);
    img?.free();
    img = offscreen(cols, rows);
    data = img.ctx.createImageData(cols, rows);
  }

  function draw(heat: Float32Array): void {
    const g = c.ctx;
    c.clear();
    if (!img || !data) return;
    if (theme.c1 + theme.c2 + theme.c3 !== rampFor) buildRamp();
    const d = data.data;
    for (let i = 0; i < heat.length; i++) {
      const k =
        Math.min(FIXED.RAMP - 1, Math.max(0, Math.round(heat[i]! * (FIXED.RAMP - 1)))) *
        SHARED.RGBA;
      const o = i * SHARED.RGBA;
      d[o] = ramp[k]!;
      d[o + 1] = ramp[k + 1]!;
      d[o + 2] = ramp[k + 2]!;
      d[o + SHARED.RGBA - 1] = ramp[k + SHARED.RGBA - 1]!;
    }
    img.ctx.putImageData(data, 0, 0);
    g.imageSmoothingEnabled = true;
    g.drawImage(img.canvas, 0, 0, grid.cols * cell, grid.rows * cell);
    g.font = font;
    try {
      g.fontStretch = String(p.letterWidth) as CanvasFontStretch;
    } catch {
      /* older browsers */
    }
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillStyle = theme.ink;
    g.fillText(String(p.text || ' '), c.w / 2, c.h * n('textY'));
  }

  return {
    resize() {
      c.fit();
      if (!fontsOk) return;
      build();
    },
    update() {
      ptr.sync();
      ptr.takeTaps();
      const fan = ptr.active
        ? { x: ptr.x / cell, y: ptr.y / cell, radius: n('fanRadius') / cell, strength: n('fan') }
        : null;
      grid.step(options(), fan);
      if (ctx.reducedMotion) {
        for (let i = 0; i < shown.length; i++)
          shown[i]! += (grid.heat[i]! - shown[i]!) * FIXED.CALM;
        draw(shown);
      } else draw(grid.heat);
    },
    still() {
      ptr.takeTaps();
      const keep = grid.heat.slice();
      grid.heat.fill(0);
      for (let i = 0; i < FIXED.STILL_STEPS; i++) grid.step(options(), null);
      shown.set(grid.heat);
      draw(grid.heat);
      grid.heat.set(keep);
    },
    setParams(next) {
      const rebuild = params.some(
        (q) =>
          (q.id === 'text' || q.id === 'detail' || q.phraseIn === 'text') && next[q.id] !== p[q.id],
      );
      p = { ...next };
      if (rebuild && fontsOk && c.w) build();
    },
    setTheme(t) {
      theme = t;
    },
    restart() {
      grid.heat.fill(0);
    },
    destroy() {
      ptr.destroy();
      c.destroy();
      img?.free();
      img = null;
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
