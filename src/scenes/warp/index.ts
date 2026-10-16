// `warp`: Hyperspace intro (SCENES.md #23). Ported from reference/peak-prototype.html.

import { createCanvas } from '../../engine/canvas';
import { prefersReducedMotion } from '../../engine/motion';
import { createPointer } from '../../engine/pointer';
import type { Theme } from '../../theme/worlds';
import type { Params, SceneContext, SceneInstance, SceneModule } from '../types';
import { meta } from './meta';
import { params } from './params';
import { followUps } from './prompt';

interface Star {
  x: number;
  y: number;
  z: number;
  ci: number;
}

const WIDTHS = [0.9, 1.8, 3];
const ALPHAS = [0.45, 0.75, 1];

function create(host: HTMLElement, initial: Params, ctx: SceneContext): SceneInstance {
  let p = { ...initial };
  let theme: Theme = ctx.theme;
  const c = createCanvas(host);
  const ptr = createPointer(host);
  let stars: Star[] = [];
  let speed = Number(p.cruise);
  let mx = 0;
  let my = 0;
  let rest = { x: 0, y: 0 };

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn btn--primary';
  Object.assign(btn.style, {
    position: 'absolute',
    left: '50%',
    top: '64%',
    translate: '-50% -50%',
    zIndex: '3',
    fontSize: '1.05rem',
    minHeight: '48px',
    padding: '0 1.6rem',
    willChange: 'transform',
  });
  btn.textContent = String(p.buttonText);
  const onClick = () =>
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  btn.addEventListener('click', onClick);
  host.append(btn);

  const reset = (s: Star, far: boolean): Star => {
    s.x = Math.random() * 2 - 1;
    s.y = Math.random() * 2 - 1;
    s.z = far ? 0.9 + Math.random() * 0.1 : 0.05 + Math.random() * 0.95;
    s.ci = Math.random() < 0.72 ? -1 : (Math.random() * 3) | 0;
    return s;
  };

  function build(): void {
    const base = Number(p.stars);
    const n = Math.round(
      (c.w < 700 ? base * (420 / 900) : base) * (ctx.quality === 'preview' ? 0.5 : 1),
    );
    stars = [];
    for (let i = 0; i < n; i++) stars.push(reset({ x: 0, y: 0, z: 1, ci: -1 }, false));
    btn.style.transform = '';
    mx = 0;
    my = 0;
    const hr = host.getBoundingClientRect();
    const br = btn.getBoundingClientRect();
    rest = { x: br.left - hr.left + br.width / 2, y: br.top - hr.top + br.height / 2 };
  }

  function draw(trail: number): void {
    const g = c.ctx;
    const cx = c.w / 2;
    const cy = c.h * 0.45;
    const f = Math.max(c.w, c.h) * 0.55;
    c.clear();
    g.globalCompositeOperation = theme.blend;
    g.lineCap = 'round';
    const paths = Array.from({ length: 12 }, () => new Path2D());
    for (const s of stars) {
      const sx = cx + (s.x / s.z) * f;
      const sy = cy + (s.y / s.z) * f;
      if (sx < -60 || sx > c.w + 60 || sy < -60 || sy > c.h + 60) {
        reset(s, true);
        continue;
      }
      const tz = Math.min(1.2, s.z + trail);
      const b = s.z > 0.6 ? 0 : s.z > 0.28 ? 1 : 2;
      const path = paths[(s.ci + 1) * 3 + b]!;
      path.moveTo(cx + (s.x / tz) * f, cy + (s.y / tz) * f);
      path.lineTo(sx + 0.01, sy);
    }
    const colors = [theme.ink, theme.c1, theme.c2, theme.c3];
    for (let i = 0; i < 12; i++) {
      g.strokeStyle = colors[Math.floor(i / 3)]!;
      g.globalAlpha = ALPHAS[i % 3]!;
      g.lineWidth = WIDTHS[i % 3]!;
      g.stroke(paths[i]!);
    }
    g.globalAlpha = 1;
    g.globalCompositeOperation = 'source-over';
  }

  return {
    resize() {
      if (c.fit() || !stars.length) build();
    },
    update(dt) {
      ptr.sync();
      ptr.takeTaps();
      const target = ptr.down && ptr.active ? Number(p.warpSpeed) : Number(p.cruise);
      speed += (target - speed) * (1 - Math.exp(-dt * (target > speed ? 1.4 : 2.2)));
      for (const s of stars) {
        s.z -= speed * dt;
        if (s.z < 0.03) reset(s, true);
      }
      draw(speed * Number(p.streak) + 0.004);
      let tx = 0;
      let ty = 0;
      if (ptr.active && ptr.pointerType === 'mouse') {
        const dx = ptr.x - rest.x;
        const dy = ptr.y - rest.y;
        if (Math.hypot(dx, dy) < 170) {
          tx = dx * Number(p.magnet);
          ty = dy * Number(p.magnet);
        }
      }
      const e = 1 - Math.exp(-dt * 12);
      mx += (tx - mx) * e;
      my += (ty - my) * e;
      btn.style.transform = `translate(${mx.toFixed(2)}px, ${my.toFixed(2)}px)`;
    },
    still() {
      ptr.takeTaps();
      draw(0.004);
    },
    setParams(next) {
      const rebuild = next.stars !== p.stars;
      p = { ...next };
      btn.textContent = String(p.buttonText);
      if (rebuild) build();
    },
    setTheme(t) {
      theme = t;
    },
    restart() {
      speed = Number(p.cruise);
      build();
    },
    destroy() {
      btn.removeEventListener('click', onClick);
      btn.remove();
      ptr.destroy();
      c.destroy();
      stars = [];
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
