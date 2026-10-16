// The scene module interface (PRD §16.3).

import type { Theme, WorldId } from '../theme/worlds';

export type ParamValue = number | string | boolean;
export type Params = Record<string, ParamValue>;

interface ParamBase {
  /** Stable, used in URLs. */
  id: string;
  /** Plain language, shown in UI. */
  label: string;
  /** One or two sentences, shown in the info popover. */
  help: string;
  /** Advanced is collapsed by default: everything else that shapes the result (owner, 2026-10-16). */
  group: 'Look' | 'Motion' | 'Interaction' | 'Advanced';
  /** Word-bank id, e.g. 'damping'. */
  term?: string;
  /** Included in the Quick prompt. */
  key?: boolean;
  /** Changing it rebuilds the scene (debounced). */
  rebuild?: boolean;
  /** One plain sentence for the prompt (PRD §10.4). */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  phrase: (value: any, all: Params) => string;
}

export type Param =
  | (ParamBase & {
      kind: 'slider';
      min: number;
      max: number;
      step: number;
      default: number;
      unit?: string;
      invertDisplay?: boolean;
    })
  | (ParamBase & { kind: 'text'; maxLength: number; default: string })
  | (ParamBase & { kind: 'toggle'; default: boolean })
  | (ParamBase & {
      kind: 'select';
      options: { value: string; label: string }[];
      default: string;
    })
  | (ParamBase & { kind: 'datetime'; default: () => string });

export interface SceneMeta {
  slug: string;
  title: string;
  summary: string;
  useCase: string;
  tags: string[];
  difficulty: 'Easy' | 'Medium' | 'Spicy';
  minutes: number;
  world: Exclude<WorldId, 'custom'>;
  terms: string[];
  /** PRD §9.5 sentences, may contain **term** markers. */
  howItWorks: string[];
  /** PRD §9.5 ideas. */
  whatElse: string[];
  /** PRD §10.2 "What I want". */
  wants: string;
  lookLines: string[];
  behaviorLines: string[];
  interactionLines: string[];
}

export interface SoundHooks {
  play(name: string, opts?: { volume?: number; pitch?: number }): void;
}

export interface SceneContext {
  /** Current theme (updated via setTheme). */
  theme: Theme;
  reducedMotion: boolean;
  /** Under 700px wide. */
  isSmall: boolean;
  /** Gallery previews use 'preview' (lower counts). */
  quality: 'full' | 'preview';
  sound: SoundHooks;
}

export interface SceneInstance {
  resize(): void;
  /** Called by the scheduler only while visible and playing. */
  update(dt: number, t: number): void;
  /** Draw a meaningful static frame. */
  still(): void;
  setParams(next: Params): void;
  setTheme(theme: Theme): void;
  restart(): void;
  /** Remove every listener, observer, timer; free canvases. */
  destroy(): void;
}

export interface SceneModule {
  meta: SceneMeta;
  params: Param[];
  followUps: (p: Params) => string[];
  create(host: HTMLElement, params: Params, ctx: SceneContext): SceneInstance;
}
