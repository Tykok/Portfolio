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

describe('mockProjects', () => {
  it('has unique ids', () => {
    expect(new Set(mockProjects.map((p) => p.id)).size).toBe(mockProjects.length);
  });

  it('fills every localized field in both languages', () => {
    mockProjects.forEach((p) => {
      expect(p.title.fr.trim()).not.toBe('');
      expect(p.title.en.trim()).not.toBe('');
      expect(p.desc.fr.trim()).not.toBe('');
      expect(p.desc.en.trim()).not.toBe('');
      expect(p.bullets.fr).toHaveLength(p.bullets.en.length);
      expect(p.bullets.fr.length).toBeGreaterThan(0);
    });
  });

  it('sets a role on every project — the deck renders it', () => {
    mockProjects.forEach((p) => {
      expect(p.role?.fr.trim()).toBeTruthy();
      expect(p.role?.en.trim()).toBeTruthy();
    });
  });

  it('carries a plain string stack — no per-entry colour to keep in sync', () => {
    mockProjects.forEach((p) => {
      expect(p.stack.length).toBeGreaterThan(0);
      p.stack.forEach((s) => {
        expect(typeof s).toBe('string');
        expect(s.trim()).not.toBe('');
      });
    });
  });

  it('carries no tags — no component renders them', () => {
    mockProjects.forEach((p) => {
      expect(p).not.toHaveProperty('tags');
    });
  });
});
