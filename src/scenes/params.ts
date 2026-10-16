// Helpers for params schemas.

import type { Param, ParamValue, Params } from './types';

export function defaultValue(p: Param): ParamValue {
  return p.kind === 'datetime' ? p.default() : p.default;
}

export function defaultParams(params: Param[]): Params {
  const out: Params = {};
  for (const p of params) out[p.id] = defaultValue(p);
  return out;
}

/** Clamps or rejects one value against its param; returns undefined when invalid. */
export function coerce(p: Param, raw: unknown): ParamValue | undefined {
  switch (p.kind) {
    case 'slider': {
      const n = typeof raw === 'number' ? raw : Number(raw);
      if (!Number.isFinite(n)) return undefined;
      const stepped = Math.round((n - p.min) / p.step) * p.step + p.min;
      return Math.min(p.max, Math.max(p.min, Number(stepped.toFixed(6))));
    }
    case 'text': {
      if (typeof raw !== 'string') return undefined;
      // eslint-disable-next-line no-control-regex
      return raw.replace(/[\u0000-\u001f<>]/g, '').slice(0, p.maxLength);
    }
    case 'toggle':
      if (typeof raw === 'boolean') return raw;
      if (raw === '1' || raw === 'true') return true;
      if (raw === '0' || raw === 'false') return false;
      return undefined;
    case 'select':
      return typeof raw === 'string' && p.options.some((o) => o.value === raw) ? raw : undefined;
    case 'datetime':
      return typeof raw === 'string' && !Number.isNaN(Date.parse(raw)) ? raw : undefined;
  }
}

/** Defaults with any valid overrides applied. */
export function resolveParams(params: Param[], overrides: Record<string, unknown> = {}): Params {
  const out = defaultParams(params);
  for (const p of params) {
    if (!(p.id in overrides)) continue;
    const v = coerce(p, overrides[p.id]);
    if (v !== undefined) out[p.id] = v;
  }
  return out;
}
