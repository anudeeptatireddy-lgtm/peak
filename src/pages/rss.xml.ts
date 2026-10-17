import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';

export async function GET(context: APIContext) {
  const drops = (await getCollection('drops')).sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime(),
  );
  return rss({
    title: 'peak drops',
    description: 'New animations and color worlds from peak.',
    site: context.site ?? 'http://localhost:4321',
    items: drops.map((d) => ({
      title: d.data.title,
      pubDate: d.data.date,
      description: d.data.summary,
      link: `/drops/${d.id}/`,
    })),
  });
}
