// `moire`: Moiré (SCENES.md #40, ⚠). Two or three line, ring or dot layers overlap;
// the second slides and turns with the cursor at a capped speed (see sim.ts).

import { createCanvas } from '../../engine/canvas';
import { createPointer } from '../../engine/pointer';
import { frameFactor } from '../../engine/time';
import type { Theme } from '../../theme/worlds';
import { SHARED } from '../shared';
import type { Params, SceneContext, SceneInstance, SceneModule } from '../types';
import { FIXED } from './constants';
import { meta } from './meta';
import { params } from './params';
import { followUps } from './prompt';
import { step, type Limits, type Motion } from './sim';

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const RAD = Math.PI / FIXED.HALF_TURN;

function create(host: HTMLElement, initial: Params, ctx: SceneContext): SceneInstance {
  let p = { ...initial };
  const n = (id: string) => Number(p[id]);
  let theme: Theme = ctx.theme;
  const c = createCanvas(host);
  const ptr = createPointer(host);
  const m: Motion = { ox: 0, oy: 0, ang: 0 };
  let time = 0;
  let tiles: HTMLCanvasElement[] = [];

  const radius = () => Math.hypot(c.w, c.h) * 0.5;
  const limits = (): Limits => ({
    spacing: n('spacing'),
    radius: radius(),
    layers: n('layers'),
    follow: n('follow'),
  });

  /** One tile with a single dot in this layer's ink, repeated to make the dot grid. */
  function dotTile(color: string): HTMLCanvasElement {
    const s = n('spacing');
    const t = document.createElement('canvas');
    t.width = Math.max(1, Math.round(s * c.dpr));
    t.height = t.width;
    const g = t.getContext('2d')!;
    g.scale(t.width / s, t.width / s);
    g.fillStyle = color;
    g.beginPath();
    g.arc(s * 0.5, s * 0.5, n('thickness') * 0.5, 0, SHARED.TAU);
    g.fill();
    return t;
  }

  /** One layer's pattern, in its own centered, shifted and turned space. */
  function layer(k: number, ox: number, oy: number, ang: number, color: string): void {
    const g = c.ctx;
    const reach = Math.hypot(c.w, c.h) * FIXED.COVER;
    const s = n('spacing');
    g.save();
    g.translate(c.w * 0.5 + ox, c.h * 0.5 + oy);
    g.rotate(ang);
    g.strokeStyle = color;
    g.lineWidth = n('thickness');
    const kind = String(p.pattern);
    if (kind === 'lines') {
      g.beginPath();
      for (let x = -reach * 0.5; x <= reach * 0.5; x += s) {
        g.moveTo(x, -reach * 0.5);
        g.lineTo(x, reach * 0.5);
      }
      g.stroke();
    } else if (kind === 'rings') {
      g.beginPath();
      for (let r = s; r <= reach * 0.5; r += s) {
        g.moveTo(r, 0);
        g.arc(0, 0, r, 0, SHARED.TAU);
      }
      g.stroke();
    } else {
      const t = (tiles[k] ??= dotTile(color));
      const pat = g.createPattern(t, 'repeat')!;
      pat.setTransform(new DOMMatrix().scale(s / t.width, s / t.width));
      g.fillStyle = pat;
      g.fillRect(-reach * 0.5, -reach * 0.5, reach, reach);
    }
    g.restore();
  }

  function draw(): void {
    const g = c.ctx;
    c.clear();
    const inks = [theme.c1, theme.c2, theme.c3];
    const scales = [0, 1, FIXED.SECOND_SCALE];
    g.globalCompositeOperation = theme.blend;
    for (let k = 0; k < n('layers'); k++) {
      const sc = scales[k]!;
      layer(k, m.ox * sc, m.oy * sc, m.ang * sc, inks[k]!);
    }
    g.globalCompositeOperation = 'source-over';
  }

  return {
    resize() {
      c.fit();
      tiles = [];
      draw();
    },
    update(dt) {
      const f = frameFactor(dt);
      time += dt;
      ptr.sync();
      ptr.takeTaps();
      const turn = n('turn') * RAD;
      const short = Math.min(c.w, c.h);
      let target: Motion;
      if (ptr.active) {
        target = {
          ox: (ptr.x - c.w * 0.5) * n('slide'),
          oy: (ptr.y - c.h * 0.5) * n('slide'),
          ang: turn * clamp((ptr.x - c.w * 0.5) / (c.w * 0.5), -1, 1),
        };
      } else {
        const w = time * n('swaySpeed');
        const amp = short * n('swayReach') * n('drift');
        target = {
          ox: amp * Math.sin(w),
          oy: amp * Math.sin(w * FIXED.SWAY_RATIO + FIXED.SWAY_PHASE),
          ang: turn * n('drift') * Math.sin(w * FIXED.TURN_RATIO),
        };
      }
      step(m, target, dt, f, limits());
      draw();
    },
    still() {
      ptr.takeTaps();
      m.ox = n('spacing') * FIXED.STILL_SHIFT;
      m.oy = 0;
      m.ang = FIXED.STILL_TURN * RAD;
      draw();
    },
    setParams(next) {
      p = { ...next };
      tiles = [];
      if (c.w) draw();
    },
    setTheme(t) {
      theme = t;
      tiles = [];
    },
    restart() {
      m.ox = 0;
      m.oy = 0;
      m.ang = 0;
      time = 0;
    },
    destroy() {
      ptr.destroy();
      c.destroy();
      tiles = [];
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
