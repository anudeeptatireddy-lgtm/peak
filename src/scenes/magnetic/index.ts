// `magnetic`: Magnetic buttons (SCENES.md #45). Each button is pulled toward the pointer
// by a spring; its label moves further than its body; pressing squashes it.

import { createPointer } from '../../engine/pointer';
import { frameFactor } from '../../engine/time';
import type { Params, SceneContext, SceneInstance, SceneModule } from '../types';
import { SHARED } from '../shared';
import { FIXED } from './constants';
import { meta } from './meta';
import { params } from './params';
import { followUps } from './prompt';

interface Btn {
  el: HTMLButtonElement;
  label: HTMLSpanElement;
  /** Center, relative to the stage, with no offset applied. */
  cx: number;
  cy: number;
  ox: number;
  oy: number;
  vx: number;
  vy: number;
  sx: number;
  sy: number;
  svx: number;
  svy: number;
  pressed: boolean;
}

function parseLabels(text: string): string[] {
  const labels = text
    .split(',')
    .map((s) => s.trim().slice(0, FIXED.MAX_LABEL))
    .filter(Boolean)
    .slice(0, FIXED.MAX_BUTTONS);
  return labels.length ? labels : [FIXED.FALLBACK];
}

function create(host: HTMLElement, initial: Params, _ctx: SceneContext): SceneInstance {
  let p = { ...initial };
  const n = (id: string) => Number(p[id]);
  const ptr = createPointer(host);
  const ac = new AbortController();

  const wrap = document.createElement('div');
  Object.assign(wrap.style, {
    position: 'absolute',
    inset: '0',
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    pointerEvents: 'none',
  });
  host.append(wrap);
  let btns: Btn[] = [];

  function build(): void {
    wrap.replaceChildren();
    btns = parseLabels(String(p.labels)).map((text, i) => {
      const el = document.createElement('button');
      el.type = 'button';
      const label = document.createElement('span');
      label.textContent = text;
      label.style.display = 'block';
      el.append(label);
      Object.assign(el.style, {
        pointerEvents: 'auto',
        minHeight: `${FIXED.MIN_HEIGHT}rem`,
        font: 'inherit',
        fontWeight: String(FIXED.WEIGHT),
        cursor: 'pointer',
        willChange: 'transform',
        touchAction: 'pan-y',
        color: i === 0 ? 'var(--ground)' : 'var(--ink)',
        background: i === 0 ? 'var(--ink)' : 'transparent',
        border: `${FIXED.BORDER}px solid var(--ink)`,
      });
      const b: Btn = {
        el,
        label,
        cx: 0,
        cy: 0,
        ox: 0,
        oy: 0,
        vx: 0,
        vy: 0,
        sx: 1,
        sy: 1,
        svx: 0,
        svy: 0,
        pressed: false,
      };
      el.addEventListener('pointerdown', () => (b.pressed = true), { signal: ac.signal });
      for (const type of ['pointerup', 'pointerleave', 'pointercancel'])
        el.addEventListener(type, () => (b.pressed = false), { signal: ac.signal });
      wrap.append(el);
      return b;
    });
    style();
  }

  function style(): void {
    wrap.style.gap = `${n('gap')}rem`;
    for (const b of btns)
      Object.assign(b.el.style, {
        fontSize: `${n('fontSize')}rem`,
        padding: `${FIXED.PAD_Y}em ${FIXED.PAD_X}em`,
        borderRadius: `${n('round') * SHARED.PERCENT}vmax`,
      });
    measure();
  }

  /** Centers of the buttons with no offset applied (so the pull is measured from where they rest). */
  function measure(): void {
    const host0 = host.getBoundingClientRect();
    for (const b of btns) {
      b.el.style.transform = '';
      const r = b.el.getBoundingClientRect();
      b.cx = r.left - host0.left + r.width * 0.5;
      b.cy = r.top - host0.top + r.height * 0.5;
    }
  }

  function apply(): void {
    for (const b of btns) {
      b.el.style.transform = `translate(${b.ox.toFixed(2)}px, ${b.oy.toFixed(2)}px) scale(${b.sx.toFixed(3)}, ${b.sy.toFixed(3)})`;
      b.label.style.transform = `translate(${(b.ox * (n('labelMult') - 1)).toFixed(2)}px, ${(b.oy * (n('labelMult') - 1)).toFixed(2)}px)`;
    }
  }

  build();

  return {
    resize() {
      measure();
      apply();
    },
    update(dt) {
      const f = frameFactor(dt);
      ptr.sync();
      ptr.takeTaps();
      const damp = Math.pow(n('damping'), f);
      const k = n('spring') * f;
      for (const b of btns) {
        let tx = 0;
        let ty = 0;
        if (ptr.active) {
          const dx = ptr.x - b.cx;
          const dy = ptr.y - b.cy;
          const d = Math.hypot(dx, dy);
          if (d < n('radius')) {
            const w = n('pull') * (1 - d / n('radius'));
            tx = dx * w;
            ty = dy * w;
          }
        }
        b.vx = (b.vx + (tx - b.ox) * k) * damp;
        b.vy = (b.vy + (ty - b.oy) * k) * damp;
        b.ox += b.vx * f;
        b.oy += b.vy * f;
        const sx = b.pressed ? 1 + n('squish') * FIXED.SQUISH_SPREAD : 1;
        const sy = b.pressed ? 1 - n('squish') : 1;
        b.svx = (b.svx + (sx - b.sx) * k) * damp;
        b.svy = (b.svy + (sy - b.sy) * k) * damp;
        b.sx += b.svx * f;
        b.sy += b.svy * f;
      }
      apply();
    },
    still() {
      ptr.takeTaps();
      for (const b of btns) {
        b.ox = b.oy = b.vx = b.vy = b.svx = b.svy = 0;
        b.sx = b.sy = 1;
      }
      apply();
    },
    setParams(next) {
      const rebuild = next.labels !== p.labels;
      p = { ...next };
      if (rebuild) build();
      else style();
      apply();
    },
    setTheme() {
      /* colors come from CSS variables */
    },
    restart() {
      for (const b of btns) {
        b.ox = b.oy = b.vx = b.vy = b.svx = b.svy = 0;
        b.sx = b.sy = 1;
      }
      apply();
    },
    destroy() {
      ac.abort();
      ptr.destroy();
      wrap.remove();
      btns = [];
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
