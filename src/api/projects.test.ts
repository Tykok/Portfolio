import { mockProjects } from 'api/mock/projects.mock';
import { getProjects } from 'api/projects';

describe('getProjects (mock mode)', () => {
  it('resolves the mock projects array', async () => {
    const data = await getProjects();
    expect(data).toHaveLength(mockProjects.length);
    expect(data[0]).toHaveProperty('id');
    expect(data[0]).toHaveProperty('title.fr');
  });
});
