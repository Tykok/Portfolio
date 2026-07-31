import { companies } from './companies';
import { getBadge, techBadges } from './techBadges';

describe('companies', () => {
  it('lists the four employers, most recent first', () => {
    expect(companies.map((c) => c.id)).toEqual(['pictarine', 'mecalife', 'canope', 'cegid']);
  });

  it('fills every localized field in both languages', () => {
    companies.forEach((c) => {
      (['place', 'period', 'role', 'what'] as const).forEach((key) => {
        expect(c[key].fr.trim()).not.toBe('');
        expect(c[key].en.trim()).not.toBe('');
      });
      expect(c.work.fr.length).toBeGreaterThan(0);
      expect(c.work.fr).toHaveLength(c.work.en.length);
      c.work.fr.forEach((line) => expect(line.trim()).not.toBe(''));
      c.work.en.forEach((line) => expect(line.trim()).not.toBe(''));
    });
  });

  it('gives every company a non-empty name, monogram and gradient', () => {
    companies.forEach((c) => {
      expect(c.name.trim()).not.toBe('');
      expect(c.monogram).toMatch(/^[A-Z]{2}$/);
      expect(c.gradient).toMatch(/^linear-gradient\(/);
    });
  });

  it('resolves every stack label to a registered badge, never the grey fallback', () => {
    companies.forEach((c) => {
      expect(c.stack.length).toBeGreaterThan(0);
      c.stack.forEach((tech) => {
        expect(techBadges).toHaveProperty(tech);
        expect(getBadge(tech).color).not.toBe('#7a8394');
      });
    });
  });

  it('names no partner — Elie chose not to cite them', () => {
    // A decision that lives only in a spec is one edit away from being undone.
    const serialized = JSON.stringify(companies);
    ['Walgreens', 'CVS', 'Fuji', 'Fujifilm'].forEach((partner) => {
      expect(serialized).not.toContain(partner);
    });
  });
});
