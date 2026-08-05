import { companies } from 'data/companies';
import { type DeckEntry, entryId } from 'data/deck';
import type { Project } from 'data/projects';

import { blank, bullets, col, dim, heading, out } from '../lines';
import type { Line, TerminalData } from '../types';
import { TERM_LANG } from '../types';

/**
 * The console's deck, in the order a reader wants it: paid work first, side
 * projects after. Mirrors the window's own composition rule — an empty or
 * failed projects fetch drops that group rather than the whole deck.
 */
export function consoleDeck(projects: Project[]): DeckEntry[] {
  return [
    ...companies.map((company) => ({ kind: 'company' as const, company })),
    ...projects.map((project) => ({ kind: 'personal' as const, project })),
  ];
}

/**
 * The deck as the terminal should see it, given whatever the fetch produced.
 * A failed fetch drops the personal group and keeps the companies — they are
 * static module data with no API in front of them.
 */
export function deckFrom(data: TerminalData): DeckEntry[] {
  return consoleDeck(data.projectsError ? [] : data.projects);
}

export function findEntry(entries: DeckEntry[], id: string): DeckEntry | undefined {
  const wanted = id.trim().toLowerCase();
  if (!wanted) return undefined;
  const exact = entries.find((entry) => entryId(entry) === wanted);
  if (exact) return exact;
  const prefixed = entries.filter((entry) => entryId(entry).startsWith(wanted));
  return prefixed.length === 1 ? prefixed[0] : undefined;
}

export function projectsView(entries: DeckEntry[]): Line[] {
  const work = entries.filter((entry) => entry.kind === 'company');
  const personal = entries.filter((entry) => entry.kind === 'personal');

  return [
    ...(work.length
      ? [
          ...heading(`WORK — ${work.length}`),
          ...out(
            ...work.map((entry) =>
              entry.kind === 'company'
                ? col(entry.company.id, `${entry.company.name} · ${entry.company.period[TERM_LANG]}`, 16)
                : '',
            ),
          ),
        ]
      : []),
    ...(personal.length ? [...blank, ...heading(`PERSONAL PROJECTS — ${personal.length}`)] : []),
    ...out(
      ...personal.map((entry) =>
        entry.kind === 'personal' ? col(entry.project.id, `${entry.project.emoji}  ${entry.project.title[TERM_LANG]}`, 16) : '',
      ),
    ),
    ...blank,
    ...dim('→ `show <id>` for any of them.'),
  ];
}

export function entryView(entry: DeckEntry): Line[] {
  if (entry.kind === 'company') {
    const { name, role, place, period, what, work, stack } = entry.company;
    return [
      ...out(`${name.toUpperCase()} — ${period[TERM_LANG]}`),
      ...dim(place[TERM_LANG]),
      ...blank,
      ...out(what[TERM_LANG]),
      ...blank,
      ...out(role[TERM_LANG]),
      ...blank,
      ...out('  What I worked on:'),
      ...bullets(work[TERM_LANG]),
      ...blank,
      ...dim(`  Stack: ${stack.join(' · ')}`),
      ...dim('→ `ls` for the list, `cv` for the résumé.'),
    ];
  }

  const { emoji, title, year, status, desc, bullets: items, stack, repo, demo, context, takeaway, linkNote } = entry.project;
  /* `'#'` is this codebase's "no link" sentinel, not a URL — the deck window
     reads it the same way (ProjectSlide.tsx:8). */
  const hasRepo = repo !== '' && repo !== '#';
  const hasDemo = demo !== '' && demo !== '#';
  return [
    ...out(`${emoji}  ${title[TERM_LANG].toUpperCase()} — ${year}`),
    ...dim(`${status.label[TERM_LANG]} · ${stack.join(' · ')}`),
    ...blank,
    ...(context ? [...out(context[TERM_LANG]), ...blank] : []),
    ...out(desc[TERM_LANG]),
    ...blank,
    ...bullets(items[TERM_LANG]),
    ...blank,
    ...(takeaway ? dim(`  Took away: ${takeaway[TERM_LANG]}`) : []),
    ...(hasRepo ? out(col('  repo', repo, 10)) : []),
    ...(hasDemo ? out(col('  demo', demo, 10)) : []),
    ...(!hasRepo && !hasDemo ? dim(`  ${linkNote?.[TERM_LANG] ?? 'No public code for this one.'}`) : []),
    ...dim('→ `ls` for the list.'),
  ];
}
