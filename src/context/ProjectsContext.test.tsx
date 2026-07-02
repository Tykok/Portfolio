import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

import { ProjectsProvider, useProjects } from 'context/ProjectsContext';

function Probe() {
  const { data, loading } = useProjects();
  if (loading) return <div>loading</div>;
  return <div>count:{data.length}</div>;
}

describe('ProjectsProvider', () => {
  it('starts loading then exposes fetched projects under StrictMode', async () => {
    render(
      <React.StrictMode>
        <ProjectsProvider>
          <Probe />
        </ProjectsProvider>
      </React.StrictMode>,
    );

    expect(screen.getByText('loading')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/count:[1-9]/)).toBeInTheDocument();
    });
  });
});
