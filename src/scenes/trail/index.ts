// `trail`: Cursor trail (SCENES.md #47). A follow-the-leader chain of points (each eases
// toward the one before it), drawn as a tapering ribbon, snake or dots.

import { createCanvas } from '../../engine/canvas';
import { createPointer } from '../../engine/pointer';
import { frameFactor } from '../../engine/time';
import { mixOklab } from '../../theme/color';
import type { Theme } from '../../theme/worlds';
import { SHARED } from '../shared';
import type { Params, SceneContext, SceneInstance, SceneModule } from '../types';
import { FIXED } from './constants';
import { meta } from './meta';
import { params } from './params';
import { followUps } from './prompt';

type Pt = { x: number; y: number };

function create(host: HTMLElement, initial: Params, ctx: SceneContext): SceneInstance {
  let p = { ...initial };
  const n = (id: string) => Number(p[id]);
  let theme: Theme = ctx.theme;
  const c = createCanvas(host);
  const ptr = createPointer(host);
  let pts: Pt[] = [];
  let time = 0;

  const count = () => Math.max(2, Math.round(n('length')));
  const widthAt = (i: number) => n('width') * (1 - (n('taper') * i) / (count() - 1));

  /** Color along the trail: 0 at the head, 1 at the tail. */
  function colorAt(frac: number): string {
    if (p.color === 'one') return theme.c1;
    return frac < FIXED.MIDDLE
      ? mixOklab(theme.c1, theme.c2, frac / FIXED.MIDDLE)
      : mixOklab(theme.c2, theme.c3, (frac - FIXED.MIDDLE) / (1 - FIXED.MIDDLE));
  }

  function reset(): void {
    pts = Array.from({ length: count() }, () => ({ x: c.w * 0.5, y: c.h * 0.5 }));
  }

  function target(): Pt {
    if (ptr.active) return { x: ptr.x, y: ptr.y };
    const w = time * n('swimSpeed');
    return {
      x: c.w * 0.5 + c.w * n('swimReach') * Math.sin(w * FIXED.IDLE_X),
      y: c.h * 0.5 + c.h * n('swimReach') * Math.sin(w * FIXED.IDLE_Y + FIXED.IDLE_PHASE),
    };
  }

  function step(dt: number, f: number, aim: Pt): void {
    time += dt;
    const k = 1 - Math.pow(1 - n('follow'), f);
    const head = pts[0]!;
    head.x += (aim.x - head.x) * k;
    head.y += (aim.y - head.y) * k;
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1]!;
      const b = pts[i]!;
      b.x += (a.x - b.x) * k;
      b.y += (a.y - b.y) * k;
    }
  }

  /** Smooth curve through the points: Bézier links with Catmull-Rom tangents. */
  function sample(): { x: number; y: number; w: number; t: number }[] {
    const out: { x: number; y: number; w: number; t: number }[] = [];
    const N = pts.length;
    for (let i = 0; i < N - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)]!;
      const p1 = pts[i]!;
      const p2 = pts[i + 1]!;
      const p3 = pts[Math.min(N - 1, i + 2)]!;
      const b1 = {
        x: p1.x + (p2.x - p0.x) / FIXED.TENSION,
        y: p1.y + (p2.y - p0.y) / FIXED.TENSION,
      };
      const b2 = {
        x: p2.x - (p3.x - p1.x) / FIXED.TENSION,
        y: p2.y - (p3.y - p1.y) / FIXED.TENSION,
      };
      for (let s = 0; s < FIXED.SAMPLES; s++) {
        const t = s / FIXED.SAMPLES;
        const u = 1 - t;
        const A = u * u * u;
        const B = FIXED.CUBIC * u * u * t;
        const C = FIXED.CUBIC * u * t * t;
        const D = t * t * t;
        out.push({
          x: A * p1.x + B * b1.x + C * b2.x + D * p2.x,
          y: A * p1.y + B * b1.y + C * b2.y + D * p2.y,
          w: widthAt(i) + (widthAt(i + 1) - widthAt(i)) * t,
          t: (i + t) / (N - 1),
        });
      }
    }
    const last = pts[N - 1]!;
    out.push({ x: last.x, y: last.y, w: widthAt(N - 1), t: 1 });
    return out;
  }

  function strip(scale: number, flat: string | null): void {
    const g = c.ctx;
    const s = sample();
    const L: Pt[] = [];
    const R: Pt[] = [];
    s.forEach((q, j) => {
      const a = s[Math.max(0, j - 1)]!;
      const b = s[Math.min(s.length - 1, j + 1)]!;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.hypot(dx, dy) || 1;
      const nx = (-dy / len) * ((q.w * scale) / 2);
      const ny = (dx / len) * ((q.w * scale) / 2);
      L.push({ x: q.x + nx, y: q.y + ny });
      R.push({ x: q.x - nx, y: q.y - ny });
    });
    for (let j = 0; j < s.length - 1; j++) {
      g.beginPath();
      g.moveTo(L[j]!.x, L[j]!.y);
      g.lineTo(L[j + 1]!.x, L[j + 1]!.y);
      g.lineTo(R[j + 1]!.x, R[j + 1]!.y);
      g.lineTo(R[j]!.x, R[j]!.y);
      g.closePath();
      const color = flat ?? colorAt(s[j]!.t);
      g.fillStyle = color;
      g.strokeStyle = color;
      g.lineWidth = 1;
      g.fill();
      g.stroke();
    }
  }

  function pieces(scale: number, flat: string | null): void {
    const g = c.ctx;
    const N = pts.length;
    if (p.look === 'ribbon') {
      strip(scale, flat);
      return;
    }
    for (let i = 0; i < N; i++) {
      const color = flat ?? colorAt(i / (N - 1));
      const w = widthAt(i) * scale;
      if (p.look === 'snake' && i < N - 1) {
        g.strokeStyle = color;
        g.lineCap = 'round';
        g.lineWidth = w * FIXED.OVERLAP;
        g.beginPath();
        g.moveTo(pts[i]!.x, pts[i]!.y);
        g.lineTo(pts[i + 1]!.x, pts[i + 1]!.y);
        g.stroke();
      } else if (p.look === 'dots') {
        g.fillStyle = color;
        g.beginPath();
        g.arc(pts[i]!.x, pts[i]!.y, w / 2, 0, SHARED.TAU);
        g.fill();
      }
    }
  }

  function draw(): void {
    const g = c.ctx;
    c.clear();
    if (n('glow') > 0) {
      g.globalCompositeOperation = theme.blend;
      g.globalAlpha = n('glow') * FIXED.GLOW_ALPHA;
      pieces(FIXED.GLOW_SCALE, p.color === 'one' ? theme.c1 : theme.c2);
      g.globalCompositeOperation = 'source-over';
    }
    g.globalAlpha = 1;
    pieces(1, null);
  }

  return {
    resize() {
      const first = !c.w;
      c.fit();
      if (first || !pts.length) reset();
      draw();
    },
    update(dt) {
      ptr.sync();
      ptr.takeTaps();
      step(dt, frameFactor(dt), target());
      draw();
    },
    still() {
      ptr.takeTaps();
      reset();
      time = 0;
      for (let i = 0; i < FIXED.STILL_FRAMES; i++) step(1 / SHARED.FPS, 1, target());
      draw();
    },
    setParams(next) {
      const resize = Math.round(Number(next.length)) !== count();
      p = { ...next };
      if (resize && c.w) reset();
      if (c.w) draw();
    },
    setTheme(t) {
      theme = t;
    },
    restart() {
      time = 0;
      reset();
    },
    destroy() {
      ptr.destroy();
      c.destroy();
      pts = [];
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
