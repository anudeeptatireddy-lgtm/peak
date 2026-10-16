// `warp`: Hyperspace intro (SCENES.md #23). Ported from reference/peak-prototype.html.

import { createCanvas } from '../../engine/canvas';
import { prefersReducedMotion } from '../../engine/motion';
import { createPointer } from '../../engine/pointer';
import type { Theme } from '../../theme/worlds';
import type { Params, SceneContext, SceneInstance, SceneModule } from '../types';
import { SHARED } from '../shared';
import { FIXED } from './constants';
import { meta } from './meta';
import { params } from './params';
import { followUps } from './prompt';

interface Star {
  x: number;
  y: number;
  z: number;
  ci: number;
}

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
    left: FIXED.CENTER,
    translate: FIXED.CENTER_SHIFT,
    zIndex: FIXED.BUTTON_LAYER,
    fontSize: FIXED.BUTTON_FONT,
    minHeight: FIXED.BUTTON_MIN_HEIGHT,
    padding: FIXED.BUTTON_PADDING,
    willChange: 'transform',
  });
  const placeButton = () => (btn.style.top = `${Number(p.buttonY) * SHARED.PERCENT}%`);
  placeButton();
  btn.textContent = String(p.buttonText);
  const onClick = () =>
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  btn.addEventListener('click', onClick);
  host.append(btn);

  const reset = (s: Star, far: boolean): Star => {
    const near = Number(p.nearest);
    const deep = Number(p.farDepth);
    s.x = Math.random() * 2 - 1;
    s.y = Math.random() * 2 - 1;
    s.z = far ? deep + Math.random() * (1 - deep) : near + Math.random() * (1 - near);
    s.ci = Math.random() < Number(p.plainShare) ? -1 : (Math.random() * SHARED.INKS) | 0;
    return s;
  };

  function build(): void {
    const base = Number(p.stars);
    const n = Math.round(
      (c.w < SHARED.SMALL_SCREEN ? Number(p.starsSmall) : base) *
        (ctx.quality === 'preview' ? SHARED.PREVIEW_SCALE : 1),
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
    const cy = c.h * Number(p.centerY);
    const f = Math.max(c.w, c.h) * Number(p.fov);
    const m = FIXED.MARGIN;
    const maxZ = Number(p.maxTrailDepth);
    const far = Number(p.bandFar);
    const mid = Number(p.bandMid);
    const widths = [Number(p.widthFar), Number(p.widthMid), Number(p.widthNear)];
    const alphas = [Number(p.alphaFar), Number(p.alphaMid), Number(p.alphaNear)];
    const bands = widths.length;
    c.clear();
    g.globalCompositeOperation = theme.blend;
    g.lineCap = 'round';
    const paths = Array.from({ length: (SHARED.INKS + 1) * bands }, () => new Path2D());
    for (const s of stars) {
      const sx = cx + (s.x / s.z) * f;
      const sy = cy + (s.y / s.z) * f;
      if (sx < -m || sx > c.w + m || sy < -m || sy > c.h + m) {
        reset(s, true);
        continue;
      }
      const tz = Math.min(maxZ, s.z + trail);
      const b = s.z > far ? 0 : s.z > mid ? 1 : 2;
      const path = paths[(s.ci + 1) * bands + b]!;
      path.moveTo(cx + (s.x / tz) * f, cy + (s.y / tz) * f);
      path.lineTo(sx + FIXED.DOT_NUDGE, sy);
    }
    const colors = [theme.ink, theme.c1, theme.c2, theme.c3];
    for (let i = 0; i < paths.length; i++) {
      g.strokeStyle = colors[Math.floor(i / bands)]!;
      g.globalAlpha = alphas[i % bands]!;
      g.lineWidth = widths[i % bands]!;
      g.stroke(paths[i]!);
    }
    g.globalAlpha = 1;
    g.globalCompositeOperation = 'source-over';
  }

  return {
    resize() {
      // Like the prototype: every resize (including the one when fonts arrive) re-seeds the stars.
      c.fit();
      build();
    },
    update(dt) {
      ptr.sync();
      ptr.takeTaps();
      const target = ptr.down && ptr.active ? Number(p.warpSpeed) : Number(p.cruise);
      const rate = target > speed ? Number(p.accel) : Number(p.decel);
      speed += (target - speed) * (1 - Math.exp(-dt * rate));
      for (const s of stars) {
        s.z -= speed * dt;
        if (s.z < Number(p.nearLimit)) reset(s, true);
      }
      draw(speed * Number(p.streak) + Number(p.streakMin));
      let tx = 0;
      let ty = 0;
      if (ptr.active && ptr.pointerType === 'mouse') {
        const dx = ptr.x - rest.x;
        const dy = ptr.y - rest.y;
        if (Math.hypot(dx, dy) < Number(p.magnetReach)) {
          tx = dx * Number(p.magnet);
          ty = dy * Number(p.magnet);
        }
      }
      const e = 1 - Math.exp(-dt * Number(p.magnetEase));
      mx += (tx - mx) * e;
      my += (ty - my) * e;
      btn.style.transform = `translate(${mx.toFixed(2)}px, ${my.toFixed(2)}px)`;
    },
    still() {
      ptr.takeTaps();
      draw(Number(p.streakMin));
    },
    setParams(next) {
      const rebuild = next.stars !== p.stars;
      p = { ...next };
      btn.textContent = String(p.buttonText);
      placeButton();
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
