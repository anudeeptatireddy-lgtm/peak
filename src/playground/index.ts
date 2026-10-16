// The scene page playground (PRD §9): wires the generated controls, the world
// picker, Shuffle and Cycle worlds, URL state, the prompt tab, the bottom sheet
// on phones, and Just play. Everything reads and writes one `state`.

import { track } from '../analytics/track';
import { isPaused, onPausedChange, prefersReducedMotion, togglePaused } from '../engine/motion';
import { mountScene, type MountedScene } from '../engine/mount';
import type { Detail, Experience, PromptOptions, Target } from '../prompt/blocks';
import { buildPrompt, wordCount } from '../prompt/builder';
import { coerce, defaultParams } from '../scenes/params';
import { loadScene } from '../scenes/registry';
import type { Param, ParamValue, SceneModule } from '../scenes/types';
import { decodeState, encodeState, type SceneState } from '../state/url';
import { customTheme } from '../theme/custom';
import { blendThemes, smootherstep } from '../theme/journey';
import { getBaseTheme, setTheme } from '../theme/store';
import { WORLD_ORDER, getWorld, type Theme, type WorldId } from '../theme/worlds';
import { initSheet } from './sheet';

type RealWorld = Exclude<WorldId, 'custom'>;

const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) =>
  root.querySelector<T>(sel)!;
const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => [
  ...root.querySelectorAll<T>(sel),
];

const CROSSFADE_MS = 400;
const CYCLE_HOLD_MS = 8000;
const CYCLE_FADE_MS = 1500;
const REBUILD_DEBOUNCE_MS = 150;
const URL_DEBOUNCE_MS = 300;

export async function initPlayground(): Promise<void> {
  const page = $('[data-scene-page]');
  const slug = page.dataset.slug!;
  const defaultWorld = page.dataset.world!;
  const mod = await loadScene(slug);
  const state: SceneState = decodeState(location.search, mod.params, defaultWorld);
  const options: PromptOptions = { target: 'new', detail: 'detailed', experience: 'new' };

  /* ---------- theme ---------- */
  const themeFor = (s: SceneState): Theme =>
    s.world === 'custom' && s.custom ? customTheme(s.custom) : getWorld(s.world as RealWorld);
  let fadeTimer = 0;
  function crossfadeTo(target: Theme, ms = CROSSFADE_MS): void {
    clearInterval(fadeTimer);
    if (prefersReducedMotion() || ms === 0) return setTheme(target);
    const from = getBaseTheme();
    const start = performance.now();
    fadeTimer = window.setInterval(() => {
      const t = Math.min(1, (performance.now() - start) / ms);
      setTheme(t >= 1 ? target : blendThemes(from, target, smootherstep(t)));
      if (t >= 1) clearInterval(fadeTimer);
    }, 16);
  }
  setTheme(themeFor(state));

  /* ---------- scene ---------- */
  const stage = $('[data-stage]');
  const mounted: MountedScene = mountScene(stage, mod, { params: state.params });

  /* ---------- prompt ---------- */
  const promptEl = $('[data-prompt]');
  const countEl = $('[data-word-count]');
  const followEl = $('[data-followups]');
  const cycleThemes = () => (state.cycle ? state.cycle.map((id) => getWorld(id)) : undefined);
  const promptText = () =>
    buildPrompt({
      scene: mod,
      params: state.params,
      theme: themeFor(state),
      options,
      cycle: cycleThemes(),
    });
  function renderPrompt(): void {
    const text = promptText();
    promptEl.textContent = text;
    countEl.textContent = `${wordCount(text)} words`;
    followEl.replaceChildren(
      ...mod.followUps(state.params).map((f) => {
        const li = document.createElement('li');
        const p = document.createElement('p');
        p.textContent = f;
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'btn btn--secondary';
        b.textContent = 'Copy';
        b.addEventListener('click', async () => {
          await copyText(f);
          toast('Next step copied. Paste it into the same Claude Code session.');
          track('followup_copied', { scene: slug });
        });
        li.append(p, b);
        return li;
      }),
    );
  }

  /* ---------- URL ---------- */
  let urlTimer = 0;
  function syncUrl(): void {
    clearTimeout(urlTimer);
    urlTimer = window.setTimeout(() => {
      const q = encodeState(state, mod.params, defaultWorld);
      history.replaceState(null, '', `${location.pathname}${q ? `?${q}` : ''}`);
    }, URL_DEBOUNCE_MS);
  }

  /* ---------- params ---------- */
  let rebuildTimer = 0;
  function setParam(p: Param, value: ParamValue): void {
    state.params[p.id] = value;
    clearTimeout(rebuildTimer);
    if (p.rebuild)
      rebuildTimer = window.setTimeout(() => mounted.setParams(state.params), REBUILD_DEBOUNCE_MS);
    else mounted.setParams(state.params);
    renderPrompt();
    syncUrl();
  }
  const controls = wireControls(mod, state, setParam);

  /* ---------- worlds ---------- */
  const swatches = $$<HTMLButtonElement>('[data-world-id]');
  const customBox = $('[data-custom]');
  const customInputs = $$<HTMLInputElement>('[data-custom-key]');
  function showWorld(): void {
    for (const b of swatches) {
      const on = b.dataset.worldId === state.world;
      b.setAttribute('aria-checked', String(on));
      b.tabIndex = on ? 0 : -1;
    }
    customBox.hidden = state.world !== 'custom';
    if (state.custom)
      for (const i of customInputs)
        i.value = state.custom[i.dataset.customKey as 'ground'].toLowerCase();
  }
  function chooseWorld(id: string, ms = CROSSFADE_MS): void {
    if (id === 'custom') {
      const base = themeFor(state);
      state.custom ??= { ground: base.ground, c1: base.c1, c2: base.c2, c3: base.c3 };
      state.world = 'custom';
    } else state.world = id as RealWorld;
    showWorld();
    crossfadeTo(themeFor(state), ms);
    renderPrompt();
    syncUrl();
    track('world_changed', { scene: slug, world: state.world });
  }
  radioGroup($('[data-swatches]'), (b) => chooseWorld(b.dataset.worldId!));
  for (const input of customInputs)
    input.addEventListener('input', () => {
      state.custom![input.dataset.customKey as 'ground'] = input.value.toUpperCase();
      crossfadeTo(themeFor(state), 0);
      renderPrompt();
      syncUrl();
    });

  const randomWorld = (not: string[]) => {
    const pool = WORLD_ORDER.filter((w) => !not.includes(w));
    return pool[Math.floor(Math.random() * pool.length)]!;
  };
  const cycleBtn = $<HTMLButtonElement>('[data-cycle]');
  let cycleTimer = 0;
  let cycleIndex = 0;
  function newCycle(): void {
    const first = state.world === 'custom' ? randomWorld([]) : state.world;
    const loop: RealWorld[] = [first];
    while (loop.length < 4) loop.push(randomWorld(loop));
    state.cycle = loop;
    cycleIndex = 0;
  }
  function scheduleCycle(): void {
    clearTimeout(cycleTimer);
    if (!state.cycle || isPaused()) return;
    cycleTimer = window.setTimeout(() => {
      cycleIndex = (cycleIndex + 1) % state.cycle!.length;
      state.world = state.cycle![cycleIndex]!;
      showWorld();
      crossfadeTo(themeFor(state), CYCLE_FADE_MS);
      scheduleCycle();
    }, CYCLE_HOLD_MS);
  }
  function setCycle(on: boolean): void {
    if (on) {
      if (!state.cycle) newCycle();
    } else state.cycle = undefined;
    cycleBtn.setAttribute('aria-checked', String(on));
    scheduleCycle();
    renderPrompt();
    syncUrl();
  }
  cycleBtn.addEventListener('click', () => setCycle(!state.cycle));
  $('[data-shuffle-world]').addEventListener('click', () => {
    chooseWorld(randomWorld([state.world]));
    if (state.cycle) {
      newCycle();
      scheduleCycle();
      renderPrompt();
      syncUrl();
    }
  });
  onPausedChange(() => scheduleCycle());
  if (state.cycle) {
    cycleIndex = Math.max(0, state.cycle.indexOf(state.world as RealWorld));
    cycleBtn.setAttribute('aria-checked', 'true');
    scheduleCycle();
  }

  /* ---------- reset, surprise, share ---------- */
  $('[data-reset]').addEventListener('click', () => {
    state.params = defaultParams(mod.params);
    controls.showAll();
    mounted.setParams(state.params);
    renderPrompt();
    syncUrl();
    toast('Back to the original settings.');
  });
  $('[data-surprise]').addEventListener('click', () => {
    for (const p of mod.params) {
      if (p.kind === 'slider') {
        const steps = Math.round((p.max - p.min) / p.step);
        state.params[p.id] = coerce(p, p.min + Math.round(Math.random() * steps) * p.step)!;
      } else if (p.kind === 'toggle') state.params[p.id] = Math.random() < 0.5;
      else if (p.kind === 'select')
        state.params[p.id] = p.options[Math.floor(Math.random() * p.options.length)]!.value;
    }
    controls.showAll();
    mounted.setParams(state.params);
    renderPrompt();
    syncUrl();
  });
  $('[data-share]').addEventListener('click', async () => {
    const url =
      `${location.origin}${location.pathname}?${encodeState(state, mod.params, defaultWorld)}`.replace(
        /\?$/,
        '',
      );
    const phone = matchMedia('(pointer: coarse)').matches;
    if (phone && navigator.share) {
      try {
        await navigator.share({ title: mod.meta.title, url });
        track('share_copied', { scene: slug });
        return;
      } catch {
        /* cancelled: fall back to copying */
      }
    }
    await copyText(url);
    toast('Link copied. Anyone who opens it sees your version.');
    track('share_copied', { scene: slug });
  });

  /* ---------- prompt tab ---------- */
  for (const group of $$('[data-opt]'))
    radioGroup(group, (b) => {
      const key = group.dataset.opt as keyof PromptOptions;
      if (key === 'target') options.target = b.dataset.value as Target;
      if (key === 'detail') options.detail = b.dataset.value as Detail;
      if (key === 'experience') options.experience = b.dataset.value as Experience;
      renderPrompt();
    });
  for (const btn of $$('[data-copy-prompt]'))
    btn.addEventListener('click', async () => {
      await copyText(promptText());
      toast('Prompt copied. Paste it into Claude Code.');
      track('prompt_copied', { scene: slug, ...options });
    });
  $('[data-download]').addEventListener('click', () => {
    const blob = new Blob([promptText()], { type: 'text/markdown' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'PROMPT.md';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    track('prompt_downloaded', { scene: slug });
  });
  const note = $('[data-feedback-note]');
  for (const b of $$('[data-feedback]'))
    b.addEventListener('click', () => {
      const ev = b.dataset.feedback as 'it_worked' | 'it_didnt';
      track(ev, { scene: slug, ...options });
      note.hidden = false;
      note.replaceChildren('Thanks, noted.');
      if (ev === 'it_didnt') {
        const a = document.createElement('a');
        a.href = '/fix';
        a.textContent = 'Find the fix for what went wrong';
        note.append(' ', a, '.');
      }
    });

  /* ---------- tabs ---------- */
  const tabs = $$<HTMLButtonElement>('[role="tab"]');
  const sheet = initSheet($('[data-panel]'));
  function selectTab(t: HTMLButtonElement, focus = false): void {
    for (const x of tabs) {
      const on = x === t;
      x.setAttribute('aria-selected', String(on));
      x.tabIndex = on ? 0 : -1;
      $(`#${x.getAttribute('aria-controls')}`).hidden = !on;
    }
    if (focus) t.focus();
    sheet.openAtLeastHalf();
  }
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => selectTab(t));
    t.addEventListener('keydown', (e) => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      selectTab(tabs[(i + d + tabs.length) % tabs.length]!, true);
    });
  });

  /* ---------- stage controls ---------- */
  const pauseBtn = $<HTMLButtonElement>('[data-stage-pause]');
  pauseBtn.addEventListener('click', togglePaused);
  onPausedChange((p) => (pauseBtn.textContent = p ? 'Play' : 'Pause'));
  $('[data-restart]').addEventListener('click', () => mounted.instance.restart());
  const panelToggle = $<HTMLButtonElement>('[data-panel-toggle]');
  panelToggle.addEventListener('click', () => {
    const collapsed = document.documentElement.classList.toggle('panel-collapsed');
    panelToggle.setAttribute('aria-expanded', String(!collapsed));
    panelToggle.textContent = collapsed ? 'Show panel' : 'Hide panel';
  });

  /* ---------- Just play (PRD §9.7) ---------- */
  const wrap = $('[data-stage-wrap]');
  const justPlay = $<HTMLButtonElement>('[data-just-play]');
  const exitBtn = $<HTMLButtonElement>('[data-fidget-exit]');
  let fidget = false;
  function setFidget(on: boolean): void {
    if (on === fidget) return;
    fidget = on;
    document.documentElement.classList.toggle('fidget', on);
    exitBtn.hidden = !on;
    // Drags start at once in this mode (see engine/pointer.ts), so nothing scrolls.
    stage.style.touchAction = on ? 'none' : '';
    if (on) {
      wrap.requestFullscreen?.().catch(() => {});
      exitBtn.focus();
    } else {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      justPlay.focus();
    }
  }
  justPlay.addEventListener('click', () => setFidget(true));
  exitBtn.addEventListener('click', () => setFidget(false));
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement && fidget) setFidget(false);
  });
  document.addEventListener('keydown', (e) => {
    const typing = (e.target as HTMLElement).closest('input, textarea, select, [contenteditable]');
    if (e.key === 'Escape' && fidget) setFidget(false);
    else if ((e.key === 'f' || e.key === 'F') && !typing && !e.metaKey && !e.ctrlKey && !e.altKey)
      setFidget(!fidget);
  });

  showWorld();
  renderPrompt();
  (window as unknown as { __playground: object }).__playground = { state, promptText };
}

/* ---------- controls ---------- */

function wireControls(
  mod: SceneModule,
  state: SceneState,
  set: (p: Param, v: ParamValue) => void,
): { showAll(): void } {
  const byId = new Map(mod.params.map((p) => [p.id, p]));
  const shows: (() => void)[] = [];
  for (const el of $$('[data-param]')) {
    const p = byId.get(el.dataset.param!)!;
    const info = $<HTMLButtonElement>('.ctl-info', el);
    const help = $(`#${info.getAttribute('aria-controls')}`);
    info.addEventListener('click', () => {
      help.hidden = !help.hidden;
      info.setAttribute('aria-expanded', String(!help.hidden));
    });
    if (p.kind === 'slider') {
      const input = $<HTMLInputElement>('input', el);
      const out = $('output', el);
      const invert = (v: number) => (p.invertDisplay ? Number((p.max + p.min - v).toFixed(6)) : v);
      const show = () => {
        const v = Number(state.params[p.id]);
        input.value = String(invert(v));
        out.textContent = `${Number(invert(v).toFixed(4))}${out.dataset.unit ?? ''}`;
        input.setAttribute('aria-valuetext', `${out.textContent}`);
      };
      input.addEventListener('input', () => {
        const v = coerce(p, invert(Number(input.value)));
        if (v !== undefined) set(p, v);
        show();
      });
      shows.push(show);
    } else if (p.kind === 'text') {
      const input = $<HTMLInputElement>('input', el);
      const count = $('[data-count]', el);
      const show = () => {
        input.value = String(state.params[p.id]);
        count.textContent = `${input.value.length}/${p.maxLength}`;
        count.hidden = input.value.length < p.maxLength * 0.8;
      };
      input.addEventListener('input', () => {
        const v = coerce(p, input.value);
        if (v !== undefined) set(p, v);
        count.textContent = `${input.value.length}/${p.maxLength}`;
        count.hidden = input.value.length < p.maxLength * 0.8;
      });
      shows.push(show);
    } else if (p.kind === 'toggle') {
      const btn = $<HTMLButtonElement>('[role="switch"]', el);
      const show = () => {
        const on = Boolean(state.params[p.id]);
        btn.setAttribute('aria-checked', String(on));
        $('.switch-text', btn).textContent = on ? 'On' : 'Off';
      };
      btn.addEventListener('click', () => {
        set(p, !state.params[p.id]);
        show();
      });
      shows.push(show);
    } else if (p.kind === 'select') {
      const group = el.querySelector<HTMLElement>('[role="radiogroup"]');
      if (group) {
        const show = () =>
          $$<HTMLButtonElement>('[role="radio"]', group).forEach((b) => {
            const on = b.dataset.value === state.params[p.id];
            b.setAttribute('aria-checked', String(on));
            b.tabIndex = on ? 0 : -1;
          });
        radioGroup(group, (b) => set(p, b.dataset.value!));
        shows.push(show);
      } else {
        const sel = $<HTMLSelectElement>('select', el);
        sel.addEventListener('change', () => set(p, sel.value));
        shows.push(() => (sel.value = String(state.params[p.id])));
      }
    } else if (p.kind === 'datetime') {
      const input = $<HTMLInputElement>('input', el);
      input.addEventListener('change', () => {
        const v = coerce(p, input.value);
        if (v !== undefined) set(p, v);
      });
      shows.push(() => (input.value = String(state.params[p.id]).slice(0, 16)));
    }
  }
  const showAll = () => shows.forEach((s) => s());
  showAll();
  return { showAll };
}

/** A roving-tabindex radio group: click or arrow keys choose. */
function radioGroup(group: HTMLElement, choose: (b: HTMLButtonElement) => void): void {
  const items = () => $$<HTMLButtonElement>('[role="radio"]', group);
  const pick = (b: HTMLButtonElement, focus: boolean) => {
    for (const x of items()) {
      x.setAttribute('aria-checked', String(x === b));
      x.tabIndex = x === b ? 0 : -1;
    }
    if (focus) b.focus();
    choose(b);
  };
  group.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('[role="radio"]');
    if (b) pick(b, false);
  });
  group.addEventListener('keydown', (e) => {
    const list = items();
    const i = list.indexOf(document.activeElement as HTMLButtonElement);
    if (i < 0) return;
    const d = ['ArrowRight', 'ArrowDown'].includes(e.key)
      ? 1
      : ['ArrowLeft', 'ArrowUp'].includes(e.key)
        ? -1
        : 0;
    if (!d) return;
    e.preventDefault();
    pick(list[(i + d + list.length) % list.length]!, true);
  });
}

/* ---------- clipboard and toast ---------- */

export async function copyText(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    return;
  } catch {
    /* older Safari, or no permission: fall back */
  }
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.append(ta);
  ta.select();
  document.execCommand('copy');
  ta.remove();
}

let toastTimer = 0;
function toast(message: string): void {
  const el = document.querySelector<HTMLElement>('[data-toast]');
  if (!el) return;
  el.textContent = message;
  el.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => el.classList.remove('is-on'), 2600);
}
