// `morph`: Shape morph (SCENES.md #39). Every shape has the same number of points; a
// morph slides each point to its twin in the next shape, eased, in up to three inks.

import { createCanvas } from '../../engine/canvas';
import { createPointer } from '../../engine/pointer';
import { backOut, clamp01, cubicInOut, expoOut, lerp, type Ease } from '../../kits/easing';
import type { Theme } from '../../theme/worlds';
import { SHARED } from '../shared';
import type { Params, SceneContext, SceneInstance, SceneModule } from '../types';
import { FIXED } from './constants';
import { meta } from './meta';
import { params } from './params';
import { followUps } from './prompt';
import { POINTS, parseShapes, shapePoints, type ShapeId } from './shapes';

const EASES: Record<string, Ease> = { smooth: cubicInOut, bouncy: backOut, snappy: expoOut };

function create(host: HTMLElement, initial: Params, ctx: SceneContext): SceneInstance {
  let p = { ...initial };
  const n = (id: string) => Number(p[id]);
  let theme: Theme = ctx.theme;
  const c = createCanvas(host);
  const ptr = createPointer(host);
  let list: ShapeId[] = parseShapes(String(p.shapes));
  let index = 0;
  let morphing = false;
  let clock = 0;

  const total = () => n('duration') * (1 + (n('layers') - 1) * n('layerLag'));

  function startMorph(): void {
    morphing = true;
    clock = 0;
  }

  function skip(): void {
    if (morphing) index = (index + 1) % list.length;
    startMorph();
  }

  function draw(progressOf: (layer: number) => number): void {
    const g = c.ctx;
    c.clear();
    const from = shapePoints(list[index % list.length]!);
    const to = shapePoints(list[(index + 1) % list.length]!);
    const R = (Math.min(c.w, c.h) * n('size')) / SHARED.PERCENT / 2;
    const cx = c.w * 0.5;
    const cy = c.h * 0.5;
    const ease = EASES[String(p.feel)] ?? cubicInOut;
    const inks = [theme.c1, theme.c2, theme.c3];
    g.globalCompositeOperation = theme.blend;
    g.globalAlpha = n('layerAlpha');
    for (let L = 0; L < n('layers'); L++) {
      const e = ease(progressOf(L));
      const shrink = 1 - L * n('inkShrink');
      g.beginPath();
      for (let k = 0; k < POINTS; k++) {
        const x = cx + lerp(from[k * 2]!, to[k * 2]!, e) * R * shrink;
        const y = cy + lerp(from[k * 2 + 1]!, to[k * 2 + 1]!, e) * R * shrink;
        if (k === 0) g.moveTo(x, y);
        else g.lineTo(x, y);
      }
      g.closePath();
      g.fillStyle = inks[L % SHARED.INKS]!;
      g.fill();
    }
    g.globalAlpha = 1;
    g.globalCompositeOperation = 'source-over';
  }

  function render(): void {
    // While waiting, every layer rests on the current shape (progress 0).
    draw((L) =>
      morphing ? clamp01((clock - L * n('layerLag') * n('duration')) / n('duration')) : 0,
    );
  }

  return {
    resize() {
      c.fit();
      render();
    },
    update(dt) {
      ptr.sync();
      if (ptr.takeTaps().length) skip();
      clock += dt;
      if (morphing && clock >= total()) {
        index = (index + 1) % list.length;
        morphing = false;
        clock = 0;
      } else if (!morphing && clock >= n('hold')) startMorph();
      render();
    },
    still() {
      ptr.takeTaps();
      draw(() => FIXED.STILL_PROGRESS);
    },
    setParams(next) {
      const was = String(p.shapes);
      p = { ...next };
      if (String(p.shapes) !== was) {
        list = parseShapes(String(p.shapes));
        index = 0;
        morphing = false;
        clock = 0;
      }
      if (c.w) render();
    },
    setTheme(t) {
      theme = t;
    },
    restart() {
      index = 0;
      morphing = false;
      clock = 0;
    },
    destroy() {
      ptr.destroy();
      c.destroy();
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
