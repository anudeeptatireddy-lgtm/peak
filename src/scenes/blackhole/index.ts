// `blackhole`: Black hole (SCENES.md #30). Particles under an inverse-square pull
// with drag spiral in; a grid is bent toward the hole; the hole can be dragged.

import { createCanvas } from '../../engine/canvas';
import { createPointer } from '../../engine/pointer';
import { frameFactor } from '../../engine/time';
import { Batch, glowStroke } from '../../kits/render';
import type { Theme } from '../../theme/worlds';
import { SHARED } from '../shared';
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
  const batch = new Batch(SHARED.INKS);

  let pos = new Float32Array(0);
  let vel = new Float32Array(0);
  let count = 0;
  let next = 0;
  const hole = { x: 0, y: 0 };
  let placed = false;
  let pressT = 0;
  let lastPress = 0;
  let settled = false;

  /** Sideways (orbiting) velocity for particle i at its current spot. */
  function orbit(i: number): void {
    const dx = pos[2 * i]! - hole.x;
    const dy = pos[2 * i + 1]! - hole.y;
    const r = Math.hypot(dx, dy) || 1;
    const s = (n('spin') * Math.sqrt((n('pull') * n('mass')) / r)) / r;
    vel[2 * i] = -dy * s;
    vel[2 * i + 1] = dx * s;
  }

  function respawn(i: number): void {
    const a = Math.random() * SHARED.TAU;
    const d = (Math.hypot(c.w, c.h) / 2) * (1 + Math.random() * n('spawnSpread'));
    pos[2 * i] = hole.x + Math.cos(a) * d;
    pos[2 * i + 1] = hole.y + Math.sin(a) * d;
    orbit(i);
  }

  function build(): void {
    const small = c.w < SHARED.SMALL_SCREEN;
    const scale = ctx.quality === 'preview' ? SHARED.PREVIEW_SCALE : 1;
    count = Math.round((small ? n('particlesSmall') : n('particles')) * scale);
    pos = new Float32Array(count * 2);
    vel = new Float32Array(count * 2);
    next = 0;
    for (let i = 0; i < count; i++) {
      pos[2 * i] = Math.random() * c.w;
      pos[2 * i + 1] = Math.random() * c.h;
      orbit(i);
    }
  }

  function physics(f: number): void {
    const g = n('pull') * n('mass');
    const d = n('drag') ** f;
    const R = n('horizon');
    const far = Math.hypot(c.w, c.h);
    for (let i = 0; i < count; i++) {
      const dx = hole.x - pos[2 * i]!;
      const dy = hole.y - pos[2 * i + 1]!;
      const r = Math.hypot(dx, dy) || 1;
      const k = (g / (r * r * r)) * f;
      vel[2 * i] = (vel[2 * i]! + dx * k) * d;
      vel[2 * i + 1] = (vel[2 * i + 1]! + dy * k) * d;
      pos[2 * i] += vel[2 * i]! * f;
      pos[2 * i + 1] += vel[2 * i + 1]! * f;
      const nr = Math.hypot(hole.x - pos[2 * i]!, hole.y - pos[2 * i + 1]!);
      if (nr < R || nr > far) respawn(i);
    }
  }

  /** A grid point pulled toward the hole (never past its center). */
  function bend(x: number, y: number, out: number[]): void {
    const dx = hole.x - x;
    const dy = hole.y - y;
    const d = Math.hypot(dx, dy);
    const R = n('horizon');
    const s = d ? Math.min(d, (n('lens') * n('mass') * R * R) / (d + R)) / d : 0;
    out[0] = x + dx * s;
    out[1] = y + dy * s;
  }

  function drawGrid(g: CanvasRenderingContext2D): void {
    const a = n('gridAlpha');
    if (a <= 0) return;
    const sp = n('grid');
    const step = sp / n('gridDetail');
    const path = new Path2D();
    const q = [0, 0];
    const line = (vertical: boolean, at: number, len: number) => {
      for (let t = -sp, first = true; t <= len + sp; t += step, first = false) {
        if (vertical) bend(at, t, q);
        else bend(t, at, q);
        if (first) path.moveTo(q[0]!, q[1]!);
        else path.lineTo(q[0]!, q[1]!);
      }
    };
    const lines = (size: number) => {
      const out: number[] = [];
      const k0 = Math.ceil((-sp - size / 2) / sp);
      for (let k = k0; size / 2 + k * sp <= size + sp; k++) out.push(size / 2 + k * sp);
      return out;
    };
    for (const x of lines(c.w)) line(true, x, c.h);
    for (const y of lines(c.h)) line(false, y, c.w);
    g.globalAlpha = a;
    g.strokeStyle = theme.inkSoft;
    g.lineWidth = 1;
    g.stroke(path);
    g.globalAlpha = 1;
  }

  function draw(): void {
    const g = c.ctx;
    c.clear();
    drawGrid(g);
    const R = n('horizon');
    const inner = (n('bandInner') * R) ** 2;
    const outer = (n('bandOuter') * R) ** 2;
    const st = n('streak');
    batch.reset();
    for (let i = 0; i < count; i++) {
      const x = pos[2 * i]!;
      const y = pos[2 * i + 1]!;
      const r2 = (x - hole.x) ** 2 + (y - hole.y) ** 2;
      const k = r2 < inner ? 0 : r2 < outer ? 1 : 2;
      batch.line(k, x - vel[2 * i]! * st, y - vel[2 * i + 1]! * st, x, y);
    }
    g.lineCap = 'round';
    g.globalCompositeOperation = theme.blend;
    batch.stroke(g, [theme.c1, theme.c2, theme.c3], n('particleSize'));
    g.globalCompositeOperation = 'source-over';
    const disk = new Path2D();
    disk.arc(hole.x, hole.y, R, 0, SHARED.TAU);
    g.fillStyle = theme.ground;
    g.fill(disk);
    if (theme.blend === 'lighter')
      glowStroke(
        g,
        disk,
        theme.c1,
        theme.c1,
        n('ringWidth'),
        FIXED.GLOW_LAYERS,
        FIXED.GLOW_SPREAD,
        FIXED.GLOW_STRENGTH,
      );
    else {
      g.strokeStyle = theme.c1;
      g.lineWidth = n('ringWidth');
      g.stroke(disk);
    }
  }

  return {
    resize() {
      // Only a real size change rebuilds (the engine also calls this when the font loads).
      if (!c.fit()) return;
      if (!placed) {
        hole.x = c.w / 2;
        hole.y = c.h / 2;
        placed = true;
      }
      hole.x = Math.min(hole.x, c.w);
      hole.y = Math.min(hole.y, c.h);
      build();
      settled = false;
    },
    update(dt) {
      const f = frameFactor(dt);
      ptr.sync();
      pressT = ptr.down ? pressT + dt : 0;
      if (ptr.down) lastPress = pressT;
      for (const tap of ptr.takeTaps()) {
        if (lastPress >= FIXED.HOLD_S) continue;
        const v = n('burstSpeed');
        for (let j = 0; j < n('burst'); j++) {
          const i = next;
          next = (next + 1) % count;
          const a = Math.random() * SHARED.TAU;
          const s = Math.random() * v;
          pos[2 * i] = tap.x;
          pos[2 * i + 1] = tap.y;
          vel[2 * i] = Math.cos(a) * s;
          vel[2 * i + 1] = Math.sin(a) * s;
        }
      }
      if (!ptr.down) lastPress = 0;
      const held = ptr.dragging && pressT >= FIXED.HOLD_S;
      if (held || (p.follow && ptr.active)) {
        const k = 1 - (1 - n('holeFollow')) ** f;
        hole.x += (ptr.x - hole.x) * k;
        hole.y += (ptr.y - hole.y) * k;
      }
      physics(f);
      draw();
    },
    still() {
      ptr.takeTaps();
      if (!settled) {
        hole.x = c.w / 2;
        hole.y = c.h / 2;
        build();
        for (let i = 0; i < FIXED.STILL_FRAMES; i++) physics(1);
        settled = true;
      }
      draw();
    },
    setParams(nextParams) {
      const rebuild = params.some((q) => q.rebuild && nextParams[q.id] !== p[q.id]);
      p = { ...nextParams };
      if (rebuild && c.w) build();
      settled = false;
    },
    setTheme(t) {
      theme = t;
    },
    restart() {
      hole.x = c.w / 2;
      hole.y = c.h / 2;
      build();
    },
    destroy() {
      ptr.destroy();
      c.destroy();
      count = 0;
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
