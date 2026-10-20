// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { existsSync, readdirSync, readFileSync } from 'node:fs';

// Scenes marked `unreleased: true` in their meta.ts stay out of the sitemap until their drop.
const unreleased = readdirSync('src/scenes', { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(`src/scenes/${d.name}/meta.ts`))
  .filter((d) => /unreleased:\s*true/.test(readFileSync(`src/scenes/${d.name}/meta.ts`, 'utf8')))
  .map((d) => d.name);

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
            filter: (page) =>
              !page.includes('/dev/') &&
              !/\/about\/?$/.test(page) &&
              !unreleased.some((s) => new RegExp(`/scenes/${s}/?$`).test(page)),
          }),
        ]
      : []),
  ],
});
