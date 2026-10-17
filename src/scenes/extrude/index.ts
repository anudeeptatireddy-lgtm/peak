// `extrude`: 3D letters (SCENES.md #15). Stacked copies of the word, nudged
// along the turn's depth direction, with yaw and pitch on springs.

import { createCanvas } from '../../engine/canvas';
import { fontsReady } from '../../engine/fonts';
import { createPointer } from '../../engine/pointer';
import { frameFactor } from '../../engine/time';
import { fontString } from '../../kits/text';
import { mixOklab } from '../../theme/color';
import type { Theme } from '../../theme/worlds';
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
  let fontsOk = false;
  fontsReady().then(() => {
    fontsOk = true;
  });

  let font = '';
  let size = 0;
  let shades: string[] = [];
  let time = 0;
  const yaw = { x: 0, v: 0 };
  const pitch = { x: 0, v: 0 };

  function layout(): void {
    const g = c.ctx;
    const text = String(p.text || ' ');
    size = c.h * n('textHeight');
    const apply = () => {
      font = fontString({ size, weight: n('weight') });
      g.font = font;
    };
    apply();
    const maxW = c.w * n('fitWidth');
    if (g.measureText(text).width > maxW) {
      size *= maxW / g.measureText(text).width;
      apply();
    }
  }

  function shade(): void {
    const depth = n('depth');
    shades = Array.from({ length: depth + 1 }, (_, d) =>
      d === 0
        ? theme.c1
        : mixOklab(
            mixOklab(theme.c2, theme.c3, d / depth),
            theme.ink,
            (n('sideShade') * d) / depth / 2,
          ),
    );
  }

  function draw(yawDeg: number, pitchDeg: number): void {
    const g = c.ctx;
    c.clear();
    g.font = font;
    try {
      g.fontStretch = String(p.letterWidth) as CanvasFontStretch;
    } catch {
      /* older browsers */
    }
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    const ya = yawDeg * FIXED.DEG;
    const pa = pitchDeg * FIXED.DEG;
    const gap = n('layerGap') * size;
    const text = String(p.text || ' ');
    const cx = c.w / 2;
    const cy = c.h / 2;
    for (let d = n('depth'); d >= 0; d--) {
      g.save();
      g.translate(cx - Math.sin(ya) * d * gap, cy + Math.sin(pa) * d * gap);
      g.scale(Math.cos(ya), Math.cos(pa));
      g.fillStyle = shades[d] ?? theme.c1;
      g.fillText(text, 0, 0);
      g.restore();
    }
  }

  function springTo(s: { x: number; v: number }, target: number, f: number): void {
    s.v = (s.v + (target - s.x) * n('spring') * f) * n('damping') ** f;
    s.x += s.v * f;
  }

  return {
    resize() {
      c.fit();
      if (!fontsOk) return;
      layout();
      shade();
    },
    update(dt) {
      time += dt;
      ptr.sync();
      ptr.takeTaps();
      const f = frameFactor(dt);
      const max = n('maxTurn');
      const clamp = (v: number) => Math.max(-1, Math.min(1, v));
      let ty: number;
      let tp: number;
      if (ptr.active) {
        ty = clamp((ptr.x - c.w / 2) / (c.w / 2)) * max;
        tp = clamp((ptr.y - c.h / 2) / (c.h / 2)) * max;
      } else {
        const fl = n('float');
        ty = fl * max * Math.sin(time * n('floatSpeed'));
        tp = fl * max * FIXED.FLOAT_PITCH * Math.sin(time * n('floatSpeed') * FIXED.FLOAT_RATIO);
      }
      springTo(yaw, ty, f);
      springTo(pitch, tp, f);
      draw(yaw.x, pitch.x);
    },
    still() {
      ptr.takeTaps();
      draw(FIXED.STILL_TURN * n('maxTurn'), (-FIXED.STILL_TURN / 2) * n('maxTurn'));
    },
    setParams(next) {
      const relayout = params.some(
        (q) => (q.phraseIn === 'text' || q.id === 'text') && next[q.id] !== p[q.id],
      );
      p = { ...next };
      if (relayout && fontsOk && c.w) layout();
      shade();
    },
    setTheme(t) {
      theme = t;
      shade();
    },
    restart() {
      yaw.x = yaw.v = pitch.x = pitch.v = 0;
    },
    destroy() {
      ptr.destroy();
      c.destroy();
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
