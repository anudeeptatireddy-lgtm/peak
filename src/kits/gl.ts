// Realism kit (PRD §8.8): a tiny hand-written WebGL helper for REALISTIC scenes. No graphics
// library. WebGL 1 only (it runs everywhere); simulations run on the CPU on a small grid and
// reach the shader as 8-bit data textures, so no float-texture extension is ever needed.
//
// The pure parts (quality tiers, the slow-frame governor, 16-bit packing, color conversion)
// are unit-tested; the GL parts are exercised by the scenes' e2e tests.

import { parseHex } from '../theme/color';

/* ---------- quality tiers (PRD §8.8 item 8) ---------- */

export type Tier = 'full' | 'balanced' | 'phone';
export type TierSetting = 'auto' | Tier;
export const TIERS: Tier[] = ['full', 'balanced', 'phone'];

/** Share of the CSS size the canvas is drawn at, per tier (the picture is soft-lit, so it scales well). */
export const TIER_SCALE: Record<Tier, number> = { full: 1, balanced: 0.7, phone: 0.5 };
/** Share of the full simulation grid each tier uses. */
export const TIER_GRID: Record<Tier, number> = { full: 1, balanced: 0.7, phone: 0.5 };

/** The tier a scene starts at: phones and gallery previews get balanced, everything else full. */
export function pickTier(
  setting: TierSetting,
  ctx: { isSmall: boolean; quality: 'full' | 'preview' },
): Tier {
  if (setting !== 'auto') return setting;
  return ctx.isSmall || ctx.quality === 'preview' ? 'balanced' : 'full';
}

/** The next lighter tier, or the same one when already lightest. */
export function lighter(tier: Tier): Tier {
  return TIERS[Math.min(TIERS.length - 1, TIERS.indexOf(tier) + 1)]!;
}

export interface Governor {
  /** Feed every frame's dt (seconds). Returns the new tier when it just dropped, else null. */
  tick(dt: number): Tier | null;
  readonly tier: Tier;
}

/**
 * Drops one tier when frames run long: a smoothed frame time above `slowSeconds` for `afterSeconds`
 * of real time in a row (so a very slow device drops within a couple of seconds, not a minute).
 * Never goes back up (that would flicker), and only the auto setting uses it.
 */
export function createGovernor(
  start: Tier,
  opts: { slowSeconds: number; afterSeconds: number; smoothing: number },
): Governor {
  let tier = start;
  let avg = 0;
  let slow = 0;
  return {
    tick(dt) {
      avg = avg === 0 ? dt : avg + (dt - avg) * opts.smoothing;
      slow = avg > opts.slowSeconds ? slow + dt : 0;
      if (slow >= opts.afterSeconds && tier !== 'phone') {
        tier = lighter(tier);
        avg = 0;
        slow = 0;
        return tier;
      }
      return null;
    },
    get tier() {
      return tier;
    },
  };
}

/* ---------- small pure helpers ---------- */

const BYTE = 255;
const UNIT16 = 65535;

/** A 0..1 value as two bytes (high, low): 16 bits of precision in an 8-bit texture. */
export function packUnit16(v: number): [number, number] {
  const n = Math.round(Math.min(1, Math.max(0, v)) * UNIT16);
  return [n >> 8, n & BYTE];
}

export function unpackUnit16(hi: number, lo: number): number {
  return ((hi << 8) | lo) / UNIT16;
}

/** "#RRGGBB" as three 0..1 numbers for a shader uniform. */
export function hexToVec3(hex: string): [number, number, number] {
  const c = parseHex(hex);
  return [c.r, c.g, c.b];
}

/** A signed value in -1..1 as a byte (128 is zero) and back. */
export const packSigned = (v: number) =>
  Math.round((Math.min(1, Math.max(-1, v)) * 0.5 + 0.5) * BYTE);
export const unpackSigned = (b: number) => (b / BYTE) * 2 - 1;

/* ---------- GLSL building blocks ---------- */

export const FULLSCREEN_VS = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

/** Float precision header: high where the device has it, medium otherwise. */
export const FS_HEADER = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 v_uv;`;

/** hash(), value noise and a few octaves of it: the micro-texture every material needs. */
export const GLSL_NOISE = `
float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
float fbm(vec2 p) {
  float s = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    s += a * vnoise(p);
    p = p * 2.03 + 17.1;
    a *= 0.5;
  }
  return s;
}`;

/* ---------- the GL handle ---------- */

export type UniformValue =
  | number
  | [number, number]
  | [number, number, number]
  | [number, number, number, number]
  | number[]
  | { tex: WebGLTexture; unit: number }
  /** An array of vec4 uniforms, flattened (x, y, z, w, x, y, z, w, ...). */
  | { vec4s: number[] };

export interface Pass {
  /** Sets the uniforms and draws the full-screen quad into the current framebuffer. */
  draw(uniforms: Record<string, UniformValue>): void;
  destroy(): void;
}

export interface DataTexture {
  texture: WebGLTexture;
  /** Uploads RGBA bytes (w × h × 4). */
  set(data: Uint8Array | Uint8ClampedArray, w: number, h: number): void;
  /** Uploads a canvas (a text mask, for instance). */
  setCanvas(source: HTMLCanvasElement): void;
  destroy(): void;
}

export interface GL {
  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  /** CSS size of the host. */
  w: number;
  h: number;
  /** Matches the host's size at the given resolution scale. Returns true when the backing size changed. */
  fit(scale: number): boolean;
  pass(fragment: string): Pass;
  texture(filter: 'linear' | 'nearest'): DataTexture;
  /** True after the browser took the GL context away (the scene shows its fallback). */
  readonly lost: boolean;
  onLost: (() => void) | null;
  onRestored: (() => void) | null;
  destroy(): void;
}

/** The longest side the backing store may have, in device pixels (phones and old GPUs). */
const MAX_SIDE = 2048;

function shader(gl: WebGLRenderingContext, type: number, src: string): WebGLShader {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(s) ?? '';
    gl.deleteShader(s);
    throw new Error(`Shader compile failed: ${log}`);
  }
  return s;
}

/**
 * A WebGL canvas inside `host`, or null when WebGL is unavailable (the scene then draws its
 * Canvas 2D fallback). `dprCap` mirrors the 2D canvas helper's devicePixelRatio cap.
 */
export function createGL(host: HTMLElement, opts: { dprCap?: number } = {}): GL | null {
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.className = 'scene-canvas';
  const gl = (canvas.getContext('webgl', {
    antialias: false,
    alpha: false,
    depth: false,
    stencil: false,
    // Kept so the last frame can be read back (tests, screenshots); the cost is negligible here.
    preserveDrawingBuffer: true,
    powerPreference: 'default',
  }) ?? null) as WebGLRenderingContext | null;
  if (!gl) return null;
  host.prepend(canvas);

  const quad = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

  const passes = new Set<Pass>();
  const textures = new Set<DataTexture>();
  let lost = false;
  const handle: GL = {
    canvas,
    gl,
    w: 0,
    h: 0,
    fit(scale) {
      const w = Math.max(1, Math.round(host.clientWidth));
      const h = Math.max(1, Math.round(host.clientHeight));
      const dpr = Math.min(window.devicePixelRatio || 1, opts.dprCap ?? 2) * scale;
      let bw = Math.max(1, Math.round(w * dpr));
      let bh = Math.max(1, Math.round(h * dpr));
      const over = Math.max(bw, bh) / MAX_SIDE;
      if (over > 1) {
        bw = Math.round(bw / over);
        bh = Math.round(bh / over);
      }
      handle.w = w;
      handle.h = h;
      if (canvas.width === bw && canvas.height === bh) return false;
      canvas.width = bw;
      canvas.height = bh;
      gl.viewport(0, 0, bw, bh);
      return true;
    },
    pass(fragment) {
      const prog = gl.createProgram()!;
      const vs = shader(gl, gl.VERTEX_SHADER, FULLSCREEN_VS);
      const fs = shader(gl, gl.FRAGMENT_SHADER, fragment);
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS))
        throw new Error(`Program link failed: ${gl.getProgramInfoLog(prog) ?? ''}`);
      const loc = gl.getAttribLocation(prog, 'a_pos');
      const cache = new Map<string, WebGLUniformLocation | null>();
      const where = (name: string) => {
        if (!cache.has(name)) cache.set(name, gl.getUniformLocation(prog, name));
        return cache.get(name)!;
      };
      const pass: Pass = {
        draw(uniforms) {
          if (lost) return;
          gl.useProgram(prog);
          gl.bindBuffer(gl.ARRAY_BUFFER, quad);
          gl.enableVertexAttribArray(loc);
          gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
          for (const [name, v] of Object.entries(uniforms)) {
            const l = where(name);
            if (l === null) continue;
            if (typeof v === 'number') gl.uniform1f(l, v);
            else if (Array.isArray(v)) {
              if (v.length === 2) gl.uniform2f(l, v[0]!, v[1]!);
              else if (v.length === 3) gl.uniform3f(l, v[0]!, v[1]!, v[2]!);
              else if (v.length === 4) gl.uniform4f(l, v[0]!, v[1]!, v[2]!, v[3]!);
              else gl.uniform1fv(l, v);
            } else if ('vec4s' in v) {
              gl.uniform4fv(l, v.vec4s);
            } else {
              gl.activeTexture(gl.TEXTURE0 + v.unit);
              gl.bindTexture(gl.TEXTURE_2D, v.tex);
              gl.uniform1i(l, v.unit);
            }
          }
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        },
        destroy() {
          gl.deleteProgram(prog);
          passes.delete(pass);
        },
      };
      passes.add(pass);
      return pass;
    },
    texture(filter) {
      const tex = gl.createTexture()!;
      const f = filter === 'linear' ? gl.LINEAR : gl.NEAREST;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, f);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, f);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const t: DataTexture = {
        texture: tex,
        set(data, w, h) {
          if (lost) return;
          gl.bindTexture(gl.TEXTURE_2D, tex);
          gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 0);
          gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
        },
        setCanvas(source) {
          if (lost) return;
          gl.bindTexture(gl.TEXTURE_2D, tex);
          gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 0);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
        },
        destroy() {
          gl.deleteTexture(tex);
          textures.delete(t);
        },
      };
      textures.add(t);
      return t;
    },
    get lost() {
      return lost;
    },
    onLost: null,
    onRestored: null,
    destroy() {
      canvas.removeEventListener('webglcontextlost', onLost);
      canvas.removeEventListener('webglcontextrestored', onRestored);
      for (const p of [...passes]) p.destroy();
      for (const t of [...textures]) t.destroy();
      gl.deleteBuffer(quad);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      canvas.width = 0;
      canvas.height = 0;
      canvas.remove();
    },
  };
  const onLost = (e: Event) => {
    e.preventDefault();
    lost = true;
    handle.onLost?.();
  };
  const onRestored = () => {
    lost = false;
    handle.onRestored?.();
  };
  canvas.addEventListener('webglcontextlost', onLost);
  canvas.addEventListener('webglcontextrestored', onRestored);
  return handle;
}
