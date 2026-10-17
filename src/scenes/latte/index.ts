// `latte`: Latte pour (SCENES.md #53, gallery only). A cup seen from above: foam amounts on a
// coarse grid, laid down by a stream that blooms at the center and then zigzags through the
// letters of the name, then settles by spreading into neighboring cells.

import { createCanvas } from '../../engine/canvas';
import { fontsReady } from '../../engine/fonts';
import { createPointer } from '../../engine/pointer';
import { frameFactor } from '../../engine/time';
import { smoothstep } from '../../kits/easing';
import { seededRandom } from '../../kits/field';
import { applyFont } from '../../kits/text';
import { mixOklab, parseHex } from '../../theme/color';
import type { Theme } from '../../theme/worlds';
import { SHARED } from '../shared';
import type { Params, SceneContext, SceneInstance, SceneModule } from '../types';
import { FIXED } from './constants';
import { meta } from './meta';
import { params } from './params';
import { followUps } from './prompt';

interface PathPt {
  x: number;
  y: number;
  pour: boolean;
}

interface OrientationApi {
  requestPermission?: () => Promise<string>;
}

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);

function create(host: HTMLElement, initial: Params, ctx: SceneContext): SceneInstance {
  let p = { ...initial };
  const n = (id: string) => Number(p[id]);
  let theme: Theme = ctx.theme;
  const c = createCanvas(host);
  const ptr = createPointer(host);
  const ac = new AbortController();
  const gridCv = document.createElement('canvas');

  let N = 0;
  let R = 0;
  let foam = new Float32Array(0);
  let glyph = new Uint8Array(0);
  let near = new Uint8Array(0);
  let tex = new Uint8ClampedArray(0);
  let img: ImageData | null = null;
  let path: PathPt[] = [];
  let lengths: number[] = [];
  let total = 0;
  let time = 0;
  let angle = 0;
  let gyroTarget: number | null = null;
  let button: HTMLButtonElement | undefined;
  let bloomed = 0;

  const cell = FIXED.CELL;
  const T = () => n('pourTime');
  const rgb = (hex: string): [number, number, number] => {
    const q = parseHex(hex);
    return [q.r * FIXED.CHANNEL, q.g * FIXED.CHANNEL, q.b * FIXED.CHANNEL];
  };

  /** Crema texture: tiger streaks and speckles on the crema color, fixed by a seed. */
  function paintTexture(): void {
    const rand = seededRandom(FIXED.SEED);
    const base = mixOklab(theme.c1, theme.ink, n('crema'));
    const [r0, g0, b0] = rgb(base);
    tex = new Uint8ClampedArray(N * N * SHARED.RGBA);
    const mid = (N - 1) * 0.5;
    for (let j = 0; j < N; j++)
      for (let i = 0; i < N; i++) {
        const a = Math.atan2(j - mid, i - mid);
        const streak = Math.sin(
          a * FIXED.STRIPES +
            Math.sin(Math.hypot(i - mid, j - mid) * FIXED.STREAK_FREQ) * FIXED.STREAK_WOBBLE,
        );
        let shade = 1 + streak * FIXED.STRIPE_ALPHA;
        if (rand() < FIXED.SPECKS / FIXED.PER_THOUSAND)
          shade += (rand() - 0.5) * 2 * FIXED.SPECK_ALPHA * 2;
        const k = (j * N + i) * SHARED.RGBA;
        tex[k] = clamp(r0 * shade, 0, FIXED.CHANNEL);
        tex[k + 1] = clamp(g0 * shade, 0, FIXED.CHANNEL);
        tex[k + 2] = clamp(b0 * shade, 0, FIXED.CHANNEL);
        tex[k + SHARED.RGBA - 1] = FIXED.CHANNEL;
      }
  }

  /** Rasterizes the name onto the grid and plans the zigzag path through its letters. */
  function plan(): void {
    const o = document.createElement('canvas');
    o.width = N;
    o.height = N;
    const g = o.getContext('2d', { willReadFrequently: true })!;
    const size = (N * cell * FIXED.TEXT_SIZE * 2) / cell;
    applyFont(g, { size, weight: FIXED.TEXT_WEIGHT }, SHARED.PERCENT);
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillStyle = theme.ink;
    const text = String(p.text || ' ');
    const fit = Math.min(1, (N * FIXED.TEXT_FIT) / Math.max(1, g.measureText(text).width));
    applyFont(g, { size: size * fit, weight: FIXED.TEXT_WEIGHT }, SHARED.PERCENT);
    g.fillText(text, N * 0.5, N * 0.5);
    const d = g.getImageData(0, 0, N, N).data;
    glyph = new Uint8Array(N * N);
    for (let k = 0; k < glyph.length; k++)
      glyph[k] = d[k * SHARED.RGBA + SHARED.RGBA - 1]! > FIXED.CHANNEL * 0.5 ? 1 : 0;
    near = new Uint8Array(N * N);
    for (let j = 0; j < N; j++)
      for (let i = 0; i < N; i++)
        for (let dj = -FIXED.EDGE_CELLS; dj <= FIXED.EDGE_CELLS; dj++)
          for (let di = -FIXED.EDGE_CELLS; di <= FIXED.EDGE_CELLS; di++) {
            const ii = i + di;
            const jj = j + dj;
            if (ii >= 0 && jj >= 0 && ii < N && jj < N && glyph[jj * N + ii] === 1)
              near[j * N + i] = 1;
          }
    path = [];
    const step = Math.max(1, Math.round((FIXED.ROW_GAP * FIXED.SPOT * n('spread')) / cell));
    let leftToRight = true;
    const mid = (N - 1) * 0.5;
    for (let j = 0; j < N; j += step) {
      const runs: [number, number][] = [];
      let start = -1;
      for (let i = 0; i <= N; i++) {
        const on = i < N && glyph[j * N + i] === 1;
        if (on && start < 0) start = i;
        if (!on && start >= 0) {
          runs.push([start, i - 1]);
          start = -1;
        }
      }
      if (!runs.length) continue;
      const ordered = leftToRight ? runs : [...runs].reverse();
      for (const [a, b] of ordered) {
        const from = leftToRight ? a : b;
        const to = leftToRight ? b : a;
        path.push({ x: (from - mid) * cell, y: (j - mid) * cell, pour: false });
        path.push({ x: (to - mid) * cell, y: (j - mid) * cell, pour: true });
      }
      leftToRight = !leftToRight;
    }
    lengths = [0];
    for (let k = 1; k < path.length; k++)
      lengths.push(
        lengths[k - 1]! + Math.hypot(path[k]!.x - path[k - 1]!.x, path[k]!.y - path[k - 1]!.y),
      );
    total = lengths[lengths.length - 1] ?? 0;
  }

  function build(): void {
    R = (c.h * n('cupSize')) / SHARED.PERCENT / 2;
    N = Math.max(FIXED.MIN_GRID, Math.ceil((R * 2) / cell));
    foam = new Float32Array(N * N);
    gridCv.width = N;
    gridCv.height = N;
    img = gridCv.getContext('2d')!.createImageData(N, N);
    paintTexture();
    plan();
    time = 0;
    bloomed = 0;
  }

  /** The landing spot at time t (relative to the cup center), and whether the stream is pouring. */
  function landing(t: number): { x: number; y: number; pouring: boolean; lift: number } {
    const bloomEnd = FIXED.BLOOM_END * T();
    const drawEnd = FIXED.DRAW_END * T();
    const wob = n('wobble') * FIXED.WOBBLE_PX;
    const wx = wob * Math.sin(t * FIXED.WOBBLE_RATE);
    const wy = wob * Math.sin(t * FIXED.WOBBLE_RATE * FIXED.WOBBLE_Y_RATIO + 1);
    if (t < bloomEnd || !path.length) return { x: wx, y: wy, pouring: t < drawEnd, lift: 0 };
    if (t >= drawEnd) {
      const last = path[path.length - 1]!;
      return {
        x: last.x + wx,
        y: last.y + wy,
        pouring: false,
        lift: clamp((t - drawEnd) / (T() - drawEnd), 0, 1),
      };
    }
    const u = (t - bloomEnd) / (drawEnd - bloomEnd);
    const at = u * total;
    let k = 1;
    while (k < lengths.length - 1 && lengths[k]! < at) k++;
    const seg = lengths[k]! - lengths[k - 1]! || 1;
    const q = clamp((at - lengths[k - 1]!) / seg, 0, 1);
    const a = path[k - 1]!;
    const b = path[k]!;
    return {
      x: a.x + (b.x - a.x) * q + wx,
      y: a.y + (b.y - a.y) * q + wy,
      pouring: b.pour,
      lift: 0,
    };
  }

  function addFoam(x: number, y: number, radius: number, amount: number, onLetters = false): void {
    const mid = (N - 1) * 0.5;
    const r = radius * FIXED.GAUSS_REACH;
    const i0 = Math.max(0, Math.floor(mid + (x - r) / cell));
    const i1 = Math.min(N - 1, Math.ceil(mid + (x + r) / cell));
    const j0 = Math.max(0, Math.floor(mid + (y - r) / cell));
    const j1 = Math.min(N - 1, Math.ceil(mid + (y + r) / cell));
    for (let j = j0; j <= j1; j++)
      for (let i = i0; i <= i1; i++) {
        const dx = (i - mid) * cell - x;
        const dy = (j - mid) * cell - y;
        const w = Math.exp(-(dx * dx + dy * dy) / (2 * radius * radius));
        const k = j * N + i;
        if (onLetters && !near[k]) continue;
        foam[k] = Math.min(1, foam[k]! + amount * w);
      }
  }

  function step(dt: number): void {
    time += dt;
    const spread = n('spread');
    const bloomEnd = FIXED.BLOOM_END * T();
    const before = time - dt;
    const L = landing(time);
    const drawing = time >= bloomEnd && time < FIXED.DRAW_END * T();
    if (!drawing) {
      if (L.pouring)
        addFoam(
          L.x,
          L.y,
          FIXED.SPOT * spread,
          FIXED.POUR_RATE * dt * (n('foam') + FIXED.RING_FOAM),
        );
    } else {
      // The spot can travel far in one frame: lay foam at stamps along the way.
      const from = landing(Math.max(before, bloomEnd));
      const dist = Math.hypot(L.x - from.x, L.y - from.y);
      const stamps = Math.max(1, Math.ceil(dist / (FIXED.SPOT * spread * 0.5)));
      for (let s = 1; s <= stamps; s++) {
        const at = landing(
          Math.max(before, bloomEnd) + ((time - Math.max(before, bloomEnd)) * s) / stamps,
        );
        if (at.pouring)
          addFoam(
            at.x,
            at.y,
            FIXED.SPOT * spread,
            FIXED.STROKE_FOAM * (n('foam') + FIXED.RING_FOAM),
          );
      }
    }
    // Bloom rings: laid in turn over the first phase, spreading from the center.
    const mid = (N - 1) * 0.5;
    for (let r = 0; r < FIXED.RINGS; r++) {
      const born = (r * bloomEnd) / FIXED.RINGS;
      const age = time - born;
      if (age < 0) continue;
      const radius = FIXED.RING_SPEED * cell * age;
      if (radius > FIXED.RING_REACH * R) continue;
      const band = FIXED.RING_WIDTH * cell * spread;
      for (let j = 0; j < N; j++)
        for (let i = 0; i < N; i++) {
          const dist = Math.hypot((i - mid) * cell, (j - mid) * cell);
          const off = dist - radius;
          if (Math.abs(off) > band * 2) continue;
          const w = Math.exp(-(off * off) / (2 * band * band)) * FIXED.RING_FOAM;
          const k = j * N + i;
          if (w > foam[k]!) foam[k] = w;
        }
    }
    bloomed = Math.max(bloomed, time);
    if (time > T()) {
      const k = Math.min(1, FIXED.DIFFUSE * dt);
      const prev = foam.slice();
      for (let j = 1; j < N - 1; j++)
        for (let i = 1; i < N - 1; i++) {
          const q = j * N + i;
          const avg =
            (prev[q - 1]! + prev[q + 1]! + prev[q - N]! + prev[q + N]!) * FIXED.NEIGHBOR_SHARE;
          foam[q] = prev[q]! + (avg - prev[q]!) * k;
        }
    }
  }

  function render(steam: boolean): void {
    const g = c.ctx;
    c.clear();
    const cx = c.w * 0.5;
    const cy = c.h * 0.5;
    g.save();
    g.translate(cx, cy);
    g.rotate((angle * Math.PI) / FIXED.HALF_TURN);
    // Saucer and rim.
    for (const m of [FIXED.SAUCER, FIXED.RIM]) {
      g.beginPath();
      g.arc(0, 0, R * m, 0, SHARED.TAU);
      g.fillStyle = theme.surface;
      g.fill();
      g.lineWidth = FIXED.RIM_W;
      g.strokeStyle = theme.ink;
      g.stroke();
    }
    // The coffee.
    const [fr, fg, fb] = rgb(theme.surface);
    const d = img!.data;
    const mid = (N - 1) * 0.5;
    for (let j = 0; j < N; j++)
      for (let i = 0; i < N; i++) {
        const q = j * N + i;
        const k = q * SHARED.RGBA;
        const inside = Math.hypot(i - mid, j - mid) * cell <= R;
        if (!inside) {
          d[k + SHARED.RGBA - 1] = 0;
          continue;
        }
        const f = smoothstep(0, 1, foam[q]! * n('foam') * 2);
        d[k] = tex[k]! + (fr - tex[k]!) * f;
        d[k + 1] = tex[k + 1]! + (fg - tex[k + 1]!) * f;
        d[k + 2] = tex[k + 2]! + (fb - tex[k + 2]!) * f;
        d[k + SHARED.RGBA - 1] = FIXED.CHANNEL;
      }
    gridCv.getContext('2d')!.putImageData(img!, 0, 0);
    g.save();
    g.beginPath();
    g.arc(0, 0, R, 0, SHARED.TAU);
    g.clip();
    g.imageSmoothingEnabled = true;
    g.drawImage(gridCv, -N * cell * 0.5, -N * cell * 0.5, N * cell, N * cell);
    g.restore();
    // The stream of milk.
    const L = landing(time);
    if (time < T() && !steam) {
      const top = -FIXED.STREAM_START * R;
      const startY = top + (L.y - top) * L.lift;
      g.strokeStyle = theme.surface;
      g.lineCap = 'round';
      g.lineWidth = FIXED.STREAM_W * n('spread');
      g.globalAlpha = 1 - L.lift;
      g.beginPath();
      g.moveTo(L.x, startY);
      g.lineTo(L.x, L.y);
      g.stroke();
      g.globalAlpha = 1;
    }
    if (steam) {
      g.strokeStyle = theme.ink;
      g.globalAlpha = FIXED.STEAM_ALPHA;
      g.lineWidth = FIXED.RIM_W;
      for (let s = 0; s < FIXED.STEAM_CURLS; s++) {
        const x0 = (s - (FIXED.STEAM_CURLS - 1) * 0.5) * R * 0.5;
        g.beginPath();
        for (let t = 0; t <= 1; t += FIXED.STEAM_STEP) {
          const x = x0 + Math.sin(t * SHARED.TAU * FIXED.STEAM_WAVES + s) * R * FIXED.STEAM_AMP;
          const y = -R * FIXED.SAUCER - t * R * FIXED.STEAM_H;
          if (t === 0) g.moveTo(x, y);
          else g.lineTo(x, y);
        }
        g.stroke();
      }
      g.globalAlpha = 1;
    }
    g.restore();
  }

  function onOrient(e: DeviceOrientationEvent): void {
    gyroTarget = n('turn') * clamp((e.gamma ?? 0) / FIXED.GYRO_RANGE, -1, 1);
  }

  async function enableMotion(): Promise<void> {
    const api = DeviceOrientationEvent as unknown as OrientationApi;
    if (typeof api.requestPermission === 'function') {
      try {
        if ((await api.requestPermission()) !== 'granted') return;
      } catch {
        return;
      }
    }
    if (ac.signal.aborted) return;
    window.addEventListener('deviceorientation', onOrient, { signal: ac.signal });
    syncButton();
  }

  function syncButton(): void {
    const wanted =
      !!p.gyro &&
      typeof DeviceOrientationEvent !== 'undefined' &&
      (typeof (DeviceOrientationEvent as unknown as OrientationApi).requestPermission ===
        'function' ||
        window.matchMedia('(pointer: coarse)').matches);
    if (!wanted) {
      button?.remove();
      button = undefined;
      return;
    }
    if (!button) {
      button = document.createElement('button');
      button.type = 'button';
      Object.assign(button.style, {
        position: 'absolute',
        bottom: `${FIXED.BUTTON_BOTTOM}rem`,
        left: `${SHARED.PERCENT * 0.5}%`,
        transform: `translateX(-${SHARED.PERCENT * 0.5}%)`,
        minHeight: `${FIXED.BUTTON_HEIGHT}rem`,
        padding: `0 ${FIXED.BUTTON_PAD}rem`,
        border: '1px solid var(--line)',
        borderRadius: `${FIXED.PILL}px`,
        background: 'var(--surface)',
        color: 'var(--ink)',
        font: 'inherit',
      });
      button.addEventListener('click', () => void enableMotion(), { signal: ac.signal });
      host.append(button);
    }
    button.textContent = gyroTarget === null ? 'Use motion' : 'Motion is on';
    button.disabled = gyroTarget !== null;
  }

  const rebuildNow = () => {
    if (!c.w) return;
    build();
    render(false);
  };

  fontsReady().then(() => rebuildNow());

  return {
    resize() {
      if (c.fit() || !foam.length) build();
      syncButton();
      render(false);
    },
    update(dt) {
      ptr.sync();
      ptr.takeTaps();
      step(dt);
      if (time >= T()) {
        const f = frameFactor(dt);
        const want =
          gyroTarget ??
          (ptr.active ? n('turn') * clamp((ptr.x - c.w * 0.5) / (c.w * 0.5), -1, 1) : 0);
        angle += (want - angle) * (1 - Math.pow(1 - FIXED.TURN_EASE, f));
      }
      render(false);
    },
    still() {
      ptr.takeTaps();
      build();
      const step60 = 1 / SHARED.FPS;
      while (time < T() + FIXED.SETTLE) step(step60);
      angle = 0;
      render(true);
    },
    setParams(next) {
      const re = ['text', 'cupSize', 'crema', 'spread'].some((k) => next[k] !== p[k]);
      p = { ...next };
      syncButton();
      if (re) rebuildNow();
      else if (c.w) render(false);
    },
    setTheme(t) {
      theme = t;
      if (c.w) {
        paintTexture();
        render(false);
      }
    },
    restart() {
      rebuildNow();
    },
    destroy() {
      ac.abort();
      ptr.destroy();
      button?.remove();
      c.destroy();
      gridCv.width = 0;
      gridCv.height = 0;
      foam = new Float32Array(0);
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
