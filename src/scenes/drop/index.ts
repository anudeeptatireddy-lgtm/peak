// `drop`: Ink-ball pile (SCENES.md #26). Ported from reference/riso-demo.html's
// "Drop"; defaults reproduce it, which tests/e2e/parity.spec.ts checks.

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

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  m: number;
  ci: number;
}

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const PCT = SHARED.PERCENT;

function create(host: HTMLElement, initial: Params, ctx: SceneContext): SceneInstance {
  let p = { ...initial };
  const n = (id: string) => Number(p[id]);
  let theme: Theme = ctx.theme;
  const c = createCanvas(host);
  const ptr = createPointer(host);
  let B: Ball[] = [];
  let seeded = false;
  let floor = 0;
  let rmin = 0;
  let rmax = 0;
  let Rp = 0;
  let next = 0;
  let settled = false;

  function make(x: number, y: number): Ball {
    const r = rmin + (rmax - rmin) * Math.random() ** n('skew');
    return {
      x,
      y,
      vx: (Math.random() * 2 - 1) * n('startSpeed'),
      vy: 0,
      r,
      m: r * r,
      ci: next++ % SHARED.INKS,
    };
  }

  function sizes(): void {
    const mn = Math.min(c.w, c.h);
    floor = c.h * n('floorY');
    rmin = clamp((mn * n('sizeMin')) / PCT, n('sizeMinLo'), n('sizeMinHi'));
    rmax = clamp((mn * n('sizeMax')) / PCT, n('sizeMaxLo'), n('sizeMaxHi'));
    Rp = clamp((mn * n('shove')) / PCT, n('shoveLo'), n('shoveHi'));
  }

  function physics(f: number, pushing: boolean): void {
    const sub = n('substeps');
    const h = f / sub;
    const pvx = (ptr.x - ptr.px) / f;
    const pvy = (ptr.y - ptr.py) / f;
    const g = n('gravity');
    const drag = n('airDrag') ** h;
    const ff = n('floorFriction') ** h;
    const wb = n('wallBounce');
    const fb = n('floorBounce');
    const kick = n('shovePower');
    const e = 1 + n('ballBounce');
    for (let s = 0; s < sub; s++) {
      for (const b of B) {
        b.vy += g * h;
        b.vx *= drag;
        b.x += b.vx * h;
        b.y += b.vy * h;
        if (b.x < b.r) {
          b.x = b.r;
          b.vx = Math.abs(b.vx) * wb;
        } else if (b.x > c.w - b.r) {
          b.x = c.w - b.r;
          b.vx = -Math.abs(b.vx) * wb;
        }
        if (b.y > floor - b.r) {
          b.y = floor - b.r;
          b.vy = -Math.abs(b.vy) * fb;
          b.vx *= ff;
        }
        if (pushing) {
          const dx = b.x - ptr.x;
          const dy = b.y - ptr.y;
          const rr = Rp + b.r;
          const d2 = dx * dx + dy * dy;
          if (d2 < rr * rr && d2 > FIXED.MIN_PUSH_D2) {
            const d = Math.sqrt(d2);
            const nx = dx / d;
            const ny = dy / d;
            b.x = ptr.x + nx * rr;
            b.y = ptr.y + ny * rr;
            const vn = (b.vx - pvx) * nx + (b.vy - pvy) * ny;
            if (vn < 0) {
              b.vx -= kick * vn * nx;
              b.vy -= kick * vn * ny;
            }
          }
        }
      }
      for (let i = 0; i < B.length; i++) {
        const a = B[i]!;
        for (let j = i + 1; j < B.length; j++) {
          const b = B[j]!;
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const rr = a.r + b.r;
          const d2 = dx * dx + dy * dy;
          if (d2 >= rr * rr || d2 < FIXED.MIN_D2) continue;
          const d = Math.sqrt(d2);
          const nx = dx / d;
          const ny = dy / d;
          const ov = rr - d;
          const ia = 1 / a.m;
          const ib = 1 / b.m;
          const it = ia + ib;
          a.x -= (nx * ov * ia) / it;
          a.y -= (ny * ov * ia) / it;
          b.x += (nx * ov * ib) / it;
          b.y += (ny * ov * ib) / it;
          const vn = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
          if (vn < 0) {
            const jn = -(e * vn) / it;
            a.vx -= jn * ia * nx;
            a.vy -= jn * ia * ny;
            b.vx += jn * ib * nx;
            b.vy += jn * ib * ny;
          }
        }
      }
    }
  }

  function draw(): void {
    const g = c.ctx;
    c.clear();
    g.globalCompositeOperation = theme.blend;
    const inks = [theme.c1, theme.c2, theme.c3];
    for (let k = 0; k < SHARED.INKS; k++) {
      g.beginPath();
      for (const b of B) {
        if (b.ci !== k || b.y < -b.r) continue;
        g.moveTo(b.x + b.r, b.y);
        g.arc(b.x, b.y, b.r, 0, SHARED.TAU);
      }
      g.fillStyle = inks[k]!;
      g.fill();
    }
    g.globalCompositeOperation = 'source-over';
  }

  return {
    resize() {
      c.fit();
      sizes();
      if (!seeded) {
        const count =
          n('start') > 0
            ? n('start')
            : Math.round(clamp(c.w / n('startDiv'), n('startMin'), n('startMax')));
        for (let i = 0; i < count; i++) {
          const x = rmax + Math.random() * (c.w - 2 * rmax);
          const y = -Math.random() * c.h * n('dropHeight') - rmax;
          B.push(make(x, y));
        }
        seeded = true;
      }
      for (const b of B) b.x = clamp(b.x, b.r, Math.max(b.r, c.w - b.r));
    },
    update(dt) {
      const f = frameFactor(dt);
      ptr.sync();
      for (const tap of ptr.takeTaps()) {
        const b = make(tap.x, tap.y);
        b.vy = -n('tapLift');
        B.push(b);
        if (B.length > n('maxBalls')) B.shift();
      }
      physics(f, ptr.pointerType === 'mouse' ? ptr.active : ptr.dragging);
      draw();
    },
    still() {
      ptr.takeTaps();
      // Reduced motion shows the settled pile: let the starting balls fall first.
      if (!settled) {
        for (let i = 0; i < FIXED.STILL_FRAMES; i++) physics(1, false);
        settled = true;
      }
      draw();
    },
    setParams(next) {
      p = { ...next };
      if (c.w) sizes();
      while (B.length > n('maxBalls')) B.shift();
    },
    setTheme(t) {
      theme = t;
    },
    restart() {
      B = [];
      seeded = false;
      if (c.w) this.resize();
    },
    destroy() {
      ptr.destroy();
      c.destroy();
      B = [];
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
