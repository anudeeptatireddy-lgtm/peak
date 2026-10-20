// Unreleased scenes (SceneMeta.unreleased) stay hidden until their weekly drop:
// not in the catalog order (gallery numbers, Tour) or on the home page.
import { readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CATALOG_ORDER } from '../../src/scenes/catalog';
import { HOME_JOURNEY } from '../../src/theme/journey';

describe('unreleased scenes', async () => {
  const slugs = readdirSync('src/scenes', { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
  const metas = await Promise.all(
    slugs.map(async (s) => (await import(`../../src/scenes/${s}/meta.ts`)).meta),
  );
  const hidden = metas.filter((m) => m.unreleased).map((m) => m.slug as string);
  it('are not in the catalog order (gallery, Tour)', () => {
    for (const s of hidden) expect((CATALOG_ORDER as readonly string[]).includes(s), s).toBe(false);
  });
  it('are not featured on the home page', () => {
    for (const s of hidden)
      expect(
        HOME_JOURNEY.some((j) => j.scene === s),
        s,
      ).toBe(false);
  });
  it('every released scene is in the catalog order', () => {
    for (const m of metas.filter((x) => !x.unreleased))
      expect((CATALOG_ORDER as readonly string[]).includes(m.slug), m.slug).toBe(true);
  });
});
