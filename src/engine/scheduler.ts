// The one requestAnimationFrame loop for the whole page (PRD §16.4).
// Scenes register with an element; only visible scenes update, and only while
// motion isn't paused. When paused, visible scenes draw their still frame.

import { isPaused, onPausedChange } from './motion';
import type { ScrollSource } from './scroll';
import { computeDt } from './time';

export interface Tickable {
  update(dt: number, t: number): void;
  still(): void;
}

interface Entry {
  el: Element;
  scene: Tickable;
  visible: boolean;
  ratio: number;
  ready: boolean;
}

const entries = new Set<Entry>();
const byEl = new Map<Element, Entry>();
const scrollSources = new Set<ScrollSource>();
let maxActive = Infinity;
let raf = 0;
let last = 0;
let clock = 0;
let running = 0;
let frames = 0;
let io: IntersectionObserver | null = null;
let pauseBound = false;

function observer(): IntersectionObserver {
  if (io) return io;
  io = new IntersectionObserver(
    (records) => {
      for (const r of records) {
        const e = byEl.get(r.target);
        if (!e) continue;
        const was = e.visible;
        e.visible = r.isIntersecting;
        e.ratio = r.intersectionRatio;
        if (e.visible && !was && e.ready && (isPaused() || !isActive(e))) e.scene.still();
      }
      wake();
    },
    { rootMargin: '80px 0px', threshold: [0, 0.25, 0.5, 0.75, 1] },
  );
  return io;
}

/** The visible entries allowed to run this frame, most visible first. */
function active(): Entry[] {
  const vis = [...entries].filter((e) => e.visible && e.ready);
  if (vis.length <= maxActive) return vis;
  return vis.sort((a, b) => b.ratio - a.ratio).slice(0, maxActive);
}
const isActive = (e: Entry) => active().includes(e);

function frame(now: number): void {
  raf = 0;
  if (isPaused()) return stop();
  const list = active();
  if (list.length === 0) return stop();
  raf = requestAnimationFrame(frame);
  const dt = computeDt(now, last);
  if (dt === null) return;
  last = now;
  clock += dt;
  frames++;
  for (const s of scrollSources) s.velocity.tick(s.read(), dt);
  running = list.length;
  for (const e of list) e.scene.update(dt, clock);
}

function stop(): void {
  if (raf) cancelAnimationFrame(raf);
  raf = 0;
  running = 0;
}

function wake(): void {
  if (raf || isPaused()) return;
  if (active().length === 0) return;
  last = performance.now();
  for (const s of scrollSources) s.velocity.reset(s.read());
  raf = requestAnimationFrame(frame);
}

function bindPause(): void {
  if (pauseBound) return;
  pauseBound = true;
  onPausedChange((paused) => {
    if (paused) {
      stop();
      for (const e of entries) if (e.visible && e.ready) e.scene.still();
    } else wake();
  });
}

export interface Registration {
  /** Mark the scene as sized and ready to draw (after its first resize). */
  ready(): void;
  /** True while the scene is on screen (within the 80px margin). */
  isVisible(): boolean;
  /** True when the scene is drawing live frames right now. */
  isRunning(): boolean;
  unregister(): void;
}

export function register(el: Element, scene: Tickable): Registration {
  bindPause();
  const entry: Entry = { el, scene, visible: false, ratio: 0, ready: false };
  entries.add(entry);
  byEl.set(el, entry);
  observer().observe(el);
  return {
    ready() {
      entry.ready = true;
      if (entry.visible && (isPaused() || !isActive(entry))) scene.still();
      wake();
    },
    isVisible: () => entry.visible,
    isRunning: () => !isPaused() && entry.visible && entry.ready && isActive(entry),
    unregister() {
      entries.delete(entry);
      byEl.delete(el);
      io?.unobserve(el);
      if (entries.size === 0) stop();
    },
  };
}

/** Ticks a scroll source every frame while the loop runs (only while some scene is running). */
export function addScrollSource(s: ScrollSource): () => void {
  scrollSources.add(s);
  wake();
  return () => {
    scrollSources.delete(s);
  };
}

/** Caps how many visible scenes run at once (gallery 4, Tour 2). Others show still frames. */
export function setMaxActive(n: number): void {
  maxActive = n;
  for (const e of entries) if (e.visible && e.ready && !isActive(e)) e.scene.still();
  wake();
}

/** Debug info for tests (PLAN 1.6, 1.16, 8.1, 8.3). */
export function debugInfo() {
  return {
    loop: raf !== 0,
    running,
    registered: entries.size,
    visible: [...entries].filter((e) => e.visible).length,
    frames,
  };
}

if (typeof window !== 'undefined') {
  (window as unknown as { __peak?: object }).__peak = {
    ...((window as unknown as { __peak?: object }).__peak ?? {}),
    scheduler: debugInfo,
  };
}
