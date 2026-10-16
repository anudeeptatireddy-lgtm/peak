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

// PLAN 2.11, PRD §6.7 item 5: Cycle worlds in prompts.
describe('Cycle worlds in prompts', () => {
  const loop = (['dunes', 'abyss', 'toxic', 'vapor'] as const).map((id) => getWorld(id));

  it.each(SCENE_SLUGS)(
    '%s: lists all four palettes with the crossfade and contrast lines',
    async (slug) => {
      const scene = await loadScene(slug);
      const params = defaultParams(scene.params);
      const theme = loop[0]!;
      const text = buildPrompt({ scene, params, theme, cycle: loop });
      for (const t of loop)
        for (const hex of [t.ground, t.ink, t.c1, t.c2, t.c3]) expect(text).toContain(hex);
      expect(text).toMatch(
        /crossfade the whole page between these palettes, holding each for 8 seconds/,
      );
      expect(text).toMatch(/about 1\.5 seconds/);
      expect(text).toMatch(
        /readable at every moment of the crossfade \(contrast at least 4\.5:1\)/,
      );
      const quick = buildPrompt({
        scene,
        params,
        theme,
        cycle: loop,
        options: { detail: 'quick' },
      });
      const plainQuick = buildPrompt({ scene, params, theme, options: { detail: 'quick' } });
      expect(quick.split('\n').length).toBe(plainQuick.split('\n').length + 1);
      expect(quick).toContain(
        `Crossfade every 8 seconds between backgrounds ${loop.map((t) => t.ground).join(', ')}.`,
      );
      expect(wordCount(quick)).toBeLessThan(150);
    },
  );

  it.each(SCENE_SLUGS)('%s: with Cycle off the prompt is byte-identical', async (slug) => {
    const scene = await loadScene(slug);
    const params = defaultParams(scene.params);
    const theme = getWorld(scene.meta.world);
    for (const detail of DETAILS) {
      const plain = buildPrompt({ scene, params, theme, options: { detail } });
      expect(buildPrompt({ scene, params, theme, options: { detail }, cycle: undefined })).toBe(
        plain,
      );
      expect(buildPrompt({ scene, params, theme, options: { detail }, cycle: [] })).toBe(plain);
    }
  });

  it('matches its snapshots', async () => {
    const scene = await loadScene('ripple');
    const params = defaultParams(scene.params);
    for (const detail of DETAILS)
      expect(
        buildPrompt({ scene, params, theme: loop[0]!, cycle: loop, options: { detail } }),
      ).toMatchSnapshot(`cycle-${detail}`);
  });
});
