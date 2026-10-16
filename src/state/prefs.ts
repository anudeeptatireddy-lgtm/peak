// Visitor preferences remembered in localStorage (PRD §16.7): sound and living
// colors. Storage can be unavailable (private mode, blocked); the page still works.

export type PrefKey = 'sound' | 'living';

const DEFAULTS: Record<PrefKey, boolean> = { sound: false, living: true };
const STORAGE_KEY = (k: PrefKey) => `peak:${k}`;
const values = new Map<PrefKey, boolean>();
const listeners = new Map<PrefKey, Set<(v: boolean) => void>>();

function read(k: PrefKey): boolean {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY(k));
    if (raw === '1') return true;
    if (raw === '0') return false;
  } catch {
    /* storage unavailable */
  }
  return DEFAULTS[k];
}

export function getPref(k: PrefKey): boolean {
  if (!values.has(k)) values.set(k, typeof window === 'undefined' ? DEFAULTS[k] : read(k));
  return values.get(k)!;
}

export function setPref(k: PrefKey, v: boolean): void {
  if (getPref(k) === v) return;
  values.set(k, v);
  try {
    window.localStorage.setItem(STORAGE_KEY(k), v ? '1' : '0');
  } catch {
    /* storage unavailable */
  }
  for (const fn of listeners.get(k) ?? []) fn(v);
}

export function onPref(k: PrefKey, fn: (v: boolean) => void): () => void {
  if (!listeners.has(k)) listeners.set(k, new Set());
  listeners.get(k)!.add(fn);
  return () => listeners.get(k)!.delete(fn);
}
