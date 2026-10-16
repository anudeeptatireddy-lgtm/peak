import { describe, expect, it } from 'vitest';
import { buildPrompt, wordCount } from '../../src/prompt/builder';
import type { Detail, Experience, Target } from '../../src/prompt/blocks';
import { defaultParams } from '../../src/scenes/params';
import { SCENE_SLUGS, loadScene } from '../../src/scenes/registry';
import { getWorld } from '../../src/theme/worlds';

const TARGETS: Target[] = ['new', 'existing', 'react'];
const EXPERIENCES: Experience[] = ['new', 'experienced'];
const DETAILS: Detail[] = ['detailed', 'quick'];

describe.each(SCENE_SLUGS)('%s prompt', (slug) => {
  it('is deterministic and matches its snapshots', async () => {
    const scene = await loadScene(slug);
    const params = defaultParams(scene.params);
    const theme = getWorld(scene.meta.world);
    for (const detail of DETAILS)
      for (const target of TARGETS)
        for (const experience of EXPERIENCES) {
          const options = { detail, target, experience };
          const a = buildPrompt({ scene, params, theme, options });
          expect(buildPrompt({ scene, params, theme, options })).toBe(a);
          expect(a).toMatchSnapshot(`${detail}-${target}-${experience}`);
        }
  });

  it('never leaks repo paths, internal ids, broken values or the site name', async () => {
    const scene = await loadScene(slug);
    const params = defaultParams(scene.params);
    // The visitor's own words may be anything (even "peak"); swap them out to check the rest.
    for (const p of scene.params) if (p.kind === 'text') params[p.id] = 'HELLO';
    const theme = getWorld(scene.meta.world);
    for (const detail of DETAILS) {
      const text = buildPrompt({ scene, params, theme, options: { detail } });
      expect(text).not.toMatch(/\bpeak\b/i);
      expect(text).not.toMatch(/src\/|reference\/|\/dev\/|docs\//);
      expect(text).not.toMatch(/\bundefined\b|\bNaN\b|\[object /);
      for (const p of scene.params) if (/[A-Z]/.test(p.id)) expect(text).not.toContain(p.id);
    }
  });

  it('keeps the Quick prompt under 150 words', async () => {
    const scene = await loadScene(slug);
    const params = defaultParams(scene.params);
    const theme = getWorld(scene.meta.world);
    for (const target of TARGETS) {
      const text = buildPrompt({ scene, params, theme, options: { detail: 'quick', target } });
      expect(wordCount(text)).toBeLessThan(150);
    }
  });
});
