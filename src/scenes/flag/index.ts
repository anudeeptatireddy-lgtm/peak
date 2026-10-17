// `flag`: Flag text (SCENES.md #14). The banner lives on a hidden canvas and is
// copied in vertical strips, each shifted by layered sine waves and shaded by slope.

import { createCanvas } from '../../engine/canvas';
import { fontsReady } from '../../engine/fonts';
import { createPointer } from '../../engine/pointer';
import { frameFactor } from '../../engine/time';
import { fontString, offscreen } from '../../kits/text';
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
  let fontsOk = false;
  fontsReady().then(() => {
    fontsOk = true;
  });

  let src: ReturnType<typeof offscreen> | null = null;
  let painted = '';
  let box = { x: 0, y: 0, w: 0, h: 0 };
  let time = 0;
  let gust = 0;

  function paint(): void {
    src?.free();
    src = offscreen(c.w * c.dpr, c.h * c.dpr);
    const o = src.ctx;
    o.setTransform(c.dpr, 0, 0, c.dpr, 0, 0);
    const text = String(p.text || ' ');
    let size = c.h * n('textHeight');
    const setFont = () => (o.font = fontString({ size, weight: n('weight') }));
    setFont();
    const bannerW = () => o.measureText(text).width + 2 * n('padX') * size;
    if (bannerW() > c.w * n('fitWidth')) {
      size *= (c.w * n('fitWidth')) / bannerW();
      setFont();
    }
    const w = bannerW();
    const h = n('bannerH') * size;
    box = { x: (c.w - w) / 2, y: (c.h - h) / 2, w, h };
    o.fillStyle = theme.c1;
    o.fillRect(box.x, box.y, w, h);
    o.fillStyle = theme.ground;
    o.textAlign = 'center';
    o.textBaseline = 'middle';
    o.fillText(text, c.w / 2, c.h / 2);
    painted = theme.c1 + theme.ground;
  }

  function offset(x: number, t: number): number {
    const L = n('wavelength') * n('waveSize');
    const S = n('waveSpeed');
    const w2 = n('wave2');
    const env = Math.pow(Math.max(0, x / box.w), n('pin'));
    const wave =
      (Math.sin((x * SHARED.TAU) / L - t * S) +
        w2 *
          Math.sin(
            (x * SHARED.TAU) / (FIXED.WAVE2_LENGTH * L) -
              t * S * FIXED.WAVE2_SPEED +
              FIXED.WAVE2_PHASE,
          )) /
      (1 + w2);
    return n('wind') * (1 + gust) * n('amplitude') * box.h * env * wave;
  }

  function draw(t: number): void {
    const g = c.ctx;
    c.clear();
    if (!src) return;
    if (theme.c1 + theme.ground !== painted) paint();
    const sw = n('stripWidth');
    const d = c.dpr;
    const shade = n('shading');
    for (let x = 0; x < box.w; x += sw) {
      const w = Math.min(sw, box.w - x);
      const off = offset(x, t);
      const slope = (offset(x + sw, t) - off) / sw;
      const X = box.x + x;
      const Y = box.y + off;
      g.drawImage(src.canvas, X * d, box.y * d, w * d, box.h * d, X, Y, w, box.h);
      const a = Math.min(0.5, shade * Math.abs(slope));
      if (a > 0) {
        g.globalAlpha = a;
        g.fillStyle = slope > 0 ? theme.ink : theme.ground;
        g.fillRect(X, Y, w, box.h);
        g.globalAlpha = 1;
      }
    }
    if (p.pole) {
      const pw = n('poleWidth');
      const top = box.y - n('poleTop') * box.h;
      g.fillStyle = theme.ink;
      g.beginPath();
      g.roundRect(box.x - pw, top, pw, c.h - top, pw / 2);
      g.fill();
    }
  }

  return {
    resize() {
      c.fit();
      if (!fontsOk) return;
      paint();
    },
    update(dt) {
      time += dt;
      ptr.sync();
      ptr.takeTaps();
      const f = frameFactor(dt);
      if (ptr.active) {
        const speed = Math.hypot(ptr.x - ptr.px, ptr.y - ptr.py);
        gust = Math.min(n('gust'), gust + n('gust') * speed * n('gustGain'));
      }
      gust *= n('gustDecay') ** f;
      draw(time);
    },
    still() {
      ptr.takeTaps();
      const keep = gust;
      gust = 0;
      draw(FIXED.STILL_TIME);
      gust = keep;
    },
    setParams(next) {
      const repaint = params.some(
        (q) => (q.id === 'text' || q.phraseIn === 'text') && next[q.id] !== p[q.id],
      );
      p = { ...next };
      if (repaint && fontsOk && c.w) paint();
    },
    setTheme(t) {
      theme = t;
    },
    restart() {
      time = 0;
      gust = 0;
    },
    destroy() {
      ptr.destroy();
      c.destroy();
      src?.free();
      src = null;
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
