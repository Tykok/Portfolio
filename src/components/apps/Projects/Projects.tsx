import { useState } from 'react';

import { ChickenLoader } from 'components/ChickenLoader/ChickenLoader';
import { useLang } from 'context/LangContext';
import { useProjects } from 'context/ProjectsContext';

import { SlideRail } from './SlideRail';
import { SlideStage } from './SlideStage';

export function Projects() {
  const { t } = useLang();
  const { data: projects, loading, error } = useProjects();
  const [activeIndex, setActiveIndex] = useState(0);

  if (loading) {
    return (
      <div className="pj-state">
        <ChickenLoader label={String(t('projects_loading'))} />
      </div>
    );
  }

  if (error || projects.length === 0) {
    return (
      <div className="pj-state">
        <p>{String(t('projects_error'))}</p>
      </div>
    );
  }

  const safeIndex = Math.min(activeIndex, projects.length - 1);

  return (
    <div className="deck-B">
      <SlideRail projects={projects} activeIndex={safeIndex} onSelect={setActiveIndex} />
      <SlideStage projects={projects} activeIndex={safeIndex} onSelect={setActiveIndex} />
    </div>
  );
}
