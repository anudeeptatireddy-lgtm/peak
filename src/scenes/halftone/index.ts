// `halftone`: Halftone paper (SCENES.md #36). Ported from reference/riso-demo.html's
// "Halftone"; defaults reproduce it, which tests/e2e/parity.spec.ts checks.

import { createCanvas } from '../../engine/canvas';
import { createPointer } from '../../engine/pointer';
import { frameFactor } from '../../engine/time';
import { smoothstep } from '../../kits/easing';
import type { Theme } from '../../theme/worlds';
import { SHARED } from '../shared';
import type { Params, SceneContext, SceneInstance, SceneModule } from '../types';
import { FIXED } from './constants';
import { meta } from './meta';
import { params } from './params';
import { followUps } from './prompt';

interface Ripple {
  x: number;
  y: number;
  r: number;
  a: number;
}

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const ease = (k: number, f: number) => 1 - Math.pow(1 - k, f);

function create(host: HTMLElement, initial: Params, ctx: SceneContext): SceneInstance {
  let p = { ...initial };
  const n = (id: string) => Number(p[id]);
  let theme: Theme = ctx.theme;
  const c = createCanvas(host);
  const ptr = createPointer(host);
  let g = 0;
  let count = 0;
  let pts = new Float32Array(0);
  // Hot (swelled) dots: position, radius and swell.
  let hx = new Float32Array(0);
  let hy = new Float32Array(0);
  let hr = new Float32Array(0);
  let he = new Float32Array(0);
  const fx = { x: 0, y: 0, vx: 0, vy: 0, init: false };
  let ripples: Ripple[] = [];
  let time = 0;

  function grid(): void {
    g =
      n('spacing') > 0
        ? n('spacing')
        : clamp(Math.min(c.w, c.h) / n('spacingDiv'), n('spacingMin'), n('spacingMax'));
    const rowH = g * FIXED.ROW;
    const cols = Math.ceil(c.w / g) + 2;
    const rows = Math.ceil(c.h / rowH) + 2;
    pts = new Float32Array(cols * rows * 2);
    count = 0;
    for (let j = 0; j < rows; j++)
      for (let i = 0; i < cols; i++) {
        pts[count * 2] = (i - 0.5) * g + (j % 2 ? g / 2 : 0);
        pts[count * 2 + 1] = (j - 0.5) * rowH;
        count++;
      }
    hx = new Float32Array(count);
    hy = new Float32Array(count);
    hr = new Float32Array(count);
    he = new Float32Array(count);
  }

  function draw(): void {
    const g2 = c.ctx;
    c.clear();
    const R = Math.min(c.w, c.h) * (n('reach') / SHARED.PERCENT);
    const base = n('dotBase') + g * n('dotGrow');
    const band = g * n('rippleWidth');
    const reach = FIXED.RING_REACH;
    const rs = n('rippleStrength');
    let m = 0;
    g2.beginPath();
    for (let i = 0; i < count; i++) {
      const x = pts[i * 2]!;
      const y = pts[i * 2 + 1]!;
      const dx = x - fx.x;
      const dy = y - fx.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      let e = 0;
      if (d < R) e = smoothstep(0, 1, 1 - d / R);
      for (const rp of ripples) {
        const rx = x - rp.x;
        const ry = y - rp.y;
        const u = (Math.sqrt(rx * rx + ry * ry) - rp.r) / band;
        if (u > -reach && u < reach) e += rp.a * Math.exp(-u * u) * rs;
      }
      if (e < FIXED.HOT_FLOOR) {
        g2.moveTo(x + base, y);
        g2.arc(x, y, base, 0, SHARED.TAU);
      } else {
        e = Math.min(e, FIXED.MAX_SWELL);
        const inv = d > FIXED.NEAR ? 1 / d : 0;
        const push = e * g * n('push');
        hx[m] = x + dx * inv * push;
        hy[m] = y + dy * inv * push;
        hr[m] = base + e * g * n('swell');
        he[m] = e;
        m++;
      }
    }
    g2.fillStyle = theme.inkSoft;
    g2.globalAlpha = n('grayAlpha');
    g2.fill();
    g2.globalAlpha = 1;
    g2.globalCompositeOperation = theme.blend;
    const mis = g * n('misprint');
    const gain = n('misprintGain');
    const mx = clamp(fx.vx * gain, -mis, mis);
    const my = clamp(fx.vy * gain, -mis, mis);
    const inks = [theme.c1, theme.c2, theme.c3];
    const reg = FIXED.REGISTER;
    for (let L = 0; L < SHARED.INKS; L++) {
      const ox = reg[L * 2]! * g * FIXED.REGISTER_SIZE + mx * (L - 1);
      const oy = reg[L * 2 + 1]! * g * FIXED.REGISTER_SIZE + my * (L - 1);
      const shrink = 1 - L * n('inkShrink');
      g2.beginPath();
      for (let i = 0; i < m; i++) {
        const e = he[i]!;
        const x = hx[i]! + ox * e;
        const y = hy[i]! + oy * e;
        const r = hr[i]! * shrink;
        g2.moveTo(x + r, y);
        g2.arc(x, y, r, 0, SHARED.TAU);
      }
      g2.fillStyle = inks[L]!;
      g2.fill();
    }
    g2.globalCompositeOperation = 'source-over';
  }

  return {
    resize() {
      c.fit();
      grid();
      if (!fx.init) {
        fx.x = c.w * FIXED.START[0];
        fx.y = c.h * FIXED.START[1];
        fx.init = true;
      }
    },
    update(dt) {
      const f = frameFactor(dt);
      time += dt;
      const t = time;
      ptr.sync();
      let tx: number;
      let ty: number;
      if (ptr.active) {
        tx = ptr.x;
        ty = ptr.y;
      } else {
        tx = c.w * (n('wanderCX') + n('wanderX') * Math.sin(t * n('wanderSX')));
        ty = c.h * (n('wanderCY') + n('wanderY') * Math.sin(t * n('wanderSY') + 1));
      }
      const k = ease(n('follow'), f);
      const nx = lerp(fx.x, tx, k);
      const ny = lerp(fx.y, ty, k);
      fx.vx = lerp(fx.vx, (nx - fx.x) / f, ease(n('velSmooth'), f));
      fx.vy = lerp(fx.vy, (ny - fx.y) / f, ease(n('velSmooth'), f));
      fx.x = nx;
      fx.y = ny;
      for (const tap of ptr.takeTaps()) ripples.push({ x: tap.x, y: tap.y, r: 0, a: 1 });
      const fade = Math.pow(n('rippleFade'), f);
      for (const rp of ripples) {
        rp.r += n('rippleSpeed') * f;
        rp.a *= fade;
      }
      ripples = ripples.filter((rp) => rp.a >= FIXED.RIPPLE_GONE);
      draw();
    },
    still() {
      ptr.takeTaps();
      draw();
    },
    setParams(next) {
      p = { ...next };
      if (c.w) grid();
    },
    setTheme(t) {
      theme = t;
    },
    restart() {
      ripples = [];
      time = 0;
      fx.x = c.w * FIXED.START[0];
      fx.y = c.h * FIXED.START[1];
      fx.vx = 0;
      fx.vy = 0;
    },
    destroy() {
      ptr.destroy();
      c.destroy();
      ripples = [];
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
