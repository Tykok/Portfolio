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

  if (error || projects.length === 0) {
    return (
      <div className="pj-state">
        <p>{t('projects_error')}</p>
      </div>
    );
  }

  const entries: DeckEntry[] = [
    ...projects.map((project) => ({ kind: 'personal' as const, project })),
    ...companies.map((company) => ({ kind: 'company' as const, company })),
  ];
  const safeIndex = Math.min(activeIndex, entries.length - 1);

  return (
    <div className="deck-B">
      <SlideRail entries={entries} activeIndex={safeIndex} onSelect={setActiveIndex} />
      <SlideStage entries={entries} activeIndex={safeIndex} onSelect={setActiveIndex} />
    </div>
  );
}
