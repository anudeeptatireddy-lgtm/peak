// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// PUBLIC_SITE_URL is set at deploy time (PRD §23). Without it the sitemap is skipped.
const site = process.env.PUBLIC_SITE_URL || undefined;

export default defineConfig({
  site,
  output: 'static',
  integrations: [mdx(), sitemap()],
});
