// `fireworks`: Fireworks ⚠ (SCENES.md #29). The simulation lives in show.ts;
// this file wires the pointer and draws: soft local glows, rockets, then sparks.

import { createCanvas } from '../../engine/canvas';
import { createPointer } from '../../engine/pointer';
import type { Theme } from '../../theme/worlds';
import { SHARED } from '../shared';
import type { Params, SceneContext, SceneInstance, SceneModule } from '../types';
import { FIXED } from './constants';
import { meta } from './meta';
import { params } from './params';
import { followUps } from './prompt';
import { Show, type BurstShape, type ShowOptions } from './show';

const STILL_SHAPES: BurstShape[] = ['sphere', 'ring', 'willow'];

function create(host: HTMLElement, initial: Params, ctx: SceneContext): SceneInstance {
  let p = { ...initial };
  const n = (id: string) => Number(p[id]);
  let theme: Theme = ctx.theme;
  const c = createCanvas(host);
  const ptr = createPointer(host);
  let show = new Show();
  let still: Show | null = null;

  function options(): ShowOptions {
    const small = c.w < SHARED.SMALL_SCREEN;
    const scale = ctx.quality === 'preview' ? SHARED.PREVIEW_SCALE : 1;
    return {
      sparks: Math.round((small ? n('sparksSmall') : n('sparks')) * scale),
      shape: p.shape as ShowOptions['shape'],
      trail: n('trail'),
      gravity: n('gravity'),
      drag: n('drag'),
      speed: n('speed'),
      life: n('life'),
      rise: n('rise'),
      autoEvery: n('autoEvery'),
      willowDrag: n('willowDrag'),
      willowLife: n('willowLife'),
      ringTilt: n('ringTilt'),
      autoTop: n('autoTop'),
      autoBottom: n('autoBottom'),
      autoMargin: n('autoMargin'),
    };
  }

  function draw(s: Show): void {
    const g = c.ctx;
    c.clear();
    const inks = [theme.c1, theme.c2, theme.c3];
    g.globalCompositeOperation = theme.blend;
    const gr = n('glowRadius');
    const gt = n('glowTime');
    if (gr > 0)
      for (const b of s.shells) {
        if (b.age >= gt) continue;
        const ink = inks[b.ink]!;
        const grad = g.createRadialGradient(b.x, b.y, 0, b.x, b.y, gr);
        grad.addColorStop(0, ink);
        grad.addColorStop(1, ink + FIXED.CLEAR);
        g.globalAlpha = n('glowAlpha') * (1 - b.age / gt);
        g.fillStyle = grad;
        g.fillRect(b.x - gr, b.y - gr, gr * 2, gr * 2);
      }
    g.globalAlpha = 1;
    g.lineCap = 'round';
    g.lineJoin = 'round';
    g.lineWidth = n('sparkWidth');
    for (const r of s.rockets) {
      g.strokeStyle = inks[r.ink]!;
      g.beginPath();
      g.moveTo(r.x, r.ty);
      g.lineTo(r.x, r.y);
      g.stroke();
    }
    for (const b of s.shells) {
      const path = new Path2D();
      const { pos, hist, n: count, trail, filled, head } = b;
      for (let i = 0; i < count; i++) {
        const x = pos[2 * i]!;
        const y = pos[2 * i + 1]!;
        if (!filled) {
          path.moveTo(x, y);
          path.lineTo(x, y);
          continue;
        }
        // Oldest remembered position first: the ring buffer starts at `head` once full.
        for (let k = 0; k < filled; k++) {
          const slot = (filled < trail ? k : (head + k) % trail) * count * 2 + 2 * i;
          if (k) path.lineTo(hist[slot]!, hist[slot + 1]!);
          else path.moveTo(hist[slot]!, hist[slot + 1]!);
        }
        path.lineTo(x, y);
      }
      g.globalAlpha = 1 - (b.age / b.life) ** 2;
      g.strokeStyle = inks[b.ink]!;
      g.stroke(path);
    }
    g.globalAlpha = 1;
    g.globalCompositeOperation = 'source-over';
  }

  function makeStill(): Show {
    const s = new Show();
    const o = options();
    STILL_SHAPES.forEach((shape, i) => {
      const [x, y] = FIXED.STILL_SPOTS[i]!;
      s.burst(x * c.w, y * c.h, i, { ...o, shape });
    });
    const dt = 1 / SHARED.FPS;
    for (let k = 0; k < FIXED.STILL_FRAMES; k++)
      for (const b of s.shells) s.stepShell(b, dt, 1, o.gravity);
    return s;
  }

  return {
    resize() {
      c.fit();
      still = null;
    },
    update(dt) {
      ptr.sync();
      for (const tap of ptr.takeTaps()) show.tap(tap.x, tap.y);
      show.step(dt, c.w, c.h, options());
      draw(show);
    },
    still() {
      ptr.takeTaps();
      still ??= makeStill();
      draw(still);
    },
    setParams(next) {
      p = { ...next };
      still = null;
    },
    setTheme(t) {
      theme = t;
    },
    restart() {
      show = new Show();
    },
    destroy() {
      ptr.destroy();
      c.destroy();
      show = new Show();
      still = null;
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
