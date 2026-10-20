// `resonanceplate`: Resonance Plate (SCENES.md #83). Sand jitters where a square
// plate vibrates and settles on its still lines (Chladni figures); the cursor's
// horizontal position picks the mode, and one pitch locks onto a field shaped like NAME.

import { createCanvas } from '../../engine/canvas';
import { fontsReady } from '../../engine/fonts';
import { createPointer } from '../../engine/pointer';
import { frameFactor } from '../../engine/time';
import { clamp01, smoothstep } from '../../kits/easing';
import { textMask } from '../../kits/text';
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
  let alive = true;
  let fontsOk = false;

  let R = 0;
  let size = 0;
  let left = 0;
  let top = 0;
  let cosT: Float32Array[] = [];
  let modes: [number, number, number][] = [];
  let nameField = new Float32Array(0);
  let hasName = false;
  let field = new Float32Array(0);
  let gx = new Float32Array(0);
  let gy = new Float32Array(0);
  let count = 0;
  let pitch = 0;
  let target = 0;
  let quiet = 0;
  let idleClock = 0;
  let idleNext = true;
  let idling = false;
  let mix = 0;

  function grainCount(): number {
    const scale = ctx.quality === 'preview' ? SHARED.PREVIEW_SCALE : 1;
    return Math.round((c.w < SHARED.SMALL_SCREEN ? n('grainsSmall') : n('grains')) * scale);
  }

  function scatter(): void {
    for (let i = 0; i < count; i++) {
      gx[i] = Math.random() * size;
      gy[i] = Math.random() * size;
    }
  }

  function buildName(): void {
    nameField = new Float32Array(R * R).fill(1);
    hasName = false;
    if (!fontsOk || !R) return;
    const { data } = textMask(R, R, String(p.text || ' '), {
      heightShare: n('textHeight'),
      fitShare: n('fitWidth'),
      weight: n('weight'),
    });
    // Chamfer distance to the nearest letter cell, in cells.
    const d = new Float32Array(R * R);
    const far = R * R;
    for (let i = 0; i < R * R; i++) {
      const inside = data[i * SHARED.RGBA + SHARED.RGBA - 1]! > FIXED.ALPHA_CUTOFF;
      d[i] = inside ? 0 : far;
      if (inside) hasName = true;
    }
    if (!hasName) return;
    const S = FIXED.STRAIGHT;
    const D = FIXED.DIAGONAL;
    for (let y = 0; y < R; y++)
      for (let x = 0; x < R; x++) {
        const i = y * R + x;
        let v = d[i]!;
        if (x > 0) v = Math.min(v, d[i - 1]! + S);
        if (y > 0) {
          v = Math.min(v, d[i - R]! + S);
          if (x > 0) v = Math.min(v, d[i - R - 1]! + D);
          if (x < R - 1) v = Math.min(v, d[i - R + 1]! + D);
        }
        d[i] = v;
      }
    for (let y = R - 1; y >= 0; y--)
      for (let x = R - 1; x >= 0; x--) {
        const i = y * R + x;
        let v = d[i]!;
        if (x < R - 1) v = Math.min(v, d[i + 1]! + S);
        if (y < R - 1) {
          v = Math.min(v, d[i + R]! + S);
          if (x < R - 1) v = Math.min(v, d[i + R + 1]! + D);
          if (x > 0) v = Math.min(v, d[i + R - 1]! + D);
        }
        d[i] = v;
      }
    const reach = R * n('nameReach');
    for (let i = 0; i < R * R; i++) nameField[i] = Math.min(1, d[i]! / reach);
  }

  function layout(): void {
    if (!c.w) return;
    R = Math.round(n('detail'));
    size = Math.min(c.w, c.h - FIXED.SCALE_SPACE) * n('plateSize');
    left = (c.w - size) * 0.5;
    top = (c.h - FIXED.SCALE_SPACE - size) * 0.5;
    const top_n = Math.round(n('pitchRange'));
    cosT = [];
    for (let k = 0; k <= top_n; k++) {
      const row = new Float32Array(R);
      for (let i = 0; i < R; i++) row[i] = Math.cos((k * Math.PI * i) / (R - 1));
      cosT.push(row);
    }
    modes = [];
    for (let a = 1; a <= top_n; a++)
      for (let b = 0; b < a; b++) {
        modes.push([a, b, -1]);
        modes.push([a, b, 1]);
      }
    modes.sort(
      (u, v) => u[0] ** 2 + u[1] ** 2 - (v[0] ** 2 + v[1] ** 2) || u[0] - v[0] || u[2] - v[2],
    );
    field = new Float32Array(R * R);
    const next = grainCount();
    if (next !== count) {
      count = next;
      gx = new Float32Array(count);
      gy = new Float32Array(count);
      scatter();
    }
    buildName();
  }

  fontsReady().then(() => {
    if (!alive) return;
    fontsOk = true;
    buildName();
  });

  /** The pitch after the magnetic lock, and how much of the name field shows. */
  function locked(): [number, number] {
    const np = n('namePitch');
    const width = n('lockWidth');
    const pull = n('lock') * (1 - smoothstep(0, width, Math.abs(pitch - np)));
    const pe = pitch + (np - pitch) * pull;
    const w = hasName ? 1 - smoothstep(0, width, Math.abs(pe - np)) : 0;
    return [pe, w];
  }

  function buildField(): void {
    const [pe, wName] = locked();
    mix = wName;
    const pos = pe * (modes.length - 1);
    const lo = Math.floor(pos);
    const t = pos - lo;
    const [a1, b1, s1] = modes[lo]!;
    const [a2, b2, s2] = modes[Math.min(lo + 1, modes.length - 1)]!;
    const A1 = cosT[a1]!;
    const B1 = cosT[b1]!;
    const A2 = cosT[a2]!;
    const B2 = cosT[b2]!;
    for (let y = 0; y < R; y++)
      for (let x = 0; x < R; x++) {
        const f1 = Math.abs(A1[x]! * B1[y]! + s1 * B1[x]! * A1[y]!);
        const f2 = Math.abs(A2[x]! * B2[y]! + s2 * B2[x]! * A2[y]!);
        const mode = (f1 + (f2 - f1) * t) / FIXED.MODE_MAX;
        const i = y * R + x;
        field[i] = mode + (nameField[i]! - mode) * wName;
      }
  }

  function shake(f: number): void {
    const k = R / size;
    const jit = n('jitter') * n('strength') * f;
    const pull = n('drift') * n('strength') * f;
    const toName = n('namePull') * n('strength') * mix * f * R * n('nameReach');
    for (let i = 0; i < count; i++) {
      const cx = Math.min(R - 2, Math.max(1, Math.floor(gx[i]! * k)));
      const cy = Math.min(R - 2, Math.max(1, Math.floor(gy[i]! * k)));
      const j = cy * R + cx;
      const a = field[j]!;
      const dx = (field[j + 1]! - field[j - 1]!) * 0.5;
      const dy = (field[j + R]! - field[j - R]!) * 0.5;
      const nx = (nameField[j + 1]! - nameField[j - 1]!) * 0.5;
      const ny = (nameField[j + R]! - nameField[j - R]!) * 0.5;
      const x = gx[i]! + (Math.random() - 0.5) * 2 * jit * a - dx * pull - nx * toName;
      const y = gy[i]! + (Math.random() - 0.5) * 2 * jit * a - dy * pull - ny * toName;
      gx[i] = Math.min(size, Math.max(0, x));
      gy[i] = Math.min(size, Math.max(0, y));
    }
  }

  function draw(): void {
    const g = c.ctx;
    c.clear();
    if (!size) return;
    const edge = n('edge');
    g.fillStyle = theme.surface;
    g.fillRect(left, top, size, size);
    if (edge > 0) {
      g.lineWidth = edge;
      g.strokeStyle = theme.c2;
      g.strokeRect(left - edge * 0.5, top - edge * 0.5, size + edge, size + edge);
    }
    const s = n('grainSize');
    const sand = new Path2D();
    for (let i = 0; i < count; i++)
      sand.rect(left + gx[i]! - s * 0.5, top + gy[i]! - s * 0.5, s, s);
    g.fillStyle = theme.ink;
    g.fill(sand);
    // Pitch scale: a line, a tick at the name's pitch, and the current pitch.
    const y = top + size + FIXED.SCALE_SPACE * 0.5;
    const [pe] = locked();
    g.fillStyle = theme.inkSoft;
    g.fillRect(left, y - FIXED.SCALE_LINE * 0.5, size, FIXED.SCALE_LINE);
    g.fillStyle = theme.c1;
    g.fillRect(
      left + size * n('namePitch') - FIXED.SCALE_LINE * 0.5,
      y - FIXED.SCALE_DOT,
      FIXED.SCALE_LINE,
      FIXED.SCALE_DOT * 2,
    );
    g.fillStyle = theme.c3;
    g.beginPath();
    g.arc(left + size * pe, y, FIXED.SCALE_DOT, 0, SHARED.TAU);
    g.fill();
  }

  function idle(dt: number): void {
    idleClock += dt;
    if (idleClock < n('idleHold') && idling) return;
    idling = true;
    target = idleNext ? n('namePitch') : Math.random();
    idleNext = !idleNext;
    idleClock = 0;
  }

  return {
    resize() {
      if (!c.fit()) return;
      layout();
    },
    update(dt) {
      ptr.sync();
      ptr.takeTaps();
      if (ptr.active) {
        target = clamp01(ptr.x / c.w);
        quiet = 0;
        idleNext = true;
        idling = false;
      } else {
        quiet += dt;
        if (quiet > n('idleDelay')) idle(dt);
      }
      pitch += (target - pitch) * (1 - Math.exp(-n('morph') * dt));
      if (!R || !modes.length) return;
      buildField();
      shake(frameFactor(dt));
      draw();
    },
    still() {
      ptr.takeTaps();
      pitch = target = n('namePitch');
      if (!R || !modes.length) return;
      buildField();
      for (let i = 0; i < count; i++) {
        let tries = 0;
        let x = 0;
        let y = 0;
        do {
          x = Math.random() * size;
          y = Math.random() * size;
          tries++;
        } while (
          tries < FIXED.STILL_TRIES &&
          field[Math.floor((y / size) * (R - 1)) * R + Math.floor((x / size) * (R - 1))]! >
            FIXED.STILL_CUTOFF
        );
        gx[i] = x;
        gy[i] = y;
      }
      draw();
    },
    setParams(next) {
      p = { ...next };
      layout();
    },
    setTheme(th) {
      theme = th;
    },
    restart() {
      scatter();
      pitch = target = 0;
      quiet = 0;
      idleNext = true;
      idling = false;
    },
    destroy() {
      alive = false;
      ptr.destroy();
      c.destroy();
      count = 0;
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
