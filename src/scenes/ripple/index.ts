// `ripple`: Ripple background (SCENES.md #21). Ported from reference/peak-prototype.html.
// Uses scene time instead of the prototype's wall clock so pausing freezes ripples.

import { createCanvas } from '../../engine/canvas';
import { createPointer } from '../../engine/pointer';
import type { Theme } from '../../theme/worlds';
import type { Params, SceneContext, SceneInstance, SceneModule } from '../types';
import { meta } from './meta';
import { params } from './params';
import { followUps } from './prompt';

const TAU = Math.PI * 2;

interface Dot {
  bx: number;
  by: number;
  x: number;
  y: number;
  e: number;
  c: number;
}
interface Ring {
  x: number;
  y: number;
  t0: number;
  ci: number;
}

function create(host: HTMLElement, initial: Params, ctx: SceneContext): SceneInstance {
  let p = { ...initial };
  let theme: Theme = ctx.theme;
  const c = createCanvas(host);
  const ptr = createPointer(host);
  let dots: Dot[] = [];
  let rings: Ring[] = [];
  let lastUser = -99;
  let nextAuto = 0;
  let nextColor = 0;
  let time = 0;

  function build(): void {
    const base = Number(p.spacing);
    const gap = c.w < 700 ? Math.round(base * (20 / 26)) : base;
    const cols = Math.floor(c.w / gap) + 1;
    const rowsN = Math.floor(c.h / gap) + 1;
    const ox = (c.w - (cols - 1) * gap) / 2;
    const oy = (c.h - (rowsN - 1) * gap) / 2;
    dots = [];
    for (let j = 0; j < rowsN; j++)
      for (let i = 0; i < cols; i++) {
        const x = ox + i * gap;
        const y = oy + j * gap;
        dots.push({ bx: x, by: y, x, y, e: 0, c: -1 });
      }
  }

  function drop(x: number, y: number, t: number): void {
    rings.push({ x, y, t0: t, ci: nextColor++ % 3 });
    if (rings.length > 8) rings.shift();
    ctx.sound.play('drop');
  }

  function step(t: number, smooth: boolean, live: boolean): void {
    rings = rings.filter((r) => t - r.t0 < 5);
    const every = Number(p.autoEvery);
    if (live && every > 0 && t - lastUser > 3.5 && t > nextAuto) {
      drop(c.w * (0.2 + Math.random() * 0.6), c.h * (0.2 + Math.random() * 0.5), t);
      nextAuto = t + every;
    }
    const speed = Number(p.speed);
    const band = Number(p.ringWidth);
    const push = Number(p.push);
    const fade = Number(p.fade);
    const reach = Number(p.cursorRadius);
    const a = smooth ? 0.25 : 1;
    const act = live && ptr.active && reach > 0;
    for (const d of dots) {
      let ox = 0;
      let oy = 0;
      let e = 0;
      let best = 0;
      let bc = -1;
      for (const r of rings) {
        const age = t - r.t0;
        const rx = d.bx - r.x;
        const ry = d.by - r.y;
        const dist = Math.sqrt(rx * rx + ry * ry) || 1;
        const k = (dist - age * speed) / band;
        if (k > -2.5 && k < 2.5) {
          const g = Math.exp(-k * k) * Math.exp(-age * fade);
          const disp = Math.sin(k * 2) * g * push;
          ox += (rx / dist) * disp;
          oy += (ry / dist) * disp;
          e += g;
          if (g > best) {
            best = g;
            bc = r.ci;
          }
        }
      }
      if (act) {
        const px = d.bx - ptr.x;
        const py = d.by - ptr.y;
        const d2 = px * px + py * py;
        if (d2 < reach * reach) {
          const dd = Math.sqrt(d2) || 1;
          const s = 1 - dd / reach;
          ox += (px / dd) * s * s * 22;
          oy += (py / dd) * s * s * 22;
          e += s * 0.6;
          if (s * 0.6 > best) bc = 1;
        }
      }
      d.x += (d.bx + ox - d.x) * a;
      d.y += (d.by + oy - d.y) * a;
      d.e += (Math.min(e, 1.4) - d.e) * a;
      if (bc >= 0) d.c = bc;
    }
    draw();
  }

  function draw(): void {
    const g = c.ctx;
    c.clear();
    g.globalAlpha = 0.38;
    g.fillStyle = theme.inkSoft;
    g.beginPath();
    for (const d of dots)
      if (d.e < 0.08 || d.c < 0) {
        g.moveTo(d.x + 1.3, d.y);
        g.arc(d.x, d.y, 1.3, 0, TAU);
      }
    g.fill();
    g.globalAlpha = 1;
    g.globalCompositeOperation = theme.blend;
    const inks = [theme.c1, theme.c2, theme.c3];
    for (let k = 0; k < 3; k++) {
      g.fillStyle = inks[k]!;
      g.beginPath();
      for (const d of dots)
        if (d.e >= 0.08 && d.c === k) {
          const r = 1.3 + d.e * 3.6;
          g.moveTo(d.x + r, d.y);
          g.arc(d.x, d.y, r, 0, TAU);
        }
      g.fill();
    }
    g.globalCompositeOperation = 'source-over';
  }

  return {
    resize() {
      if (c.fit() || !dots.length) build();
    },
    update(dt) {
      time += dt;
      ptr.sync();
      for (const tap of ptr.takeTaps()) {
        drop(tap.x, tap.y, time);
        lastUser = time;
      }
      step(time, true, true);
    },
    still() {
      ptr.takeTaps();
      const keep = rings;
      rings = [
        { x: c.w / 2, y: c.h * 0.45, t0: -0.9, ci: 0 },
        { x: c.w / 2, y: c.h * 0.45, t0: -0.35, ci: 1 },
      ];
      step(0, false, false);
      rings = keep;
    },
    setParams(next) {
      const rebuild = next.spacing !== p.spacing;
      p = { ...next };
      if (rebuild) build();
    },
    setTheme(t) {
      theme = t;
    },
    restart() {
      rings = [];
      lastUser = -99;
      nextAuto = 0;
    },
    destroy() {
      ptr.destroy();
      c.destroy();
      dots = [];
      rings = [];
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
