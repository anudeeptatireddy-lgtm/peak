// `doubling`: Doubling (SCENES.md #85). Slots sampled from the name, ordered by how far
// up their column they are; step k shows the first c(k) of them as a bar chart standing
// on the table, and the last step puts every coin on its own slot. Each coin of step
// k + 1 splits off a coin of step k, spinning as it slides; landings sway the stacks.

import { cursorSweep } from '../../kits/cursor';
import { createCanvas } from '../../engine/canvas';
import { fontsReady } from '../../engine/fonts';
import { innerScroller } from '../../engine/inner-scroll';
import { createPointer } from '../../engine/pointer';
import { addScrollSource } from '../../engine/scheduler';
import { createScrollSource } from '../../engine/scroll';
import { frameFactor } from '../../engine/time';
import { smoothstep } from '../../kits/easing';
import { applyFont, textMask } from '../../kits/text';
import { ensureContrast, mixOklab } from '../../theme/color';
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
  const inner =
    host.dataset.innerScroll === 'true'
      ? innerScroller(host, {
          screens: FIXED.INNER_SCREENS,
          low: FIXED.RECENTER_LOW,
          high: FIXED.RECENTER_HIGH,
        })
      : null;
  // Follow cursor: a sideways mouse sweep counts as scrolling (off by default).
  const sweep = cursorSweep(host, inner ? inner.source : createScrollSource(), {
    on: () => !!p.cursor,
    px: () => Number(p.cursorSweep),
  });
  const source = sweep.source;
  const removeSource = addScrollSource(source);
  let fontsOk = false;
  let stillShown = false;
  let lastScroll: number | null = null;

  let steps = 0;
  /** Coin positions per step: xs[k][i], ys[k][i] for i < c(k). */
  let xs: Float32Array[] = [];
  let ys: Float32Array[] = [];
  let tableY = 0;
  let tableL = 0;
  let tableR = 0;
  let thick = 1;
  let tallest = 1;
  let edgeInk = '';
  let textInk = '';

  let goal = 0;
  let cur = 0;
  let landed = 0;
  let sway = 0;
  let swayV = 0;
  let quiet = 0;
  let idleT = 0;
  let held = 0;

  function inks(): void {
    edgeInk = mixOklab(theme.c1, theme.ink, FIXED.EDGE_MIX);
    textInk = ensureContrast(theme.ink, theme.ground, FIXED.CONTRAST);
  }

  /** Slot columns of the name at a given scale of the font. */
  function sample(scale: number): { x: number; y: number[] }[] {
    const w = c.w;
    const h = c.h;
    const { data } = textMask(w, h, String(p.text || ' '), {
      heightShare: n('textHeight') * scale,
      fitShare: n('fitWidth') * scale,
      weight: n('weight'),
      centerY: FIXED.NAME_Y,
    });
    const W = Math.round(w);
    const H = Math.round(h);
    const gx = n('coinSize') * FIXED.X_GAP;
    const cols: { x: number; y: number[] }[] = [];
    for (let x = gx * 0.5; x < w; x += gx) {
      const col: number[] = [];
      for (let y = thick * 0.5; y < h; y += thick) {
        const i = (Math.min(H - 1, Math.floor(y)) * W + Math.floor(x)) * SHARED.RGBA;
        if (data[i + SHARED.RGBA - 1]! > FIXED.ALPHA_CUTOFF) col.push(y);
      }
      if (col.length) cols.push({ x, y: col });
    }
    return cols;
  }

  function layout(): void {
    inks();
    if (!fontsOk || !c.w) return;
    const small = c.w < SHARED.SMALL_SCREEN;
    steps = small ? n('doublingsSmall') : n('doublings');
    thick = n('coinSize') * n('thickness');
    const target = 2 ** steps;
    let scale = 1;
    let cols = sample(scale);
    let count = cols.reduce((s, col) => s + col.y.length, 0);
    for (let t = 0; t < FIXED.SHRINK_TRIES && count > target; t++) {
      scale *= Math.sqrt(target / count) * FIXED.SHRINK_MARGIN;
      cols = sample(scale);
      count = cols.reduce((s, col) => s + col.y.length, 0);
    }
    // Every slot, ordered by how far up its column it is, then by column.
    const slots: { col: number; x: number; y: number; rank: number }[] = [];
    cols.forEach((col, j) => {
      const m = col.y.length;
      // Bottom slot first: level 0 is the largest y.
      [...col.y]
        .reverse()
        .forEach((y, level) => slots.push({ col: j, x: col.x, y, rank: (level + 0.5) / m }));
    });
    slots.sort((a, b) => a.rank - b.rank || a.col - b.col);
    const M = slots.length;
    tableY = Math.max(0, ...slots.map((s) => s.y)) + thick * FIXED.TABLE_GAP;
    tableL = Math.min(c.w, ...slots.map((s) => s.x)) - n('coinSize');
    tableR = Math.max(0, ...slots.map((s) => s.x)) + n('coinSize');
    tallest = Math.max(thick, ...slots.map((s) => tableY - s.y));
    xs = [];
    ys = [];
    for (let k = 0; k <= steps; k++) {
      const ck = Math.max(1, Math.round(M ** (k / steps)));
      const x = new Float32Array(ck);
      const y = new Float32Array(ck);
      const height = new Map<number, number>();
      for (let i = 0; i < ck; i++) {
        const s = slots[Math.min(i, M - 1)]!;
        x[i] = s.x;
        if (k === steps) y[i] = s.y;
        else {
          const level = height.get(s.col) ?? 0;
          height.set(s.col, level + 1);
          y[i] = tableY - thick * (level + 1);
        }
      }
      xs.push(x);
      ys.push(y);
    }
    goal = Math.min(goal, steps);
    cur = Math.min(cur, steps);
  }

  fontsReady().then(() => {
    fontsOk = true;
    layout();
    if (stillShown) draw(steps, 0);
  });

  function draw(at: number, swing: number): void {
    const g = c.ctx;
    c.clear();
    if (!xs.length) return;
    const k = Math.min(steps - 1, Math.floor(at));
    const u = smoothstep(0, 1, at - k);
    const from = { x: xs[k]!, y: ys[k]! };
    const to = { x: xs[k + 1]!, y: ys[k + 1]! };
    const size = n('coinSize');
    const face = size * FIXED.TILT;
    const lift = n('arc') * c.h * Math.sin(Math.PI * u);
    const turn = Math.max(FIXED.MIN_WIDTH, Math.abs(Math.cos(Math.PI * n('spin') * u)));
    const sway0 = n('wobble') * FIXED.WOBBLE_SHARE * size * swing;
    // One edge path and one face path per stack level, drawn bottom up.
    const levels = Math.ceil(tallest / thick) + 2;
    const edges = Array.from({ length: levels }, () => new Path2D());
    const faces = Array.from({ length: levels }, () => new Path2D());
    const high = p.quality === 'high';
    const ratio = from.x.length / to.x.length;
    for (let i = 0; i < to.x.length; i++) {
      const j = Math.floor(i * ratio);
      const y0 = from.y[j]!;
      const y1 = to.y[i]!;
      const above = tableY - (y0 + (y1 - y0) * u);
      const y = tableY - above - lift;
      const x = from.x[j]! + (to.x[i]! - from.x[j]!) * u + sway0 * (above / tallest);
      const rx = size * 0.5 * turn;
      const level = Math.max(0, Math.min(levels - 1, Math.round(above / thick)));
      if (high) {
        const e = edges[level]!;
        e.rect(x - rx, y, rx * 2, thick);
        e.moveTo(x + rx, y + thick);
        e.ellipse(x, y + thick, rx, face * 0.5, 0, 0, Math.PI);
      }
      const fpath = faces[level]!;
      fpath.moveTo(x + rx, y);
      fpath.ellipse(x, y, rx, face * 0.5, 0, 0, SHARED.TAU);
    }
    g.strokeStyle = theme.line;
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(tableL, tableY + face * 0.5);
    g.lineTo(tableR, tableY + face * 0.5);
    g.stroke();
    for (let l = 0; l < levels; l++) {
      if (high) {
        g.fillStyle = edgeInk;
        g.fill(edges[l]!);
      }
      g.fillStyle = theme.c1;
      g.fill(faces[l]!);
    }
    // The counter eases with the steps.
    const value = Math.round(2 ** at).toLocaleString('en-US');
    const style = String(p.counter);
    const label = style === 'money' ? `$${value}` : style === 'times' ? `×${value}` : value;
    applyFont(g, { size: c.h * FIXED.COUNTER_SIZE, weight: FIXED.COUNTER_WEIGHT });
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillStyle = textInk;
    g.fillText(label, c.w * 0.5, c.h * FIXED.COUNTER_Y);
  }

  return {
    resize() {
      if (!c.fit()) return;
      layout();
    },
    update(dt) {
      stillShown = false;
      const f = frameFactor(dt);
      ptr.sync();
      ptr.takeTaps();
      const pos = source.read();
      const scrolled = lastScroll === null ? 0 : pos - lastScroll;
      lastScroll = pos;
      let moved = scrolled / n('scrub');
      if (ptr.down && ptr.pointerType !== 'mouse') moved += (ptr.x - ptr.px) / n('scrub');
      if (moved) {
        goal = Math.min(steps, Math.max(0, goal + moved));
        quiet = idleT = held = 0;
      } else {
        quiet += dt;
        if (quiet >= n('idleWait')) {
          if (Math.floor(goal) < steps) {
            idleT += dt;
            if (idleT >= n('idleStep')) [goal, idleT] = [Math.floor(goal) + 1, 0];
          } else if (cur >= steps) {
            held += dt;
            if (held >= n('idleHold')) [goal, held] = [0, 0];
          }
        }
      }
      const target = Math.min(steps, Math.floor(goal));
      const step = dt / n('splitSpeed');
      cur = cur < target ? Math.min(target, cur + step) : Math.max(target, cur - step);
      if (cur === target && target !== landed) {
        landed = target;
        swayV += 1;
      }
      swayV += -sway * FIXED.WOBBLE_K * f;
      swayV *= n('settle') ** f;
      sway += swayV * f;
      draw(cur, sway);
    },
    still() {
      stillShown = true;
      ptr.takeTaps();
      draw(steps, 0);
    },
    setParams(next) {
      p = { ...next };
      layout();
      if (stillShown) draw(steps, 0);
    },
    setTheme(th) {
      theme = th;
      inks();
      if (stillShown) draw(steps, 0);
    },
    restart() {
      goal = cur = landed = sway = swayV = quiet = idleT = held = 0;
    },
    destroy() {
      sweep.destroy();
      ptr.destroy();
      removeSource();
      inner?.el.remove();
      c.destroy();
      xs = [];
      ys = [];
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
