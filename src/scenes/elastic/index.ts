// `elastic`: Stretchy headline (SCENES.md #2). Ported from reference/peak-prototype.html.

import { createPointer } from '../../engine/pointer';
import type { Params, SceneContext, SceneInstance, SceneModule } from '../types';
import { FIXED } from './constants';
import { meta } from './meta';
import { params } from './params';
import { followUps } from './prompt';

function create(host: HTMLElement, initial: Params, _ctx: SceneContext): SceneInstance {
  let p = { ...initial };
  const ptr = createPointer(host);

  const wrap = document.createElement('div');
  Object.assign(wrap.style, {
    position: 'absolute',
    inset: '0',
    display: 'grid',
    placeItems: 'center',
    pointerEvents: 'none',
  });
  const word = document.createElement('p');
  Object.assign(word.style, { whiteSpace: 'nowrap', color: 'var(--ink)' });
  const layout = () =>
    Object.assign(word.style, {
      margin: `0 0 ${p.offsetY}vh`,
      fontSize: `clamp(${p.sizeMin}rem, ${p.size}vw, ${p.sizeMax}rem)`,
      lineHeight: String(p.lineHeight),
    });
  layout();
  wrap.append(word);
  host.append(wrap);

  let spans: HTMLSpanElement[] = [];
  let inf: number[] = [];

  function build(): void {
    const text = String(p.text || ' ');
    word.replaceChildren();
    const label = document.createElement('span');
    label.className = 'sr-only';
    label.textContent = text;
    word.append(label);
    spans = [...text].map((ch) => {
      const s = document.createElement('span');
      s.textContent = ch;
      s.setAttribute('aria-hidden', 'true');
      Object.assign(s.style, { display: 'inline-block', willChange: 'transform' });
      word.append(s);
      return s;
    });
    inf = spans.map(() => 0.5);
  }

  const idle = (i: number, t: number) => {
    const v = 0.5 + 0.5 * Math.sin(t * Number(p.waveSpeed) - i * Number(p.wavePhase));
    return Number(p.waveSpeed) === 0 ? 0.5 : v * v;
  };

  function apply(): void {
    const wMin = Number(p.widthMin);
    const wMax = Number(p.widthMax);
    const gMin = Number(p.weightMin);
    const gMax = Number(p.weightMax);
    const mis = Number(p.misprint);
    const misY = Number(p.misprintY);
    const lift = Number(p.lift);
    spans.forEach((s, i) => {
      const v = inf[i]!;
      const wght = Math.round(gMin + v * (gMax - gMin));
      const ox = (v * mis).toFixed(4);
      const oy = (v * misY).toFixed(4);
      s.style.fontWeight = String(wght);
      s.style.fontVariationSettings = `"wdth" ${(wMin + v * (wMax - wMin)).toFixed(1)}, "wght" ${wght}`;
      s.style.textShadow = `${ox}em ${oy}em 0 var(--c1), -${ox}em -${oy}em 0 var(--c2)`;
      s.style.transform = `translateY(${(-v * lift).toFixed(4)}em)`;
    });
  }

  build();

  return {
    resize() {
      apply();
    },
    update(dt, t) {
      ptr.sync();
      const n = spans.length;
      const ease = 1 - Math.exp(-dt * Number(p.smoothing));
      let left = 0;
      let step = 0;
      if (ptr.active && n) {
        const hr = host.getBoundingClientRect();
        const wr = word.getBoundingClientRect();
        left = wr.left - hr.left;
        step = wr.width / n;
      }
      for (let i = 0; i < n; i++) {
        let target: number;
        if (ptr.active && step > 0) {
          const k = (left + step * (i + 0.5) - ptr.x) / (step * Number(p.reach));
          target = Math.exp(-k * k);
        } else target = idle(i, t);
        inf[i]! += (target - inf[i]!) * ease;
      }
      apply();
    },
    still() {
      for (let i = 0; i < inf.length; i++) inf[i] = idle(i, FIXED.STILL_TIME);
      apply();
    },
    setParams(next) {
      const rebuild = next.text !== p.text;
      p = { ...next };
      if (rebuild) build();
      layout();
      apply();
    },
    setTheme() {
      /* colors come from CSS variables */
    },
    restart() {
      inf = spans.map(() => 0.5);
      apply();
    },
    destroy() {
      ptr.destroy();
      wrap.remove();
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
