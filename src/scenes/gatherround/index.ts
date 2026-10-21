// `gatherround`: Gather Round (SCENES.md #87). Spots sampled from the name; people walk
// in from random edges in a shuffled order, steering toward their spot along bent paths
// and pushing apart through a spatial hash; scrolling sets how many are on their way.

import { cursorSweep } from '../../kits/cursor';
import { createCanvas } from '../../engine/canvas';
import { fontsReady } from '../../engine/fonts';
import { innerScroller } from '../../engine/inner-scroll';
import { createPointer } from '../../engine/pointer';
import { addScrollSource } from '../../engine/scheduler';
import { createScrollSource } from '../../engine/scroll';
import { ease, frameFactor } from '../../engine/time';
import { seededRandom } from '../../kits/field';
import { SpatialHash } from '../../kits/physics';
import { applyFont, samplePointsUnder, textMask } from '../../kits/text';
import { ensureContrast, mixOklab } from '../../theme/color';
import type { Theme } from '../../theme/worlds';
import { SHARED } from '../shared';
import type { Params, SceneContext, SceneInstance, SceneModule } from '../types';
import { FIXED } from './constants';
import { meta } from './meta';
import { params } from './params';
import { followUps } from './prompt';

type Idle = 'fill' | 'full' | 'empty' | 'low';

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
  const hash = new SpatialHash(1);

  // Per person, in arrival order: spot, start point, position, velocity, traits.
  let count = 0;
  let gap = 1;
  let tx = new Float32Array(0);
  let ty = new Float32Array(0);
  let sx = new Float32Array(0);
  let sy = new Float32Array(0);
  let px = new Float32Array(0);
  let py = new Float32Array(0);
  let vx = new Float32Array(0);
  let vy = new Float32Array(0);
  let speed = new Float32Array(0);
  let bend = new Float32Array(0);
  let walked = new Float32Array(0);
  let tint = new Uint8Array(0);
  let out = new Uint8Array(0);
  let palette: string[] = [];
  let textInk = '';
  let headInk = '';

  let A: number = FIXED.START_FEW;
  let quiet = 0;
  let idle: Idle = 'fill';
  let held = 0;

  function inks(): void {
    const acc = [theme.c1, theme.c2, theme.c3];
    palette = [];
    for (const a of acc)
      for (let t = 0; t < FIXED.TINTS; t++)
        palette.push(
          mixOklab(a, theme.surface, (t / (FIXED.TINTS - 1)) * n('variety') * FIXED.TINT_MIX),
        );
    textInk = ensureContrast(theme.ink, theme.ground, FIXED.CONTRAST);
    headInk = theme.inkSoft;
  }

  function spawn(i: number): void {
    px[i] = sx[i]!;
    py[i] = sy[i]!;
    vx[i] = vy[i] = 0;
    out[i] = 1;
  }

  function layout(): void {
    inks();
    if (!fontsOk || !c.w) return;
    const w = c.w;
    const h = c.h;
    const small = w < SHARED.SMALL_SCREEN;
    const max = Math.round(
      (small ? n('crowdSmall') : n('crowd')) *
        (ctx.quality === 'preview' ? SHARED.PREVIEW_SCALE : 1),
    );
    const { data } = textMask(w, h, String(p.text || ' '), {
      heightShare: n('textHeight'),
      fitShare: n('fitWidth'),
      weight: n('weight'),
      centerY: FIXED.NAME_Y,
    });
    const res = samplePointsUnder(
      data,
      Math.round(w),
      Math.round(h),
      FIXED.START_GAP,
      FIXED.ALPHA_CUTOFF,
      max,
      FIXED.MAX_GAP,
    );
    gap = res.gap;
    count = res.pts.length / 2;
    const rand = seededRandom(FIXED.SEED);
    const order = Array.from({ length: count }, (_, i) => i);
    for (let i = count - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [order[i], order[j]] = [order[j]!, order[i]!];
    }
    tx = new Float32Array(count);
    ty = new Float32Array(count);
    sx = new Float32Array(count);
    sy = new Float32Array(count);
    px = new Float32Array(count);
    py = new Float32Array(count);
    vx = new Float32Array(count);
    vy = new Float32Array(count);
    speed = new Float32Array(count);
    bend = new Float32Array(count);
    walked = new Float32Array(count);
    tint = new Uint8Array(count);
    out = new Uint8Array(count);
    const loose = (1 - n('tightness')) * gap * 0.5;
    const o = FIXED.SPAWN_OUT;
    order.forEach((src, i) => {
      tx[i] = res.pts[2 * src]! + (rand() * 2 - 1) * loose;
      ty[i] = res.pts[2 * src + 1]! + (rand() * 2 - 1) * loose;
      const edge = Math.floor(rand() * FIXED.EDGES);
      const along = rand();
      // Left or right edge (axis 0), or top or bottom (axis 1); far is right or bottom.
      const axis = Math.floor(edge / 2);
      const far = edge % 2;
      sx[i] = axis ? along * w : far ? w + o : -o;
      sy[i] = axis ? (far ? h + o : -o) : along * h;
      speed[i] = 1 + n('variety') * (rand() - 0.5);
      bend[i] = (rand() - 0.5) * 2 * n('variety') * FIXED.CURVE_MAX;
      const color = i % Math.max(1, Math.min(SHARED.INKS, n('colors')));
      tint[i] = color * FIXED.TINTS + Math.floor(rand() * FIXED.TINTS);
      spawn(i);
    });
    hash.cell = Math.max(1, n('figure') * FIXED.SEP_RADIUS);
    A = Math.min(Math.max(A, FIXED.START_FEW), count);
  }

  fontsReady().then(() => {
    fontsOk = true;
    layout();
    if (stillShown) still();
  });

  function step(f: number): void {
    const active = Math.ceil(A);
    const base = n('walkSpeed') * FIXED.WALK_PX;
    const arrive = gap * FIXED.ARRIVE;
    const k = ease(FIXED.STEER, f);
    for (let i = 0; i < count; i++) {
      const coming = i < active;
      if (!coming && out[i]) continue;
      out[i] = 0;
      const gx = coming ? tx[i]! : sx[i]!;
      const gy = coming ? ty[i]! : sy[i]!;
      const dx = gx - px[i]!;
      const dy = gy - py[i]!;
      const d = Math.hypot(dx, dy);
      if (!coming && d < base * f) {
        spawn(i);
        continue;
      }
      const sp = base * speed[i]! * Math.min(1, d / arrive);
      const turn = bend[i]! * Math.min(1, d / FIXED.CURVE_DIST);
      const a = Math.atan2(dy, dx) + turn;
      vx[i] += (Math.cos(a) * sp - vx[i]!) * k;
      vy[i] += (Math.sin(a) * sp - vy[i]!) * k;
    }
    // Step around each other.
    const r = n('figure') * FIXED.SEP_RADIUS;
    const push = n('separation') * FIXED.SEP_PUSH * f;
    if (push > 0) {
      hash.build(px, py, count, c.w, c.h);
      for (let i = 0; i < count; i++) {
        if (out[i]) continue;
        hash.query(px[i]!, py[i]!, r, (j) => {
          if (j <= i || out[j]) return;
          const dx = px[i]! - px[j]!;
          const dy = py[i]! - py[j]!;
          const d = Math.hypot(dx, dy);
          if (d >= r || d === 0) return;
          const m = (push * (1 - d / r)) / d;
          px[i] += dx * m;
          py[i] += dy * m;
          px[j] -= dx * m;
          py[j] -= dy * m;
        });
      }
    }
    for (let i = 0; i < count; i++) {
      if (out[i]) continue;
      px[i] += vx[i]! * f;
      py[i] += vy[i]! * f;
      walked[i] += Math.hypot(vx[i]!, vy[i]!) * f;
    }
  }

  function draw(): void {
    const g = c.ctx;
    c.clear();
    if (!count) return;
    const high = p.quality === 'high';
    if (high) {
      const grid = new Path2D();
      for (let x = FIXED.PAVING; x < c.w; x += FIXED.PAVING) {
        grid.moveTo(x, 0);
        grid.lineTo(x, c.h);
      }
      for (let y = FIXED.PAVING; y < c.h; y += FIXED.PAVING) {
        grid.moveTo(0, y);
        grid.lineTo(c.w, y);
      }
      g.strokeStyle = theme.line;
      g.lineWidth = 1;
      g.stroke(grid);
    }
    const bodies = palette.map(() => new Path2D());
    const heads = new Path2D();
    const s = n('figure');
    let standing = 0;
    for (let i = 0; i < count; i++) {
      if (out[i]) continue;
      const moving = Math.hypot(vx[i]!, vy[i]!);
      const heading = moving > 0 ? Math.atan2(vy[i]!, vx[i]!) : -Math.PI * 0.5;
      const sway = high ? Math.sin((SHARED.TAU * walked[i]!) / FIXED.STEP_PX) * FIXED.SWAY : 0;
      const body = bodies[tint[i]!]!;
      body.moveTo(px[i]! + s, py[i]!);
      body.ellipse(
        px[i]!,
        py[i]!,
        s * FIXED.SHOULDER,
        s,
        heading + sway * Math.min(1, moving),
        0,
        SHARED.TAU,
      );
      const hx = px[i]! + Math.cos(heading) * s * FIXED.HEAD_FWD;
      const hy = py[i]! + Math.sin(heading) * s * FIXED.HEAD_FWD;
      heads.moveTo(hx + s * FIXED.HEAD, hy);
      heads.arc(hx, hy, s * FIXED.HEAD, 0, SHARED.TAU);
      if (i < A && Math.hypot(px[i]! - tx[i]!, py[i]! - ty[i]!) < gap * FIXED.STAND) standing++;
    }
    bodies.forEach((path, k) => {
      g.fillStyle = palette[k]!;
      g.fill(path);
    });
    g.fillStyle = headInk;
    g.fill(heads);
    const num = standing.toLocaleString('en-US');
    const style = String(p.counter);
    const label =
      style === 'number'
        ? num
        : style === 'fraction'
          ? `${num} of ${count.toLocaleString('en-US')}`
          : `${num} standing together`;
    applyFont(g, { size: c.h * FIXED.COUNTER_SIZE, weight: FIXED.COUNTER_WEIGHT });
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillStyle = textInk;
    g.fillText(label, c.w * 0.5, c.h * FIXED.COUNTER_Y);
  }

  function still(): void {
    stillShown = true;
    ptr.takeTaps();
    A = count;
    for (let i = 0; i < count; i++) {
      px[i] = tx[i]!;
      py[i] = ty[i]!;
      vx[i] = vy[i] = 0;
      out[i] = 0;
    }
    draw();
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
      const low = Math.min(FIXED.START_FEW, count);
      if (moved) {
        A = Math.min(count, Math.max(low, A + moved * count));
        quiet = held = 0;
        idle = moved > 0 ? 'fill' : 'empty';
      } else {
        quiet += dt;
        if (quiet >= n('idleWait')) {
          const rate = (count / n('idleFill')) * dt;
          if (idle === 'fill') {
            A = Math.min(count, A + rate);
            if (A >= count) [idle, held] = ['full', 0];
          } else if (idle === 'empty') {
            A = Math.max(low, A - rate);
            if (A <= low) [idle, held] = ['low', 0];
          } else {
            held += dt;
            if (held >= n('idleHold')) idle = idle === 'full' ? 'empty' : 'fill';
          }
        }
      }
      step(f);
      draw();
    },
    still,
    setParams(next) {
      p = { ...next };
      layout();
      if (stillShown) still();
    },
    setTheme(th) {
      theme = th;
      inks();
      if (stillShown) still();
    },
    restart() {
      A = Math.min(FIXED.START_FEW, count);
      quiet = held = 0;
      idle = 'fill';
      for (let i = 0; i < count; i++) spawn(i);
    },
    destroy() {
      sweep.destroy();
      ptr.destroy();
      removeSource();
      inner?.el.remove();
      c.destroy();
      count = 0;
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
