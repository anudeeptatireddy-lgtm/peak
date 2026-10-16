import { describe, expect, it } from 'vitest';
import { defaultParams } from '../../src/scenes/params';
import { SCENE_SLUGS, loadScene } from '../../src/scenes/registry';
import { decodeState, encodeState } from '../../src/state/url';
import { contrast } from '../../src/theme/color';
import { customTheme } from '../../src/theme/custom';

describe.each(SCENE_SLUGS)('%s URL state', (slug) => {
  it('round-trips changed params, world and cycle', async () => {
    const scene = await loadScene(slug);
    const params = defaultParams(scene.params);
    for (const p of scene.params) {
      if (p.kind === 'slider') params[p.id] = p.max;
      else if (p.kind === 'toggle') params[p.id] = !p.default;
      else if (p.kind === 'text') params[p.id] = 'Hi there'.slice(0, p.maxLength);
      else if (p.kind === 'select') params[p.id] = p.options.at(-1)!.value;
    }
    const state = {
      world: 'toxic' as const,
      cycle: ['toxic', 'abyss', 'vapor', 'golden'] as never,
      params,
    };
    const back = decodeState(
      encodeState(state, scene.params, scene.meta.world),
      scene.params,
      scene.meta.world,
    );
    expect(back).toEqual(state);
  });

  it('drops junk and clamps out-of-range values', async () => {
    const scene = await loadScene(slug);
    const slider = scene.params.find((p) => p.kind === 'slider')!;
    if (slider.kind !== 'slider') return;
    const s = decodeState(
      `?${slider.id}=99999&nonsense=1&w=nowhere&cycle=abyss,mars`,
      scene.params,
      scene.meta.world,
    );
    expect(s.params[slider.id]).toBe(slider.max);
    expect(s.world).toBe(scene.meta.world);
    expect(s.cycle).toBeUndefined();
    const t = decodeState(`?${slider.id}=abc`, scene.params, scene.meta.world);
    expect(t.params[slider.id]).toBe(slider.default);
  });
});

describe('custom colors', () => {
  it('round-trip through the URL', () => {
    const custom = { ground: '#123456', c1: '#FF0000', c2: '#00FF00', c3: '#0000FF' };
    const s = decodeState(
      encodeState({ world: 'custom', custom, params: {} }, [], 'riso'),
      [],
      'riso',
    );
    expect(s).toEqual({ world: 'custom', custom, params: {} });
  });
  it('derive readable text for 20 random palettes', () => {
    let seed = 7;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const hex = () =>
      '#' +
      Math.floor(rnd() * 0xffffff)
        .toString(16)
        .padStart(6, '0')
        .toUpperCase();
    for (let i = 0; i < 20; i++) {
      const t = customTheme({ ground: hex(), c1: hex(), c2: hex(), c3: hex() });
      expect(contrast(t.ink, t.ground)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(t.inkSoft, t.ground)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(t.accentText, t.ground)).toBeGreaterThanOrEqual(3);
    }
  });
});
