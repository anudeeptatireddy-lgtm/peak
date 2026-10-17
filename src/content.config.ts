// Content collections (PRD §16.6): guides, words and drops. The schemas are checked at build
// time, so a guide without sources or a drop without a date fails the build.

import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const guides = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/guides' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    /** The day every fact about outside products was last checked against the official pages. */
    lastChecked: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    sources: z.array(z.object({ label: z.string(), url: z.string().url() })).min(1),
  }),
});

const words = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/words' }),
  schema: z.object({
    term: z.string(),
    definition: z.string(),
    sayIt: z.string(),
    /** Id of the mini demo for this word (src/demos). */
    demo: z.string(),
    /** Slugs of scenes that use the word. */
    seenIn: z.array(z.string()).default([]),
  }),
});

const drops = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/drops' }),
  schema: z
    .object({
      title: z.string(),
      date: z.coerce.date(),
      scene: z.string().optional(),
      world: z.string().optional(),
      summary: z.string(),
    })
    .refine((d) => Boolean(d.scene) !== Boolean(d.world), {
      message: 'A drop has either a scene or a world, not both and not neither.',
    }),
});

export const collections = { guides, words, drops };
