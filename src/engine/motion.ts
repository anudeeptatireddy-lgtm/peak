// Global pause state (PRD §16.4, §17). Starts paused under
// prefers-reduced-motion and follows changes to that setting live.

type Listener = (paused: boolean) => void;

const listeners = new Set<Listener>();
let paused = false;
let reduced = false;
let initialized = false;

function init(): void {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;
  const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  if (!mq) return;
  reduced = mq.matches;
  paused = mq.matches;
  mq.addEventListener('change', (e) => {
    reduced = e.matches;
    setPaused(e.matches);
  });
}

export function isPaused(): boolean {
  init();
  return paused;
}

export function prefersReducedMotion(): boolean {
  init();
  return reduced;
}

export function setPaused(v: boolean): void {
  init();
  if (paused === v) return;
  paused = v;
  for (const fn of listeners) fn(paused);
}

export function togglePaused(): void {
  setPaused(!isPaused());
}

/** Calls `fn` now and whenever the paused state changes. */
export function onPausedChange(fn: Listener): () => void {
  init();
  listeners.add(fn);
  fn(paused);
  return () => listeners.delete(fn);
}
