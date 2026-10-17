// `tunnel`: Infinite tunnel (SCENES.md #41, ⚠). Rings in 3D with perspective along a
// winding noise path; ring spacing grows with speed (see fly.ts) so nothing flashes.

import { createCanvas } from '../../engine/canvas';
import { createPointer } from '../../engine/pointer';
import { frameFactor } from '../../engine/time';
import { makeNoise } from '../../kits/field';
import type { Theme } from '../../theme/worlds';
import { SHARED } from '../shared';
import type { Params, SceneContext, SceneInstance, SceneModule } from '../types';
import { FIXED } from './constants';
import { fly, spacingFor, type Flight } from './fly';
import { meta } from './meta';
import { params } from './params';
import { followUps } from './prompt';

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);

interface Ring {
  sx: number;
  sy: number;
  s: number;
  turn: number;
  /** Which accent color this ring uses. */
  ink: number;
}

function create(host: HTMLElement, initial: Params, ctx: SceneContext): SceneInstance {
  let p = { ...initial };
  const n = (id: string) => Number(p[id]);
  let theme: Theme = ctx.theme;
  const c = createCanvas(host);
  const ptr = createPointer(host);
  const noise = makeNoise(FIXED.NOISE_SEED);
  const flight: Flight = { frac: 0, passed: 0, travel: 0, since: 0 };
  const cam = { x: 0, y: 0 };
  let boost = 1;
  let time = 0;

  const sides = () =>
    p.ringShape === 'square'
      ? FIXED.SQUARE_SIDES
      : p.ringShape === 'hexagon'
        ? FIXED.HEX_SIDES
        : FIXED.CIRCLE_SIDES;
  /** The ring's corner angles start 45° round for a square, so its sides are level. */
  const startTurn = () => (p.ringShape === 'square' ? Math.PI / FIXED.SQUARE_SIDES : 0);

  /** Distance from a ring's middle to its outline in direction `phi`, as a share of its radius. */
  function outline(phi: number): number {
    if (p.ringShape === 'circle') return 1;
    const N = sides();
    const sector = SHARED.TAU / N;
    const rel = (((phi - startTurn() + sector * 0.5) % sector) + sector) % sector;
    return Math.cos(Math.PI / N) / Math.cos(rel - sector * 0.5);
  }

  const pathAt = (d: number) => {
    const f = n('pathFreq');
    return {
      x: noise.noise2(d * f, 0) * n('pathAmp') * n('radius'),
      y: noise.noise2(d * f, FIXED.PATH_Y_SEED) * n('pathAmp') * n('radius'),
    };
  };

  function draw(): void {
    const g = c.ctx;
    c.clear();
    const R = n('radius');
    const short = Math.min(c.w, c.h);
    const focal = short * n('focal');
    const gap = spacingFor(flightSpeed(), n('spacing'));
    const here = pathAt(flight.travel);
    const inks = [theme.c1, theme.c2, theme.c3];
    const paths = inks.map(() => new Path2D());
    const stripes = new Path2D();
    const N = sides();
    const S = Math.round(n('stripes'));
    let far = null as Ring | null;
    g.globalCompositeOperation = theme.blend;
    for (let k = n('rings'); k >= 1; k--) {
      const z = (k - flight.frac) * gap;
      if (z < FIXED.NEAR) continue;
      const d = flight.travel + z;
      const mid = pathAt(d);
      const s = focal / z;
      const ring: Ring = {
        sx: c.w * 0.5 + (mid.x - here.x - cam.x) * s,
        sy: c.h * 0.5 + (mid.y - here.y - cam.y) * s,
        s,
        turn:
          n('twist') *
          Math.PI *
          noise.noise2(d * n('pathFreq') * FIXED.TWIST_PACE, FIXED.TWIST_SEED),
        ink: (flight.passed + k) % SHARED.INKS,
      };
      const path = paths[ring.ink]!;
      for (let i = 0; i <= N; i++) {
        const a = ring.turn + startTurn() + (SHARED.TAU * i) / N;
        const x = ring.sx + R * Math.cos(a) * s;
        const y = ring.sy + R * Math.sin(a) * s;
        if (i === 0) path.moveTo(x, y);
        else path.lineTo(x, y);
      }
      if (far && S > 0)
        for (let q = 0; q < S; q++) {
          const phi = (SHARED.TAU * q) / S;
          const r = outline(phi) * R;
          const pair: Ring[] = [far, ring];
          for (const rg of pair) {
            const a = phi + rg.turn;
            const x = rg.sx + r * Math.cos(a) * rg.s;
            const y = rg.sy + r * Math.sin(a) * rg.s;
            if (rg === far) stripes.moveTo(x, y);
            else stripes.lineTo(x, y);
          }
        }
      far = ring;
    }
    g.lineJoin = 'round';
    g.lineWidth = n('ringWidth');
    g.globalAlpha = FIXED.STRIPE_ALPHA;
    g.strokeStyle = inks[1]!;
    g.stroke(stripes);
    g.globalAlpha = 1;
    for (let i = 0; i < inks.length; i++) {
      g.strokeStyle = inks[i]!;
      g.stroke(paths[i]!);
    }
    g.globalCompositeOperation = 'source-over';
    const fog = g.createRadialGradient(
      c.w * 0.5,
      c.h * 0.5,
      0,
      c.w * 0.5,
      c.h * 0.5,
      short * FIXED.FOG_REACH,
    );
    fog.addColorStop(0, withAlpha(theme.ground, FIXED.FOG_ALPHA));
    fog.addColorStop(1, withAlpha(theme.ground, 0));
    g.fillStyle = fog;
    g.fillRect(0, 0, c.w, c.h);
  }

  const flightSpeed = () => n('speed') * n('speedUnit') * boost;

  return {
    resize() {
      c.fit();
      draw();
    },
    update(dt) {
      const f = frameFactor(dt);
      time += dt;
      ptr.sync();
      ptr.takeTaps();
      const holding = ptr.pointerType === 'mouse' ? ptr.down : ptr.dragging;
      boost += ((holding ? n('boost') : 1) - boost) * (1 - Math.pow(1 - n('boostEase'), f));
      let tx: number;
      let ty: number;
      const reach = n('steer') * n('radius');
      if (ptr.active) {
        tx = reach * clamp((ptr.x - c.w * 0.5) / (c.w * 0.5), -1, 1);
        ty = reach * clamp((ptr.y - c.h * 0.5) / (c.h * 0.5), -1, 1);
      } else {
        tx = reach * noise.noise2(time * FIXED.SELF_RATE, 0);
        ty = reach * noise.noise2(time * FIXED.SELF_RATE, FIXED.PATH_Y_SEED);
      }
      const k = 1 - Math.pow(1 - n('steerEase'), f);
      cam.x += (tx - cam.x) * k;
      cam.y += (ty - cam.y) * k;
      fly(flight, flightSpeed(), n('spacing'), dt);
      draw();
    },
    still() {
      ptr.takeTaps();
      flight.frac = FIXED.STILL_FRAC;
      cam.x = 0;
      cam.y = 0;
      boost = 1;
      draw();
    },
    setParams(next) {
      p = { ...next };
      if (c.w) draw();
    },
    setTheme(t) {
      theme = t;
    },
    restart() {
      flight.frac = 0;
      flight.passed = 0;
      flight.travel = 0;
      flight.since = 0;
      cam.x = 0;
      cam.y = 0;
      boost = 1;
      time = 0;
    },
    destroy() {
      ptr.destroy();
      c.destroy();
    },
  };
}

/** `#rrggbb` or `rgb()` color with an opacity, for the gradient stops. */
function withAlpha(color: string, alpha: number): string {
  return `color-mix(in srgb, ${color} ${Math.round(alpha * SHARED.PERCENT)}%, transparent)`;
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
