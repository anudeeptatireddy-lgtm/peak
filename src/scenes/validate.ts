// Schema validator for scene modules (PLAN 1.7, PRD §8.4). Used by unit tests.

import { isWorldId } from '../theme/worlds';
import { isWordId } from '../words/list';
import { defaultParams } from './params';
import type { SceneModule } from './types';

const BAD_TEXT = /\bundefined\b|\bNaN\b|\[object /;

export function validateScene(mod: SceneModule): string[] {
  const errs: string[] = [];
  const m = mod.meta;
  const need = (ok: boolean, msg: string) => {
    if (!ok) errs.push(`${m?.slug ?? '?'}: ${msg}`);
  };

  need(/^[a-z]+$/.test(m.slug), 'slug must be lowercase letters');
  for (const k of ['title', 'summary', 'useCase', 'wants'] as const)
    need(!!m[k]?.trim(), `meta.${k} is empty`);
  need(isWorldId(m.world), `unknown world ${m.world}`);
  need(m.minutes > 0, 'minutes must be positive');
  need(m.tags.length > 0, 'needs at least one tag');
  need(m.howItWorks.length >= 3 && m.howItWorks.length <= 5, 'howItWorks needs 3–5 sentences');
  need(m.terms.length > 0, 'needs at least one linked term');
  for (const t of m.terms) need(isWordId(t), `unknown term ${t}`);

  const ids = new Set<string>();
  const all = defaultParams(mod.params);
  for (const p of mod.params) {
    const where = `param ${p.id}`;
    need(/^[a-z][a-zA-Z0-9]*$/.test(p.id), `${where}: id must be camelCase`);
    need(!ids.has(p.id), `${where}: duplicate id`);
    ids.add(p.id);
    need(!!p.label.trim(), `${where}: missing label`);
    need(!!p.help.trim(), `${where}: missing help text`);
    if (p.term) need(isWordId(p.term), `${where}: unknown term ${p.term}`);
    if (p.when)
      need(
        mod.params.some((q) => q.id === p.when!.id),
        `${where}: when must name another param`,
      );
    if (p.phraseIn)
      need(
        mod.params.some((q) => q.id === p.phraseIn && !q.phraseIn),
        `${where}: phraseIn must name another param that has its own line`,
      );
    switch (p.kind) {
      case 'slider':
        need(p.min < p.max, `${where}: min must be below max`);
        need(p.step > 0, `${where}: step must be positive`);
        need(p.default >= p.min && p.default <= p.max, `${where}: default out of range`);
        break;
      case 'text':
        need(p.maxLength > 0, `${where}: maxLength must be positive`);
        need(p.default.length <= p.maxLength, `${where}: default longer than maxLength`);
        break;
      case 'select':
        need(p.options.length > 0, `${where}: needs options`);
        need(
          p.options.some((o) => o.value === p.default),
          `${where}: default not among options`,
        );
        break;
      case 'datetime':
        need(!Number.isNaN(Date.parse(p.default())), `${where}: default is not a date`);
        break;
      case 'toggle':
        break;
    }
    let phrase = '';
    try {
      phrase = p.phrase(all[p.id], all);
    } catch (e) {
      need(false, `${where}: phrase threw ${(e as Error).message}`);
    }
    need(!!phrase.trim(), `${where}: phrase is empty`);
    need(!BAD_TEXT.test(phrase), `${where}: phrase contains undefined/NaN`);
    // camelCase ids are internal names; plain words like "stiffness" are fine in prose.
    need(
      !/[A-Z]/.test(p.id) || !phrase.includes(p.id),
      `${where}: phrase mentions its internal id`,
    );
  }

  const ups = mod.followUps(all);
  need(ups.length >= 3 && ups.length <= 5, 'needs 3–5 follow-ups');
  for (const u of ups) need(!!u.trim() && !BAD_TEXT.test(u), 'follow-up is empty or broken');
  return errs;
}
