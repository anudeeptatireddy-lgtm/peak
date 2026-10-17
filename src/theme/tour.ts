// Which world each scene shows in on the Tour (PRD §6.7). Every scene uses its own
// world, except that two neighbors may never share one (the colors must change at every
// boundary), so a scene that would repeat its neighbor's world takes the next world in the
// list that differs from both neighbors.

import { WORLD_ORDER } from './worlds';

type Id = (typeof WORLD_ORDER)[number];

export function tourWorlds(own: Id[]): Id[] {
  const out: Id[] = [];
  own.forEach((w, i) => {
    let pick = w;
    if (i > 0 && pick === out[i - 1]) {
      const start = WORLD_ORDER.indexOf(w);
      for (let k = 1; k <= WORLD_ORDER.length; k++) {
        const cand = WORLD_ORDER[(start + k) % WORLD_ORDER.length]!;
        if (cand !== out[i - 1] && cand !== own[i + 1]) {
          pick = cand;
          break;
        }
      }
    }
    out.push(pick);
  });
  return out;
}

/** A shuffled copy (Fisher-Yates) using the given random function. */
export function shuffled<T>(items: readonly T[], rand: () => number = Math.random): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/** Reads an `?order=a,b,c` list: keeps known slugs once each, then appends any that are missing. */
export function parseOrder(raw: string | null, known: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of (raw ?? '').split(',')) {
    if (known.includes(s) && !seen.has(s)) {
      seen.add(s);
      out.push(s);
    }
  }
  if (out.length === 0) return [...known];
  for (const s of known) if (!seen.has(s)) out.push(s);
  return out;
}
