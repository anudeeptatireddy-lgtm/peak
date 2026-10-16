// Slug → lazy import of every scene module in src/scenes/<slug>/index.ts.
// Adding a scene folder registers it; each scene stays its own chunk.

import type { SceneModule } from './types';

const modules = import.meta.glob<{ default: SceneModule }>('./*/index.ts');

export const SCENE_LOADERS: Record<string, () => Promise<SceneModule>> = Object.fromEntries(
  Object.entries(modules).map(([path, load]) => [
    path.split('/')[1]!,
    () => load().then((m) => m.default),
  ]),
);

export const SCENE_SLUGS = Object.keys(SCENE_LOADERS).sort();

export function hasScene(slug: string): boolean {
  return Object.prototype.hasOwnProperty.call(SCENE_LOADERS, slug);
}

export async function loadScene(slug: string): Promise<SceneModule> {
  const load = SCENE_LOADERS[slug];
  if (!load) throw new Error(`Unknown scene: ${slug}`);
  return load();
}
