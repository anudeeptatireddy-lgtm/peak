// `curtain`: Page transitions (SCENES.md #48). A tiny three-page site: clicking a link
// covers the page (curtain, wipe, iris or slats), swaps it, and uncovers the new one.

import { backOut, clamp01, cubicInOut, expoOut, type Ease } from '../../kits/easing';
import { createPointer } from '../../engine/pointer';
import type { Params, SceneContext, SceneInstance, SceneModule } from '../types';
import { SHARED } from '../shared';
import { FIXED } from './constants';
import { meta } from './meta';
import { params } from './params';
import { followUps } from './prompt';

const EASES: Record<string, Ease> = { smooth: cubicInOut, snappy: expoOut, bouncy: backOut };

interface Run {
  style: string;
  t: number;
  total: number;
  swapAt: number;
  swapped: boolean;
  target: number;
  cx: number;
  cy: number;
  cover: HTMLDivElement;
  update(run: Run): void;
}

function parsePages(text: string): string[] {
  const names = text
    .split(',')
    .map((s) => s.trim().slice(0, FIXED.MAX_NAME))
    .filter(Boolean);
  while (names.length < FIXED.PAGES) names.push(`Page ${names.length + 1}`);
  return names.slice(0, FIXED.PAGES);
}

function create(host: HTMLElement, initial: Params, ctx: SceneContext): SceneInstance {
  let p = { ...initial };
  const n = (id: string) => Number(p[id]);
  const ptr = createPointer(host);
  const ac = new AbortController();

  const wrap = document.createElement('div');
  Object.assign(wrap.style, {
    position: 'absolute',
    inset: '0',
    display: 'grid',
    gridTemplateRows: 'auto 1fr',
    justifyItems: 'center',
    overflow: 'hidden',
    pointerEvents: 'none',
    color: 'var(--ink)',
    fontVariationSettings: 'normal',
  });
  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Pages');
  Object.assign(nav.style, {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: `${FIXED.NAV_PAD}rem 1rem`,
    pointerEvents: 'auto',
  });
  const page = document.createElement('div');
  Object.assign(page.style, {
    display: 'grid',
    alignContent: 'center',
    justifyItems: 'center',
    gap: `${FIXED.PAGE_GAP}rem`,
    padding: '1rem',
    textAlign: 'center',
  });
  const title = document.createElement('h2');
  title.tabIndex = -1;
  Object.assign(title.style, {
    margin: '0',
    fontSize: `${FIXED.TITLE_SIZE}rem`,
    lineHeight: '1',
    outline: 'none',
  });
  const body = document.createElement('p');
  Object.assign(body.style, { margin: '0', color: 'var(--ink-soft)' });
  body.textContent = FIXED.BODY;
  page.append(title, body);
  wrap.append(nav, page);
  host.append(wrap);

  let names: string[] = [];
  let current = 0;
  let buttons: HTMLButtonElement[] = [];
  let run: Run | null = null;
  let last = { x: 0, y: 0 };

  function show(i: number): void {
    current = i;
    title.textContent = names[i] ?? '';
    buttons.forEach((b, k) => {
      b.setAttribute('aria-current', k === i ? 'page' : 'false');
      b.style.textDecoration = k === i ? 'underline' : 'none';
    });
  }

  function build(): void {
    names = parsePages(String(p.pages));
    nav.replaceChildren();
    buttons = names.map((name, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = name;
      Object.assign(b.style, {
        minHeight: `${FIXED.NAV_HEIGHT}rem`,
        padding: '0 1rem',
        font: 'inherit',
        fontWeight: String(FIXED.NAV_WEIGHT),
        color: 'var(--ink)',
        background: 'transparent',
        border: '0',
        cursor: 'pointer',
        textUnderlineOffset: `${FIXED.UNDERLINE}em`,
      });
      b.addEventListener('click', () => go(i), { signal: ac.signal });
      nav.append(b);
      return b;
    });
    show(Math.min(current, names.length - 1));
  }

  const panel = (color: string) => {
    const d = document.createElement('div');
    d.style.position = 'absolute';
    d.style.background = color;
    return d;
  };

  function start(kind: string, target: number): Run {
    const cover = document.createElement('div');
    Object.assign(cover.style, {
      position: 'absolute',
      inset: '0',
      overflow: 'hidden',
      pointerEvents: 'auto',
    });
    const inks = ['var(--c1)', 'var(--c2)', 'var(--c3)'];
    const W = () => host.clientWidth;
    const H = () => host.clientHeight;
    const ease = EASES[String(p.feel)] ?? cubicInOut;
    const base = { t: 0, swapped: false, target, cx: last.x, cy: last.y, cover };
    const dur = n('duration');
    const parts = (t: number) => ({
      cc: ease(clamp01((t / dur) * 2)),
      rr: ease(clamp01((t / dur) * 2 - 1)),
    });

    if (ctx.reducedMotion) {
      const fade = panel(inks[0]!);
      fade.style.inset = '0';
      fade.style.opacity = '0';
      cover.append(fade);
      const total = FIXED.FADE_TIME * 2;
      return {
        ...base,
        style: 'fade',
        total,
        swapAt: total * 0.5,
        update(r) {
          const q = r.t / total;
          fade.style.opacity = String(q < 0.5 ? q * 2 : (1 - q) * 2);
        },
      };
    }
    if (kind === 'curtain') {
      const left = panel(inks[0]!);
      const right = panel(inks[1]!);
      for (const [d, side] of [
        [left, 'left'],
        [right, 'right'],
      ] as const) {
        Object.assign(d.style, {
          top: '0',
          bottom: '0',
          [side]: '0',
          width: `${SHARED.PERCENT * 0.5}%`,
          backgroundImage: `repeating-linear-gradient(${FIXED.QUARTER}deg, transparent 0 ${FIXED.FOLD * 0.5}px, color-mix(in srgb, var(--ink) ${FIXED.FOLD_SHADE * SHARED.PERCENT}%, transparent) ${FIXED.FOLD * 0.5}px ${FIXED.FOLD}px)`,
        });
        cover.append(d);
      }
      return {
        ...base,
        style: kind,
        total: dur,
        swapAt: dur * 0.5,
        update(r) {
          const { cc, rr } = parts(r.t);
          const x = r.t < dur * 0.5 ? (1 - cc) * SHARED.PERCENT : rr * SHARED.PERCENT;
          left.style.transform = `translateX(${-x}%)`;
          right.style.transform = `translateX(${x}%)`;
        },
      };
    }
    if (kind === 'wipe') {
      const d = panel(inks[0]!);
      d.style.inset = '0';
      cover.append(d);
      return {
        ...base,
        style: kind,
        total: dur,
        swapAt: dur * 0.5,
        update(r) {
          const { cc, rr } = parts(r.t);
          const skew = FIXED.WIPE_SKEW * SHARED.PERCENT;
          const lead = cc * (SHARED.PERCENT + skew);
          const trail = rr * (SHARED.PERCENT + skew);
          d.style.clipPath = `polygon(${trail}% 0, ${lead}% 0, ${lead - skew}% ${SHARED.PERCENT}%, ${trail - skew}% ${SHARED.PERCENT}%)`;
        },
      };
    }
    if (kind === 'iris') {
      const d = panel(inks[2]!);
      d.style.inset = '0';
      cover.append(d);
      const far = Math.hypot(Math.max(base.cx, W() - base.cx), Math.max(base.cy, H() - base.cy));
      return {
        ...base,
        style: kind,
        total: dur,
        swapAt: dur * 0.5,
        update(r) {
          const { cc, rr } = parts(r.t);
          const radius = far * (r.t < dur * 0.5 ? cc : 1 - rr);
          d.style.clipPath = `circle(${Math.max(0, radius)}px at ${r.cx}px ${r.cy}px)`;
        },
      };
    }
    const count = Math.round(n('slats'));
    const gap = n('stagger') / FIXED.MS;
    const slats = Array.from({ length: count }, (_, i) => {
      const d = panel(inks[i % SHARED.INKS]!);
      Object.assign(d.style, {
        top: '0',
        bottom: '0',
        left: `${(SHARED.PERCENT * i) / count}%`,
        width: `${SHARED.PERCENT / count + FIXED.SLAT_OVERLAP}%`,
        transform: 'scaleY(0)',
      });
      cover.append(d);
      return d;
    });
    const total = dur + (count - 1) * gap;
    return {
      ...base,
      style: kind,
      total,
      swapAt: dur * 0.5 + (count - 1) * gap,
      update(r) {
        slats.forEach((d, i) => {
          const t = r.t - i * gap;
          const { cc, rr } = parts(Math.max(0, t));
          d.style.transform = `scaleY(${t < dur * 0.5 ? cc : 1 - rr})`;
        });
      },
    };
  }

  function go(i: number): void {
    if (run || i === current) return;
    const kind =
      p.style === 'random'
        ? FIXED.STYLES[Math.floor(Math.random() * FIXED.STYLES.length)]!
        : String(p.style);
    run = start(kind, i);
    wrap.append(run.cover);
  }

  build();

  return {
    resize() {
      /* CSS sizes everything */
    },
    update(dt) {
      ptr.sync();
      ptr.takeTaps();
      last = { x: ptr.x, y: ptr.y };
      if (!run) return;
      run.t += dt;
      if (!run.swapped && run.t >= run.swapAt) {
        run.swapped = true;
        show(run.target);
        title.focus({ preventScroll: true });
      }
      run.update(run);
      if (run.t >= run.total) {
        run.cover.remove();
        run = null;
      }
    },
    still() {
      ptr.takeTaps();
      run?.cover.remove();
      run = null;
      show(0);
    },
    setParams(next) {
      const rebuild = next.pages !== p.pages;
      p = { ...next };
      if (rebuild) build();
    },
    setTheme() {
      /* colors come from CSS variables */
    },
    restart() {
      run?.cover.remove();
      run = null;
      show(0);
    },
    destroy() {
      ac.abort();
      ptr.destroy();
      wrap.remove();
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
