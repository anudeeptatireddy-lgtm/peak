// `platformarrival`: Platform Arrival (SCENES.md #81). Layered landscapes race past
// a train window; scrolling springs the train into a station whose sign shows NAME.

import { cursorSweep } from '../../kits/cursor';
import { createCanvas } from '../../engine/canvas';
import { fontsReady } from '../../engine/fonts';
import { innerScroller } from '../../engine/inner-scroll';
import { createPointer } from '../../engine/pointer';
import { addScrollSource } from '../../engine/scheduler';
import { createScrollSource } from '../../engine/scroll';
import { frameFactor } from '../../engine/time';
import { clamp01, springStep, type Spring } from '../../kits/easing';
import { applyFont } from '../../kits/text';
import { ensureContrast, mixOklab } from '../../theme/color';
import type { Theme } from '../../theme/worlds';
import { SHARED } from '../shared';
import type { Params, SceneContext, SceneInstance, SceneModule } from '../types';
import { FIXED } from './constants';
import { meta } from './meta';
import { params } from './params';
import { followUps } from './prompt';

type Shape = keyof typeof FIXED.SHAPES;

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
  let alive = true;
  let lastScroll: number | null = null;

  // Arrival: 0 racing, 1 stopped at the sign (overshoots past 1 on the bounce).
  const arrive: Spring = { x: 0, v: 0 };
  const swing: Spring = { x: 0, v: 0 };
  let goal = 0;
  let quiet = 0;
  let wait = 0;
  let offsets: number[] = [];
  let streakY: number[] = [];
  let streakX: number[] = [];
  let streakOff = 0;
  let layerInks: string[] = [];
  let signInk = '';
  let font = { size: 0, width: 0 };

  function layerCount(): number {
    return c.w < SHARED.SMALL_SCREEN ? n('layersSmall') : n('layers');
  }

  function colors(): void {
    const L = layerCount();
    const inks = [theme.c1, theme.c2, theme.c3];
    layerInks = [];
    for (let k = 0; k < L; k++) {
      const s = L > 1 ? k / (L - 1) : 1;
      const ink = inks[(L - 1 - k) % SHARED.INKS]!;
      layerInks.push(mixOklab(ink, theme.ground, n('haze') * (1 - s)));
    }
    signInk = ensureContrast(theme.ink, theme.c1, FIXED.SIGN_CONTRAST);
  }

  function layout(): void {
    if (!c.w) return;
    const L = layerCount();
    while (offsets.length < L) offsets.push(0);
    offsets.length = L;
    streakY = [];
    streakX = [];
    const count = Math.round(
      FIXED.STREAKS * (ctx.quality === 'preview' ? SHARED.PREVIEW_SCALE : 1),
    );
    for (let i = 0; i < count; i++) {
      streakY.push(FIXED.HORIZON + Math.random() * (FIXED.FRONT_LINE - FIXED.HORIZON));
      streakX.push(Math.random());
    }
    colors();
    if (!fontsOk) return;
    const g = c.ctx;
    let size = c.h * n('textHeight');
    applyFont(g, { size, weight: n('weight') });
    let width = g.measureText(String(p.text || ' ')).width;
    const room = c.w * n('fitWidth') - size * FIXED.SIGN_PAD * 2;
    if (width > room) {
      size *= room / width;
      applyFont(g, { size, weight: n('weight') });
      width = g.measureText(String(p.text || ' ')).width;
    }
    font = { size, width };
  }

  fontsReady().then(() => {
    if (!alive) return;
    fontsOk = true;
    layout();
  });

  function ridge(shape: Shape, u: number, front: boolean): number {
    if (shape === 'coast' && front) return FIXED.SEA_SHARE;
    let y = 0;
    for (const [amp, waves, phase] of FIXED.SHAPES[shape])
      y += amp * Math.sin(SHARED.TAU * waves * u + phase);
    return shape === 'coast' ? Math.max(0, y) : (y + 1) * 0.5;
  }

  /** The platform's center offset from the screen center, in px. */
  function platformOffset(): number {
    const r = 1 - arrive.x;
    return n('stopDistance') * c.w * r * Math.abs(r);
  }

  function draw(speed: number): void {
    const g = c.ctx;
    const { w, h } = c;
    c.clear();
    const L = offsets.length;
    const shape = String(p.landscape) as Shape;
    // Landscape layers, back to front.
    for (let k = 0; k < L; k++) {
      const s = L > 1 ? k / (L - 1) : 1;
      const base = h * (FIXED.HORIZON + (FIXED.FRONT_LINE - FIXED.HORIZON) * s);
      const amp = h * n('hillHeight') * (1 + s) * 0.5;
      const period = w * n('period') * (1 + s);
      const front = k >= L * 0.5;
      g.beginPath();
      g.moveTo(0, h);
      for (let x = 0; x <= w + FIXED.SAMPLE_PX; x += FIXED.SAMPLE_PX)
        g.lineTo(x, base - amp * ridge(shape, (x + offsets[k]!) / period + k, front));
      g.lineTo(w, h);
      g.closePath();
      g.fillStyle = layerInks[k]!;
      g.fill();
    }
    // Speed streaks.
    const fast = clamp01((speed - FIXED.STREAK_FROM) / (1 - FIXED.STREAK_FROM));
    if (fast > 0) {
      const len = w * n('streakLength') * fast;
      const span = w + len;
      g.beginPath();
      for (let i = 0; i < streakY.length; i++) {
        const x = span - ((streakX[i]! * span + streakOff * (1 + streakY[i]!)) % span);
        g.rect(x - len, h * streakY[i]!, len, FIXED.STREAK_W);
      }
      g.globalAlpha = fast;
      g.fillStyle = theme.ink;
      g.fill();
      g.globalAlpha = 1;
    }
    // Platform, canopy and pillars.
    const cx = w * 0.5 + platformOffset();
    const half = w * n('platformLength') * 0.5;
    const left = cx - half;
    const top = h * FIXED.PLATFORM_TOP;
    g.fillStyle = theme.surface;
    g.fillRect(left, top, half * 2, h - top);
    g.fillStyle = theme.c3;
    g.fillRect(left, top, half * 2, (h - top) * FIXED.EDGE_LINE);
    const beam = h * FIXED.CANOPY_Y;
    g.beginPath();
    g.rect(left, beam, half * 2, FIXED.BEAM);
    const gap = w * FIXED.PILLAR_GAP;
    for (let x = left; x <= cx + half; x += gap) g.rect(x, beam, FIXED.BEAM, top - beam);
    g.fillStyle = theme.inkSoft;
    g.fill();
    // The sign, hanging from the beam.
    if (fontsOk && font.size) {
      const pad = font.size * FIXED.SIGN_PAD;
      const bw = font.width + pad * 2;
      const bh = font.size + pad * 2;
      const chain = font.size * FIXED.CHAIN;
      g.save();
      g.translate(cx, beam + FIXED.BEAM);
      g.rotate(swing.x);
      g.strokeStyle = theme.inkSoft;
      g.lineWidth = FIXED.STREAK_W;
      g.beginPath();
      g.moveTo(-bw * 0.5 + pad, 0);
      g.lineTo(-bw * 0.5 + pad, chain);
      g.moveTo(bw * 0.5 - pad, 0);
      g.lineTo(bw * 0.5 - pad, chain);
      g.stroke();
      g.fillStyle = theme.c1;
      g.fillRect(-bw * 0.5, chain, bw, bh);
      applyFont(g, { size: font.size, weight: n('weight') });
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillStyle = signInk;
      g.fillText(String(p.text || ' '), 0, chain + bh * 0.5);
      g.restore();
    }
    // The window frame.
    const fw = n('frame');
    if (fw > 0) {
      g.beginPath();
      g.rect(0, 0, w, h);
      g.roundRect(fw, fw, w - fw * 2, h - fw * 2, fw);
      g.fillStyle = theme.surface;
      g.fill('evenodd');
      g.lineWidth = FIXED.FRAME_LINE;
      g.strokeStyle = theme.inkSoft;
      g.beginPath();
      g.roundRect(fw, fw, w - fw * 2, h - fw * 2, fw);
      g.stroke();
    }
  }

  function step(dt: number): void {
    const f = frameFactor(dt);
    ptr.sync();
    ptr.takeTaps();
    const pos = source.read();
    const scrolled = lastScroll === null ? 0 : pos - lastScroll;
    lastScroll = pos;
    let moved = scrolled / n('scrollPx');
    if (ptr.down) moved += (ptr.x - ptr.px) / n('scrollPx');
    if (moved) {
      goal = clamp01(goal + moved);
      quiet = 0;
    } else quiet += dt;
    // Idle demo: arrive, wait, leave, cruise, again.
    if (quiet > n('idleDelay')) {
      const settled = Math.abs(arrive.x - goal) < FIXED.SETTLED;
      wait = settled ? wait + dt : 0;
      if (wait > n('idleHold')) {
        goal = goal < 0.5 ? 1 : 0;
        wait = 0;
      }
    }
    const k = n('brake');
    const prev = arrive.v;
    springStep(arrive, goal, k, 1 - Math.sqrt(k) * 2 * (1 - n('bounce')), f);
    const lurch = f > 0 ? (arrive.v - prev) / f : 0;
    springStep(
      swing,
      Math.max(-FIXED.SWING_MAX, Math.min(FIXED.SWING_MAX, -lurch * n('signSwing'))),
      FIXED.SWING_STIFF,
      FIXED.SWING_DAMP,
      f,
    );
    const speed = 1 - arrive.x;
    const L = offsets.length;
    const px = n('topSpeed') * n('speedPx') * speed * f;
    for (let i = 0; i < L; i++) {
      const s = L > 1 ? i / (L - 1) : 1;
      offsets[i]! += px * (1 - n('parallax') * (1 - s));
    }
    streakOff += px;
    draw(Math.abs(speed) * n('topSpeed'));
  }

  return {
    resize() {
      if (!c.fit()) return;
      layout();
    },
    update(dt) {
      step(dt);
    },
    still() {
      ptr.takeTaps();
      arrive.x = 1;
      arrive.v = 0;
      swing.x = 0;
      goal = 1;
      draw(0);
    },
    setParams(next) {
      p = { ...next };
      layout();
    },
    setTheme(th) {
      theme = th;
      colors();
    },
    restart() {
      arrive.x = 0;
      arrive.v = 0;
      goal = 0;
      quiet = 0;
    },
    destroy() {
      sweep.destroy();
      alive = false;
      ptr.destroy();
      removeSource();
      inner?.el.remove();
      c.destroy();
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
