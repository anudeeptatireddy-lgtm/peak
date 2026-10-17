// `echo`: Echo trail (SCENES.md #16). The word's position is sampled 60 times
// a second; echoes are drawn where it was a few samples ago.

import { createCanvas } from '../../engine/canvas';
import { fontsReady } from '../../engine/fonts';
import { createPointer } from '../../engine/pointer';
import { frameFactor } from '../../engine/time';
import { fontString } from '../../kits/text';
import type { Theme } from '../../theme/worlds';
import { SHARED } from '../shared';
import type { Params, SceneContext, SceneInstance, SceneModule } from '../types';
import { FIXED } from './constants';
import { meta } from './meta';
import { params } from './params';
import { followUps } from './prompt';

interface P2 {
  x: number;
  y: number;
}

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

  let font = '';
  let pos: P2 = { x: 0, y: 0 };
  let history: P2[] = [];
  let time = 0;
  let acc = 0;

  const path = (t: number): P2 => ({
    x: c.w / 2 + c.w * n('pathW') * Math.sin(t * n('pathSpeed')),
    y:
      c.h / 2 +
      c.h * n('pathH') * Math.sin(t * n('pathSpeed') * FIXED.LOOP_RATIO + FIXED.LOOP_PHASE),
  });
  const keep = () => n('copies') * n('spacing') + 1;

  function layout(): void {
    const g = c.ctx;
    const text = String(p.text || ' ');
    let size = c.h * n('textHeight');
    const setFont = () => {
      font = fontString({ size, weight: n('weight') });
      g.font = font;
      try {
        g.fontStretch = String(p.letterWidth) as CanvasFontStretch;
      } catch {
        /* older browsers */
      }
    };
    setFont();
    const maxW = c.w * n('fitWidth');
    if (g.measureText(text).width > maxW) {
      size *= maxW / g.measureText(text).width;
      setFont();
    }
  }

  function reset(): void {
    pos = path(time);
    history = Array.from({ length: keep() }, () => ({ ...pos }));
    acc = 0;
  }

  function draw(at: (k: number) => P2): void {
    const g = c.ctx;
    c.clear();
    g.font = font;
    try {
      g.fontStretch = String(p.letterWidth) as CanvasFontStretch;
    } catch {
      /* older browsers */
    }
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    const text = String(p.text || ' ');
    const inks = [theme.c1, theme.c2, theme.c3];
    g.globalCompositeOperation = theme.blend;
    for (let k = n('copies'); k >= 1; k--) {
      const q = at(k);
      g.globalAlpha = n('fade') ** k;
      g.fillStyle = inks[(k - 1) % SHARED.INKS]!;
      g.fillText(text, q.x, q.y);
    }
    g.globalAlpha = 1;
    g.globalCompositeOperation = 'source-over';
    g.fillStyle = theme.ink;
    const q = at(0);
    g.fillText(text, q.x, q.y);
  }

  const sampleAt = (k: number): P2 =>
    k === 0 ? pos : (history[Math.max(0, history.length - 1 - k * n('spacing'))] ?? pos);

  return {
    resize() {
      c.fit();
      if (!fontsOk) return;
      layout();
      if (!history.length) reset();
    },
    update(dt) {
      time += dt;
      ptr.sync();
      ptr.takeTaps();
      const f = frameFactor(dt);
      const near = Math.hypot(ptr.x - pos.x, ptr.y - pos.y) < n('followReach');
      const following = Boolean(p.follow) && ptr.active && near;
      const target = following ? { x: ptr.x, y: ptr.y } : path(time);
      const k = Math.min(1, (following ? n('followEase') : n('returnEase')) * f);
      pos = { x: pos.x + (target.x - pos.x) * k, y: pos.y + (target.y - pos.y) * k };
      acc += dt;
      while (acc >= 1 / SHARED.FPS) {
        history.push({ ...pos });
        acc -= 1 / SHARED.FPS;
      }
      if (history.length > keep()) history.splice(0, history.length - keep());
      draw(sampleAt);
    },
    still() {
      ptr.takeTaps();
      draw((k) => path(FIXED.STILL_TIME - (k * n('spacing')) / SHARED.FPS));
    },
    setParams(next) {
      const relayout = params.some(
        (q) => (q.group === 'Look' || q.phraseIn === 'text') && next[q.id] !== p[q.id],
      );
      p = { ...next };
      if (relayout && fontsOk && c.w) layout();
      while (history.length < keep()) history.unshift({ ...(history[0] ?? pos) });
    },
    setTheme(t) {
      theme = t;
    },
    restart() {
      reset();
    },
    destroy() {
      ptr.destroy();
      c.destroy();
      history = [];
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
