// `particles`: Your name in particles (SCENES.md #1). Ported from
// reference/peak-prototype.html. Defaults reproduce the prototype exactly, which
// tests/e2e/parity.spec.ts proves pixel by pixel.

import { createCanvas } from '../../engine/canvas';
import { fontsReady } from '../../engine/fonts';
import { createPointer } from '../../engine/pointer';
import { frameFactor } from '../../engine/time';
import type { Theme } from '../../theme/worlds';
import { SHARED } from '../shared';
import type { Params, SceneContext, SceneInstance, SceneModule } from '../types';
import { FIXED } from './constants';
import { meta } from './meta';
import { params } from './params';
import { followUps } from './prompt';

const { TAU, SMALL_SCREEN, PREVIEW_SCALE, RGBA } = SHARED;

interface Dot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  tx: number;
  ty: number;
  k: number;
  r: number;
  ci: number;
}

function create(host: HTMLElement, initial: Params, ctx: SceneContext): SceneInstance {
  let p = { ...initial };
  const n = (id: string) => Number(p[id]);
  let theme: Theme = ctx.theme;
  const c = createCanvas(host);
  const ptr = createPointer(host);
  let dots: Dot[] = [];
  let groups: Dot[][] = [[], [], []];
  let fontsOk = false;
  let destroyed = false;
  // Like the prototype, sample only once the real font is here (or the wait timed out).
  fontsReady().then(() => {
    fontsOk = true;
  });

  function sample(): { pts: number[]; gap: number } {
    const W = c.w;
    const H = c.h;
    const small = W < SMALL_SCREEN;
    const off = document.createElement('canvas');
    off.width = W;
    off.height = H;
    const o = off.getContext('2d', { willReadFrequently: true })!;
    const text = String(p.text || ' ');
    let size = Math.min(H * n('textHeight'), W * n('textWidth'));
    const setFont = () => {
      o.font = `${n('fontWeight')} ${size}px ${FIXED.FONT}`;
      try {
        o.fontStretch = String(p.fontStretch) as CanvasFontStretch;
      } catch {
        /* older browsers */
      }
    };
    setFont();
    const maxW = W * (small ? n('fitWidthSmall') : n('fitWidth'));
    const tw = o.measureText(text).width;
    if (tw > maxW) {
      size *= maxW / tw;
      setFont();
    }
    o.textAlign = 'center';
    o.textBaseline = 'middle';
    o.fillStyle = FIXED.MASK;
    o.fillText(text, W / 2, H * (small ? n('textYSmall') : n('textY')));
    const data = o.getImageData(0, 0, W, H).data;
    const max =
      (small ? n('densitySmall') : n('density')) * (ctx.quality === 'preview' ? PREVIEW_SCALE : 1);
    const cutoff = n('alphaCutoff');
    let gap = Math.max(n('minGap'), Math.round(size / n('gapDivisor')));
    let pts: number[];
    do {
      pts = [];
      for (let y = 0; y < H; y += gap)
        for (let x = 0; x < W; x += gap)
          if (data[(y * W + x) * RGBA + (RGBA - 1)]! > cutoff) pts.push(x, y);
    } while (pts.length / 2 > max && ++gap < n('maxGap'));
    off.width = 0;
    return { pts, gap };
  }

  function build(): void {
    const s = sample();
    const count = s.pts.length / 2;
    const old = dots;
    const scatter = old.length === 0 && Boolean(p.intro);
    const kMin = n('stiffness');
    const kSpread = n('stiffnessSpread');
    const rMin = n('dotMin');
    const rSpread = n('dotRange');
    const v0 = n('introSpeed');
    dots = new Array(count);
    groups = [[], [], []];
    // Same order of Math.random() calls as the prototype, so seeded runs match.
    for (let i = 0; i < count; i++) {
      const o = old[i];
      const tx = s.pts[2 * i]!;
      const ty = s.pts[2 * i + 1]!;
      const d: Dot = {
        x: o ? o.x : scatter ? Math.random() * c.w : tx,
        y: o ? o.y : scatter ? Math.random() * c.h : ty,
        vx: o ? o.vx : scatter ? (Math.random() - 0.5) * v0 : 0,
        vy: o ? o.vy : scatter ? (Math.random() - 0.5) * v0 : 0,
        tx,
        ty,
        k: kMin + Math.random() * kSpread,
        r: s.gap * (rMin + Math.random() * rSpread),
        ci: o ? o.ci : (Math.random() * SHARED.INKS) | 0,
      };
      dots[i] = d;
      groups[d.ci]!.push(d);
    }
  }

  function draw(): void {
    const g = c.ctx;
    c.clear();
    g.globalCompositeOperation = theme.blend;
    const scale = n('dotSize');
    const inks = [theme.c1, theme.c2, theme.c3];
    for (let k = 0; k < SHARED.INKS; k++) {
      g.fillStyle = inks[k]!;
      g.beginPath();
      for (const d of groups[k]!) {
        const r = d.r * scale;
        g.moveTo(d.x + r, d.y);
        g.arc(d.x, d.y, r, 0, TAU);
      }
      g.fill();
    }
    g.globalCompositeOperation = 'source-over';
  }

  function explode(cx: number, cy: number): void {
    const reach = Math.max(c.w, c.h);
    const blast = n('explosion');
    const lo = n('blastMin');
    const floor = n('blastFloor');
    const jitter = n('blastJitter');
    for (const d of dots) {
      const dx = d.x - cx;
      const dy = d.y - cy;
      const dist = Math.hypot(dx, dy) || 1;
      const s = blast * (lo + Math.random() * (1 - lo)) * Math.max(floor, 1 - dist / reach);
      d.vx += (dx / dist) * s + (Math.random() - 0.5) * jitter;
      d.vy += (dy / dist) * s + (Math.random() - 0.5) * jitter;
    }
    ctx.sound.play('pop');
  }

  return {
    resize() {
      c.fit();
      if (!fontsOk || destroyed) {
        dots = [];
        groups = [[], [], []];
        return;
      }
      build();
    },
    update(dt) {
      ptr.sync();
      for (const t of ptr.takeTaps()) explode(t.x, t.y);
      const f = frameFactor(dt);
      const damp = Math.pow(n('bounce'), f);
      const maxR = n('cursorRadius');
      const R = Math.min(
        maxR,
        Math.max(Math.min(n('cursorRadiusMin'), maxR), c.w * n('cursorReachScale')),
      );
      const R2 = R * R;
      const force = n('cursorForce');
      const act = ptr.active;
      const px = ptr.x;
      const py = ptr.y;
      for (const d of dots) {
        let ax = (d.tx - d.x) * d.k;
        let ay = (d.ty - d.y) * d.k;
        if (act) {
          const dx = d.x - px;
          const dy = d.y - py;
          const d2 = dx * dx + dy * dy;
          if (d2 < R2 && d2 > FIXED.MIN_PUSH_DIST2) {
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
      const changed = params.filter((q) => q.rebuild && next[q.id] !== p[q.id]).length > 0;
      const stiff = next.stiffness !== p.stiffness || next.stiffnessSpread !== p.stiffnessSpread;
      p = { ...next };
      if (changed && fontsOk) build();
      else if (stiff)
        for (const d of dots) d.k = n('stiffness') + Math.random() * n('stiffnessSpread');
    },
    setTheme(t) {
      theme = t;
    },
    restart() {
      dots = [];
      if (fontsOk) build();
    },
    destroy() {
      destroyed = true;
      ptr.destroy();
      c.destroy();
      dots = [];
      groups = [[], [], []];
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
