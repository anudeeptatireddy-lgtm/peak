// `coilstairs`: Coil Stairs (SCENES.md #65). Each letter is a stack of letter-shaped
// coils that tumbles forward down a front-view staircase, top coils first; one progress
// value P (scroll, a sideways drag, or the idle walk) drives every letter.

import { createCanvas } from '../../engine/canvas';
import { fontsReady } from '../../engine/fonts';
import { innerScroller } from '../../engine/inner-scroll';
import { createPointer } from '../../engine/pointer';
import { addScrollSource } from '../../engine/scheduler';
import { createScrollSource } from '../../engine/scroll';
import { frameFactor } from '../../engine/time';
import { smoothstep } from '../../kits/easing';
import {
  alphaChannel,
  applyFont,
  letterBoxes,
  offscreen,
  simplifyLoop,
  traceContours,
  type Pt,
} from '../../kits/text';
import { mixOklab } from '../../theme/color';
import type { Theme } from '../../theme/worlds';
import { SHARED } from '../shared';
import type { Params, SceneContext, SceneInstance, SceneModule } from '../types';
import { FIXED } from './constants';
import { meta } from './meta';
import { params } from './params';
import { followUps } from './prompt';

interface Letter {
  /** Outline loops relative to the baseline center, at bottom-step size. */
  loops: Pt[][];
  /** Center offset from the name's middle, at bottom-step size. */
  dx: number;
  squash: number;
  v: number;
  step: number;
}

type Idle = 'down' | 'restDown' | 'up' | 'restUp';

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
  let stillShown = false;
  let lastScroll: number | null = null;

  let letters: Letter[] = [];
  let steps = 0;
  let coils = 0;
  let stepH = 0;
  let size = 0;
  let nameW = 0;
  let y0 = 0;
  let P = 0;
  let quiet = 0;
  let idle: Idle = 'down';
  let held = 0;
  let treadInk = '';
  let riserInk = '';

  const end = () => steps + Math.max(0, letters.length - 1) * n('stagger');
  const scaleAt = (k: number) => 1 / (1 + (steps - k) * n('grow'));
  const edgeAt = (k: number) => y0 + k * stepH;

  function inks(): void {
    treadInk = mixOklab(theme.ground, theme.ink, FIXED.TREAD_MIX);
    riserInk = mixOklab(theme.ground, theme.ink, FIXED.RISER_MIX);
  }

  function layout(): void {
    inks();
    if (!fontsOk || !c.w) return;
    const small = c.w < SHARED.SMALL_SCREEN;
    steps = small ? n('stepsSmall') : n('steps');
    coils = Math.max(2, small ? n('coilsSmall') : n('coils'));
    const text = [...String(p.text || ' ')];
    const probe = offscreen(1, 1);
    size = n('letterSize');
    applyFont(probe.ctx, { size, weight: n('weight') });
    const wide = probe.ctx.measureText(text.join('')).width;
    if (wide > c.w * n('fitWidth')) size *= (c.w * n('fitWidth')) / wide;
    applyFont(probe.ctx, { size, weight: n('weight') });
    const boxes = letterBoxes(probe.ctx, text.join(''), 0, 0, 'center');
    nameW = probe.ctx.measureText(text.join('')).width;
    probe.free();
    const old = letters;
    letters = boxes.map((b, i) => {
      const pad = FIXED.PAD + size * FIXED.OVERHANG;
      const w = Math.ceil(b.w + pad * 2);
      const h = Math.ceil(size + pad * 2);
      const base = pad + size * FIXED.CAP + size * (1 - FIXED.CAP) * 0.5;
      const off = offscreen(w, h);
      applyFont(off.ctx, { size, weight: n('weight') });
      off.ctx.fillStyle = 'black';
      off.ctx.fillText(b.ch, pad, base);
      const alpha = alphaChannel(off.ctx.getImageData(0, 0, w, h).data, w, h);
      off.free();
      const loops = traceContours(alpha, w, h, FIXED.ALPHA_CUTOFF).map((loop) =>
        simplifyLoop(loop, FIXED.SIMPLIFY).map((q) => ({
          x: q.x - pad - b.w * 0.5,
          y: q.y - base,
        })),
      );
      const prev = old[i];
      return {
        loops,
        dx: b.x + b.w * 0.5,
        squash: prev?.squash ?? 0,
        v: prev?.v ?? 0,
        step: prev?.step ?? 0,
      };
    });
    const cap = size * FIXED.CAP;
    stepH = Math.min(n('stepHeight'), Math.max(1, (c.h * FIXED.HEIGHT_FIT - cap) / steps));
    y0 = (c.h - steps * stepH - cap) * 0.5 + cap;
    P = Math.min(P, end());
  }

  fontsReady().then(() => {
    fontsOk = true;
    layout();
    if (stillShown) draw(end(), true);
  });

  function drawStairs(): void {
    const g = c.ctx;
    const tops = new Path2D();
    const fronts = new Path2D();
    const reach = nameW * (0.5 + FIXED.MARGIN);
    const cx = c.w * 0.5;
    for (let k = 0; k <= steps; k++) {
      const s = scaleAt(k);
      const y = edgeAt(k);
      const half = reach * s;
      const depth = FIXED.TREAD * stepH * s;
      const back = k ? scaleAt(k - 1) * reach : half;
      // Top face: a trapezoid from the back edge (narrower) to this step's edge.
      tops.moveTo(cx - back, y - depth);
      tops.lineTo(cx + back, y - depth);
      tops.lineTo(cx + half, y);
      tops.lineTo(cx - half, y);
      tops.closePath();
      // Front face down to the next step's top face.
      const below =
        k < steps ? edgeAt(k + 1) - FIXED.TREAD * stepH * scaleAt(k + 1) : y + stepH * s;
      fronts.rect(cx - half, y, half * 2, below - y);
    }
    g.fillStyle = treadInk;
    g.fill(tops);
    g.fillStyle = riserInk;
    g.fill(fronts);
  }

  function draw(progress: number, rest: boolean): void {
    const g = c.ctx;
    c.clear();
    if (!letters.length || !steps) return;
    drawStairs();
    const accents = [theme.c1, theme.c2, theme.c3];
    const back = accents.map(() => new Path2D());
    const front = accents.map(() => new Path2D());
    const lag = n('coilLag');
    const arc = n('flipArc') * stepH;
    const mid = size * FIXED.CAP * 0.5;
    const cx = c.w * 0.5;
    letters.forEach((L, i) => {
      const q = Math.min(steps, Math.max(0, progress - i * n('stagger')));
      const k = Math.min(steps - 1, Math.floor(q));
      const phi = q - k;
      const sA = scaleAt(k);
      const sB = scaleAt(k + 1);
      const squash = rest ? 0 : L.squash;
      for (let j = coils - 1; j >= 0; j--) {
        const t = j / (coils - 1);
        const s = smoothstep(0, 1, phi * (1 + lag) - (1 - t) * lag);
        const sc = sA + (sB - sA) * s;
        const bx = cx + L.dx * sc;
        const by = edgeAt(k) + stepH * s - arc * Math.sin(Math.PI * s);
        const flip = Math.cos(SHARED.TAU * s);
        const lift = j * n('coilGap') * (1 + squash) * sc;
        const path = (j ? back : front)[i % SHARED.INKS]!;
        for (const loop of L.loops) {
          loop.forEach((pt, m) => {
            const x = bx + pt.x * sc;
            const y = by - lift + (-mid + (pt.y + mid) * flip) * sc;
            if (m) path.lineTo(x, y);
            else path.moveTo(x, y);
          });
          path.closePath();
        }
      }
    });
    g.lineJoin = 'round';
    g.lineCap = 'round';
    g.lineWidth = n('coilThickness');
    g.globalCompositeOperation = theme.blend;
    g.globalAlpha = n('backAlpha');
    back.forEach((path, k) => {
      g.strokeStyle = accents[k]!;
      g.stroke(path);
    });
    g.globalAlpha = 1;
    front.forEach((path, k) => {
      g.strokeStyle = accents[k]!;
      g.stroke(path);
    });
    g.globalCompositeOperation = 'source-over';
  }

  function idleStep(dt: number): void {
    const last = end();
    const v = n('idleSpeed') * dt;
    if (idle === 'down') {
      P = Math.min(last, P + v);
      if (P >= last) [idle, held] = ['restDown', 0];
    } else if (idle === 'up') {
      P = Math.max(0, P - v);
      if (P <= 0) [idle, held] = ['restUp', 0];
    } else {
      held += dt;
      if (held >= n('idleHold')) idle = idle === 'restDown' ? 'up' : 'down';
    }
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
      const pos = source.read();
      const scrolled = lastScroll === null ? 0 : pos - lastScroll;
      lastScroll = pos;
      let moved = scrolled / n('scrub');
      if (ptr.down && ptr.pointerType !== 'mouse') moved += (ptr.x - ptr.px) / n('scrub');
      if (moved) {
        P = Math.min(end(), Math.max(0, P + moved));
        quiet = 0;
        idle = moved > 0 ? 'down' : 'up';
      } else {
        quiet += dt;
        if (quiet >= n('idleWait')) idleStep(dt);
      }
      const mid = size * FIXED.CAP * 0.5;
      for (const tap of ptr.takeTaps()) {
        letters.forEach((L, i) => {
          const q = Math.min(steps, Math.max(0, P - i * n('stagger')));
          const k = Math.round(q);
          const sc = scaleAt(k);
          const x = c.w * 0.5 + L.dx * sc;
          const y = edgeAt(k) - mid * sc;
          if (Math.hypot(tap.x - x, tap.y - y) < size * sc) L.v += n('nudge');
        });
      }
      letters.forEach((L, i) => {
        const q = Math.min(steps, Math.max(0, P - i * n('stagger')));
        const step = Math.floor(q);
        if (step !== L.step) {
          L.v -= n('bounce');
          L.step = step;
        }
        L.v += -L.squash * n('stiffness') * f;
        L.v *= n('damping') ** f;
        L.squash = Math.max(FIXED.SQUASH_MIN, L.squash + L.v * f);
      });
      draw(P, false);
    },
    still() {
      stillShown = true;
      ptr.takeTaps();
      draw(end(), true);
    },
    setParams(next) {
      p = { ...next };
      layout();
      if (stillShown) draw(end(), true);
    },
    setTheme(th) {
      theme = th;
      inks();
      if (stillShown) draw(end(), true);
    },
    restart() {
      P = 0;
      quiet = 0;
      idle = 'down';
      for (const L of letters) [L.squash, L.v, L.step] = [0, 0, 0];
    },
    destroy() {
      ptr.destroy();
      removeSource();
      inner?.el.remove();
      c.destroy();
      letters = [];
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
