import { apiFetch } from 'api/client';
import { mockProjects } from 'api/mock/projects.mock';

import type { Project } from 'data/projects';

const USE_MOCK = process.env.REACT_APP_USE_MOCK !== 'false';
const MOCK_DELAY_MS = 400;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function getProjects(): Promise<Project[]> {
  if (USE_MOCK) {
    await delay(MOCK_DELAY_MS);
    return mockProjects;
  }

  return apiFetch<Project[]>('/projects');
}
