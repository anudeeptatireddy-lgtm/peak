// `cloth`: Tearable cloth (SCENES.md #28). Verlet points joined by breakable
// links, pinned to a rail; one point can be grabbed and dragged.

import { createCanvas } from '../../engine/canvas';
import { createPointer } from '../../engine/pointer';
import { frameFactor } from '../../engine/time';
import { satisfy, verletMove, vpoint, type Stick, type VPoint } from '../../kits/physics';
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

  let pts: VPoint[] = [];
  let links: Stick[] = [];
  let cols = 0;
  let rows = 0;
  let railPins: VPoint[] = [];
  let rail = { x0: 0, x1: 0, y: 0 };
  let time = 0;
  let held: { q: VPoint; dx: number; dy: number }[] = [];
  let wasDragging = false;
  let wasDown = false;
  let press = { x: 0, y: 0, moved: false };
  let lastTap: { t: number; x: number; y: number } | null = null;
  let settled = false;

  function pinned(i: number): boolean {
    if (p.pins === 'all') return true;
    if (i === 0 || i === cols - 1) return true;
    return p.pins === 'every4' && i % FIXED.PIN_EVERY === 0;
  }

  function build(): void {
    cols = c.w < SHARED.SMALL_SCREEN ? n('detailSmall') : n('detail');
    const sw = c.w * n('sheetWidth');
    const s = sw / (cols - 1);
    rows = Math.max(FIXED.MIN_ROWS, Math.round((c.h * n('sheetHeight')) / s) + 1);
    rail = { x0: (c.w - sw) / 2, x1: (c.w + sw) / 2, y: c.h * n('railY') };
    pts = [];
    links = [];
    for (let j = 0; j < rows; j++)
      for (let i = 0; i < cols; i++)
        pts.push(vpoint(rail.x0 + i * s, rail.y + j * s, j === 0 && pinned(i)));
    for (let j = 0; j < rows; j++)
      for (let i = 0; i < cols; i++) {
        const k = j * cols + i;
        if (i < cols - 1) links.push({ a: k, b: k + 1, len: s, stiffness: 1 });
        if (j < rows - 1) links.push({ a: k, b: k + cols, len: s, stiffness: 1 });
      }
    for (const l of links) l.tearAt = n('tear');
    railPins = pts.filter((q) => q.pinned);
    held = [];
    time = 0;
  }

  function physics(f: number): void {
    verletMove(pts, n('gravity'), n('drag'), f);
    const push = n('wind') * n('windForce') * f * f;
    const ws = n('windSpeed');
    const wr = n('windRipple');
    if (push)
      for (let k = 0; k < pts.length; k++) {
        const q = pts[k]!;
        if (q.pinned) continue;
        q.x += push * Math.sin(time * ws - ((k % cols) + Math.floor(k / cols)) * wr);
      }
    for (const h of held) {
      h.q.px = h.q.x;
      h.q.py = h.q.y;
      h.q.x = ptr.x + h.dx;
      h.q.y = ptr.y + h.dy;
    }
    satisfy(pts, links, n('stiffness'));
  }

  function grab(): void {
    const r2 = n('grabRadius') ** 2;
    for (const q of pts) {
      const dx = q.x - ptr.x;
      const dy = q.y - ptr.y;
      if (q.pinned || dx * dx + dy * dy > r2) continue;
      q.pinned = true;
      held.push({ q, dx, dy });
    }
  }

  function release(): void {
    for (const h of held) h.q.pinned = false;
    held = [];
  }

  function draw(): void {
    const g = c.ctx;
    c.clear();
    const inks = [theme.c1, theme.c2, theme.c3];
    const span = n('tear') - 1;
    const paths = inks.map(() => new Path2D());
    for (const l of links) {
      if (l.broken) continue;
      const a = pts[l.a]!;
      const b = pts[l.b]!;
      const share = (Math.hypot(b.x - a.x, b.y - a.y) / l.len - 1) / span;
      const k = Math.min(SHARED.INKS - 1, Math.max(0, Math.floor(share * SHARED.INKS)));
      paths[k]!.moveTo(a.x, a.y);
      paths[k]!.lineTo(b.x, b.y);
    }
    g.lineCap = 'round';
    g.lineWidth = n('lineWidth');
    paths.forEach((path, k) => {
      g.strokeStyle = inks[k]!;
      g.stroke(path);
    });
    g.strokeStyle = theme.inkSoft;
    g.lineWidth = n('railWidth');
    g.beginPath();
    g.moveTo(rail.x0, rail.y);
    g.lineTo(rail.x1, rail.y);
    g.stroke();
    const r = n('pinSize');
    if (r > 0) {
      g.fillStyle = theme.ink;
      g.beginPath();
      for (const q of railPins) {
        g.moveTo(q.x + r, q.y);
        g.arc(q.x, q.y, r, 0, SHARED.TAU);
      }
      g.fill();
    }
  }

  function taps(): void {
    const dist = Math.hypot(ptr.x - press.x, ptr.y - press.y);
    if (ptr.down && !wasDown) press = { x: ptr.x, y: ptr.y, moved: false };
    else if (ptr.down && dist > FIXED.DOUBLE_TAP_PX) press.moved = true;
    wasDown = ptr.down;
    for (const tap of ptr.takeTaps()) {
      if (press.moved) {
        lastTap = null;
        continue;
      }
      if (
        lastTap &&
        time - lastTap.t <= FIXED.DOUBLE_TAP_S &&
        Math.hypot(tap.x - lastTap.x, tap.y - lastTap.y) <= FIXED.DOUBLE_TAP_PX
      ) {
        lastTap = null;
        build();
        return;
      }
      lastTap = { t: time, x: tap.x, y: tap.y };
    }
  }

  return {
    resize() {
      // Only a real size change rebuilds (the engine also calls this when the font loads).
      if (!c.fit()) return;
      build();
      settled = false;
    },
    update(dt) {
      time += dt;
      ptr.sync();
      taps();
      if (ptr.dragging && !wasDragging) grab();
      if (!ptr.dragging && held.length) release();
      wasDragging = ptr.dragging;
      physics(frameFactor(dt));
      draw();
    },
    still() {
      ptr.takeTaps();
      if (!settled) {
        release();
        build();
        for (let i = 0; i < FIXED.STILL_FRAMES; i++) {
          physics(1);
          time += 1 / SHARED.FPS;
        }
        settled = true;
      }
      draw();
    },
    setParams(next) {
      const rebuild = params.some((q) => q.rebuild && next[q.id] !== p[q.id]);
      p = { ...next };
      for (const l of links) l.tearAt = n('tear');
      if (rebuild && c.w) {
        build();
        settled = false;
      }
    },
    setTheme(t) {
      theme = t;
    },
    restart() {
      build();
      settled = false;
    },
    destroy() {
      ptr.destroy();
      c.destroy();
      pts = [];
      links = [];
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
