// `fold`: Paper fold (SCENES.md #43). A sheet cut into panels, each hinged to the one
// before it with CSS 3D; scroll distance sets how folded the whole chain is.

import { innerScroller } from '../../engine/inner-scroll';
import { createScrollSource } from '../../engine/scroll';
import { frameFactor } from '../../engine/time';
import type { Params, SceneContext, SceneInstance, SceneModule } from '../types';
import { SHARED } from '../shared';
import { FIXED } from './constants';
import { meta } from './meta';
import { params } from './params';
import { followUps } from './prompt';

const RAD = Math.PI / FIXED.HALF_TURN;

function create(host: HTMLElement, initial: Params, _ctx: SceneContext): SceneInstance {
  let p = { ...initial };
  const n = (id: string) => Number(p[id]);

  const wrap = document.createElement('div');
  Object.assign(wrap.style, {
    position: 'absolute',
    inset: '0',
    pointerEvents: 'none',
    overflow: 'hidden',
  });
  const label = document.createElement('p');
  label.className = 'sr-only';
  const sheet = document.createElement('div');
  sheet.setAttribute('aria-hidden', 'true');
  Object.assign(sheet.style, { position: 'absolute', transformStyle: FIXED.PRESERVE });
  wrap.append(label, sheet);
  host.append(wrap);

  const inner =
    host.dataset.innerScroll === 'true'
      ? innerScroller(host, {
          screens: FIXED.INNER_SCREENS,
          low: FIXED.RECENTER_LOW,
          high: FIXED.RECENTER_HIGH,
        })
      : null;
  const source = inner ? inner.source : createScrollSource();

  interface Panel {
    el: HTMLDivElement;
    shade: HTMLDivElement;
  }
  let panels: Panel[] = [];
  let W = 0;
  let H = 0;
  let sheetW = 0;
  let sheetH = 0;
  let fold = 1;

  const vertical = () => p.direction === 'vertical';

  function build(): void {
    sheet.replaceChildren();
    panels = [];
    const count = Math.round(n('panels'));
    label.textContent = String(p.text);
    sheetW = W * n('sheetW');
    sheetH = H * n('sheetH');
    const pw = vertical() ? sheetW : sheetW / count;
    const ph = vertical() ? sheetH / count : sheetH;
    const fontSize = Math.min(
      sheetH * n('textSize'),
      (sheetW * FIXED.TEXT_FIT) / Math.max(1, String(p.text).length) / FIXED.TEXT_EM,
    );
    let parent: HTMLElement = sheet;
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      Object.assign(el.style, {
        position: 'absolute',
        left: '0',
        top: '0',
        width: `${pw}px`,
        height: `${ph}px`,
        transformStyle: FIXED.PRESERVE,
        transformOrigin: vertical() ? 'top center' : 'left center',
      });
      const face = document.createElement('div');
      Object.assign(face.style, {
        position: 'absolute',
        inset: '0',
        overflow: 'hidden',
        background: 'var(--surface)',
        color: 'var(--ink)',
        boxShadow: `inset 0 0 0 1px color-mix(in srgb, var(--line) ${FIXED.EDGE_ALPHA * SHARED.PERCENT}%, transparent)`,
      });
      const text = document.createElement('div');
      Object.assign(text.style, {
        position: 'absolute',
        left: `${vertical() ? 0 : -i * pw}px`,
        top: `${vertical() ? -i * ph : 0}px`,
        width: `${sheetW}px`,
        height: `${sheetH}px`,
        display: 'grid',
        placeItems: 'center',
        fontSize: `${fontSize}px`,
        fontWeight: String(FIXED.TEXT_WEIGHT),
        whiteSpace: 'nowrap',
      });
      text.textContent = String(p.text);
      const shade = document.createElement('div');
      Object.assign(shade.style, { position: 'absolute', inset: '0', opacity: '0' });
      face.append(text, shade);
      el.append(face);
      parent.append(el);
      panels.push({ el, shade });
      parent = el;
    }
  }

  function layout(): void {
    const left = (W - sheetW) * 0.5;
    const top = (H - sheetH) * 0.5;
    Object.assign(sheet.style, {
      left: `${left}px`,
      top: `${top}px`,
      width: `${sheetW}px`,
      height: `${sheetH}px`,
    });
    wrap.style.perspective = `${n('perspective')}px`;
  }

  function place(): void {
    const count = panels.length;
    const theta = fold * n('angle') * RAD;
    const axis = vertical() ? 'X' : 'Y';
    // The rotation about the hinge axis that points a panel's free edge toward the viewer is
    // negative for X and positive for Y.
    const dir = vertical() ? -1 : 1;
    const zigzag = p.direction !== 'horizontal';
    const length = vertical() ? sheetH : sheetW;
    const shown = zigzag ? length * Math.cos(theta * 0.5) : length;
    const shift = (length - shown) * 0.5;
    let absolute = 0;
    panels.forEach((pn, i) => {
      let rel: number;
      if (i === 0) rel = zigzag ? theta * 0.5 : 0;
      else rel = zigzag ? (i % 2 === 1 ? -theta : theta) : theta / Math.max(1, count - 1);
      absolute = i === 0 ? rel : absolute + rel;
      const hinge = i === 0 ? 0 : (vertical() ? sheetH : sheetW) / count;
      const move = vertical()
        ? `translateY(${i === 0 ? shift : hinge}px)`
        : `translateX(${i === 0 ? shift : hinge}px)`;
      pn.el.style.transform = `${move} rotate${axis}(${(dir * rel).toFixed(4)}rad)`;
      const tilt = Math.sin(absolute);
      const towards = tilt * dir > 0;
      pn.shade.style.background = towards ? 'var(--ink)' : 'var(--surface)';
      pn.shade.style.opacity = String(
        n('shading') * Math.abs(tilt) * (towards ? 1 : FIXED.LIGHT_SHARE),
      );
    });
  }

  const target = () => {
    const span = n('cycleScreens') * (H || 1);
    const u = (((source.read() / span) % 1) + 1) % 1;
    return Math.abs(u * 2 - 1);
  };

  return {
    resize() {
      W = host.clientWidth;
      H = host.clientHeight;
      build();
      layout();
      fold = target();
      place();
    },
    update(dt) {
      const f = frameFactor(dt);
      fold += (target() - fold) * (1 - Math.pow(1 - n('follow'), f));
      place();
    },
    still() {
      fold = FIXED.STILL_FOLD;
      place();
    },
    setParams(next) {
      p = { ...next };
      if (W) {
        build();
        layout();
        place();
      }
    },
    setTheme() {
      /* colors come from CSS variables */
    },
    restart() {
      fold = target();
      place();
    },
    destroy() {
      inner?.el.remove();
      wrap.remove();
      panels = [];
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
