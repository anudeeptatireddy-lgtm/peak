// `neon`: Neon sign (SCENES.md #18, ⚠ flashing rules in PRD §8.2). Letters are
// stroked outlines with stacked additive glow; flicker timing lives in flicker.ts.

import { createCanvas } from '../../engine/canvas';
import { fontsReady } from '../../engine/fonts';
import { createPointer } from '../../engine/pointer';
import { frameFactor } from '../../engine/time';
import { fontString } from '../../kits/text';
import { mixOklab } from '../../theme/color';
import type { Theme } from '../../theme/worlds';
import { SHARED } from '../shared';
import type { Params, SceneContext, SceneInstance, SceneModule } from '../types';
import { Flicker, type FlickerTiming } from './flicker';
import { meta } from './meta';
import { params } from './params';
import { followUps } from './prompt';

interface Letter {
  ch: string;
  x: number;
  w: number;
  word: number;
  boost: number;
  tapAt: number;
}

function create(host: HTMLElement, initial: Params, ctx: SceneContext): SceneInstance {
  let p = { ...initial };
  const n = (id: string) => Number(p[id]);
  let theme: Theme = ctx.theme;
  const c = createCanvas(host);
  const ptr = createPointer(host);
  const label = document.createElement('p');
  label.className = 'sr-only';
  host.append(label);
  let fontsOk = false;
  fontsReady().then(() => {
    fontsOk = true;
  });

  let letters: Letter[] = [];
  let font = '';
  let baseline = 0;
  let top = 0;
  let bottom = 0;
  let time = 0;
  let flicker = new Flicker(0);

  const timing = (): FlickerTiming => ({
    firstDelay: n('firstDelay'),
    turnOn: n('turnOn'),
    flicker: ctx.reducedMotion ? 0 : n('flicker'),
    dimsPerMinute: n('dimsPerMinute'),
    dimTime: n('dimTime'),
    dimLevel: n('dimLevel'),
    stutter: Boolean(p.stutter),
  });

  function layout(): void {
    const g = c.ctx;
    const text = String(p.text || ' ');
    label.textContent = text;
    let size = c.h * n('textHeight');
    const apply = () => {
      font = fontString({ size, weight: n('weight'), italic: p.style === 'italic' });
      g.font = font;
    };
    apply();
    const maxW = c.w * n('fitWidth');
    if (g.measureText(text).width > maxW) {
      size *= maxW / g.measureText(text).width;
      apply();
    }
    const m = g.measureText(text);
    baseline = c.h * n('textY') + (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2;
    top = baseline - m.actualBoundingBoxAscent;
    bottom = baseline + m.actualBoundingBoxDescent;
    const left = (c.w - m.width) / 2;
    const old = letters;
    letters = [];
    let word = 0;
    [...text].forEach((ch, i) => {
      if (ch === ' ') {
        word++;
        return;
      }
      const before = [...text].slice(0, i).join('');
      const prev = old[letters.length];
      letters.push({
        ch,
        x: left + g.measureText(before).width,
        w: g.measureText(ch).width,
        word,
        boost: prev?.boost ?? 0,
        tapAt: prev?.tapAt ?? -Infinity,
      });
    });
    if (flicker.letters !== letters.length) flicker = new Flicker(letters.length);
  }

  function draw(lit: (i: number) => number): void {
    const g = c.ctx;
    c.clear();
    g.font = font;
    g.textAlign = 'left';
    g.textBaseline = 'alphabetic';
    g.lineJoin = 'round';
    g.lineCap = 'round';
    const tube = n('tube');
    const layers = n('glowLayers');
    const inks = [theme.c1, theme.c2, theme.c3];
    letters.forEach((l, i) => {
      const b = lit(i);
      if (b <= 0) return;
      const color = inks[l.word % SHARED.INKS]!;
      g.globalCompositeOperation = 'lighter';
      g.strokeStyle = color;
      const glow = n('glow') * b * (1 + n('hoverBoost') * l.boost);
      for (let k = layers; k >= 1; k--) {
        g.globalAlpha = Math.min(1, (glow * (1 - (k - 1) / layers)) / layers);
        g.lineWidth = tube + k * n('glowSpread') * tube;
        g.strokeText(l.ch, l.x, baseline);
      }
      g.globalCompositeOperation = 'source-over';
      g.globalAlpha = Math.min(1, b);
      g.lineWidth = tube;
      g.strokeStyle = mixOklab(color, theme.ink, n('core'));
      g.strokeText(l.ch, l.x, baseline);
    });
    g.globalAlpha = 1;
  }

  return {
    resize() {
      c.fit();
      if (!fontsOk) return;
      layout();
    },
    update(dt) {
      time += dt;
      ptr.sync();
      const inside = (l: Letter, x: number, y: number) =>
        x >= l.x && x <= l.x + l.w && y >= top && y <= bottom;
      for (const tap of ptr.takeTaps()) {
        const hit = letters.find((l) => inside(l, tap.x, tap.y));
        if (hit && ptr.pointerType !== 'mouse') hit.tapAt = time;
      }
      const f = frameFactor(dt);
      const k = Math.min(1, n('boostEase') * f);
      for (const l of letters) {
        const hovered = ptr.pointerType === 'mouse' && ptr.active && inside(l, ptr.x, ptr.y);
        l.boost += ((hovered ? 1 : 0) - l.boost) * k;
        l.boost = Math.max(l.boost, 1 - (time - l.tapAt) / n('boostTime'));
      }
      const o = timing();
      flicker.step(time, dt, o);
      draw((i) => flicker.brightness(i, time, o));
    },
    still() {
      ptr.takeTaps();
      draw(() => 1);
    },
    setParams(next) {
      const relayout = params.some(
        (q) =>
          (q.id === 'text' || q.id === 'style' || q.phraseIn === 'text') && next[q.id] !== p[q.id],
      );
      p = { ...next };
      if (relayout && fontsOk && c.w) layout();
    },
    setTheme(t) {
      theme = t;
    },
    restart() {
      time = 0;
      flicker = new Flicker(letters.length);
    },
    destroy() {
      ptr.destroy();
      c.destroy();
      label.remove();
      letters = [];
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
