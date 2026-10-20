// `domino`: Domino Run (SCENES.md #64). Dominoes stand along the traced letter
// outlines; a front moved by scroll (or a flick, or the idle run) topples them.

import { createCanvas } from '../../engine/canvas';
import { fontsReady } from '../../engine/fonts';
import { innerScroller } from '../../engine/inner-scroll';
import { createPointer } from '../../engine/pointer';
import { addScrollSource } from '../../engine/scheduler';
import { createScrollSource } from '../../engine/scroll';
import { frameFactor } from '../../engine/time';
import { alphaChannel, simplifyLoop, textMask, traceContours, type Pt } from '../../kits/text';
import type { Theme } from '../../theme/worlds';
import { SHARED } from '../shared';
import type { Params, SceneContext, SceneInstance, SceneModule } from '../types';
import { FIXED } from './constants';
import { meta } from './meta';
import { params } from './params';
import { followUps } from './prompt';

interface Domino {
  x: number;
  y: number;
  tx: number;
  ty: number;
  a: number;
  v: number;
}

type Mode = 'still' | 'run' | 'hold' | 'rewind';

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
  const source = inner ? inner.source : createScrollSource();
  const removeSource = addScrollSource(source);
  let fontsOk = false;
  let lastScroll: number | null = null;

  let D: Domino[] = [];
  let front = 0;
  let mode: Mode = 'still';
  let quiet = 0;
  let held = 0;

  function layout(): void {
    if (!fontsOk || !c.w) return;
    const W = Math.round(c.w);
    const H = Math.round(c.h);
    const { data } = textMask(W, H, String(p.text || ' '), {
      heightShare: n('textHeight'),
      fitShare: n('fitWidth'),
      weight: n('weight'),
    });
    const loops = traceContours(alphaChannel(data, W, H), W, H, FIXED.ALPHA_CUTOFF)
      .map((l) => simplifyLoop(l, FIXED.SIMPLIFY))
      .filter((l) => l.length > 2)
      .sort((a, b) => Math.min(...a.map((q) => q.x)) - Math.min(...b.map((q) => q.x)));
    const len = (l: Pt[]) =>
      l.reduce(
        (s, q, i) => s + Math.hypot(l[(i + 1) % l.length]!.x - q.x, l[(i + 1) % l.length]!.y - q.y),
        0,
      );
    const total = loops.reduce((s, l) => s + len(l), 0);
    const small = c.w < SHARED.SMALL_SCREEN;
    const scale = ctx.quality === 'preview' ? SHARED.PREVIEW_SCALE : 1;
    const max = Math.max(1, Math.round((small ? n('dominoesSmall') : n('dominoes')) * scale));
    const step = Math.max(total / max, n('spacing') * n('thickness') * n('size'));
    D = [];
    for (const l of loops) {
      let carry = 0;
      for (let i = 0; i < l.length && D.length < max; i++) {
        const a = l[i]!;
        const b = l[(i + 1) % l.length]!;
        const seg = Math.hypot(b.x - a.x, b.y - a.y);
        if (!seg) continue;
        const tx = (b.x - a.x) / seg;
        const ty = (b.y - a.y) / seg;
        for (let s = carry; s < seg && D.length < max; s += step)
          D.push({ x: a.x + tx * s, y: a.y + ty * s, tx, ty, a: 0, v: 0 });
        carry = (((carry - seg) % step) + step) % step;
      }
    }
    front = Math.min(front, D.length + 1);
  }

  fontsReady().then(() => {
    fontsOk = true;
    layout();
  });

  const target = (i: number) => {
    const x = front - i;
    if (x <= 0) return 0;
    if (x < 1) return x * n('tilt') * n('leanMax') * FIXED.DEG;
    return FIXED.FLAT;
  };

  function settle(f: number): void {
    const k = n('gravity') * n('speed');
    const damp = n('friction') ** f;
    for (let i = 0; i < D.length; i++) {
      const d = D[i]!;
      d.v = (d.v + (target(i) - d.a) * k * f) * damp;
      d.a += d.v * f;
      if (d.a > FIXED.FLAT) {
        d.a = FIXED.FLAT;
        d.v = -d.v * n('clack');
      } else if (d.a < 0) {
        d.a = 0;
        d.v = 0;
      }
    }
  }

  function draw(): void {
    const g = c.ctx;
    c.clear();
    if (!D.length) return;
    const size = n('size');
    const thick = size * n('thickness');
    const hw = (size * n('width')) / 2;
    const body = new Path2D();
    const near = new Path2D();
    const far = new Path2D();
    const quad = (path: Path2D, d: Domino, from: number, to: number) => {
      const nx = -d.ty * hw;
      const ny = d.tx * hw;
      path.moveTo(d.x - nx + d.tx * from, d.y - ny + d.ty * from);
      path.lineTo(d.x + nx + d.tx * from, d.y + ny + d.ty * from);
      path.lineTo(d.x + nx + d.tx * to, d.y + ny + d.ty * to);
      path.lineTo(d.x - nx + d.tx * to, d.y - ny + d.ty * to);
      path.closePath();
    };
    for (const d of D) {
      const L = thick * Math.cos(d.a) + size * Math.sin(d.a);
      if (d.a < FIXED.FACE_AT) quad(body, d, 0, L);
      else if (p.twoTone) {
        quad(near, d, 0, L / 2);
        quad(far, d, L / 2, L);
      } else quad(near, d, 0, L);
    }
    g.fillStyle = theme.inkSoft;
    g.fill(body);
    g.globalCompositeOperation = theme.blend;
    g.fillStyle = theme.c1;
    g.fill(near);
    g.fillStyle = theme.c2;
    g.fill(far);
    g.globalCompositeOperation = 'source-over';
  }

  return {
    resize() {
      if (!c.fit()) return;
      layout();
    },
    update(dt) {
      const f = frameFactor(dt);
      ptr.sync();
      const pos = source.read();
      let moved = lastScroll === null ? 0 : pos - lastScroll;
      lastScroll = pos;
      if (ptr.down && ptr.pointerType !== 'mouse') moved += ptr.x - ptr.px;
      const end = D.length + 1;
      const run = n('runRate') * n('speed');
      for (const tap of ptr.takeTaps()) {
        const hit = D.findIndex(
          (d, i) => front <= i && Math.hypot(d.x - tap.x, d.y - tap.y) < n('size'),
        );
        if (hit >= 0) {
          front = Math.max(front, hit);
          mode = 'run';
          quiet = 0;
        }
      }
      if (moved) {
        front = Math.min(end, Math.max(0, front + moved / n('scrollStep')));
        quiet = 0;
        if (moved < 0 || mode !== 'run') mode = 'still';
      } else if (mode === 'still') {
        quiet += dt;
        if (quiet >= n('idleDelay') && front < end) mode = 'run';
      }
      if (mode === 'run') {
        front = Math.min(end, front + run * dt);
        if (front >= end) {
          mode = 'hold';
          held = 0;
        }
      } else if (mode === 'hold') {
        held += dt;
        if (held >= n('idleHold')) mode = 'rewind';
      } else if (mode === 'rewind') {
        front = Math.max(0, front - run * n('rewind') * dt);
        if (!front) {
          mode = 'still';
          quiet = 0;
        }
      }
      settle(f);
      draw();
    },
    still() {
      ptr.takeTaps();
      const keep = front;
      front = D.length / 2;
      for (let i = 0; i < D.length; i++) {
        D[i]!.a = target(i);
        D[i]!.v = 0;
      }
      draw();
      front = keep;
    },
    setParams(next) {
      p = { ...next };
      layout();
    },
    setTheme(t) {
      theme = t;
    },
    restart() {
      front = 0;
      mode = 'still';
      quiet = 0;
      for (const d of D) {
        d.a = 0;
        d.v = 0;
      }
    },
    destroy() {
      ptr.destroy();
      removeSource();
      inner?.el.remove();
      c.destroy();
      D = [];
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
