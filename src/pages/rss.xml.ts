import rss from '@astrojs/rss';
import type { APIContext } from 'astro';

// Drops are added in PLAN step 8.13; until then the feed is empty.
export function GET(context: APIContext) {
  return rss({
    title: 'peak drops',
    description: 'New animations and color worlds from peak.',
    site: context.site ?? 'http://localhost:4321',
    items: [],
  });
}
