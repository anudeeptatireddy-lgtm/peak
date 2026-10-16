// `velocity`: Scroll-reactive marquee (SCENES.md #3). Ported from reference/peak-prototype.html.
// On a page that doesn't scroll much (scene pages, the dev viewer), the host sets
// data-inner-scroll and the scene provides its own endless scroll area (PRD §8 note).

import { addScrollSource } from '../../engine/scheduler';
import { createScrollSource, type ScrollSource } from '../../engine/scroll';
import { SHARED } from '../shared';
import type { Params, SceneContext, SceneInstance, SceneModule } from '../types';
import { FIXED } from './constants';
import { meta } from './meta';
import { params } from './params';
import { followUps } from './prompt';

interface Row {
  el: HTMLDivElement;
  track: HTMLDivElement;
  dir: 1 | -1;
  w: number;
  off: number;
}

function rowStyle(i: number, p: Params): Partial<CSSStyleDeclaration> {
  if (i === 0)
    return {
      fontWeight: String(p.row1Weight),
      fontStyle: 'normal',
      fontVariationSettings: `"wdth" ${p.row1Width}, "wght" ${p.row1Weight}`,
      color: 'var(--ink)',
    };
  if (i === 1)
    return {
      fontWeight: String(p.row2Weight),
      fontStyle: 'italic',
      fontVariationSettings: `"wdth" ${p.row2Width}, "wght" ${p.row2Weight}`,
      color: 'transparent',
      webkitTextStroke: `max(${p.strokeMin}px, ${p.stroke}em) var(--ink)`,
    };
  return {
    fontWeight: String(p.row3Weight),
    fontStyle: 'normal',
    fontVariationSettings: `"wdth" ${p.row3Width}, "wght" ${p.row3Weight}`,
    color: 'var(--accent-text)',
  };
}

/** An endless inner scroll area: reports an unwrapped position while recentering itself. */
function innerScroller(host: HTMLElement): { el: HTMLDivElement; source: ScrollSource } {
  const el = document.createElement('div');
  Object.assign(el.style, {
    position: 'absolute',
    inset: '0',
    overflowY: 'scroll',
    scrollbarWidth: 'none',
    zIndex: '1',
    touchAction: 'pan-y',
  });
  el.setAttribute('aria-hidden', 'true');
  const spacer = document.createElement('div');
  spacer.style.height = `${FIXED.INNER_SCREENS * FIXED.PERCENT}%`;
  el.append(spacer);
  host.append(el);
  let wrapped = 0;
  const recenter = () => {
    const h = el.clientHeight;
    if (!h) return;
    if (el.scrollTop < h * FIXED.RECENTER_LOW) {
      el.scrollTop += h;
      wrapped -= h;
    } else if (el.scrollTop > h * FIXED.RECENTER_HIGH) {
      el.scrollTop -= h;
      wrapped += h;
    }
  };
  el.addEventListener('scroll', recenter, { passive: true });
  requestAnimationFrame(() => (el.scrollTop = el.clientHeight));
  const source = createScrollSource(el);
  return { el, source: { velocity: source.velocity, read: () => el.scrollTop + wrapped } };
}

function create(host: HTMLElement, initial: Params, _ctx: SceneContext): SceneInstance {
  let p = { ...initial };
  const wrap = document.createElement('div');
  Object.assign(wrap.style, {
    position: 'absolute',
    inset: '0',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    pointerEvents: 'none',
  });
  const rowsEl = document.createElement('div');
  rowsEl.setAttribute('aria-hidden', 'true');
  Object.assign(rowsEl.style, {
    display: 'flex',
    flexDirection: 'column',
    willChange: 'transform',
  });
  const label = document.createElement('p');
  label.className = 'sr-only';
  wrap.append(label, rowsEl);
  host.append(wrap);

  const rows: Row[] = FIXED.DIRECTIONS.map((dir) => {
    const el = document.createElement('div');
    Object.assign(el.style, { overflow: 'hidden', whiteSpace: 'nowrap' });
    const track = document.createElement('div');
    Object.assign(track.style, { display: 'flex', width: 'max-content', willChange: 'transform' });
    el.append(track);
    rowsEl.append(el);
    return { el, track, dir, w: 1, off: Math.random() * Number(p.startOffset) };
  });

  function layout(): void {
    wrap.style.paddingBottom = `${p.offsetY}vh`;
    rowsEl.style.gap = `clamp(${p.rowGapMin}rem, ${p.rowGap}vw, ${p.rowGapMax}rem)`;
    rows.forEach((r, i) =>
      Object.assign(r.el.style, {
        fontSize: `clamp(${p.sizeMin}rem, ${p.size}vw, ${p.sizeMax}rem)`,
        lineHeight: String(p.lineHeight),
        padding: `${p.rowPadding}em 0`,
        ...rowStyle(i, p),
      }),
    );
  }
  layout();

  const inner = host.dataset.innerScroll === 'true' ? innerScroller(host) : null;
  const source = inner ? inner.source : createScrollSource();
  const tune = () =>
    (source.velocity.tuning = {
      maxSpeed: Number(p.maxScroll),
      smoothing: Number(p.scrollSmoothing),
      dirThreshold: Number(p.dirThreshold),
    });
  tune();
  const removeSource = addScrollSource(source);
  const words = () => [String(p.line1), String(p.line2), String(p.line3)];

  function fill(): void {
    const vw = host.clientWidth || window.innerWidth;
    label.textContent = words().join(' · ');
    rows.forEach((r, i) => {
      r.track.replaceChildren();
      const seq = document.createElement('span');
      Object.assign(seq.style, {
        display: 'flex',
        gap: `${p.wordGap}em`,
        paddingRight: `${p.wordGap}em`,
      });
      r.track.append(seq);
      let guard = 0;
      do {
        const w = document.createElement('span');
        w.textContent = words()[i] || ' ';
        seq.append(w);
      } while (seq.offsetWidth < vw && ++guard < FIXED.MAX_REPEATS);
      r.track.append(seq.cloneNode(true));
      r.w = seq.offsetWidth || 1;
    });
  }

  function place(move: number, lean: boolean): void {
    for (const r of rows) {
      r.off += move * r.dir;
      const x = ((r.off % r.w) + r.w) % r.w;
      r.track.style.transform = `translate3d(${(-x).toFixed(2)}px, 0, 0)`;
    }
    const max = Number(p.maxLean);
    const skew = lean
      ? Math.max(-max, Math.min(max, -source.velocity.vel * Number(p.leanStrength)))
      : 0;
    rowsEl.style.transform = `skewX(${skew.toFixed(2)}deg)`;
  }

  return {
    resize() {
      fill();
      place(0, false);
    },
    update(dt) {
      const v = source.velocity;
      const speed = Number(p.baseSpeed) * (1 + Math.abs(v.vel) * Number(p.boost));
      place(speed * dt * SHARED.FPS * v.dir, true);
    },
    still() {
      place(0, false);
    },
    setParams(next) {
      const refill = next.line1 !== p.line1 || next.line2 !== p.line2 || next.line3 !== p.line3;
      p = { ...next };
      layout();
      tune();
      if (refill) fill();
    },
    setTheme() {
      /* colors come from CSS variables */
    },
    restart() {
      for (const r of rows) r.off = Math.random() * Number(p.startOffset);
      source.velocity.reset(source.read());
    },
    destroy() {
      removeSource();
      inner?.el.remove();
      wrap.remove();
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
