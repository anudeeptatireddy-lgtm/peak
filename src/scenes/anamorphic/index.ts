// `anamorphic`: Anamorphic (SCENES.md #63). Shards sit at random depths along the
// sweet-spot camera's lines of sight through the name, so they spell it only from there;
// the camera orbits with the cursor (or tilt, or a drag) and snaps in near the sweet spot.

import { createCanvas } from '../../engine/canvas';
import { fontsReady } from '../../engine/fonts';
import { createPointer } from '../../engine/pointer';
import { ease, frameFactor } from '../../engine/time';
import { smoothstep } from '../../kits/easing';
import { seededRandom } from '../../kits/field';
import { samplePointsUnder, textMask } from '../../kits/text';
import type { Theme } from '../../theme/worlds';
import { SHARED } from '../shared';
import type { Params, SceneContext, SceneInstance, SceneModule } from '../types';
import { FIXED } from './constants';
import { meta } from './meta';
import { params } from './params';
import { followUps } from './prompt';

const clamp1 = (v: number) => (v < -1 ? -1 : v > 1 ? 1 : v);
const DEG = Math.PI / FIXED.HALF_TURN;

interface OrientationApi {
  requestPermission?: () => Promise<string>;
}

function create(host: HTMLElement, initial: Params, ctx: SceneContext): SceneInstance {
  let p = { ...initial };
  const n = (id: string) => Number(p[id]);
  let theme: Theme = ctx.theme;
  const c = createCanvas(host);
  const ptr = createPointer(host);
  const ac = new AbortController();
  let fontsOk = false;
  let stillShown = false;

  // Per shard: point relative to the center, depth, size, turn, float phase, corners.
  let sx = new Float32Array(0);
  let sy = new Float32Array(0);
  let sz = new Float32Array(0);
  let size = new Float32Array(0);
  let turn = new Float32Array(0);
  let phase = new Float32Array(0);
  let corners = new Uint8Array(0);
  let count = 0;
  let focal = 1;

  // Camera aim (u, v in −1…1) and the drawn camera.
  let aimU = 0;
  let aimV = 0;
  let camU = 0;
  let camV = 0;
  let quiet = 0;
  let idleT = 0;
  let time = 0;
  let gyroOn = false;
  let gyroU = 0;
  let gyroV = 0;
  let gyroFresh = false;
  let button: HTMLButtonElement | undefined;

  function layout(): void {
    if (!fontsOk || !c.w) return;
    const small = c.w < SHARED.SMALL_SCREEN;
    const scale = ctx.quality === 'preview' ? SHARED.PREVIEW_SCALE : 1;
    const max = Math.round((small ? n('shardsSmall') : n('shards')) * scale);
    const { data } = textMask(c.w, c.h, String(p.text || ' '), {
      heightShare: n('textHeight'),
      fitShare: n('fitWidth'),
      weight: n('weight'),
    });
    const { pts, gap } = samplePointsUnder(
      data,
      Math.round(c.w),
      Math.round(c.h),
      FIXED.START_GAP,
      FIXED.ALPHA_CUTOFF,
      max,
      FIXED.MAX_GAP,
    );
    const rand = seededRandom(FIXED.SEED);
    const side = Math.min(c.w, c.h);
    focal = (side * FIXED.FOCAL) / n('perspective');
    count = pts.length / 2;
    sx = new Float32Array(count);
    sy = new Float32Array(count);
    sz = new Float32Array(count);
    size = new Float32Array(count);
    turn = new Float32Array(count);
    phase = new Float32Array(count);
    corners = new Uint8Array(count);
    for (let i = 0; i < count; i++) {
      sx[i] = pts[2 * i]! - c.w * 0.5 + (rand() - 0.5) * gap * FIXED.JITTER;
      sy[i] = pts[2 * i + 1]! - c.h * 0.5 + (rand() - 0.5) * gap * FIXED.JITTER;
      sz[i] = Math.max(-FIXED.NEAR_LIMIT * focal, (rand() * 2 - 1) * n('depth') * side);
      // Shards never reach much past their grid cell, so the letter edges stay crisp.
      size[i] =
        Math.min(n('shardSize'), gap * FIXED.GAP_FIT) *
        (FIXED.SHARD_MIN + rand() * (1 - FIXED.SHARD_MIN));
      turn[i] = rand() * SHARED.TAU;
      phase[i] = rand() * SHARED.TAU;
      const shape = String(p.shape);
      const tri = shape === 'tri' || (shape === 'mixed' && i % 2 === 0);
      corners[i] = tri ? FIXED.TRI : FIXED.QUAD;
    }
  }

  fontsReady().then(() => {
    fontsOk = true;
    layout();
    if (stillShown) draw(0, 0, 0);
  });

  function draw(u: number, v: number, at: number): void {
    const g = c.ctx;
    c.clear();
    if (!count) return;
    const yaw = u * n('orbit') * DEG;
    const pitch = v * n('orbit') * FIXED.PITCH_SHARE * DEG;
    const cy = Math.cos(yaw);
    const sy0 = Math.sin(yaw);
    const cp = Math.cos(pitch);
    const sp = Math.sin(pitch);
    const F = focal;
    const ox = c.w * 0.5;
    const oy = c.h * 0.5;
    const inks = [theme.c1, theme.c2, theme.c3];
    const colors = Math.max(1, Math.min(SHARED.INKS, n('colors')));
    const paths = inks.slice(0, colors).map(() => new Path2D());
    const amp = n('float') * n('floatPx');
    const w = SHARED.TAU * n('floatSpeed') * at;
    for (let i = 0; i < count; i++) {
      const z = sz[i]! + amp * Math.sin(w + phase[i]!);
      const k = Math.max(FIXED.NEAR_LIMIT * F, F + z) / F;
      const px = sx[i]! * k;
      const py = sy[i]! * k;
      const path = paths[i % colors]!;
      const m = corners[i]!;
      for (let j = 0; j < m; j++) {
        const a = turn[i]! + (SHARED.TAU * j) / m;
        const X = px + Math.cos(a) * size[i]! * k;
        const Y = py + Math.sin(a) * size[i]! * k;
        // Yaw around the vertical axis, then pitch around the horizontal one.
        const x1 = X * cy + z * sy0;
        const z1 = -X * sy0 + z * cy;
        const y2 = Y * cp - z1 * sp;
        const z2 = Y * sp + z1 * cp;
        const s = F / Math.max(FIXED.NEAR_LIMIT * F, F + z2);
        if (j) path.lineTo(ox + x1 * s, oy + y2 * s);
        else path.moveTo(ox + x1 * s, oy + y2 * s);
      }
      path.closePath();
    }
    g.globalCompositeOperation = theme.blend;
    paths.forEach((path, k) => {
      g.fillStyle = inks[k]!;
      g.fill(path);
    });
    g.globalCompositeOperation = 'source-over';
  }

  function onOrient(e: DeviceOrientationEvent): void {
    gyroU = clamp1((e.gamma ?? 0) / FIXED.GYRO_RANGE);
    gyroV = clamp1(((e.beta ?? 0) - FIXED.GYRO_REST) / FIXED.GYRO_RANGE);
    gyroFresh = true;
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
    gyroOn = true;
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
        pointerEvents: 'auto',
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
    button.textContent = gyroOn ? 'Motion is on' : 'Use motion';
    button.disabled = gyroOn;
  }
  syncButton();

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
      ptr.takeTaps();
      let input = false;
      if (ptr.active && ptr.pointerType === 'mouse' && c.w) {
        aimU = clamp1((ptr.x / c.w - 0.5) * 2);
        aimV = clamp1((ptr.y / c.h - 0.5) * 2);
        input = true;
      } else if (ptr.down && c.w) {
        aimU = clamp1(aimU + ((ptr.x - ptr.px) / c.w) * 2);
        if (ptr.dragging) aimV = clamp1(aimV + ((ptr.y - ptr.py) / c.h) * 2);
        input = true;
      } else if (gyroOn && gyroFresh) {
        aimU = gyroU;
        aimV = gyroV;
        gyroFresh = false;
        input = true;
      }
      quiet = input ? 0 : quiet + dt;
      if (quiet > n('idleWait')) {
        idleT += dt;
        const a = (SHARED.TAU * idleT) / n('idlePeriod');
        aimU = Math.sin(a);
        aimV = Math.sin(FIXED.IDLE_RATIO * a);
      } else if (input) idleT = 0;
      const r = Math.hypot(aimU, aimV);
      const pull = n('snap') > 0 ? smoothstep(0, n('snap'), r) : 1;
      const k = ease(n('ease'), f);
      camU += (aimU * pull - camU) * k;
      camV += (aimV * pull - camV) * k;
      draw(camU, camV, time);
    },
    still() {
      stillShown = true;
      ptr.takeTaps();
      draw(0, 0, 0);
    },
    setParams(next) {
      p = { ...next };
      layout();
      syncButton();
      if (stillShown) draw(0, 0, 0);
    },
    setTheme(th) {
      theme = th;
      if (stillShown) draw(0, 0, 0);
    },
    restart() {
      camU = camV = aimU = aimV = 0;
      quiet = idleT = time = 0;
    },
    destroy() {
      ac.abort();
      ptr.destroy();
      button?.remove();
      button = undefined;
      c.destroy();
      count = 0;
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
