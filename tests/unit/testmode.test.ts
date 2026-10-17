import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('engine test mode', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('does nothing unless a test sets the flag', async () => {
    const real = Math.random;
    const m = await import('../../src/engine/testmode');
    m.initTestMode();
    expect(m.isTestMode()).toBe(false);
    expect(Math.random).toBe(real);
  });

  it('seeds Math.random identically every time and can restart it', async () => {
    const w = globalThis as unknown as { window: Record<string, unknown> };
    const had = 'window' in globalThis;
    w.window = { __PEAK_TEST__: 7 };
    const real = Math.random;
    try {
      const m = await import('../../src/engine/testmode');
      m.initTestMode();
      expect(m.isTestMode()).toBe(true);
      const first = [Math.random(), Math.random(), Math.random()];
      (w.window.__reseed as (s: number) => void)(7);
      expect([Math.random(), Math.random(), Math.random()]).toEqual(first);
      expect(first.every((v) => v >= 0 && v < 1)).toBe(true);
    } finally {
      Math.random = real;
      if (!had) delete (globalThis as Record<string, unknown>).window;
    }
  });
});
