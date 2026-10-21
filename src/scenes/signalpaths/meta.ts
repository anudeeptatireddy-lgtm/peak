import type { SceneMeta } from '../types';

export const meta: SceneMeta = {
  slug: 'signalpaths',
  title: 'Signal Paths',
  summary: 'Your cursor fires signals through a network; the paths it uses most learn your name.',
  useCase: 'AI startups, data tools and developer platforms.',
  tags: ['Tech & AI', 'Backgrounds'],
  difficulty: 'Medium',
  minutes: 40,
  world: 'aurora',
  terms: ['trail', 'opacity', 'blend-mode'],
  howItWorks: [
    'Glowing nodes are scattered across the screen, some of them on the letters of the name, and each is joined to its nearest neighbors.',
    'Moving the cursor fires signals from the nearest node. A signal runs along a connection with a bright head and a short **trail**, then picks the next connection and keeps going for a while.',
    'Every connection a signal uses gets a little stronger (thicker and brighter, by **opacity**), and all of them slowly fade, like learning and forgetting.',
    'Signals slightly prefer the connections along the letters, so after a few seconds of movement the strongest paths spell the name. Overlaps glow through a **blend mode**.',
  ],
  whatElse: [
    'An AI product hero where the network learns your brand.',
    'A data-platform background that reacts as you read.',
    'A developer-tools page where the paths trace a command.',
  ],
  wants:
    'A dark field of small glowing nodes with faint connections between them. Moving my cursor fires signals along the connections, each with a bright head and a soft tail; connections that fire often grow thicker and brighter, like learning, and slowly fade otherwise. After a few seconds of movement the strongest paths spell a name. When nobody touches it, an idle demo moves an invisible cursor around.',
  lookLines: [
    'A full-screen canvas (100svh, at least 540px), transparent over the background and cleared every frame. Size it for devicePixelRatio (capped at 2) and do all math in CSS pixels.',
  ],
  behaviorLines: [
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; f = min(dt × 60, 2.5); t = seconds the loop has run (the sum of dt).',
    'Build the network again on every resize and once more when the Anybody font has finished loading; nothing is drawn before the font loads.',
    'Safety: signals are small dots and thin lines, capped in number, so nothing flashes more than 3 times a second and the background never flashes.',
    'Reduced-motion still frame: every name connection at full strength, every other connection at zero, no signals.',
  ],
  interactionLines: ['The canvas has touch-action: pan-y, so vertical swipes still scroll.'],
};
