// `pluck`: Strings (SCENES.md #27). Ported from reference/riso-demo.html's
// "Pluck"; defaults reproduce it, which tests/e2e/parity.spec.ts checks.

import { createCanvas } from '../../engine/canvas';
import { createPointer } from '../../engine/pointer';
import { frameFactor } from '../../engine/time';
import type { Theme } from '../../theme/worlds';
import { SHARED } from '../shared';
import type { Params, SceneContext, SceneInstance, SceneModule } from '../types';
import { FIXED } from './constants';
import { meta } from './meta';
import { params } from './params';
import { followUps } from './prompt';

interface Str {
  x: number;
  off: number;
  vel: number;
  held: boolean;
  by: number;
  k: number;
  ci: number;
}
interface Ghost {
  u: number;
  dir: number;
  y: number;
  wave: number;
}

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

function create(host: HTMLElement, initial: Params, ctx: SceneContext): SceneInstance {
  let p = { ...initial };
  const n = (id: string) => Number(p[id]);
  let theme: Theme = ctx.theme;
  const c = createCanvas(host);
  const ptr = createPointer(host);
  let S: Str[] = [];
  let top = 0;
  let bot = 0;
  let pull = 0;
  let idle = 0;
  let ghost: Ghost | null = null;
  let prevX: number | null = null;

  function build(): void {
    const gap =
      n('spacing') > 0
        ? n('spacing')
        : clamp(c.w / n('spacingDiv'), n('spacingMin'), n('spacingMax'));
    const count = Math.max(FIXED.MIN_STRINGS, Math.floor((c.w - gap) / gap));
    const x0 = (c.w - (count - 1) * gap) / 2;
    const old = S;
    S = Array.from({ length: count }, (_, i) => ({
      x: x0 + i * gap,
      off: 0,
      vel: 0,
      held: false,
      by: c.h / 2,
      k: n('tension') + n('tensionSpread') * (1 - i / (count - 1)),
      ci: i % SHARED.INKS,
    }));
    for (let i = 0; i < Math.min(old.length, count); i++) {
      S[i]!.off = old[i]!.off;
      S[i]!.vel = old[i]!.vel;
    }
    top = c.h * n('topY');
    bot = c.h * n('botY');
    pull = clamp(gap * n('pull'), n('pullMin'), n('pullMax'));
  }

  function saber(g: CanvasRenderingContext2D, color: string, width: number, a: number): void {
    g.strokeStyle = color;
    g.globalAlpha = a * FIXED.HALO_ALPHA;
    g.lineWidth = width * FIXED.HALO_WIDTH;
    g.stroke();
    g.globalAlpha = a * FIXED.BLADE_ALPHA;
    g.lineWidth = width * FIXED.BLADE_WIDTH;
    g.stroke();
    g.globalAlpha = a * FIXED.CORE_ALPHA;
    g.lineWidth = width;
    g.stroke();
    g.strokeStyle = FIXED.WHITE;
    g.globalAlpha = a * FIXED.WHITE_ALPHA;
    g.lineWidth = Math.max(width * FIXED.WHITE_WIDTH, FIXED.WHITE_MIN);
    g.stroke();
  }

  function draw(): void {
    const g = c.ctx;
    c.clear();
    g.lineCap = 'round';
    g.lineJoin = 'round';
    const r = n('anchorR');
    g.fillStyle = theme.inkSoft;
    g.beginPath();
    for (const s of S) {
      g.moveTo(s.x + r, top);
      g.arc(s.x, top, r, 0, SHARED.TAU);
      g.moveTo(s.x + r, bot);
      g.arc(s.x, bot, r, 0, SHARED.TAU);
    }
    g.fill();
    const inks = [theme.c1, theme.c2, theme.c3];
    const glowing = Boolean(p.glow) && theme.blend === 'lighter';
    const path = (s: Str) => {
      g.beginPath();
      g.moveTo(s.x, top);
      g.lineTo(s.x + s.off, s.by);
      g.lineTo(s.x, bot);
    };
    for (const s of S) {
      const a = Math.min(Math.abs(s.off) / (pull * n('litShare')), 1);
      if (a < FIXED.LIT_CEIL) {
        g.globalCompositeOperation = 'source-over';
        g.globalAlpha = (1 - a) * n('restAlpha');
        g.strokeStyle = theme.inkSoft;
        g.lineWidth = n('restWidth');
        path(s);
        g.stroke();
      }
      if (a > FIXED.LIT_FLOOR) {
        const lw = n('litWidth') + Math.min(Math.abs(s.off) / pull, 1) * n('litExtra');
        g.globalCompositeOperation = theme.blend;
        path(s);
        if (glowing) saber(g, inks[s.ci]!, lw, a);
        else {
          g.globalAlpha = a;
          g.strokeStyle = inks[s.ci]!;
          g.lineWidth = lw;
          g.stroke();
        }
      }
    }
    g.globalAlpha = 1;
    g.globalCompositeOperation = 'source-over';
  }

  return {
    resize() {
      c.fit();
      build();
    },
    update(dt) {
      const f = frameFactor(dt);
      ptr.sync();
      ptr.takeTaps();
      let on = false;
      let ax = 0;
      let ay = 0;
      if (ptr.active) {
        on = true;
        ax = ptr.x;
        ay = ptr.y;
        idle = 0;
        ghost = null;
      } else if (p.ghostStrum) {
        idle += dt;
        if (!ghost && idle > n('ghostDelay'))
          ghost = {
            u: 0,
            dir: Math.random() < 0.5 ? 1 : -1,
            y: c.h * lerp(n('ghostYMin'), n('ghostYMax'), Math.random()),
            wave: lerp(n('ghostWaveMin'), n('ghostWaveMax'), Math.random()),
          };
        if (ghost) {
          ghost.u += dt / n('ghostTime');
          if (ghost.u >= 1) {
            ghost = null;
            idle = 0;
          } else {
            on = true;
            const u = ghost.u;
            const o = n('ghostOver');
            ax = ghost.dir > 0 ? lerp(-o, c.w + o, u) : lerp(c.w + o, -o, u);
            ay = ghost.y + Math.sin(u * SHARED.TAU * n('ghostWaves')) * c.h * ghost.wave;
          }
        }
      }
      const inside = ay > top && ay < bot;
      const damp = n('ring') ** f;
      const inset = n('endInset');
      for (const s of S) {
        if (
          on &&
          inside &&
          prevX !== null &&
          !s.held &&
          prevX !== ax &&
          (prevX - s.x) * (ax - s.x) <= 0
        )
          s.held = true;
        if (s.held) {
          if (!on) s.held = false;
          else {
            s.off = ax - s.x;
            s.by = clamp(ay, top + inset, bot - inset);
            s.vel = 0;
            if (Math.abs(s.off) > pull) {
              s.held = false;
              ctx.sound.play('pluck');
            }
          }
        }
        if (!s.held) {
          s.vel = (s.vel - s.k * s.off * f) * damp;
          s.off += s.vel * f;
        }
      }
      prevX = on ? ax : null;
      draw();
    },
    still() {
      ptr.takeTaps();
      draw();
    },
    setParams(next) {
      p = { ...next };
      if (c.w) build();
    },
    setTheme(t) {
      theme = t;
    },
    restart() {
      for (const s of S) {
        s.off = 0;
        s.vel = 0;
        s.held = false;
      }
      idle = 0;
      ghost = null;
    },
    destroy() {
      ptr.destroy();
      c.destroy();
      S = [];
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
