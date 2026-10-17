// `goo`: Gooey blobs (SCENES.md #25). SVG circles under a blur + alpha-threshold
// filter; orbits and a spring follower, moved with transforms only.

import { createPointer } from '../../engine/pointer';
import { frameFactor } from '../../engine/time';
import { SHARED } from '../shared';
import type { Params, SceneContext, SceneInstance, SceneModule } from '../types';
import { FIXED } from './constants';
import { meta } from './meta';
import { params } from './params';
import { followUps } from './prompt';

interface Blob {
  el: SVGCircleElement;
  rx: number;
  ry: number;
  phase: number;
  speed: number;
  r: number;
}

let uid = 0;

function create(host: HTMLElement, initial: Params, _ctx: SceneContext): SceneInstance {
  let p = { ...initial };
  const n = (id: string) => Number(p[id]);
  const ptr = createPointer(host);
  const id = `peak-goo-${uid++}`;

  const label = document.createElement('p');
  label.className = 'sr-only';
  label.textContent = 'Colored blobs that orbit and melt into each other.';
  const svg = document.createElementNS(FIXED.SVG, 'svg');
  svg.setAttribute('aria-hidden', 'true');
  Object.assign(svg.style, { position: 'absolute', left: '0', top: '0' });
  const defs = document.createElementNS(FIXED.SVG, 'defs');
  const filter = document.createElementNS(FIXED.SVG, 'filter');
  filter.setAttribute('id', id);
  filter.setAttribute('filterUnits', 'userSpaceOnUse');
  const blur = document.createElementNS(FIXED.SVG, 'feGaussianBlur');
  blur.setAttribute('in', 'SourceGraphic');
  blur.setAttribute('result', 'blur');
  const matrix = document.createElementNS(FIXED.SVG, 'feColorMatrix');
  matrix.setAttribute('in', 'blur');
  matrix.setAttribute('type', 'matrix');
  matrix.setAttribute('result', 'goo');
  const comp = document.createElementNS(FIXED.SVG, 'feComposite');
  comp.setAttribute('in', 'SourceGraphic');
  comp.setAttribute('in2', 'goo');
  comp.setAttribute('operator', 'atop');
  filter.append(blur, matrix, comp);
  defs.append(filter);
  const group = document.createElementNS(FIXED.SVG, 'g');
  group.setAttribute('filter', `url(#${id})`);
  svg.append(defs, group);
  host.append(label, svg);

  let blobs: Blob[] = [];
  let w = 0;
  let h = 0;
  let time = 0;
  const lead = { x: 0, y: 0, vx: 0, vy: 0 };

  function styleFilter(): void {
    blur.setAttribute('stdDeviation', String(p.goo));
    matrix.setAttribute(
      'values',
      `1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${p.contrast} -${p.cutoff}`,
    );
  }

  function addBlob(rx: number, ry: number, phase: number, speed: number): void {
    const v = n('sizeVariety');
    const r = n('size') * (1 - v + Math.random() * v * 2);
    const el = document.createElementNS(FIXED.SVG, 'circle');
    el.setAttribute('r', r.toFixed(1));
    el.style.fill = `var(--c${(blobs.length % SHARED.INKS) + 1})`;
    group.append(el);
    blobs.push({ el, rx, ry, phase, speed, r });
  }

  function build(): void {
    group.replaceChildren();
    blobs = [];
    const sv = n('speedVariety');
    for (let i = 0; i < n('blobs'); i++) {
      const rx = n('orbitW') * w * (0.5 + Math.random() * 0.5);
      const ry = n('orbitH') * h * (0.5 + Math.random() * 0.5);
      const phase = Math.random() * SHARED.TAU;
      const speed = 1 - sv + Math.random() * sv * 2;
      addBlob(rx, ry, phase, speed);
    }
    const first = orbitPoint(blobs[0]!, time);
    Object.assign(lead, { x: first.x, y: first.y, vx: 0, vy: 0 });
  }

  const orbitPoint = (b: Blob, t: number) => ({
    x: w / 2 + b.rx * Math.cos(b.phase + t * n('orbit') * b.speed),
    y: h / 2 + b.ry * Math.sin(b.phase + t * n('orbit') * b.speed),
  });

  function place(t: number, useLead: boolean): void {
    blobs.forEach((b, i) => {
      const q = i === 0 && useLead ? lead : orbitPoint(b, t);
      b.el.style.transform = `translate(${q.x.toFixed(1)}px, ${q.y.toFixed(1)}px)`;
    });
  }

  function fit(): boolean {
    const nw = host.clientWidth;
    const nh = host.clientHeight;
    if (nw === w && nh === h) return false;
    w = nw;
    h = nh;
    svg.setAttribute('width', String(w));
    svg.setAttribute('height', String(h));
    for (const [k, v] of [
      ['x', '0'],
      ['y', '0'],
      ['width', String(w)],
      ['height', String(h)],
    ] as const)
      filter.setAttribute(k, v);
    return true;
  }

  styleFilter();

  return {
    resize() {
      const first = !w;
      fit();
      if (first || !blobs.length) build();
    },
    update(dt) {
      time += dt;
      ptr.sync();
      for (const tap of ptr.takeTaps()) {
        if (blobs.length >= FIXED.MAX_BLOBS) break;
        const dx = tap.x - w / 2;
        const dy = tap.y - h / 2;
        const rx = Math.max(1, Math.SQRT2 * Math.abs(dx));
        const ry = Math.max(1, Math.SQRT2 * Math.abs(dy));
        addBlob(rx, ry, Math.atan2(dy / ry, dx / rx) - time * n('orbit'), 1);
      }
      const f = frameFactor(dt);
      const target = ptr.active ? { x: ptr.x, y: ptr.y } : orbitPoint(blobs[0]!, time);
      const k = n('follow');
      const d = n('damping') ** f;
      lead.vx = (lead.vx + (target.x - lead.x) * k * f) * d;
      lead.vy = (lead.vy + (target.y - lead.y) * k * f) * d;
      lead.x += lead.vx * f;
      lead.y += lead.vy * f;
      place(time, true);
    },
    still() {
      ptr.takeTaps();
      place(FIXED.STILL_TIME, false);
    },
    setParams(next) {
      const rebuild = params.some(
        (q) => (q.id === 'blobs' || q.phraseIn === 'blobs') && next[q.id] !== p[q.id],
      );
      p = { ...next };
      styleFilter();
      if (rebuild && w) build();
    },
    setTheme() {
      /* colors come from CSS variables */
    },
    restart() {
      build();
    },
    destroy() {
      ptr.destroy();
      svg.remove();
      label.remove();
      blobs = [];
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
