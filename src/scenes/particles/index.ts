// `particles`: Your name in particles (SCENES.md #1). Ported from
// reference/peak-prototype.html; defaults reproduce the prototype exactly.

import { createCanvas } from '../../engine/canvas';
import { createPointer } from '../../engine/pointer';
import { frameFactor } from '../../engine/time';
import type { Theme } from '../../theme/worlds';
import type { Params, SceneContext, SceneInstance, SceneModule } from '../types';
import { meta } from './meta';
import { params } from './params';
import { followUps } from './prompt';

const TAU = Math.PI * 2;
const FONT = 'Anybody, "Arial Black", Arial, sans-serif';

interface Dot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  tx: number;
  ty: number;
  k: number;
  rf: number;
  ci: number;
}

function create(host: HTMLElement, initial: Params, ctx: SceneContext): SceneInstance {
  let p = { ...initial };
  let theme: Theme = ctx.theme;
  const c = createCanvas(host);
  const ptr = createPointer(host);
  let dots: Dot[] = [];
  let groups: Dot[][] = [[], [], []];
  let gap = 4;

  function sample(): { pts: number[]; gap: number } {
    const W = c.w;
    const H = c.h;
    const small = W < 700;
    const off = document.createElement('canvas');
    off.width = W;
    off.height = H;
    const o = off.getContext('2d', { willReadFrequently: true })!;
    const text = String(p.text || ' ');
    let size = Math.min(H * 0.46, W * 0.42);
    const setFont = () => {
      o.font = `900 ${size}px ${FONT}`;
      try {
        o.fontStretch = 'expanded';
      } catch {
        /* older browsers */
      }
    };
    setFont();
    const maxW = W * (small ? 0.92 : 0.82);
    const tw = o.measureText(text).width;
    if (tw > maxW) {
      size *= maxW / tw;
      setFont();
    }
    o.textAlign = 'center';
    o.textBaseline = 'middle';
    o.fillStyle = '#000';
    o.fillText(text, W / 2, H * (small ? 0.4 : 0.43));
    const data = o.getImageData(0, 0, W, H).data;
    const density = Number(p.density) * (small ? 0.45 : 1) * (ctx.quality === 'preview' ? 0.4 : 1);
    let g = Math.max(3, Math.round(size / 80));
    let pts: number[];
    do {
      pts = [];
      for (let y = 0; y < H; y += g)
        for (let x = 0; x < W; x += g) if (data[(y * W + x) * 4 + 3]! > 140) pts.push(x, y);
    } while (pts.length / 2 > density && ++g < 14);
    off.width = 0;
    return { pts, gap: g };
  }

  function build(scatter: boolean): void {
    const s = sample();
    gap = s.gap;
    const n = s.pts.length / 2;
    const old = dots;
    const k0 = Number(p.stiffness);
    dots = new Array(n);
    groups = [[], [], []];
    for (let i = 0; i < n; i++) {
      const o = old[i];
      const tx = s.pts[2 * i]!;
      const ty = s.pts[2 * i + 1]!;
      const d: Dot = {
        x: o ? o.x : scatter ? Math.random() * c.w : tx,
        y: o ? o.y : scatter ? Math.random() * c.h : ty,
        vx: o ? o.vx : scatter ? (Math.random() - 0.5) * 12 : 0,
        vy: o ? o.vy : scatter ? (Math.random() - 0.5) * 12 : 0,
        tx,
        ty,
        // Prototype: 0.02 + random × 0.035, i.e. 0.0375 ± 46.7%.
        k: k0 * (0.5333 + Math.random() * 0.9333),
        rf: 0.32 + Math.random() * 0.22,
        ci: o ? o.ci : (Math.random() * 3) | 0,
      };
      dots[i] = d;
      groups[d.ci]!.push(d);
    }
  }

  function draw(): void {
    const ctx2 = c.ctx;
    c.clear();
    ctx2.globalCompositeOperation = theme.blend;
    const scale = gap * Number(p.dotSize);
    const inks = [theme.c1, theme.c2, theme.c3];
    for (let g = 0; g < 3; g++) {
      ctx2.fillStyle = inks[g]!;
      ctx2.beginPath();
      for (const d of groups[g]!) {
        const r = d.rf * scale;
        ctx2.moveTo(d.x + r, d.y);
        ctx2.arc(d.x, d.y, r, 0, TAU);
      }
      ctx2.fill();
    }
    ctx2.globalCompositeOperation = 'source-over';
  }

  function explode(cx: number, cy: number): void {
    const reach = Math.max(c.w, c.h);
    const blast = Number(p.explosion);
    for (const d of dots) {
      const dx = d.x - cx;
      const dy = d.y - cy;
      const dist = Math.hypot(dx, dy) || 1;
      const s = blast * (0.35 + Math.random() * 0.65) * Math.max(0.3, 1 - dist / reach);
      d.vx += (dx / dist) * s + (Math.random() - 0.5) * 6;
      d.vy += (dy / dist) * s + (Math.random() - 0.5) * 6;
    }
    ctx.sound.play('pop');
  }

  let built = false;

  return {
    resize() {
      const changed = c.fit();
      if (changed || !built) {
        build(!built && Boolean(p.intro) && !ctx.reducedMotion);
        built = true;
      }
    },
    update(dt) {
      ptr.sync();
      for (const t of ptr.takeTaps()) explode(t.x, t.y);
      const f = frameFactor(dt);
      const damp = Math.pow(Number(p.bounce), f);
      const maxR = Number(p.cursorRadius);
      const R = Math.min(maxR, Math.max(Math.min(70, maxR), c.w * 0.16));
      const R2 = R * R;
      const force = Number(p.cursorForce);
      const act = ptr.active && ptr.pointerType !== 'touch';
      const px = ptr.x;
      const py = ptr.y;
      for (const d of dots) {
        let ax = (d.tx - d.x) * d.k;
        let ay = (d.ty - d.y) * d.k;
        if (act) {
          const dx = d.x - px;
          const dy = d.y - py;
          const d2 = dx * dx + dy * dy;
          if (d2 < R2 && d2 > 0.01) {
            const dist = Math.sqrt(d2);
            const q = 1 - dist / R;
            const s = q * q * force;
            ax += (dx / dist) * s;
            ay += (dy / dist) * s;
          }
        }
        d.vx = (d.vx + ax * f) * damp;
        d.vy = (d.vy + ay * f) * damp;
        d.x += d.vx * f;
        d.y += d.vy * f;
      }
      draw();
    },
    still() {
      ptr.takeTaps();
      for (const d of dots) {
        d.x = d.tx;
        d.y = d.ty;
        d.vx = 0;
        d.vy = 0;
      }
      draw();
    },
    setParams(next) {
      const rebuild = next.text !== p.text || next.density !== p.density;
      const stiffChanged = next.stiffness !== p.stiffness;
      p = { ...next };
      if (rebuild && built) build(false);
      else if (stiffChanged) {
        const k0 = Number(p.stiffness);
        for (const d of dots) d.k = k0 * (0.5333 + Math.random() * 0.9333);
      }
    },
    setTheme(t) {
      theme = t;
    },
    restart() {
      dots = [];
      build(Boolean(p.intro));
    },
    destroy() {
      ptr.destroy();
      c.destroy();
      dots = [];
      groups = [[], [], []];
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
