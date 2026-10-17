// Mounts a scene module into a host element: creates the instance, keeps it
// sized (ResizeObserver), themed (theme store) and scheduled (scheduler), and
// tears all of that down again in destroy().

import type { Params, SceneInstance, SceneModule, SoundHooks } from '../scenes/types';
import { resolveParams } from '../scenes/params';
import { getTheme, subscribe } from '../theme/store';
import type { Theme } from '../theme/worlds';
import { fontsReady } from './fonts';
import { isPaused, prefersReducedMotion } from './motion';
import { register } from './scheduler';

export interface MountOptions {
  params?: Record<string, unknown>;
  quality?: 'full' | 'preview';
  sound?: SoundHooks;
  /** A fixed theme (a gallery tile in its own world): the scene ignores the page's theme store. */
  theme?: Theme;
}

export interface MountedScene {
  module: SceneModule;
  instance: SceneInstance;
  params: Params;
  setParams(next: Record<string, unknown>): void;
  destroy(): void;
}

const silent: SoundHooks = { play() {} };

export function mountScene(
  host: HTMLElement,
  mod: SceneModule,
  opts: MountOptions = {},
): MountedScene {
  host.classList.add('scene-host');
  let params = resolveParams(mod.params, opts.params);
  const instance = mod.create(host, params, {
    theme: opts.theme ?? getTheme(),
    reducedMotion: prefersReducedMotion(),
    isSmall: (host.clientWidth || window.innerWidth) < 700,
    quality: opts.quality ?? 'full',
    sound: opts.sound ?? silent,
  });
  const reg = register(host, instance);
  let destroyed = false;
  let sized = false;

  const redrawIfIdle = () => {
    if (sized && reg.isVisible() && !reg.isRunning()) instance.still();
  };

  const resize = () => {
    if (destroyed) return;
    instance.resize();
    if (!sized) {
      sized = true;
      reg.ready();
    } else redrawIfIdle();
  };

  const ro = new ResizeObserver(resize);
  ro.observe(host);

  const unsubscribe = opts.theme
    ? () => {}
    : subscribe((theme) => {
        instance.setTheme(theme);
        redrawIfIdle();
      }, false);

  // Text-sampled scenes rebuild once the real font has arrived.
  fontsReady().then(() => {
    if (!destroyed && sized) resize();
  });

  return {
    module: mod,
    instance,
    get params() {
      return params;
    },
    setParams(next) {
      params = resolveParams(mod.params, { ...params, ...next });
      instance.setParams(params);
      if (isPaused()) redrawIfIdle();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      ro.disconnect();
      unsubscribe();
      reg.unregister();
      instance.destroy();
      host.classList.remove('scene-host');
    },
  };
}
