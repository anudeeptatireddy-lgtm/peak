// The playground's bottom sheet on phones and tablets (PRD §9.1, §21): it peeks
// 72px (tab names and Copy prompt), drags up to half and full, closes with a swipe
// down or Esc, and traps focus while open. On desktop it does nothing.

type Snap = 'peek' | 'half' | 'full';

const SMALL = '(max-width: 1023.98px)';
/** Movement in px before a press on the handle or tabs counts as a drag, not a tap. */
const DRAG_SLOP = 6;
/** A flick faster than this (px per ms) snaps in its direction. */
const FLICK = 0.5;

export interface Sheet {
  /** Opens to half unless already open (tabs call this on phones). */
  openAtLeastHalf(): void;
  readonly snap: Snap;
}

export function initSheet(panel: HTMLElement): Sheet {
  const mq = matchMedia(SMALL);
  const handle = panel.querySelector<HTMLElement>('[data-sheet-handle]')!;
  const tabRow = panel.querySelector<HTMLElement>('.tabs')!;
  let snap: Snap = 'peek';
  let returnFocus: HTMLElement | null = null;

  function set(next: Snap): void {
    // Animate only moves the visitor asked for, never the first layout.
    panel.dataset.anim = '';
    const wasOpen = snap !== 'peek';
    snap = next;
    panel.style.transform = '';
    if (next === 'peek') delete panel.dataset.sheet;
    else panel.dataset.sheet = next;
    if (!wasOpen && next !== 'peek')
      returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (wasOpen && next === 'peek') {
      const tab = panel.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
      (panel.contains(returnFocus) ? tab : (returnFocus ?? tab))?.focus();
    }
  }

  /** The sheet's top edge offset for each snap, in px from fully open. */
  function offsets(): Record<Snap, number> {
    const h = panel.offsetHeight;
    const vh = window.innerHeight;
    return { full: 0, half: Math.max(0, h - vh * 0.5), peek: Math.max(0, h - 72) };
  }
  function currentOffset(): number {
    const m = new DOMMatrixReadOnly(getComputedStyle(panel).transform);
    return m.m42;
  }

  let startY = 0;
  let startOffset = 0;
  let lastY = 0;
  let lastT = 0;
  let velocity = 0;
  let dragging = false;
  let pressed = false;
  let suppressClick = false;

  function onDown(e: PointerEvent): void {
    if (!mq.matches || e.button !== 0) return;
    // Follow the pointer anywhere on the page until it lifts, not just over the handle.
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp, { once: true });
    window.addEventListener('pointercancel', onUp, { once: true });
    pressed = true;
    dragging = false;
    startY = lastY = e.clientY;
    lastT = e.timeStamp;
    velocity = 0;
    startOffset = currentOffset();
  }
  function onMove(e: PointerEvent): void {
    if (!pressed) return;
    const dy = e.clientY - startY;
    if (!dragging && Math.abs(dy) < DRAG_SLOP) return;
    if (!dragging) {
      dragging = true;
      panel.classList.add('is-dragging');
    }
    const dt = Math.max(1, e.timeStamp - lastT);
    velocity = (e.clientY - lastY) / dt;
    lastY = e.clientY;
    lastT = e.timeStamp;
    const o = offsets();
    const y = Math.min(o.peek, Math.max(0, startOffset + dy));
    panel.style.transform = `translateY(${y}px)`;
  }
  function onUp(): void {
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('pointercancel', onUp);
    if (!pressed) return;
    pressed = false;
    if (!dragging) return;
    dragging = false;
    suppressClick = true;
    panel.classList.remove('is-dragging');
    const y = currentOffset();
    const o = offsets();
    const order: Snap[] = ['full', 'half', 'peek'];
    let pick: Snap;
    if (Math.abs(velocity) > FLICK) {
      // Flicks move one step in their direction from where the drag started.
      const from = order.reduce((a, b) =>
        Math.abs(o[b] - startOffset) < Math.abs(o[a] - startOffset) ? b : a,
      );
      const i = order.indexOf(from) + (velocity > 0 ? 1 : -1);
      pick = order[Math.min(order.length - 1, Math.max(0, i))]!;
    } else pick = order.reduce((a, b) => (Math.abs(o[b] - y) < Math.abs(o[a] - y) ? b : a));
    set(pick);
  }

  for (const el of [handle, tabRow]) el.addEventListener('pointerdown', onDown);
  // A drag that ends on a tab must not also select it.
  tabRow.addEventListener(
    'click',
    (e) => {
      if (suppressClick) {
        e.stopPropagation();
        e.preventDefault();
      }
      suppressClick = false;
    },
    true,
  );
  // Tapping the handle toggles between peek and half.
  handle.addEventListener('click', () => {
    if (suppressClick) return void (suppressClick = false);
    set(snap === 'peek' ? 'half' : 'peek');
  });

  document.addEventListener('keydown', (e) => {
    if (!mq.matches || snap === 'peek') return;
    if (e.key === 'Escape' && !document.documentElement.classList.contains('fidget')) {
      e.preventDefault();
      set('peek');
    } else if (e.key === 'Tab') trapFocus(panel, e);
  });
  mq.addEventListener('change', () => set('peek'));

  return {
    openAtLeastHalf() {
      if (mq.matches && snap === 'peek') set('half');
    },
    get snap() {
      return snap;
    },
  };
}

/** Moves focus to the next or previous item inside root, wrapping at the ends. */
function trapFocus(root: HTMLElement, e: KeyboardEvent): void {
  // Handled in full, not left to the browser: Safari skips buttons and links by
  // default, which would let focus escape the sheet.
  const items = [
    ...root.querySelectorAll<HTMLElement>(
      'a[href], button, input, select, textarea, summary, [tabindex]:not([tabindex="-1"])',
    ),
  ].filter(
    (el) =>
      !el.hasAttribute('disabled') &&
      el.tabIndex >= 0 &&
      el.getClientRects().length > 0 &&
      !el.closest('[hidden], details:not([open]) > :not(summary)'),
  );
  if (!items.length) return;
  e.preventDefault();
  const i = items.indexOf(document.activeElement as HTMLElement);
  const next = i < 0 ? 0 : (i + (e.shiftKey ? -1 : 1) + items.length) % items.length;
  items[next]!.focus();
}
