// Phrase coverage (PLAN 2.10, PRD §10.4): every setting of every built scene
// reaches the prompt. Changing one value changes the prompt and states the new
// value, and every phrase reads as a plain sentence.
import { describe, expect, it } from 'vitest';
import { buildPrompt } from '../../src/prompt/builder';
import { defaultParams } from '../../src/scenes/params';
import { SCENE_SLUGS, loadScene } from '../../src/scenes/registry';
import type { Param, ParamValue, Params } from '../../src/scenes/types';
import { getWorld } from '../../src/theme/worlds';

/** A valid value that differs from the default. */
function otherValue(p: Param, defaults: Params): ParamValue {
  const d = defaults[p.id];
  switch (p.kind) {
    case 'slider':
      return d === p.max ? p.min : p.max;
    case 'toggle':
      return !d;
    case 'select':
      return p.options.find((o) => o.value !== d)!.value;
    case 'text':
      return 'ZEBRA';
    case 'datetime':
      return '2031-05-04T09:30';
  }
}

/** The ways a number may be written in a sentence: 2300, 2,300, 0.5, 50%. */
function spellings(v: number): string[] {
  const n = Number(v.toFixed(4));
  return [String(n), n.toLocaleString('en-US'), `${Number((n * 100).toFixed(2))}%`];
}

describe.each(SCENE_SLUGS)('%s phrases', (slug) => {
  it('each setting changes the prompt and states its new value', async () => {
    const scene = await loadScene(slug);
    const defaults = defaultParams(scene.params);
    const theme = getWorld(scene.meta.world);
    const base = buildPrompt({ scene, params: defaults, theme });
    for (const p of scene.params) {
      const params = { ...defaults, [p.id]: otherValue(p, defaults) };
      const text = buildPrompt({ scene, params, theme });
      expect(text, `${p.id} did not change the prompt`).not.toBe(base);
      const v = params[p.id]!;
      // A phraseIn value is stated by its host's sentence, sometimes folded into a
      // result (a range's upper end is smallest + variety); the change above covers it.
      if (p.phraseIn) continue;
      if (p.kind === 'slider')
        expect(
          spellings(v as number).some((s) => text.includes(s)),
          `${p.id}=${v} is not stated in the prompt`,
        ).toBe(true);
      if (p.kind === 'text') expect(text).toContain('ZEBRA');
      if (p.kind === 'select') {
        const opt = p.options.find((o) => o.value === v)!;
        expect(text.toLowerCase(), `${p.id}=${v} is not stated`).toMatch(
          new RegExp(
            `${opt.value}|${opt.label}`.toLowerCase().replace(/[.*+?^${}()[\]\\]/g, '\\$&'),
          ),
        );
      }
    }
  });

  it('each phrase is a plain sentence at its default and changed values', async () => {
    const scene = await loadScene(slug);
    const defaults = defaultParams(scene.params);
    for (const p of scene.params) {
      if (p.phraseIn) continue;
      for (const v of [defaults[p.id], otherValue(p, defaults)]) {
        const s = p.phrase(v, { ...defaults, [p.id]: v! });
        expect(s, p.id).toMatch(/^[A-Z"“(]/);
        expect(s, p.id).toMatch(/[.!?)"”]$/);
        expect(s, p.id).not.toMatch(/\bundefined\b|\bNaN\b|\bnull\b|\[object /);
      }
    }
  });

  it('the Quick prompt lists every changed setting', async () => {
    const scene = await loadScene(slug);
    const defaults = defaultParams(scene.params);
    const theme = getWorld(scene.meta.world);
    for (const p of scene.params) {
      const params = { ...defaults, [p.id]: otherValue(p, defaults) };
      const text = buildPrompt({ scene, params, theme, options: { detail: 'quick' } });
      expect(text, p.id).toContain(`${p.label}: `);
    }
  });
});
