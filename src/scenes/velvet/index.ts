// `velvet`: Velvet Brush (SCENES.md #55, gallery only, REALISTIC: PRD §8.8). Crushed velvet
// shaded in a WebGL fragment shader from a fiber-lean grid that the cursor brushes and that
// slowly relaxes. The name is already brushed the other way, so it shows as a shift in sheen.

import { createCanvas } from '../../engine/canvas';
import { createPointer } from '../../engine/pointer';
import { makeNoise } from '../../kits/field';
import {
  TIER_GRID,
  TIER_SCALE,
  createGL,
  createGovernor,
  hexToVec3,
  pickTier,
  type DataTexture,
  type GL,
  type Pass,
  type Tier,
  type TierSetting,
} from '../../kits/gl';
import { applyFont, offscreen, whenFontReady } from '../../kits/text';
import { parseHex } from '../../theme/color';
import type { Theme } from '../../theme/worlds';
import { SHARED } from '../shared';
import type { Params, SceneContext, SceneInstance, SceneModule } from '../types';
import { FIXED } from './constants';
import { meta } from './meta';
import { params } from './params';
import { followUps } from './prompt';
import { VELVET_FS } from './shader';

function create(host: HTMLElement, initial: Params, ctx: SceneContext): SceneInstance {
  let p = { ...initial };
  const n = (id: string) => Number(p[id]);
  let theme: Theme = ctx.theme;
  const noise = makeNoise(FIXED.NOISE_SEED);
  const ptr = createPointer(host);
  const rad = (deg: number) => (deg * Math.PI) / FIXED.HALF_TURN;

  let tier: Tier = pickTier(String(p.quality) as TierSetting, ctx);
  let governor = makeGovernor();
  function makeGovernor() {
    return String(p.quality) === 'auto'
      ? createGovernor(tier, {
          slowSeconds: FIXED.SLOW_SECONDS,
          afterSeconds: FIXED.SLOW_AFTER,
          smoothing: FIXED.SLOW_SMOOTHING,
        })
      : null;
  }

  // ---- the fiber grid (CPU) ----
  let cols = 0;
  let rows = 0;
  let cell = 1;
  let leanX = new Float32Array(0);
  let leanY = new Float32Array(0);
  let dent = new Float32Array(0);
  let restX = new Float32Array(0);
  let restY = new Float32Array(0);
  let mask = new Float32Array(0);
  let bytes = new Uint8Array(0);

  // ---- drawing: WebGL, or a 2D fallback ----
  let glh: GL | null = createGL(host);
  let pass: Pass | null = null;
  let fieldTex: DataTexture | null = null;
  let fallback: ReturnType<typeof createCanvas> | null = glh ? null : createCanvas(host);
  let W = 0;
  let H = 0;
  let sized = false;

  function buildGL(): void {
    if (!glh) return;
    pass?.destroy();
    fieldTex?.destroy();
    pass = glh.pass(VELVET_FS);
    fieldTex = glh.texture('linear');
  }
  if (glh) {
    buildGL();
    glh.onLost = () => {
      fallback ??= createCanvas(host);
      fallback.fit();
      draw();
    };
    glh.onRestored = () => {
      fallback?.destroy();
      fallback = null;
      buildGL();
      glh!.fit(TIER_SCALE[tier]);
      draw();
    };
  }

  /** The grid for the current size and tier. Returns true when it was rebuilt. */
  function layout(): boolean {
    const w = glh?.w || fallback?.w || host.clientWidth;
    const h = glh?.h || fallback?.h || host.clientHeight;
    if (!w || !h) return false;
    const nc = Math.max(1, Math.round(FIXED.COLS * TIER_GRID[tier]));
    const nr = Math.max(1, Math.ceil((h / w) * nc));
    const changed = nc !== cols || nr !== rows || w !== W || h !== H;
    W = w;
    H = h;
    if (!changed) return false;
    cols = nc;
    rows = nr;
    cell = W / cols;
    const size = cols * rows;
    leanX = new Float32Array(size);
    leanY = new Float32Array(size);
    dent = new Float32Array(size);
    restX = new Float32Array(size);
    restY = new Float32Array(size);
    mask = new Float32Array(size);
    bytes = new Uint8Array(size * SHARED.RGBA);
    buildMask();
    buildRest();
    leanX.set(restX);
    leanY.set(restY);
    return true;
  }

  /** The hidden name, drawn once on a grid-sized 2D canvas: 1 inside the letters. */
  function buildMask(): void {
    const o = offscreen(cols, rows);
    const g = o.ctx;
    const k = cols / W;
    g.setTransform(k, 0, 0, k, 0, 0);
    const text = String(p.text || ' ');
    const size = Math.min(
      H * FIXED.TEXT_SIZE,
      (W * FIXED.TEXT_FIT) / Math.max(1, text.length) / FIXED.TEXT_EM,
    );
    applyFont(g, { size, weight: FIXED.TEXT_WEIGHT }, SHARED.PERCENT);
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillStyle = theme.ink;
    g.fillText(text, W * 0.5, H * 0.5);
    const data = g.getImageData(0, 0, cols, rows).data;
    for (let i = 0; i < mask.length; i++) mask[i] = data[(i + 1) * SHARED.RGBA - 1]! / FIXED.BYTE;
    o.free();
  }

  /** The resting pile: crushed by noise, and turned the other way inside the name. */
  function buildRest(): void {
    const crush = n('crush');
    for (let j = 0; j < rows; j++)
      for (let i = 0; i < cols; i++) {
        const k = j * cols + i;
        const a =
          rad(FIXED.REST_ANGLE) +
          noise.noise2(i / FIXED.CRUSH_CELLS, j / FIXED.CRUSH_CELLS) *
            rad(FIXED.CRUSH_TURN) *
            crush;
        const lean = Math.min(
          1,
          FIXED.REST_LEAN *
            (1 +
              noise.noise2(i / FIXED.CRUSH_CELLS + cols, j / FIXED.CRUSH_CELLS + rows) *
                FIXED.CRUSH_LEAN *
                crush),
        );
        const flip = 1 - 2 * mask[k]!;
        restX[k] = Math.cos(a) * lean * flip;
        restY[k] = Math.sin(a) * lean * flip;
      }
  }

  // ---- brushing and relaxing ----
  function stamp(cx: number, cy: number, dx: number, dy: number, strength: number, r: number) {
    const x0 = Math.max(0, Math.floor(cx - r));
    const x1 = Math.min(cols - 1, Math.ceil(cx + r));
    const y0 = Math.max(0, Math.floor(cy - r));
    const y1 = Math.min(rows - 1, Math.ceil(cy + r));
    for (let j = y0; j <= y1; j++)
      for (let i = x0; i <= x1; i++) {
        const q = ((i + 0.5 - cx) ** 2 + (j + 0.5 - cy) ** 2) / (r * r);
        if (q >= 1) continue;
        const w = (1 - q) ** 2;
        const k = j * cols + i;
        const rate = Math.min(1, FIXED.BRUSH_RATE * w * strength);
        leanX[k] = leanX[k]! + (dx * FIXED.BRUSH_LEAN - leanX[k]!) * rate;
        leanY[k] = leanY[k]! + (dy * FIXED.BRUSH_LEAN - leanY[k]!) * rate;
        dent[k] = Math.min(1, dent[k]! + w * strength * FIXED.DENT_RATE);
      }
  }

  /** One stroke segment in CSS pixels, taking `dt` seconds. */
  function brush(x0: number, y0: number, x1: number, y1: number, dt: number): void {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const d = Math.hypot(dx, dy);
    if (d < FIXED.EPS || dt <= 0) return;
    const strength = Math.min(1, d / dt / FIXED.SPEED_REF);
    const r = Math.max(1, ((n('brushWidth') / SHARED.PERCENT) * W) / cell);
    const steps = Math.max(1, Math.ceil(d / cell / (r * FIXED.STEP_FRAC)));
    for (let s = 1; s <= steps; s++) {
      const f = s / steps;
      stamp((x0 + dx * f) / cell, (y0 + dy * f) / cell, dx / d, dy / d, strength, r);
    }
  }

  function relax(dt: number): void {
    const k = 1 - Math.exp((-FIXED.RELAX_K * dt) / Math.max(FIXED.EPS, n('relax')));
    for (let i = 0; i < leanX.length; i++) {
      leanX[i] = leanX[i]! + (restX[i]! - leanX[i]!) * k;
      leanY[i] = leanY[i]! + (restY[i]! - leanY[i]!) * k;
      dent[i] = dent[i]! - dent[i]! * k;
    }
  }

  // ---- drawing ----
  const lin = (hex: string) =>
    hexToVec3(hex).map((v) => Math.pow(v, FIXED.GAMMA)) as [number, number, number];

  function pack(): void {
    // Texture row 0 is the bottom of the screen, so write the grid upside down.
    for (let j = 0; j < rows; j++) {
      const src = (rows - 1 - j) * cols;
      for (let i = 0; i < cols; i++) {
        const k = src + i;
        const o = (j * cols + i) * SHARED.RGBA;
        bytes[o] = Math.round((leanX[k]! * 0.5 + 0.5) * FIXED.BYTE);
        bytes[o + 1] = Math.round((leanY[k]! * 0.5 + 0.5) * FIXED.BYTE);
        bytes[o + 2] = Math.round(dent[k]! * FIXED.BYTE);
        bytes[o + SHARED.RGBA - 1] = FIXED.BYTE;
      }
    }
  }

  /** The fold waves as the shader wants them: direction x, direction y, frequency, phase. */
  const waves = FIXED.WAVES.map((w): [number, number, number, number] => [
    Math.cos(rad(w[0]!)),
    Math.sin(rad(w[0]!)),
    w[1]!,
    w[2]!,
  ]);

  function drawGL(): void {
    if (!glh || !pass || !fieldTex || glh.lost || !cols) return;
    pack();
    fieldTex.set(bytes, cols, rows);
    const body = lin(theme.c1).map((v) => v * FIXED.BODY_DEPTH) as [number, number, number];
    const sheenCol = lin(theme.c1).map((v) => v + (1 - v) * FIXED.SHEEN_LIFT) as [
      number,
      number,
      number,
    ];
    const az = rad(n('lightAngle'));
    const el = rad(n('lightHeight'));
    pass.draw({
      u_field: { tex: fieldTex.texture, unit: 0 },
      u_size: [W, H],
      u_body: body,
      u_sheenCol: sheenCol,
      u_light: [Math.cos(az) * Math.cos(el), Math.sin(az) * Math.cos(el), Math.sin(el)],
      u_pile: n('pileLength'),
      u_sheen: n('sheen'),
      u_dent: n('dent'),
      u_fiberSize: n('fiberSize'),
      u_fiberStrength: n('fiberStrength'),
      u_sheenPow: n('sheenSharpness'),
      u_ambient: n('ambient'),
      u_crush: n('crush'),
      u_detail: tier === 'phone' ? 0 : 1,
      u_tiltGain: FIXED.TILT_GAIN,
      u_wrap: FIXED.WRAP,
      u_rimPow: FIXED.RIM_POWER,
      u_rimWeight: FIXED.RIM_WEIGHT,
      u_kkWeight: FIXED.KK_WEIGHT,
      u_fiberLum: FIXED.FIBER_LUM,
      u_sparkRate: FIXED.SPARKLE_RATE,
      u_sparkGain: FIXED.SPARKLE_GAIN,
      u_dentDark: FIXED.DENT_DARK,
      u_dentSheen: FIXED.DENT_SHEEN,
      u_falloff: FIXED.FALLOFF,
      u_exposure: FIXED.EXPOSURE,
      u_gamma: FIXED.GAMMA,
      u_fiberTurn: FIXED.FIBER_TURN,
      u_crushTurn: FIXED.CRUSH_SHADE_TURN,
      u_crushScale: FIXED.CRUSH_SCALE,
      u_tangentGain: FIXED.TANGENT_GAIN,
      u_kkGate: FIXED.KK_GATE,
      u_crushSize: FIXED.CRUSH_SIZE,
      u_crushRelief: FIXED.CRUSH_RELIEF,
      u_crushEps: FIXED.CRUSH_EPS,
      u_wave0: waves[0]!,
      u_wave1: waves[1]!,
      u_wave2: waves[waves.length - 2]!,
      u_wave3: waves[waves.length - 1]!,
      u_waveWeight: FIXED.WAVE_WEIGHT,
      u_warp: FIXED.WARP,
      u_satinPow: FIXED.SATIN_POW,
      u_satinWeight: FIXED.SATIN_WEIGHT,
      u_leanRef: FIXED.LEAN_REF,
      u_sheenFloor: FIXED.SHEEN_FLOOR,
    });
  }

  /** No WebGL: flat velvet with a few soft sheen bands and the name as an opposite band. */
  function drawFallback(): void {
    if (!fallback) return;
    fallback.fit();
    const g = fallback.ctx;
    const w = fallback.w;
    const h = fallback.h;
    const rgb = parseHex(theme.c1);
    const to = (v: number) => Math.round(v * FIXED.BYTE);
    const body = `rgb(${to(rgb.r * FIXED.BODY_DEPTH)}, ${to(rgb.g * FIXED.BODY_DEPTH)}, ${to(rgb.b * FIXED.BODY_DEPTH)})`;
    g.fillStyle = body;
    g.fillRect(0, 0, w, h);
    const band = (x0: number, y0: number, x1: number, y1: number, alpha: number) => {
      const grad = g.createLinearGradient(x0, y0, x1, y1);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(0.5, theme.c1);
      grad.addColorStop(1, 'transparent');
      g.globalAlpha = alpha;
      g.fillStyle = grad;
      g.fillRect(0, 0, w, h);
      g.globalAlpha = 1;
    };
    band(0, 0, w, h, n('sheen'));
    const text = String(p.text || ' ');
    const size = Math.min(
      h * FIXED.TEXT_SIZE,
      (w * FIXED.TEXT_FIT) / Math.max(1, text.length) / FIXED.TEXT_EM,
    );
    applyFont(g, { size, weight: FIXED.TEXT_WEIGHT }, SHARED.PERCENT);
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    const flip = g.createLinearGradient(w, 0, 0, h);
    flip.addColorStop(0, 'transparent');
    flip.addColorStop(0.5, theme.c1);
    flip.addColorStop(1, 'transparent');
    g.globalAlpha = n('sheen');
    g.fillStyle = flip;
    g.fillText(text, w * 0.5, h * 0.5);
    g.globalAlpha = 1;
  }

  function draw(): void {
    if (glh && !glh.lost) drawGL();
    else drawFallback();
  }

  function resizeAll(): void {
    if (glh) glh.fit(TIER_SCALE[tier]);
    else fallback?.fit();
    layout();
  }

  let last: { x: number; y: number } | null = null;
  const cancelFont = whenFontReady(() => {
    if (!cols) return;
    buildMask();
    buildRest();
    leanX.set(restX);
    leanY.set(restY);
    if (sized) draw();
  });

  return {
    resize() {
      resizeAll();
      sized = true;
      draw();
    },
    update(dt) {
      ptr.sync();
      ptr.takeTaps();
      if (!cols) return;
      const brushing = ptr.pointerType === 'mouse' ? ptr.active : ptr.dragging;
      if (brushing) {
        if (last) brush(last.x, last.y, ptr.x, ptr.y, dt);
        last = { x: ptr.x, y: ptr.y };
      } else last = null;
      relax(dt);
      const dropped = governor?.tick(dt);
      if (dropped) {
        tier = dropped;
        resizeAll();
      }
      draw();
    },
    still() {
      ptr.takeTaps();
      if (!cols) return;
      leanX.set(restX);
      leanY.set(restY);
      dent.fill(0);
      const pts = FIXED.STILL_SWOOP.map((s) => ({ x: s[0] * W, y: s[1] * H }));
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1]!;
        const b = pts[i]!;
        const steps = Math.max(
          1,
          Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / (FIXED.STILL_SPEED * FIXED.STILL_DT)),
        );
        for (let s = 0; s < steps; s++) {
          const f0 = s / steps;
          const f1 = (s + 1) / steps;
          brush(
            a.x + (b.x - a.x) * f0,
            a.y + (b.y - a.y) * f0,
            a.x + (b.x - a.x) * f1,
            a.y + (b.y - a.y) * f1,
            FIXED.STILL_DT,
          );
        }
      }
      draw();
    },
    setParams(next) {
      const before = p;
      p = { ...next };
      if (String(before.quality) !== String(p.quality)) {
        tier = pickTier(String(p.quality) as TierSetting, ctx);
        governor = makeGovernor();
        resizeAll();
      }
      if (cols && before.text !== p.text) buildMask();
      if (cols && (before.text !== p.text || before.crush !== p.crush)) buildRest();
      if (sized) draw();
    },
    setTheme(t) {
      theme = t;
      if (cols) buildMask();
      if (sized) draw();
    },
    restart() {
      leanX.set(restX);
      leanY.set(restY);
      dent.fill(0);
      last = null;
    },
    destroy() {
      cancelFont();
      ptr.destroy();
      pass?.destroy();
      fieldTex?.destroy();
      glh?.destroy();
      glh = null;
      fallback?.destroy();
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
