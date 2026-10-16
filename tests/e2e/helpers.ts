import type { Page } from '@playwright/test';

/**
 * Collects console errors and uncaught exceptions. Requests to Vercel's own
 * analytics endpoints (/_vercel/…) are ignored: analytics is optional and can be
 * paused by the host, and that must never fail a page test.
 */
export function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    if (msg.location().url.includes('/_vercel/')) return;
    errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));
  return errors;
}
