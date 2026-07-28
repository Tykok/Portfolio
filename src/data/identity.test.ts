import { identity } from './identity';
import { socials } from './socials';

describe('identity', () => {
  it('exposes no phone number — the site is public', () => {
    expect(identity).not.toHaveProperty('phone');
    const serialized = JSON.stringify(identity);
    expect(serialized).not.toMatch(/\b0\d(?:[\s.-]?\d{2}){4}\b/);
  });

  it('has both languages filled for every localized field', () => {
    (['role', 'location', 'status', 'tagline', 'bio', 'now'] as const).forEach((key) => {
      expect(identity[key].fr.trim().length).toBeGreaterThan(0);
      expect(identity[key].en.trim().length).toBeGreaterThan(0);
    });
  });

  it('lists the same number of interests in both languages', () => {
    expect(identity.interests.fr).toHaveLength(identity.interests.en.length);
    expect(identity.interests.fr.length).toBeGreaterThan(0);
  });
});

describe('socials', () => {
  it('only lists accounts that exist', () => {
    const keys = socials.map((s) => s.key);
    expect(keys).toContain('medium');
    expect(keys).not.toContain('x');
    expect(keys).not.toContain('bluesky');
  });

  it('has unique keys and reachable hrefs', () => {
    expect(new Set(socials.map((s) => s.key)).size).toBe(socials.length);
    socials.forEach((s) => {
      expect(s.href).toMatch(/^(https:\/\/|mailto:)/);
      expect(s.desc.fr.trim().length).toBeGreaterThan(0);
      expect(s.desc.en.trim().length).toBeGreaterThan(0);
    });
  });

  it('keeps at least one primary contact', () => {
    expect(socials.filter((s) => s.primary).length).toBeGreaterThan(0);
  });
});
