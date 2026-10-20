// `soap`: Soap Film (SCENES.md #56, gallery only, REALISTIC: PRD §8.8). Each letter of the name
// is a wire frame holding a soap film. The CPU simulates thickness (drainage, swirl, breath,
// pops, droplets) on a small grid; a WebGL shader turns thickness into real thin-film color.

import { createCanvas } from '../../engine/canvas';
import { createPointer } from '../../engine/pointer';
import { makeNoise } from '../../kits/field';
import {
  TIER_GRID,
  TIER_SCALE,
  createGL,
  createGovernor,
  hexToVec3,
  packSigned,
  pickTier,
  type DataTexture,
  type GL,
  type Pass,
  type Tier,
  type TierSetting,
} from '../../kits/gl';
import { applyFont, letterBoxes, offscreen, whenFontReady } from '../../kits/text';
import type { Theme } from '../../theme/worlds';
import { SHARED } from '../shared';
import type { Params, SceneContext, SceneInstance, SceneModule } from '../types';
import { FIXED } from './constants';
import { meta } from './meta';
import { params } from './params';
import { followUps } from './prompt';
import { signedDistance, wireCoverage } from './mask';
import { SOAP_FS } from './shader';

interface Drop {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  age: number;
  phase: number;
}

/** The four cells touching a cell. */
const NEIGHBORS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
] as const;

/** A letter's film: whole, empty after a pop, or growing back from the left. */
type Phase = 'film' | 'wait' | 'grow';

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

  // ---- the film grid (CPU) ----
  let cols = 0;
  let rows = 0;
  let cell = 1;
  let thick = new Float32Array(0);
  let spare = new Float32Array(0);
  let bulge = new Float32Array(0);
  let shape = new Uint8Array(0); // 1 where a film may be (inside a letter, off the wire)
  let alive = new Uint8Array(0); // 1 where film is right now
  let lid = new Int8Array(0); // which letter a cell belongs to, -1 for none
  let edge = new Float32Array(0); // meniscus boost in nm
  let yrel = new Float32Array(0); // height inside its letter, 0 top to 1 bottom
  let bytes = new Uint8Array(0);
  let letters: {
    x0: number;
    x1: number;
    phase: Phase;
    timer: number;
    front: number;
    press: number;
  }[] = [];
  let drops: Drop[] = [];
  let time = 0;
  let pops = 0;

  // ---- drawing: WebGL, or a 2D fallback ----
  let glh: GL | null = createGL(host);
  let pass: Pass | null = null;
  let filmTex: DataTexture | null = null;
  let maskTex: DataTexture | null = null;
  let maskCv: HTMLCanvasElement | null = null;
  let fallback: ReturnType<typeof createCanvas> | null = glh ? null : createCanvas(host);
  let W = 0;
  let H = 0;
  let sized = false;

  function buildGL(): void {
    if (!glh) return;
    pass?.destroy();
    filmTex?.destroy();
    maskTex?.destroy();
    pass = glh.pass(SOAP_FS);
    filmTex = glh.texture('linear');
    maskTex = glh.texture('linear');
    if (maskCv) maskTex.setCanvas(maskCv);
  }
  if (glh) {
    buildGL();
    glh.onLost = () => {
      fallback ??= createCanvas(host);
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

  const fontSize = () =>
    Math.min(
      H * FIXED.TEXT_SIZE,
      (W * FIXED.TEXT_FIT) / Math.max(1, String(p.text || ' ').length) / FIXED.TEXT_EM,
    );

  /** Draws the filled letters (white on black) at the given scale. */
  function fillLetters(g: CanvasRenderingContext2D, scale: number): void {
    const text = String(p.text || ' ');
    g.setTransform(scale, 0, 0, scale, 0, 0);
    g.fillStyle = 'black';
    g.fillRect(0, 0, W, H);
    applyFont(g, { size: fontSize(), weight: FIXED.TEXT_WEIGHT }, SHARED.PERCENT);
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillStyle = 'white';
    g.fillText(text, W * 0.5, H * 0.5);
  }

  /**
   * The letters as image data at the given scale: red = where a film may be (inside the letter and
   * off the wire), green = the wire, centered on the letters' true boundary.
   */
  function letterMask(w: number, h: number, scale: number): Uint8ClampedArray {
    const o = offscreen(w, h);
    fillLetters(o.ctx, scale);
    const px = o.ctx.getImageData(0, 0, w, h).data;
    o.free();
    const inside = new Uint8Array(w * h);
    for (let k = 0; k < inside.length; k++)
      inside[k] = px[k * SHARED.RGBA]! > SHARED.PERCENT ? 1 : 0;
    const sd = signedDistance(inside, w, h);
    const out = new Uint8ClampedArray(w * h * SHARED.RGBA);
    const width = n('wireWidth') * scale;
    for (let k = 0; k < sd.length; k++) {
      const wire = wireCoverage(sd[k]!, width);
      const o4 = k * SHARED.RGBA;
      out[o4] = (inside[k] ? 1 : 0) * FIXED.BYTE;
      out[o4 + 1] = wire * FIXED.BYTE;
      out[o4 + SHARED.RGBA - 1] = FIXED.BYTE;
    }
    return out;
  }

  /** Rebuilds everything that depends on the name, the size or the grid. */
  function layout(): boolean {
    const w = glh?.w || fallback?.w || host.clientWidth;
    const h = glh?.h || fallback?.h || host.clientHeight;
    if (!w || !h) return false;
    W = w;
    H = h;
    const nc = Math.max(1, Math.round(FIXED.COLS * TIER_GRID[tier]));
    const nr = Math.max(1, Math.ceil((h / w) * nc));
    cols = nc;
    rows = nr;
    cell = W / cols;
    const size = cols * rows;
    thick = new Float32Array(size);
    spare = new Float32Array(size);
    bulge = new Float32Array(size);
    shape = new Uint8Array(size);
    alive = new Uint8Array(size);
    lid = new Int8Array(size).fill(-1);
    edge = new Float32Array(size);
    yrel = new Float32Array(size);
    bytes = new Uint8Array(size * SHARED.RGBA);

    // The film shape on the grid: red inside a letter, not green on the wire.
    const data = letterMask(cols, rows, cols / W);
    for (let k = 0; k < size; k++) {
      const o = k * SHARED.RGBA;
      shape[k] = data[o]! > SHARED.PERCENT && data[o + 1]! < SHARED.PERCENT ? 1 : 0;
    }

    // Which letter each cell belongs to, and how high it is inside that letter.
    const probe = offscreen(1, 1);
    applyFont(probe.ctx, { size: fontSize(), weight: FIXED.TEXT_WEIGHT }, SHARED.PERCENT);
    const text = String(p.text || ' ');
    const boxes = letterBoxes(probe.ctx, text, W * 0.5, H * 0.5, 'center');
    probe.free();
    letters = boxes.map((b) => ({
      x0: Math.floor(b.x / cell),
      x1: Math.ceil((b.x + b.w) / cell),
      phase: 'film',
      timer: 0,
      front: 0,
      press: 0,
    }));
    const top = new Array<number>(letters.length).fill(rows);
    const bottom = new Array<number>(letters.length).fill(0);
    for (let j = 0; j < rows; j++)
      for (let i = 0; i < cols; i++) {
        const k = j * cols + i;
        if (!shape[k]) continue;
        const l = letters.findIndex((q) => i >= q.x0 && i < q.x1);
        lid[k] = l;
        if (l < 0) continue;
        top[l] = Math.min(top[l]!, j);
        bottom[l] = Math.max(bottom[l]!, j);
      }
    for (let k = 0; k < size; k++) {
      const l = lid[k]!;
      if (l < 0) continue;
      const j = Math.floor(k / cols);
      yrel[k] = (j - top[l]!) / Math.max(1, bottom[l]! - top[l]!);
    }
    buildEdge();

    // The wire and film mask at a crisper size for the shader.
    const mw = Math.max(1, Math.round(W * FIXED.MASK_SCALE));
    const mh = Math.max(1, Math.round(H * FIXED.MASK_SCALE));
    maskCv ??= document.createElement('canvas');
    maskCv.width = mw;
    maskCv.height = mh;
    const maskImage = new ImageData(mw, mh);
    maskImage.data.set(letterMask(mw, mh, FIXED.MASK_SCALE));
    maskCv.getContext('2d')!.putImageData(maskImage, 0, 0);
    maskTex?.setCanvas(maskCv);

    drops = [];
    freshFilm(-1);
    return true;
  }

  /** Meniscus boost: thicker film next to the wire (distance to the nearest non-film cell). */
  function buildEdge(): void {
    const far = cols + rows;
    const d = new Float32Array(cols * rows).fill(far);
    for (let k = 0; k < d.length; k++) if (!shape[k]) d[k] = 0;
    const at = (i: number, j: number) =>
      i < 0 || j < 0 || i >= cols || j >= rows ? 0 : d[j * cols + i]!;
    for (let j = 0; j < rows; j++)
      for (let i = 0; i < cols; i++) {
        const k = j * cols + i;
        d[k] = Math.min(d[k]!, at(i - 1, j) + 1, at(i, j - 1) + 1);
      }
    for (let j = rows - 1; j >= 0; j--)
      for (let i = cols - 1; i >= 0; i--) {
        const k = j * cols + i;
        d[k] = Math.min(d[k]!, at(i + 1, j) + 1, at(i, j + 1) + 1);
      }
    for (let k = 0; k < d.length; k++)
      edge[k] = FIXED.EDGE_THICK * Math.exp(-d[k]! / FIXED.EDGE_CELLS);
  }

  /** A fresh film in letter l (or every letter when l is -1). */
  function freshFilm(l: number, upTo = cols): void {
    for (let j = 0; j < rows; j++)
      for (let i = 0; i < Math.min(cols, upTo); i++) {
        const k = j * cols + i;
        if (!shape[k] || (l >= 0 && lid[k] !== l)) continue;
        const tilt = 1 - FIXED.INIT_TILT + 2 * FIXED.INIT_TILT * yrel[k]!;
        const patch = noise.noise2(i / FIXED.INIT_CELLS, j / FIXED.INIT_CELLS);
        thick[k] = Math.min(
          FIXED.THICK_MAX,
          n('thickness') * tilt * (1 + patch * FIXED.INIT_NOISE) + edge[k]!,
        );
        alive[k] = 1;
      }
  }

  // ---- simulation ----
  /** Where the breath is, when there is one (CSS px). */
  let breath: { x: number; y: number; strength: number } | null = null;

  function swirlAt(i: number, j: number, t: number): [number, number] {
    let vx = 0;
    let vy = 0;
    for (const [length, degrees, drift, offset] of FIXED.SWIRL_WAVES) {
      const k = SHARED.TAU / length;
      const a = rad(degrees);
      const phase = k * (Math.cos(a) * i + Math.sin(a) * j) + drift * t + offset;
      const c = Math.cos(phase);
      vx += Math.sin(a) * c;
      vy -= Math.cos(a) * c;
    }
    return [vx, vy];
  }

  function bilinear(src: Float32Array, fx: number, fy: number, own: number): number {
    const x0 = Math.floor(fx);
    const y0 = Math.floor(fy);
    const tx = fx - x0;
    const ty = fy - y0;
    let sum = 0;
    let wsum = 0;
    for (let dy = 0; dy < 2; dy++)
      for (let dx = 0; dx < 2; dx++) {
        const i = x0 + dx;
        const j = y0 + dy;
        if (i < 0 || j < 0 || i >= cols || j >= rows) continue;
        const k = j * cols + i;
        if (!alive[k]) continue;
        const w = (dx ? tx : 1 - tx) * (dy ? ty : 1 - ty);
        sum += src[k]! * w;
        wsum += w;
      }
    return wsum < FIXED.EPS ? own : sum / wsum;
  }

  function step(dt: number): void {
    time += dt;
    const sw = n('swirl') * FIXED.SWIRL_SPEED;
    const breathCells = breath ? { x: breath.x / cell, y: breath.y / cell } : null;
    const radius = Math.max(1, ((n('breathWidth') / SHARED.PERCENT) * W) / cell);
    const blow = n('breath') * (breath?.strength ?? 0);

    // Carry the film along the swirl and the breath.
    spare.set(thick);
    for (let j = 0; j < rows; j++)
      for (let i = 0; i < cols; i++) {
        const k = j * cols + i;
        if (!alive[k]) continue;
        let [vx, vy] = swirlAt(i, j, time);
        vx *= sw;
        vy *= sw;
        if (breathCells && blow > 0) {
          const dx = i + 0.5 - breathCells.x;
          const dy = j + 0.5 - breathCells.y;
          const q = (dx * dx + dy * dy) / (radius * radius);
          if (q < 1) {
            const wgt = (1 - q) ** 2;
            const d = Math.hypot(dx, dy) || 1;
            const f = FIXED.BREATH_FLOW * blow * wgt;
            vx += (dx / d - dy / d) * f * 0.5;
            vy += (dy / d + dx / d) * f * 0.5;
          }
        }
        spare[k] = bilinear(thick, i - vx * dt, j - vy * dt, thick[k]!);
      }
    thick.set(spare);

    // Drain: each film cell hands thickness to the cell below (squared in its thickness).
    spare.set(thick);
    const sums = new Array<number>(letters.length).fill(0);
    const counts = new Array<number>(letters.length).fill(0);
    for (let j = 0; j < rows; j++)
      for (let i = 0; i < cols; i++) {
        const k = j * cols + i;
        if (!alive[k]) continue;
        const l = lid[k]!;
        if (l >= 0) {
          sums[l] = sums[l]! + thick[k]!;
          counts[l] = counts[l]! + 1;
        }
        if (j + 1 >= rows || !alive[k + cols]) continue;
        const hn = thick[k]! / FIXED.H_REF;
        const flux = Math.min(
          FIXED.DRAIN_RATE * n('drainage') * hn * hn * dt,
          Math.max(0, thick[k]! - FIXED.H_BLACK) * 0.5,
        );
        spare[k] = spare[k]! - flux;
        spare[k + cols] = spare[k + cols]! + flux;
      }
    for (let k = 0; k < thick.length; k++) thick[k] = Math.min(FIXED.THICK_MAX, spare[k]!);

    // The bulge follows the breath; pressure builds on the letters under it.
    const ease = 1 - Math.exp(-dt / FIXED.BULGE_TAU);
    const cover = new Array<number>(letters.length).fill(0);
    let total = 0;
    for (let j = 0; j < rows; j++)
      for (let i = 0; i < cols; i++) {
        const k = j * cols + i;
        let target = 0;
        if (breathCells && blow > 0) {
          const dx = i + 0.5 - breathCells.x;
          const dy = j + 0.5 - breathCells.y;
          const q = (dx * dx + dy * dy) / (radius * radius);
          if (q < 1) {
            const wgt = (1 - q) ** 2;
            target = wgt * FIXED.BULGE_MAX * Math.min(1, n('breath'));
            total += wgt;
            const l = lid[k]!;
            if (l >= 0 && alive[k]) cover[l] = cover[l]! + wgt;
          }
        }
        bulge[k] = bulge[k]! + (target - bulge[k]!) * ease;
      }
    const sens = n('popSensitivity');
    letters.forEach((L, l) => {
      const share = total > FIXED.EPS ? Math.min(1, cover[l]! / (total * FIXED.PRESS_FULL)) : 0;
      L.press += FIXED.PRESS_RATE * blow * share * dt - L.press * FIXED.PRESS_DECAY * dt;
      L.press = Math.max(0, L.press);
      if (L.phase === 'film') {
        const mean = counts[l]! > 0 ? sums[l]! / counts[l]! : Infinity;
        const limit = sens > FIXED.EPS ? FIXED.POP_BASE / sens : Infinity;
        if (L.press > limit || mean < FIXED.H_BREAK) pop(l);
      } else if (L.phase === 'wait') {
        L.timer -= dt;
        if (L.timer <= 0) {
          L.phase = 'grow';
          L.front = L.x0;
        }
      } else {
        L.front += ((L.x1 - L.x0) / Math.max(FIXED.EPS, n('regrowTime'))) * dt;
        freshFilm(l, Math.ceil(L.front));
        if (L.front >= L.x1) L.phase = 'film';
      }
    });

    // Droplets fall, wobble and fade.
    for (const d of drops) {
      d.age += dt;
      d.vy += FIXED.DROP_GRAVITY * dt;
      d.x += d.vx * dt;
      d.y += d.vy * dt;
    }
    drops = drops.filter((d) => d.age < FIXED.DROP_LIFE);
  }

  /** A letter's film breaks: it empties and throws droplets from random points on it. */
  function pop(l: number): void {
    const L = letters[l]!;
    const cellsOf: number[] = [];
    for (let k = 0; k < lid.length; k++) if (lid[k] === l && alive[k]) cellsOf.push(k);
    for (let d = 0; d < FIXED.POP_DROPS && cellsOf.length && drops.length < FIXED.MAX_DROPS; d++) {
      const k = cellsOf[Math.floor(Math.random() * cellsOf.length)]!;
      const a = Math.random() * SHARED.TAU;
      const s = Math.random() * FIXED.DROP_THROW;
      drops.push({
        x: ((k % cols) + 0.5) * cell,
        y: (Math.floor(k / cols) + 0.5) * cell,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        r: n('dropletSize') * (FIXED.DROP_SIZE_MIN + Math.random() * FIXED.DROP_SIZE_SPAN),
        age: 0,
        phase: Math.random() * SHARED.TAU,
      });
    }
    for (const k of cellsOf) {
      alive[k] = 0;
      thick[k] = 0;
    }
    pops++;
    host.dataset.pops = String(pops);
    L.phase = 'wait';
    L.timer = FIXED.REGROW_DELAY;
    L.press = 0;
    ctx.sound.play('pop');
  }

  // ---- drawing ----
  /** The CIE color matching weights at each wavelength, computed once: x, y, z and the wavelength. */
  const lobe = (l: number, [w, mu, s1, s2]: readonly number[]) =>
    w! * Math.exp(-0.5 * ((l - mu!) / (l < mu! ? s1! : s2!)) ** 2);
  const sumLobes = (l: number, list: readonly (readonly number[])[]) =>
    list.reduce((acc, one) => acc + lobe(l, one), 0);
  const [lamFrom, lamTo, lamCount] = FIXED.LAMBDA;
  const lamStep = (lamTo - lamFrom) / lamCount;
  const cmfTable: number[] = [];
  for (let k = 0; k < lamCount; k++) {
    const l = lamFrom + (k + 0.5) * lamStep;
    cmfTable.push(sumLobes(l, FIXED.CMF_X), sumLobes(l, FIXED.CMF_Y), sumLobes(l, FIXED.CMF_Z), l);
  }

  const lin = (hex: string) =>
    hexToVec3(hex).map((v) => Math.pow(v, FIXED.GAMMA)) as [number, number, number];

  function pack(): void {
    for (let j = 0; j < rows; j++)
      for (let i = 0; i < cols; i++) {
        const k = j * cols + i;
        const o = k * SHARED.RGBA;
        let t = thick[k]!;
        let on = alive[k]!;
        if (!on) {
          // One cell of film past the edge (it takes its neighbors' thickness), so the crisp
          // letter mask, not the blocky grid, decides where the film ends.
          let sum = 0;
          let count = 0;
          for (const [di, dj] of NEIGHBORS) {
            const ni = i + di;
            const nj = j + dj;
            if (ni < 0 || nj < 0 || ni >= cols || nj >= rows || !alive[nj * cols + ni]) continue;
            sum += thick[nj * cols + ni]!;
            count++;
          }
          if (count) {
            t = sum / count;
            on = 1;
          }
        }
        bytes[o] = Math.round(Math.min(1, t / FIXED.THICK_MAX) * FIXED.BYTE);
        bytes[o + 1] = packSigned(bulge[k]!);
        bytes[o + 2] = on ? FIXED.BYTE : 0;
        bytes[o + SHARED.RGBA - 1] = FIXED.BYTE;
      }
  }

  function dropUniform(): number[] {
    const out = new Array<number>(FIXED.MAX_DROPS * SHARED.RGBA).fill(0);
    drops.slice(0, FIXED.MAX_DROPS).forEach((d, i) => {
      const life = 1 - d.age / FIXED.DROP_LIFE;
      const fade = Math.min(1, life / FIXED.DROP_FADE);
      const wobble = 1 + Math.sin(d.phase + d.age * FIXED.DROP_WOBBLE) * FIXED.DROP_WOBBLE_AMOUNT;
      out[i * SHARED.RGBA] = d.x;
      out[i * SHARED.RGBA + 1] = d.y;
      out[i * SHARED.RGBA + 2] = d.r * wobble;
      out[i * SHARED.RGBA + SHARED.RGBA - 1] = fade;
    });
    return out;
  }

  function drawGL(): void {
    if (!glh || !pass || !filmTex || !maskTex || glh.lost || !cols) return;
    pack();
    filmTex.set(bytes, cols, rows);
    const wa = rad(n('windowAngle'));
    const matrix = FIXED.XYZ_TO_RGB;
    const ground = lin(theme.ground);
    const ink = lin(theme.ink);
    pass.draw({
      u_film: { tex: filmTex.texture, unit: 0 },
      u_mask: { tex: maskTex.texture, unit: 1 },
      u_size: [W, H],
      u_texel: [1 / cols, 1 / rows],
      u_maskTexel: [1 / Math.max(1, maskCv?.width ?? 1), 1 / Math.max(1, maskCv?.height ?? 1)],
      u_n: n('refractive'),
      u_reflect: n('reflection'),
      u_sat: n('colorStrength'),
      u_stride: tier === 'phone' ? 2 : 1,
      u_window: [Math.cos(wa) * FIXED.WINDOW_OFFSET, -Math.sin(wa) * FIXED.WINDOW_OFFSET],
      u_bg: ground.map((v) => v * FIXED.BACK_DEPTH) as [number, number, number],
      u_wire: ground.map((v, i) => v + (ink[i]! - v) * FIXED.WIRE_MIX) as [number, number, number],
      u_thickMax: FIXED.THICK_MAX,
      u_bulgeSlope: FIXED.BULGE_SLOPE,
      u_eyeDist: FIXED.EYE_DIST,
      u_mullion: FIXED.MULLION,
      u_lamStep: lamStep,
      u_cmf: { vec4s: cmfTable },
      u_yNorm: FIXED.Y_NORM,
      u_winSize: [FIXED.WINDOW_SIZE[0], FIXED.WINDOW_SIZE[1]],
      u_winSoft: FIXED.WINDOW_SOFT,
      u_winLight: FIXED.WINDOW_LIGHT,
      u_room: FIXED.ROOM_LIGHT,
      u_filmGain: FIXED.FILM_GAIN,
      u_tone: FIXED.TONE,
      u_blackFilm: FIXED.BLACK_FILM,
      u_vignette: FIXED.VIGNETTE,
      u_wireSpec: FIXED.WIRE_SPEC,
      u_wirePow: FIXED.WIRE_POWER,
      u_wireRound: FIXED.WIRE_ROUND,
      u_dropRim: FIXED.DROP_RIM,
      u_dropRimPow: FIXED.DROP_RIM_POWER,
      u_dropGlint: FIXED.DROP_GLINT,
      u_dropGlintPow: FIXED.DROP_GLINT_POWER,
      u_dropShade: FIXED.DROP_SHADE,
      u_dither: FIXED.DITHER,
      u_dropCount: drops.length,
      u_drops: { vec4s: dropUniform() },
      u_r0: [...matrix[0]!] as [number, number, number],
      u_r1: [...matrix[1]!] as [number, number, number],
      u_r2: [...matrix[2]!] as [number, number, number],
    });
  }

  /** No WebGL: letters filled with a gradient from dark (thin) at the top to bright at the bottom. */
  function drawFallback(): void {
    if (!fallback) return;
    fallback.fit();
    const g = fallback.ctx;
    const w = fallback.w;
    const h = fallback.h;
    g.fillStyle = theme.ground;
    g.fillRect(0, 0, w, h);
    const text = String(p.text || ' ');
    const size = Math.min(
      h * FIXED.TEXT_SIZE,
      (w * FIXED.TEXT_FIT) / Math.max(1, text.length) / FIXED.TEXT_EM,
    );
    applyFont(g, { size, weight: FIXED.TEXT_WEIGHT }, SHARED.PERCENT);
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    const grad = g.createLinearGradient(0, h * 0.5 - size * 0.5, 0, h * 0.5 + size * 0.5);
    grad.addColorStop(0, theme.ground);
    grad.addColorStop(FIXED.FALLBACK_STOPS[0], theme.c1);
    grad.addColorStop(FIXED.FALLBACK_STOPS[1], theme.c2);
    grad.addColorStop(1, theme.c3);
    g.fillStyle = grad;
    g.fillText(text, w * 0.5, h * 0.5);
    g.strokeStyle = theme.ink;
    g.lineWidth = n('wireWidth');
    g.lineJoin = 'round';
    g.strokeText(text, w * 0.5, h * 0.5);
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

  const cancelFont = whenFontReady(() => {
    if (!sized) return;
    layout();
    draw();
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
      const blowing = ptr.pointerType === 'mouse' ? ptr.active : ptr.dragging;
      if (blowing) {
        const speed = Math.hypot(ptr.x - ptr.px, ptr.y - ptr.py) / Math.max(FIXED.EPS, dt);
        const s = FIXED.HOLD + (1 - FIXED.HOLD) * Math.min(1, speed / FIXED.SPEED_REF);
        breath = { x: ptr.x, y: ptr.y, strength: s };
      } else breath = null;
      step(dt);
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
      layout();
      breath = null;
      const steps = Math.round(FIXED.STILL_AGE / FIXED.STILL_STEP);
      for (let s = 0; s < steps; s++) step(FIXED.STILL_STEP);
      // One breath's bulge, set directly.
      const bx = FIXED.STILL_BREATH[0] * cols;
      const by = FIXED.STILL_BREATH[1] * rows;
      const radius = Math.max(1, ((n('breathWidth') / SHARED.PERCENT) * W) / cell);
      for (let j = 0; j < rows; j++)
        for (let i = 0; i < cols; i++) {
          const q = ((i + 0.5 - bx) ** 2 + (j + 0.5 - by) ** 2) / (radius * radius);
          bulge[j * cols + i] =
            q < 1 ? (1 - q) ** 2 * FIXED.BULGE_MAX * Math.min(1, n('breath')) : 0;
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
      } else if (cols && (before.text !== p.text || before.wireWidth !== p.wireWidth)) layout();
      else if (cols && before.thickness !== p.thickness) freshFilm(-1);
      if (sized) draw();
    },
    setTheme(t) {
      theme = t;
      if (sized) draw();
    },
    restart() {
      if (!cols) return;
      drops = [];
      letters.forEach((L) => {
        L.phase = 'film';
        L.press = 0;
      });
      alive.set(shape);
      freshFilm(-1);
      bulge.fill(0);
      time = 0;
    },
    destroy() {
      cancelFont();
      ptr.destroy();
      pass?.destroy();
      filmTex?.destroy();
      maskTex?.destroy();
      glh?.destroy();
      glh = null;
      fallback?.destroy();
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
