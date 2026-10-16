// The theme store (PRD §16.4, §16.5). Holds the base theme (a world, a journey
// blend or a crossfade) and publishes the current theme: the base with any
// accent transform applied on top (living colors, PRD §6.7). Scenes and the CSS
// variable writer subscribe; nothing reads getComputedStyle per frame.

import { getWorld, type Theme } from './worlds';

export type ThemeListener = (theme: Theme) => void;
export type ThemeTransform = (base: Theme) => Theme;

let base: Theme = getWorld('riso');
let current: Theme = base;
let transform: ThemeTransform | null = null;
const listeners = new Set<ThemeListener>();

const key = (t: Theme) =>
  [
    t.id,
    t.mode,
    t.ground,
    t.surface,
    t.ink,
    t.inkSoft,
    t.c1,
    t.c2,
    t.c3,
    t.accentText,
    t.focus,
    t.blend,
  ].join('|');

function publish(force = false): void {
  const next = transform ? transform(base) : base;
  if (!force && key(next) === key(current)) return;
  current = next;
  for (const fn of listeners) fn(current);
}

export function getTheme(): Theme {
  return current;
}

export function getBaseTheme(): Theme {
  return base;
}

/** Sets the base theme (a world, blend or crossfade) and republishes. */
export function setTheme(theme: Theme): void {
  base = theme;
  publish();
}

/** Installs (or clears) the accent transform used by living colors. */
export function setTransform(fn: ThemeTransform | null): void {
  transform = fn;
  publish();
}

/** Re-runs the transform (for time-based transforms) and publishes if anything changed. */
export function refresh(): void {
  publish();
}

/** Subscribes to theme changes. The listener is called immediately with the current theme. */
export function subscribe(fn: ThemeListener, immediate = true): () => void {
  listeners.add(fn);
  if (immediate) fn(current);
  return () => listeners.delete(fn);
}

/** Content pages use Riso, following the system light/dark setting live (PRD §6.2). */
export function followSystemRiso(): () => void {
  if (typeof window === 'undefined' || !window.matchMedia) {
    setTheme(getWorld('riso'));
    return () => {};
  }
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const update = () => setTheme(getWorld('riso', mq.matches ? 'dark' : 'light'));
  update();
  mq.addEventListener('change', update);
  return () => mq.removeEventListener('change', update);
}

/** For tests: resets the store. */
export function _resetStore(theme: Theme = getWorld('riso')): void {
  base = theme;
  current = theme;
  transform = null;
  listeners.clear();
}
