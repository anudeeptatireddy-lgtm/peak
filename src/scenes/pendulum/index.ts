// `pendulum`: Pendulum Field (SCENES.md #62). Bobs circle their homes on the
// letters at whole-number turns per cycle, so they all line up at t = 0 (mod cycle).

import { createCanvas } from '../../engine/canvas';
import { fontsReady } from '../../engine/fonts';
import { innerScroller } from '../../engine/inner-scroll';
import { createPointer } from '../../engine/pointer';
import { addScrollSource } from '../../engine/scheduler';
import { createScrollSource } from '../../engine/scroll';
import { smoothstep } from '../../kits/easing';
import { samplePointsUnder, textMask } from '../../kits/text';
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
  const source = inner ? inner.source : createScrollSource();
  const removeSource = addScrollSource(source);
  let fontsOk = false;
  let lastScroll: number | null = null;

  let hx = new Float32Array(0);
  let hy = new Float32Array(0);
  let turns = new Int32Array(0);
  let count = 0;
  let t = 0;

  function layout(): void {
    if (!fontsOk || !c.w) return;
    const small = c.w < SHARED.SMALL_SCREEN;
    const scale = ctx.quality === 'preview' ? SHARED.PREVIEW_SCALE : 1;
    const max = Math.round((small ? n('bobsSmall') : n('bobs')) * scale);
    const { data } = textMask(c.w, c.h, String(p.text || ' '), {
      heightShare: n('textHeight'),
      fitShare: n('fitWidth'),
      weight: n('weight'),
    });
    const { pts } = samplePointsUnder(
      data,
      Math.round(c.w),
      Math.round(c.h),
      FIXED.START_GAP,
      FIXED.ALPHA_CUTOFF,
      max,
      FIXED.MAX_GAP,
    );
    count = pts.length / 2;
    hx = new Float32Array(count);
    hy = new Float32Array(count);
    turns = new Int32Array(count);
    let minX = Infinity;
    let maxX = -Infinity;
    for (let i = 0; i < count; i++) {
      hx[i] = pts[2 * i]!;
      hy[i] = pts[2 * i + 1]!;
      minX = Math.min(minX, hx[i]!);
      maxX = Math.max(maxX, hx[i]!);
    }
    const span = maxX - minX || 1;
    for (let i = 0; i < count; i++)
      turns[i] =
        n('baseTurns') + Math.round(((hx[i]! - minX) / span) * n('spread') * n('turnRange'));
  }

  fontsReady().then(() => {
    fontsOk = true;
    layout();
  });

  function draw(time: number): void {
    const g = c.ctx;
    c.clear();
    if (!count) return;
    const r = n('radius');
    const w = (SHARED.TAU * time) / n('loop');
    const inks = [theme.c1, theme.c2, theme.c3];
    g.globalCompositeOperation = theme.blend;
    const trail = n('trail') * n('trailSpan');
    if (trail > 0) {
      const paths = inks.map(() => new Path2D());
      const steps = FIXED.TRAIL_STEPS;
      const wt = (SHARED.TAU * trail) / n('loop');
      for (let i = 0; i < count; i++) {
        const path = paths[turns[i]! % SHARED.INKS]!;
        for (let k = 0; k < steps; k++) {
          const th = turns[i]! * (w - wt * (1 - k / (steps - 1)));
          const x = hx[i]! + r * (Math.cos(th) - 1);
          const y = hy[i]! + r * Math.sin(th);
          if (k) path.lineTo(x, y);
          else path.moveTo(x, y);
        }
      }
      g.lineCap = 'round';
      g.lineJoin = 'round';
      g.lineWidth = n('bobSize') * n('trailWidth');
      g.globalAlpha = n('trailAlpha');
      paths.forEach((path, k) => {
        g.strokeStyle = inks[k]!;
        g.stroke(path);
      });
      g.globalAlpha = 1;
    }
    const dots = inks.map(() => new Path2D());
    const b = n('bobSize');
    for (let i = 0; i < count; i++) {
      const th = turns[i]! * w;
      const x = hx[i]! + r * (Math.cos(th) - 1);
      const y = hy[i]! + r * Math.sin(th);
      const path = dots[turns[i]! % SHARED.INKS]!;
      path.moveTo(x + b, y);
      path.arc(x, y, b, 0, SHARED.TAU);
    }
    dots.forEach((path, k) => {
      g.fillStyle = inks[k]!;
      g.fill(path);
    });
    g.globalCompositeOperation = 'source-over';
  }

  return {
    resize() {
      if (!c.fit()) return;
      layout();
    },
    update(dt) {
      ptr.sync();
      ptr.takeTaps();
      const pos = source.read();
      const scrolled = lastScroll === null ? 0 : pos - lastScroll;
      lastScroll = pos;
      const cyc = n('loop');
      const u = t / cyc;
      const d = Math.abs(u - Math.round(u));
      const hold = 1 - n('hold') * FIXED.HOLD_MAX * (1 - smoothstep(0, n('holdWidth'), d));
      const speed = ptr.active && ptr.pointerType === 'mouse' ? n('hoverSlow') : 1;
      t += dt * speed * hold + scrolled / n('scrub');
      if (ptr.down && ptr.pointerType !== 'mouse') t += (ptr.x - ptr.px) / n('scrub');
      draw(t);
    },
    still() {
      ptr.takeTaps();
      draw(0);
    },
    setParams(next) {
      p = { ...next };
      layout();
    },
    setTheme(th) {
      theme = th;
    },
    restart() {
      t = 0;
    },
    destroy() {
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
