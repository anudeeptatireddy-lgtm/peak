// Writes the default Detailed + New page + I'm new prompt (Riso light) for the
// listed scenes into $PTEST_DIR/<slug>/PROMPT.md, for prompt tests (docs/PROMPT_TESTS.md).
// Run: npx esbuild scripts/prompt-tests/gen-prompts.ts --bundle --platform=node \
//   --format=esm --outfile=/tmp/gen.mjs && PTEST_DIR=/some/empty/dir node /tmp/gen.mjs
// Edit the import list and the array below to pick the scenes.
import { writeFileSync, mkdirSync } from 'node:fs';
import { buildPrompt } from '../../src/prompt/builder';
import { defaultParams } from '../../src/scenes/params';
import { getWorld } from '../../src/theme/worlds';
import goo from '../../src/scenes/goo/index';
import cloth from '../../src/scenes/cloth/index';
import blackhole from '../../src/scenes/blackhole/index';
import lightning from '../../src/scenes/lightning/index';
import smoke from '../../src/scenes/smoke/index';
for (const scene of [goo, cloth, blackhole, lightning, smoke]) {
  const dir = '' + (process.env.PTEST_DIR ?? './ptest') + '/' + scene.meta.slug;
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    dir + '/PROMPT.md',
    buildPrompt({ scene, params: defaultParams(scene.params), theme: getWorld('riso') }),
  );
  console.log(scene.meta.slug);
}
