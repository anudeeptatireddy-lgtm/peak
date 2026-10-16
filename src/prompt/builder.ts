// The prompt builder (PRD §10). A pure, deterministic function: the same scene,
// params, theme and options always give the same text. No DOM.

import { defaultParams } from '../scenes/params';
import type { Param, Params, SceneModule } from '../scenes/types';
import type { Theme } from '../theme/worlds';
import {
  DEFAULT_OPTIONS,
  EXPERIENCE_BLOCKS,
  FONT_URL,
  QUICK_CLOSER,
  QUICK_TARGET,
  RULES,
  TARGET_BLOCKS,
  type PromptOptions,
} from './blocks';

export interface PromptInput {
  scene: SceneModule;
  params: Params;
  theme: Theme;
  options?: Partial<PromptOptions>;
  /** Cycle worlds (PRD §6.7): the loop of palettes, current one first. */
  cycle?: Theme[];
}

const bullet = (s: string) => `- ${s}`;

function paletteLine(t: Theme): string {
  return `background ${t.ground}, text ${t.ink}, secondary text ${t.inkSoft}, accents ${t.c1}, ${t.c2}, ${t.c3}`;
}

function blendLine(t: Theme): string {
  if (t.blend === 'multiply')
    return 'Where accent colors overlap, multiply them like ink on paper (canvas globalCompositeOperation "multiply").';
  if (t.blend === 'lighter')
    return 'Where accent colors overlap, add them so they glow (canvas globalCompositeOperation "lighter").';
  return 'Draw accent colors normally on top of each other (canvas globalCompositeOperation "source-over").';
}

function cycleLines(cycle: Theme[] | undefined): string[] {
  if (!cycle || cycle.length < 2) return [];
  const list = cycle.map((t) => `"${t.name}": ${paletteLine(t)}`).join('; ');
  return [
    `Slowly crossfade the whole page between these palettes, holding each for 8 seconds and blending in OKLab over about 1.5 seconds: ${list}.`,
    'Keep all text readable at every moment of the crossfade (contrast at least 4.5:1).',
  ];
}

const isChanged = (p: Param, params: Params, defaults: Params) => params[p.id] !== defaults[p.id];

/** A short value for the Quick prompt: "0.02", "150px", "on", "\"peak\"". */
function formatValue(p: Param, v: unknown): string {
  if (p.kind === 'toggle') return v ? 'on' : 'off';
  if (p.kind === 'text') return `"${String(v)}"`;
  if (p.kind === 'select') return p.options.find((o) => o.value === v)?.label ?? String(v);
  if (p.kind === 'slider')
    return `${Number(Number(v).toFixed(4))}${p.unit && p.unit !== '×' ? p.unit : p.unit === '×' ? '×' : ''}`;
  return String(v);
}

/** The Detailed prompt (PRD §10.2): every param's phrase, in schema order. */
function detailed(input: PromptInput, o: PromptOptions): string {
  const { scene, params, theme } = input;
  const m = scene.meta;
  const look = [
    `Colors ("${theme.name}" palette): ${paletteLine(theme)}.`,
    blendLine(theme),
    ...cycleLines(input.cycle),
    `Font: "Anybody" from Google Fonts (variable width 50–150, weight 100–900), loaded with ${FONT_URL}, with a system sans-serif fallback.`,
    ...m.lookLines,
  ];
  const moves = [
    ...scene.params.filter((p) => !p.phraseIn).map((p) => p.phrase(params[p.id], params)),
    ...m.behaviorLines,
  ];
  const out = [
    `# Build: ${m.title}`,
    '',
    '## What I want',
    m.wants,
    '',
    '## Look',
    ...look.map(bullet),
    '',
    '## How it moves',
    ...moves.map(bullet),
    '',
    '## How people interact',
    ...m.interactionLines.map(bullet),
    '',
    '## Where this goes',
    TARGET_BLOCKS[o.target],
    '',
    '## Rules',
    ...RULES.map(bullet),
    '',
    "## When you're done",
    EXPERIENCE_BLOCKS[o.experience],
  ];
  return out.join('\n');
}

/** The Quick prompt (PRD §10.6): key params plus anything the visitor changed. */
function quick(input: PromptInput, o: PromptOptions): string {
  const { scene, params, theme } = input;
  const m = scene.meta;
  const defaults = defaultParams(scene.params);
  const picked = scene.params.filter((p) => p.key || isChanged(p, params, defaults));
  const cycle =
    input.cycle && input.cycle.length > 1
      ? [
          `Crossfade every 8 seconds between backgrounds ${input.cycle.map((t) => t.ground).join(', ')}.`,
        ]
      : [];
  return [
    `# Build: ${m.title}`,
    '',
    m.wants,
    '',
    `Colors: ${paletteLine(theme)}. Font: "Anybody" from Google Fonts.`,
    ...cycle,
    ...picked.map((p) => bullet(`${p.label}: ${formatValue(p, params[p.id])}`)),
    '',
    QUICK_TARGET[o.target],
    QUICK_CLOSER,
  ].join('\n');
}

export function buildPrompt(input: PromptInput): string {
  const o = { ...DEFAULT_OPTIONS, ...input.options };
  return o.detail === 'quick' ? quick(input, o) : detailed(input, o);
}

export function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}
