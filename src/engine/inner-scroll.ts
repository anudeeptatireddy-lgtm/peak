// An endless inner scroll area for scroll-driven scenes on short pages (scene
// pages, the dev viewer): an invisible scroller over the stage that quietly
// recenters itself and reports an unwrapped position (PRD §8 note on velocity).

import { createScrollSource, type ScrollSource } from './scroll';

export interface InnerScrollOptions {
  /** How many stage heights tall the scroll area is. */
  screens: number;
  /** Recenter by one stage height when within this many heights of the top or bottom. */
  low: number;
  high: number;
}

export function innerScroller(
  host: HTMLElement,
  o: InnerScrollOptions,
): { el: HTMLDivElement; source: ScrollSource } {
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
  spacer.style.height = `${o.screens * 100}%`;
  el.append(spacer);
  host.append(el);
  let wrapped = 0;
  const recenter = () => {
    const h = el.clientHeight;
    if (!h) return;
    if (el.scrollTop < h * o.low) {
      el.scrollTop += h;
      wrapped -= h;
    } else if (el.scrollTop > h * o.high) {
      el.scrollTop -= h;
      wrapped += h;
    }
  };
  el.addEventListener('scroll', recenter, { passive: true });
  requestAnimationFrame(() => (el.scrollTop = el.clientHeight));
  const source = createScrollSource(el);
  return { el, source: { velocity: source.velocity, read: () => el.scrollTop + wrapped } };
}
