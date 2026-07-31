import { useState } from 'react';

import { ChickenLoader } from 'components/ChickenLoader/ChickenLoader';
import { useLang } from 'context/LangContext';
import { useProjects } from 'context/ProjectsContext';
import { companies } from 'data/companies';
import type { DeckEntry } from 'data/deck';

import { SlideRail } from './SlideRail';
import { SlideStage } from './SlideStage';

export function Projects() {
  const { t } = useLang();
  const { data: projects, loading, error } = useProjects();
  const [activeIndex, setActiveIndex] = useState(0);

  if (loading) {
    return (
      <div className="pj-state">
        <ChickenLoader label={t('projects_loading')} />
      </div>
    );
  }

  // Companies are static module data with no API in front of them: a
  // transient projects failure must not take the company cards down with it.
  // The deck still renders — with the personal group dropped, per SlideRail's
  // empty-group rule — and the failure becomes a notice above it, not a
  // replacement for it.
  const projectsUnavailable = error || projects.length === 0;
  const entries: DeckEntry[] = [
    ...(projectsUnavailable ? [] : projects.map((project) => ({ kind: 'personal' as const, project }))),
    ...companies.map((company) => ({ kind: 'company' as const, company })),
  ];
  const safeIndex = Math.min(activeIndex, entries.length - 1);

  return (
    // .deck-shell is a flex column so the notice takes its own height and the
    // deck takes the rest. Without it, .deck-B's height: 100% plus a non-zero
    // sibling overflows .os-winbody and pushes the deck below the fold.
    <div className="deck-shell">
      {projectsUnavailable && (
        <div className="pj-notice">
          <p>{t('projects_error')}</p>
        </div>
      )}
      <div className="deck-B">
        <SlideRail entries={entries} activeIndex={safeIndex} onSelect={setActiveIndex} />
        <SlideStage entries={entries} activeIndex={safeIndex} onSelect={setActiveIndex} />
      </div>
    </div>
  );
}
