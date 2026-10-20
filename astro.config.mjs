// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// PUBLIC_SITE_URL is set at deploy time (PRD §23); it defaults to the live address so canonical
// links and share images are absolute. The sitemap is on since launch (PLAN 9.7); set
// PEAK_SITEMAP=0 to turn it off.
const site = process.env.PUBLIC_SITE_URL || 'https://peak-teal.vercel.app';
const sitemapOn = process.env.PEAK_SITEMAP !== '0';

export default defineConfig({
  site,
  output: 'static',
  // Straight quotes everywhere, so guides match the buttons and headings elsewhere.
  markdown: { smartypants: false },
  integrations: [
    mdx(),
    ...(sitemapOn
      ? [
          sitemap({
            // /about is hidden until the owner's details arrive (DECISIONS, 2026-10-20): drop it from here too.
            filter: (page) => !page.includes('/dev/') && !/\/about\/?$/.test(page),
          }),
        ]
      : []),
  ],
});
