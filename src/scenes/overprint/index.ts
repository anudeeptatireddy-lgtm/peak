// `overprint`: Overprint blobs (SCENES.md #35). Ported from reference/riso-demo.html's
// "Overprint"; defaults reproduce it, which tests/e2e/parity.spec.ts checks.

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

interface Blob {
  i: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  s: number;
  sv: number;
  kick: number;
}

function create(host: HTMLElement, initial: Params, ctx: SceneContext): SceneInstance {
  let p = { ...initial };
  const n = (id: string) => Number(p[id]);
  let theme: Theme = ctx.theme;
  const c = createCanvas(host);
  const ptr = createPointer(host);
  const B: Blob[] = [0, 1, 2].map((i) => ({ i, x: 0, y: 0, vx: 0, vy: 0, s: 1, sv: 0, kick: -1 }));
  let R = 0;
  let placed = false;
  let time = 0;

  function place(): void {
    const [x0, dx, y0, dy] = FIXED.START;
    for (const b of B) {
      Object.assign(b, { vx: 0, vy: 0, s: 1, sv: 0, kick: -1 });
      b.x = c.w * (x0 + b.i * dx);
      b.y = c.h * (y0 + (b.i % 2) * dy);
    }
  }

  function draw(t: number): void {
    const g = c.ctx;
    c.clear();
    g.globalCompositeOperation = theme.blend;
    const inks = [theme.c1, theme.c2, theme.c3];
    const N = FIXED.POINTS;
    const [h1, h2] = FIXED.HARMONICS;
    const [s1, s2] = FIXED.WOBBLE_SPEEDS;
    const wob = n('wobble');
    for (const b of B) {
      const sp = Math.hypot(b.vx, b.vy);
      const st = 1 + Math.min(sp * n('stretchGain'), n('stretch'));
      const ang = Math.atan2(b.vy, b.vx);
      const ca = Math.cos(ang);
      const sa = Math.sin(ang);
      const r0 = R * b.s * (1 - b.i * n('inkShrink'));
      g.beginPath();
      for (let j = 0; j <= N; j++) {
        const th = (j / N) * SHARED.TAU;
        const w = th + ang;
        const r =
          r0 *
          (1 +
            wob * Math.sin(h1 * w + t * s1 + b.i * 2) +
            FIXED.WOBBLE2 * Math.sin(h2 * w + t * s2 + b.i));
        const lx = Math.cos(th) * r * st;
        const ly = (Math.sin(th) * r) / Math.sqrt(st);
        const x = b.x + lx * ca - ly * sa;
        const y = b.y + lx * sa + ly * ca;
        if (j) g.lineTo(x, y);
        else g.moveTo(x, y);
      }
      g.closePath();
      g.fillStyle = inks[b.i]!;
      g.fill();
    }
    g.globalCompositeOperation = 'source-over';
  }

  return {
    resize() {
      c.fit();
      R = Math.min(c.w, c.h) * (n('size') / SHARED.PERCENT);
      if (!placed) {
        place();
        placed = true;
      }
    },
    update(dt) {
      const f = frameFactor(dt);
      time += dt;
      const t = time;
      ptr.sync();
      let tx: number;
      let ty: number;
      if (ptr.active) {
        tx = ptr.x;
        ty = ptr.y;
      } else {
        tx = c.w * (n('wanderCX') + n('wanderX') * Math.sin(t * n('wanderSX')));
        ty = c.h * (n('wanderCY') + n('wanderY') * Math.sin(t * n('wanderSY')));
      }
      if (ptr.takeTaps().length) for (const b of B) b.kick = b.i * FIXED.JUMP_GAP;
      const springs = [n('fastSpring'), FIXED.MID_SPRING, n('slowSpring')];
      const spread = R * n('spread');
      for (const b of B) {
        const a = t * n('turnSpeed') + (b.i * SHARED.TAU) / SHARED.INKS;
        const gx = tx + Math.cos(a) * spread;
        const gy = ty + Math.sin(a) * spread;
        const damp = FIXED.DAMPING[b.i]! ** f;
        const k = springs[b.i]!;
        b.vx = (b.vx + (gx - b.x) * k * f) * damp;
        b.vy = (b.vy + (gy - b.y) * k * f) * damp;
        b.x += b.vx * f;
        b.y += b.vy * f;
        if (b.kick >= 0) {
          b.kick -= dt;
          if (b.kick < 0) {
            b.sv += n('jump');
            b.kick = -1;
          }
        }
        b.sv = (b.sv + (1 - b.s) * n('squashSpring') * f) * n('squashDamp') ** f;
        b.s += b.sv * f;
      }
      draw(t);
    },
    still() {
      ptr.takeTaps();
      draw(time);
    },
    setParams(next) {
      p = { ...next };
      if (c.w) R = Math.min(c.w, c.h) * (n('size') / SHARED.PERCENT);
    },
    setTheme(t) {
      theme = t;
    },
    restart() {
      time = 0;
      if (c.w) place();
    },
    destroy() {
      ptr.destroy();
      c.destroy();
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
