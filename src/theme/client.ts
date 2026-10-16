// Browser glue: keeps :root's CSS variables in sync with the theme store.

import { createApplier } from './apply';
import { subscribe } from './store';

let connected = false;

export function connectThemeToCss(root: HTMLElement = document.documentElement): void {
  if (connected) return;
  connected = true;
  const apply = createApplier(root);
  subscribe((theme) => {
    apply(theme);
    root.dataset.world = theme.id;
    root.dataset.mode = theme.mode;
  });
}
