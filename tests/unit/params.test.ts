import { describe, expect, it } from 'vitest';
import { coerce, resolveParams } from '../../src/scenes/params';
import { SCENE_SLUGS, loadScene } from '../../src/scenes/registry';
import type { Param } from '../../src/scenes/types';
import { validateScene } from '../../src/scenes/validate';

describe('scene schemas', () => {
  it('registry loads', () => {
    expect(Array.isArray(SCENE_SLUGS)).toBe(true);
  });
  it.each(SCENE_SLUGS.length ? SCENE_SLUGS : ['(none yet)'])(
    '%s passes the validator',
    async (slug) => {
      if (slug === '(none yet)') return;
      const mod = await loadScene(slug);
      expect(validateScene(mod)).toEqual([]);
      expect(mod.meta.slug).toBe(slug);
    },
  );
});

describe('param coercion', () => {
  const slider: Param = {
    kind: 'slider',
    id: 'speed',
    label: 'Speed',
    help: 'How fast.',
    group: 'Motion',
    min: 0,
    max: 5,
    step: 0.1,
    default: 1,
    phrase: (v: number) => `Speed ${v}.`,
  };
  const text: Param = {
    kind: 'text',
    id: 'text',
    label: 'Word',
    help: 'The word.',
    group: 'Look',
    maxLength: 4,
    default: 'peak',
    phrase: (v: string) => `The word is ${v}.`,
  };
  it('clamps and steps sliders, rejects junk', () => {
    expect(coerce(slider, '9')).toBe(5);
    expect(coerce(slider, -2)).toBe(0);
    expect(coerce(slider, '1.234')).toBe(1.2);
    expect(coerce(slider, 'abc')).toBeUndefined();
  });
  it('sanitizes and limits text', () => {
    expect(coerce(text, '<b>hello</b>')).toBe('bhel');
    expect(coerce(text, 42)).toBeUndefined();
  });
  it('resolves overrides on top of defaults', () => {
    expect(resolveParams([slider, text], { speed: '3', text: 'ok', junk: 1 })).toEqual({
      speed: 3,
      text: 'ok',
    });
  });
});
