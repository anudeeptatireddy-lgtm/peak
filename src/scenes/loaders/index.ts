// `loaders`: Loading pack (SCENES.md #50). Six small loops in plain CSS keyframes
// (see styles.ts), so each can be copied into any site. A click features one.

import { cursorLean } from '../../kits/cursor';
import { createPointer } from '../../engine/pointer';
import type { Params, SceneContext, SceneInstance, SceneModule } from '../types';
import { FIXED } from './constants';
import { meta } from './meta';
import { params } from './params';
import { followUps } from './prompt';
import { loaderCss, ringSvg } from './styles';

function create(host: HTMLElement, initial: Params, _ctx: SceneContext): SceneInstance {
  let p = { ...initial };
  // Follow cursor: the whole picture tilts toward the mouse (off by default).
  const lean = cursorLean(host);
  const n = (id: string) => Number(p[id]);
  const ptr = createPointer(host);
  const ac = new AbortController();

  const style = document.createElement('style');
  const wrap = document.createElement('div');
  wrap.className = 'ld-wrap';
  const main = document.createElement('div');
  main.className = 'ld-main';
  const grid = document.createElement('div');
  grid.className = 'ld-grid';
  wrap.append(main, grid);
  host.append(style, wrap);

  /** One loader's small elements; `i` is each piece's position, used for its staggered start. */
  function loader(kind: string): HTMLElement {
    const el = document.createElement('div');
    el.className = `ld ld-${kind}`;
    el.style.setProperty('--d', `${FIXED.LOOP[kind]! / n('speed')}s`);
    const inks = ['var(--c1)', 'var(--c2)', 'var(--c3)'];
    const colorOf = (i: number) => (p.colors === 'one' ? inks[0]! : inks[i % inks.length]!);
    const piece = (i: number, k: number) => {
      const b = document.createElement('i');
      b.style.setProperty('--i', String(i));
      b.style.setProperty('--k', colorOf(k));
      return b;
    };
    if (kind === 'dots') for (let i = 0; i < inks.length; i++) el.append(piece(i, i));
    else if (kind === 'bounce') {
      for (let i = 0; i < inks.length; i++) {
        const b = piece(i, 1);
        el.append(b);
      }
    } else if (kind === 'bars') for (let i = 0; i < inks.length + 2; i++) el.append(piece(i, i));
    else if (kind === 'morph') el.append(piece(0, 2));
    else if (kind === 'orbit') {
      el.style.setProperty('--k', colorOf(0));
      el.append(piece(0, 0), piece(1, 1));
    } else {
      el.append(ringSvg(n('size'), n('thickness'), colorOf(0)));
    }
    return el;
  }

  function build(): void {
    style.textContent = loaderCss({
      size: n('size'),
      thickness: n('thickness'),
      scale: FIXED.FEATURE_SCALE,
      cols: FIXED.COLS,
      colsSmall: FIXED.COLS_SMALL,
    });
    main.replaceChildren(loader(String(p.featured)));
    grid.replaceChildren();
    for (const kind of FIXED.KINDS) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'ld-btn';
      b.setAttribute('aria-label', FIXED.NAMES[kind]!);
      b.setAttribute('aria-pressed', String(kind === p.featured));
      b.append(loader(kind));
      b.addEventListener(
        'click',
        () => {
          p = { ...p, featured: kind };
          build();
        },
        { signal: ac.signal },
      );
      grid.append(b);
    }
  }

  const stillClass = (on: boolean) => wrap.classList.toggle('ld-still', on);
  build();

  return {
    resize() {
      /* CSS sizes everything */
    },
    update(dt) {
      lean.update(dt, !!p.cursor, Number(p.cursorLean));
      ptr.sync();
      ptr.takeTaps();
      stillClass(false);
    },
    still() {
      lean.reset();
      ptr.takeTaps();
      stillClass(true);
    },
    setParams(next) {
      p = { ...next };
      build();
    },
    setTheme() {
      /* colors come from CSS variables */
    },
    restart() {
      build();
    },
    destroy() {
      lean.destroy();
      ac.abort();
      ptr.destroy();
      wrap.remove();
      style.remove();
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
