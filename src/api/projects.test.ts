import { mockProjects } from 'api/mock/projects.mock';
import { getProjects } from 'api/projects';
import { existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

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

  it('holds the eight personal projects, in deck order', () => {
    expect(mockProjects.map((p) => p.id)).toEqual([
      'ticoqos',
      'homelab',
      'ramassali',
      'plant974',
      'pokeapi-kotlin',
      'cedict',
      'meyiv',
      'ipi-calendar',
    ]);
  });

  it('gives every project a context and a takeaway, in both languages', () => {
    mockProjects.forEach((p) => {
      expect(p.context?.fr.trim()).toBeTruthy();
      expect(p.context?.en.trim()).toBeTruthy();
      expect(p.takeaway?.fr.trim()).toBeTruthy();
      expect(p.takeaway?.en.trim()).toBeTruthy();
    });
  });

  it('names every cover after its own project', () => {
    mockProjects.forEach((p) => {
      expect(p.cover).toBe(`/projects/${p.id}.png`);
    });
  });

  it('either links out over https or says nothing at all', () => {
    mockProjects.forEach((p) => {
      [p.repo, p.demo].forEach((link) => {
        expect(link === '#' || link.startsWith('https://')).toBe(true);
      });
    });
  });

  it('explains itself when it has no link at all', () => {
    mockProjects
      .filter((p) => p.repo === '#' && p.demo === '#')
      .forEach((p) => {
        expect(p.linkNote?.fr.trim()).toBeTruthy();
        expect(p.linkNote?.en.trim()).toBeTruthy();
      });
  });
});

describe('cover files on disk', () => {
  // The most valuable assertion here: a typo or a forgotten export produces a
  // broken hero in production and nothing else notices.
  const publicDir = resolve(import.meta.dirname, '..', '..', 'public');
  const coverPath = (cover: string | undefined) => resolve(publicDir, String(cover).replace(/^\//, ''));

  it.each(mockProjects.map((p) => [p.id, p.cover] as const))('%s has its file', (_id, cover) => {
    expect(existsSync(coverPath(cover))).toBe(true);
  });

  it.each(mockProjects.map((p) => [p.id, p.cover] as const))('%s stays under 80 kB', (_id, cover) => {
    expect(statSync(coverPath(cover)).size).toBeLessThanOrEqual(80_000);
  });
});
