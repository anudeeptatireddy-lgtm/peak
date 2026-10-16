// Shareable scene state in the URL (PRD §9.6): the world (or custom colors), the
// Cycle worlds loop, and every param that differs from its default. Parsing
// validates and clamps everything and ignores unknown keys.

import { coerce, defaultParams } from '../scenes/params';
import type { Param, Params } from '../scenes/types';
import { isHex, parseHex, toHex } from '../theme/color';
import { isWorldId, type WorldId } from '../theme/worlds';

export interface CustomColors {
  ground: string;
  c1: string;
  c2: string;
  c3: string;
}

export interface SceneState {
  world: Exclude<WorldId, 'custom'> | 'custom';
  custom?: CustomColors;
  cycle?: Exclude<WorldId, 'custom'>[];
  params: Params;
}

const RESERVED = new Set(['w', 'g', 'c1', 'c2', 'c3', 'cycle']);
const hex6 = (v: string) => toHex(parseHex(v)).slice(1);

export function encodeState(state: SceneState, params: Param[], defaultWorld: string): string {
  const q = new URLSearchParams();
  if (state.world === 'custom' && state.custom) {
    q.set('w', 'custom');
    q.set('g', hex6(state.custom.ground));
    q.set('c1', hex6(state.custom.c1));
    q.set('c2', hex6(state.custom.c2));
    q.set('c3', hex6(state.custom.c3));
  } else if (state.world !== defaultWorld) q.set('w', state.world);
  if (state.cycle && state.cycle.length > 1) q.set('cycle', state.cycle.join(','));
  const defaults = defaultParams(params);
  for (const p of params) {
    if (RESERVED.has(p.id)) continue;
    const v = state.params[p.id];
    if (v === undefined || v === defaults[p.id]) continue;
    q.set(p.id, typeof v === 'boolean' ? (v ? '1' : '0') : String(v));
  }
  return q.toString();
}

export function decodeState(search: string, params: Param[], defaultWorld: string): SceneState {
  const q = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const out: SceneState = {
    world: isWorldId(defaultWorld) ? defaultWorld : 'riso',
    params: defaultParams(params),
  };
  const w = q.get('w');
  if (w === 'custom') {
    const parts = ['g', 'c1', 'c2', 'c3'].map((k) => q.get(k) ?? '');
    if (parts.every((v) => isHex(v))) {
      const [g, c1, c2, c3] = parts.map((v) => toHex(parseHex(v)));
      out.world = 'custom';
      out.custom = { ground: g!, c1: c1!, c2: c2!, c3: c3! };
    }
  } else if (w && isWorldId(w)) out.world = w;
  const cycle = (q.get('cycle') ?? '')
    .split(',')
    .filter((id): id is Exclude<WorldId, 'custom'> => isWorldId(id));
  if (cycle.length > 1) out.cycle = [...new Set(cycle)].slice(0, 4);
  for (const p of params) {
    if (RESERVED.has(p.id) || !q.has(p.id)) continue;
    const v = coerce(p, q.get(p.id));
    if (v !== undefined) out.params[p.id] = v;
  }
  return out;
}
