// `tailor`: Tailor's cut (SCENES.md #52, gallery only). A cloth sheet of Verlet points hangs
// from a pinned top row; a chalk line is drawn, shears snip along it (links between the
// halves are removed), the top half lifts away and the bottom half falls.

import { createCanvas } from '../../engine/canvas';
import { fontsReady } from '../../engine/fonts';
import { createPointer } from '../../engine/pointer';
import { frameFactor } from '../../engine/time';
import { smoothstep } from '../../kits/easing';
import { satisfy, verletMove, vpoint, type Stick, type VPoint } from '../../kits/physics';
import { mixOklab } from '../../theme/color';
import { applyFont } from '../../kits/text';
import type { Theme } from '../../theme/worlds';
import { SHARED } from '../shared';
import type { Params, SceneContext, SceneInstance, SceneModule } from '../types';
import { FIXED } from './constants';
import { meta } from './meta';
import { params } from './params';
import { followUps } from './prompt';

const SHADE_HALF = 0.5;

interface Thread {
  pts: VPoint[];
  sticks: Stick[];
}

function create(host: HTMLElement, initial: Params, ctx: SceneContext): SceneInstance {
  let p = { ...initial };
  const n = (id: string) => Number(p[id]);
  let theme: Theme = ctx.theme;
  const c = createCanvas(host);
  const ptr = createPointer(host);

  let pts: VPoint[] = [];
  let links: Stick[] = [];
  let top: boolean[] = [];
  let cols = 0;
  let rows = 0;
  let cell = 0;
  let cutRow: number[] = [];
  let time = 0;
  let cutFront = -1;
  let lastBite = -1;
  let finishedAt = -1;
  let lift = FIXED.LIFT_START;
  let lifting = false;
  let threads: Thread[] = [];
  let left = 0;
  let restArea = 1;
  let lastX = 0;
  let placed = false;

  const cutStart = () => FIXED.START_DELAY + n('chalkTime');
  const gravity = () =>
    FIXED.GRAVITY_LIGHT + (FIXED.GRAVITY_HEAVY - FIXED.GRAVITY_LIGHT) * n('weight');
  const drag = () => FIXED.DRAG_LIGHT + (FIXED.DRAG_HEAVY - FIXED.DRAG_LIGHT) * n('weight');

  function build(): void {
    cols = c.w < SHARED.SMALL_SCREEN ? FIXED.COLS_SMALL : FIXED.COLS;
    const sw = c.w * FIXED.SHEET_W;
    cell = sw / (cols - 1);
    rows = Math.max(2, Math.round((c.h * FIXED.SHEET_H) / cell) + 1);
    left = (c.w - sw) * 0.5;
    const topY = (c.h - (rows - 1) * cell) * 0.5;
    restArea = cell * cell;
    pts = [];
    links = [];
    for (let j = 0; j < rows; j++)
      for (let i = 0; i < cols; i++) pts.push(vpoint(left + i * cell, topY + j * cell, j === 0));
    for (let j = 0; j < rows; j++)
      for (let i = 0; i < cols; i++) {
        const k = j * cols + i;
        if (i < cols - 1) links.push({ a: k, b: k + 1, len: cell, stiffness: 1 });
        if (j < rows - 1) links.push({ a: k, b: k + cols, len: cell, stiffness: 1 });
      }
    const base = Math.round(rows * n('cutHeight'));
    cutRow = Array.from({ length: cols }, (_, i) => {
      const u = i / (cols - 1);
      if (p.cutPath === 'wavy')
        return (
          base + Math.round(rows * FIXED.WAVE_AMP * Math.sin(SHARED.TAU * FIXED.WAVE_CYCLES * u))
        );
      if (p.cutPath === 'diagonal') return base + Math.round(rows * FIXED.DIAG * (2 * u - 1));
      return base;
    }).map((j) => Math.max(1, Math.min(rows - 2, j)));
    top = pts.map((_, k) => Math.floor(k / cols) <= cutRow[k % cols]!);
    time = 0;
    cutFront = -1;
    lastBite = -1;
    finishedAt = -1;
    lift = FIXED.LIFT_START;
    lifting = false;
    threads = [];
    placed = true;
  }

  /** How far (in columns) the shears have got at time t, in short bites. */
  function front(t: number): number {
    const u = Math.min(1, Math.max(0, (t - cutStart()) / n('cutSpeed')));
    if (u <= 0) return -1;
    const b = u * n('bites');
    const k = Math.min(n('bites') - 1, Math.floor(b));
    const within = Math.min(1, (b - k) / FIXED.BITE_MOVE);
    const prog = u >= 1 ? 1 : (k + smoothstep(0, 1, within)) / n('bites');
    return prog * (cols - 1);
  }

  function snip(): void {
    const t = time;
    const f = front(t);
    const bite = Math.min(
      n('bites') - 1,
      Math.floor(((t - cutStart()) / n('cutSpeed')) * n('bites')),
    );
    if (f >= 0 && bite !== lastBite && t - cutStart() < n('cutSpeed')) {
      lastBite = bite;
      for (let k = 0; k < pts.length; k++) {
        const col = k % cols;
        if (Math.abs(col - f) <= FIXED.BUNCH_CELLS && !pts[k]!.pinned) pts[k]!.y += FIXED.BUNCH;
      }
    }
    if (f > cutFront) {
      cutFront = f;
      for (const l of links) {
        if (l.broken || top[l.a] === top[l.b]) continue;
        if (Math.min(l.a % cols, l.b % cols) <= f) l.broken = true;
      }
    }
    if (finishedAt < 0 && t >= cutStart() + n('cutSpeed')) {
      finishedAt = t;
      for (let i = 0; i < Math.round(n('threads')); i++) {
        const col = Math.floor(Math.random() * cols);
        const o = pts[cutRow[col]! * cols + col]!;
        const chain = Array.from({ length: FIXED.THREAD_POINTS }, (_, s) =>
          vpoint(o.x, o.y + (s + 1) * FIXED.THREAD_SEG),
        );
        threads.push({
          pts: chain,
          sticks: chain
            .slice(1)
            .map((_, s) => ({ a: s, b: s + 1, len: FIXED.THREAD_SEG, stiffness: 1 })),
        });
      }
    }
    if (!lifting && finishedAt >= 0 && t >= finishedAt + FIXED.HOLD) lifting = true;
  }

  function physics(dt: number, f: number): void {
    time += dt;
    const sway = FIXED.SWAY * f * f;
    pts.forEach((q, k) => {
      if (q.pinned) return;
      const i = k % cols;
      const j = Math.floor(k / cols);
      q.x += sway * Math.sin(time * FIXED.SWAY_RATE - (i + j) * FIXED.SWAY_STEP);
    });
    if (n('breeze') > 0 && finishedAt < 0 && time < cutStart() && ptr.active) {
      const push = (ptr.x - lastX) * n('breeze');
      for (const q of pts) {
        if (q.pinned) continue;
        const d = Math.hypot(q.x - ptr.x, q.y - ptr.y);
        if (d < FIXED.BREEZE_R) q.x += push * (1 - d / FIXED.BREEZE_R);
      }
    }
    lastX = ptr.x;
    if (lifting) {
      for (let i = 0; i < cols; i++) pts[i]!.y -= lift * f;
      lift += FIXED.LIFT_ACC * f;
    }
    verletMove(pts, gravity(), drag(), f);
    satisfy(pts, links, FIXED.ITER);
    snip();
    for (const th of threads) {
      verletMove(th.pts, FIXED.THREAD_G, FIXED.THREAD_DRAG, f);
      satisfy(th.pts, th.sticks, FIXED.ITER);
    }
  }

  function text(): void {
    const g = c.ctx;
    const label = String(p.text || ' ');
    const size = Math.min(
      c.h * FIXED.TEXT_SIZE,
      (c.w * FIXED.TEXT_FIT) / Math.max(1, label.length) / FIXED.TEXT_EM,
    );
    applyFont(g, { size, weight: FIXED.TEXT_WEIGHT }, SHARED.PERCENT);
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillStyle = theme.ink;
    g.fillText(label, c.w * 0.5, c.h * 0.5);
  }

  function draw(): void {
    const g = c.ctx;
    c.clear();
    text();
    if (!placed) return;
    const paths = Array.from({ length: FIXED.SHADES }, () => new Path2D());
    for (let j = 0; j < rows - 1; j++)
      for (let i = 0; i < cols - 1; i++) {
        const k = j * cols + i;
        if (top[k] !== top[k + 1] || top[k] !== top[k + cols] || top[k] !== top[k + cols + 1])
          continue;
        const a = pts[k]!;
        const b = pts[k + 1]!;
        const d = pts[k + cols + 1]!;
        const e = pts[k + cols]!;
        if (
          Math.min(a.y, b.y, d.y, e.y) > c.h + FIXED.MARGIN ||
          Math.max(a.y, b.y, d.y, e.y) < -FIXED.MARGIN
        )
          continue;
        const area = Math.abs((b.x - a.x) * (e.y - a.y) - (b.y - a.y) * (e.x - a.x)) / restArea;
        const squeeze = Math.min(1, Math.max(0, 1 - area) * 2 * n('fold'));
        const shade = Math.min(FIXED.SHADES - 1, Math.floor(squeeze * FIXED.SHADES));
        const path = paths[shade]!;
        path.moveTo(a.x, a.y);
        path.lineTo(b.x, b.y);
        path.lineTo(d.x, d.y);
        path.lineTo(e.x, e.y);
        path.closePath();
      }
    paths.forEach((path, s) => {
      g.fillStyle = mixOklab(theme.c1, theme.ink, s / (FIXED.SHADES - 1));
      g.fill(path);
      g.strokeStyle = g.fillStyle;
      g.lineWidth = 1;
      g.stroke(path);
    });
    if (p.pattern !== 'plain') {
      g.strokeStyle = mixOklab(theme.c1, theme.ground, FIXED.STRIPE_MIX);
      g.lineWidth = 1;
      g.beginPath();
      for (let i = 0; i < cols; i += FIXED.STRIPE_EVERY)
        for (let j = 0; j < rows - 1; j++) {
          const k = j * cols + i;
          if (top[k] !== top[k + cols]) continue;
          g.moveTo(pts[k]!.x, pts[k]!.y);
          g.lineTo(pts[k + cols]!.x, pts[k + cols]!.y);
        }
      if (p.pattern === 'check')
        for (let j = 0; j < rows; j += FIXED.STRIPE_EVERY)
          for (let i = 0; i < cols - 1; i++) {
            const k = j * cols + i;
            if (top[k] !== top[k + 1]) continue;
            g.moveTo(pts[k]!.x, pts[k]!.y);
            g.lineTo(pts[k + 1]!.x, pts[k + 1]!.y);
          }
      g.stroke();
    }
    chalkAndShears();
    g.strokeStyle = mixOklab(theme.c1, theme.ink, SHADE_HALF);
    g.lineWidth = 1;
    g.beginPath();
    for (const th of threads) {
      g.moveTo(th.pts[0]!.x, th.pts[0]!.y);
      for (const q of th.pts) g.lineTo(q.x, q.y);
    }
    g.stroke();
  }

  function chalkAndShears(): void {
    const g = c.ctx;
    const drawn = Math.min(1, Math.max(0, (time - FIXED.START_DELAY) / n('chalkTime')));
    if (drawn > 0 && finishedAt < 0) {
      const upTo = Math.floor(drawn * (cols - 1));
      const from = Math.max(0, Math.ceil(cutFront));
      g.save();
      g.setLineDash([FIXED.DASH, FIXED.DASH_GAP]);
      g.strokeStyle = theme.ground;
      g.globalAlpha = FIXED.CHALK_ALPHA;
      g.lineWidth = FIXED.CHALK;
      g.beginPath();
      for (let i = from; i <= upTo; i++) {
        const q = pts[cutRow[i]! * cols + i]!;
        if (i === from) g.moveTo(q.x, q.y);
        else g.lineTo(q.x, q.y);
      }
      g.stroke();
      g.restore();
    }
    if (cutFront >= 0 && finishedAt < 0) {
      const i = Math.min(cols - 1, Math.floor(cutFront));
      const q = pts[cutRow[i]! * cols + i]!;
      const next = pts[cutRow[Math.min(cols - 1, i + 1)]! * cols + Math.min(cols - 1, i + 1)]!;
      const ang = Math.atan2(next.y - q.y, next.x - q.x);
      const open = FIXED.SHEAR_OPEN * (0.5 + 0.5 * Math.cos(cutFront * 2));
      g.save();
      g.translate(q.x, q.y);
      g.rotate(ang);
      g.fillStyle = theme.ink;
      for (const s of [-1, 1]) {
        g.save();
        g.rotate(s * open * 0.5);
        g.beginPath();
        g.moveTo(-FIXED.SHEAR_LEN, 0);
        g.lineTo(0, -FIXED.CHALK);
        g.lineTo(0, FIXED.CHALK);
        g.closePath();
        g.fill();
        g.restore();
      }
      g.restore();
    }
  }

  fontsReady().then(() => {
    if (c.w) draw();
  });

  return {
    resize() {
      if (c.fit() || !placed) build();
      draw();
    },
    update(dt) {
      ptr.sync();
      ptr.takeTaps();
      physics(dt, frameFactor(dt));
      draw();
    },
    still() {
      ptr.takeTaps();
      build();
      const stop = cutStart() + n('cutSpeed') + FIXED.HOLD + FIXED.STILL_AFTER;
      const step = 1 / SHARED.FPS;
      while (time < stop) physics(step, 1);
      draw();
    },
    setParams(next) {
      const rebuild =
        next.cutPath !== p.cutPath || next.cutHeight !== p.cutHeight || next.weight !== p.weight;
      p = { ...next };
      if (rebuild && c.w) build();
      if (c.w) draw();
    },
    setTheme(t) {
      theme = t;
    },
    restart() {
      if (c.w) build();
    },
    destroy() {
      ptr.destroy();
      c.destroy();
      pts = [];
      links = [];
      threads = [];
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
