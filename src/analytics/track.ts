// Analytics events (PRD §20). Custom events aren't part of Vercel Web Analytics
// on the Hobby plan (vercel.com/docs/analytics/limits-and-pricing, checked
// 2026-10-16), so track() is a no-op. Page views are counted by the
// <Analytics /> component in Base.astro. No cookies, no personal data.

export type TrackEvent =
  | 'prompt_copied'
  | 'prompt_downloaded'
  | 'followup_copied'
  | 'share_copied'
  | 'world_changed'
  | 'it_worked'
  | 'it_didnt';

export function track(
  _event: TrackEvent,
  _data: Record<string, string | number | boolean> = {},
): void {
  // Intentionally empty. Wire to `track` from '@vercel/analytics' if the plan ever includes custom events.
}
