// `epicycles`: Epicycles (SCENES.md #67). The name's outline joined into one closed path
// (pen-up between loops), resampled evenly and Fourier-transformed; the biggest terms
// spin end to end and the chain's tip draws a glowing trail. Pointer height sets how
// many terms are active.

import { createCanvas } from '../../engine/canvas';
import { fontsReady } from '../../engine/fonts';
import { createPointer } from '../../engine/pointer';
import { ease, frameFactor } from '../../engine/time';
import { glowStroke } from '../../kits/render';
import { alphaChannel, simplifyLoop, textMask, traceContours, type Pt } from '../../kits/text';
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
  let fontsOk = false;
  let stillShown = false;

  // Fourier terms, biggest first (frequency 0 kept apart as the base point).
  let re = new Float64Array(0);
  let im = new Float64Array(0);
  let freq = new Int32Array(0);
  let baseX = 0;
  let baseY = 0;
  let penUp = new Uint8Array(0);
  let samples = 1;
  let maxCircles = 0;

  let t = 0;
  let since = 0;
  let count: number = FIXED.MIN_CIRCLES;
  let time = 0;

  function layout(): void {
    if (!fontsOk || !c.w) return;
    const w = c.w;
    const h = c.h;
    const W = Math.round(w);
    const H = Math.round(h);
    const { data } = textMask(w, h, String(p.text || ' '), {
      heightShare: n('textHeight'),
      fitShare: n('fitWidth'),
      weight: n('weight'),
    });
    const loops = traceContours(alphaChannel(data, W, H), W, H, FIXED.ALPHA_CUTOFF)
      .map((l) => simplifyLoop(l, FIXED.SIMPLIFY))
      .filter((l) => l.length > 2)
      .sort((a, b) => Math.min(...a.map((q) => q.x)) - Math.min(...b.map((q) => q.x)));
    // One closed path: each loop closed on itself, then a pen-up join to the next.
    const pts: Pt[] = [];
    const up: number[] = [];
    loops.forEach((l) => {
      for (const q of [...l, l[0]!]) {
        pts.push(q);
        up.push(0);
      }
      up[up.length - 1] = 1;
    });
    samples = n('samples');
    re = new Float64Array(0);
    penUp = new Uint8Array(samples);
    if (pts.length < 2) return;
    const seg: number[] = [0];
    for (let i = 1; i <= pts.length; i++) {
      const a = pts[i - 1]!;
      const b = pts[i % pts.length]!;
      seg.push(seg[i - 1]! + Math.hypot(b.x - a.x, b.y - a.y));
    }
    const total = seg[pts.length]!;
    const zx = new Float64Array(samples);
    const zy = new Float64Array(samples);
    let j = 0;
    for (let s = 0; s < samples; s++) {
      const d = (s / samples) * total;
      while (j < pts.length - 1 && seg[j + 1]! < d) j++;
      const a = pts[j]!;
      const b = pts[(j + 1) % pts.length]!;
      const len = seg[j + 1]! - seg[j]! || 1;
      const u = (d - seg[j]!) / len;
      zx[s] = a.x + (b.x - a.x) * u - w * 0.5;
      zy[s] = a.y + (b.y - a.y) * u - h * 0.5;
      penUp[s] = up[j]!;
    }
    // Discrete Fourier transform, frequencies −N/2 … N/2 − 1.
    const terms: { re: number; im: number; k: number; size: number }[] = [];
    const half = Math.floor(samples * 0.5);
    for (let k = -half; k < samples - half; k++) {
      let sr = 0;
      let si = 0;
      for (let s = 0; s < samples; s++) {
        const a = (-SHARED.TAU * k * s) / samples;
        const cs = Math.cos(a);
        const sn = Math.sin(a);
        sr += zx[s]! * cs - zy[s]! * sn;
        si += zx[s]! * sn + zy[s]! * cs;
      }
      sr /= samples;
      si /= samples;
      if (k === 0) [baseX, baseY] = [sr, si];
      else terms.push({ re: sr, im: si, k, size: Math.hypot(sr, si) });
    }
    terms.sort((a, b) => b.size - a.size);
    const small = w < SHARED.SMALL_SCREEN;
    maxCircles = Math.min(terms.length, small ? n('circlesSmall') : n('circles'));
    const keep = terms.slice(0, maxCircles);
    re = Float64Array.from(keep.map((q) => q.re));
    im = Float64Array.from(keep.map((q) => q.im));
    freq = Int32Array.from(keep.map((q) => q.k));
    count = Math.min(Math.max(count, FIXED.MIN_CIRCLES), maxCircles);
  }

  fontsReady().then(() => {
    fontsOk = true;
    layout();
    if (stillShown) still();
  });

  /** The chain's tip at time u (in cycles) with `active` terms (the last one partial). */
  function tip(u: number, active: number): [number, number] {
    let x = baseX;
    let y = baseY;
    const whole = Math.floor(active);
    for (let i = 0; i < re.length && i <= whole; i++) {
      const scale = i < whole ? 1 : active - whole;
      if (scale <= 0) break;
      const a = SHARED.TAU * freq[i]! * u;
      const cs = Math.cos(a);
      const sn = Math.sin(a);
      x += (re[i]! * cs - im[i]! * sn) * scale;
      y += (re[i]! * sn + im[i]! * cs) * scale;
    }
    return [x, y];
  }

  function draw(u: number, back: number, ringAlpha: number): void {
    const g = c.ctx;
    c.clear();
    if (!re.length) return;
    g.save();
    const wob = n('wobble');
    const drift = (SHARED.TAU * time) / FIXED.DRIFT_PERIOD;
    const side = Math.min(c.w, c.h);
    g.translate(
      c.w * 0.5 + wob * FIXED.DRIFT * side * Math.sin(drift),
      c.h * 0.5 + wob * FIXED.DRIFT * side * Math.cos(drift),
    );
    g.rotate(wob * FIXED.DRIFT_TURN * Math.sin(drift));
    // The trail, broken wherever the outline lifts its pen.
    const trail = new Path2D();
    const steps = Math.max(2, Math.round(back * FIXED.TRAIL_POINTS));
    let pen = false;
    for (let s = 0; s <= steps; s++) {
      const at = u - back + (back * s) / steps;
      const idx = Math.floor((((at % 1) + 1) % 1) * samples) % samples;
      if (penUp[idx]) {
        pen = false;
        continue;
      }
      const [x, y] = tip(at, count);
      if (pen) trail.lineTo(x, y);
      else trail.moveTo(x, y);
      pen = true;
    }
    g.lineCap = 'round';
    g.lineJoin = 'round';
    if (n('glow') > 0)
      glowStroke(
        g,
        trail,
        theme.c1,
        theme.ink,
        n('lineWidth'),
        FIXED.GLOW_LAYERS,
        FIXED.GLOW_SPREAD,
        n('glow'),
        theme.blend,
      );
    else {
      g.strokeStyle = theme.c1;
      g.lineWidth = n('lineWidth');
      g.stroke(trail);
    }
    // The circles, end to end.
    if (ringAlpha > 0) {
      const accents = [theme.c2, theme.c3, theme.c1];
      const kinds = Math.max(1, Math.min(SHARED.INKS, n('ringColors')));
      const rings = accents.slice(0, kinds).map(() => new Path2D());
      let x = baseX;
      let y = baseY;
      const whole = Math.floor(count);
      for (let i = 0; i < re.length && i <= whole; i++) {
        const scale = i < whole ? 1 : count - whole;
        if (scale <= 0) break;
        const a = SHARED.TAU * freq[i]! * u;
        const nx = x + (re[i]! * Math.cos(a) - im[i]! * Math.sin(a)) * scale;
        const ny = y + (re[i]! * Math.sin(a) + im[i]! * Math.cos(a)) * scale;
        const r = Math.hypot(nx - x, ny - y);
        const path = rings[i % kinds]!;
        path.moveTo(x + r, y);
        path.arc(x, y, r, 0, SHARED.TAU);
        path.moveTo(x, y);
        path.lineTo(nx, ny);
        [x, y] = [nx, ny];
      }
      g.globalAlpha = ringAlpha;
      g.lineWidth = FIXED.RING_WIDTH;
      rings.forEach((path, k) => {
        g.strokeStyle = accents[k]!;
        g.stroke(path);
      });
      g.globalAlpha = 1;
    }
    g.restore();
  }

  function still(): void {
    stillShown = true;
    ptr.takeTaps();
    count = maxCircles;
    draw(0, 1, n('showCircles') * FIXED.STILL_FAINT);
  }

  return {
    resize() {
      if (!c.fit()) return;
      layout();
    },
    update(dt) {
      stillShown = false;
      const f = frameFactor(dt);
      time += dt;
      ptr.sync();
      if (ptr.takeTaps().length) [t, since] = [0, 0];
      const lo = Math.min(FIXED.MIN_CIRCLES, maxCircles);
      let share: number;
      const pointing = (ptr.active && ptr.pointerType === 'mouse') || ptr.dragging;
      if (pointing && c.h) share = 1 - Math.min(1, Math.max(0, ptr.y / c.h));
      else share = 0.5 - 0.5 * Math.cos((SHARED.TAU * time) / FIXED.IDLE_PERIOD);
      const want = lo + share * (maxCircles - lo);
      count += (want - count) * ease(n('ease'), f);
      const step = (dt * n('speed')) / FIXED.TRACE_SECONDS;
      t = (t + step) % 1;
      since = Math.min(1, since + step);
      draw(t, Math.min(n('trail'), since), n('showCircles'));
    },
    still,
    setParams(next) {
      p = { ...next };
      layout();
      if (stillShown) still();
    },
    setTheme(th) {
      theme = th;
      if (stillShown) still();
    },
    restart() {
      t = since = time = 0;
    },
    destroy() {
      ptr.destroy();
      c.destroy();
      re = new Float64Array(0);
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
