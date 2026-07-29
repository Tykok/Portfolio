import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { getProjects } from 'api/projects';

import type { Project } from 'data/projects';

interface ProjectsContextValue {
  data: Project[];
  loading: boolean;
  error: Error | null;
}

const ProjectsContext = createContext<ProjectsContextValue>({
  data: [],
  loading: true,
  error: null,
});

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;
    getProjects()
      .then((projects) => {
        if (active) setData(projects);
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err : new Error('Unknown error'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return <ProjectsContext.Provider value={{ data, loading, error }}>{children}</ProjectsContext.Provider>;
}

export function useProjects(): ProjectsContextValue {
  return useContext(ProjectsContext);
}

export default ProjectsProvider;
