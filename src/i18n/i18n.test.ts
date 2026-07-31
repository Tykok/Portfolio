import { mockProjects } from 'api/mock/projects.mock';

import en from './en';
import fr from './fr';
import { interpolate, t } from './index';
import type { Translations } from './types';

describe('deck i18n keys', () => {
  const keys = ['p_role', 'p_prev', 'p_next'] as const;

  it.each(keys)('en defines %s', (k) => {
    expect(typeof en[k]).toBe('string');
    expect((en[k] as string).length).toBeGreaterThan(0);
  });

  it.each(keys)('fr defines %s', (k) => {
    expect(typeof fr[k]).toBe('string');
    expect((fr[k] as string).length).toBeGreaterThan(0);
  });
});

describe('locale completeness', () => {
  it('en and fr expose exactly the same keys', () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(fr).sort());
  });

  it('no locale has an empty string value', () => {
    const empties: string[] = [];
    (Object.keys(fr) as Array<keyof Translations>).forEach((k) => {
      if (typeof fr[k] === 'string' && (fr[k] as string).trim() === '') empties.push(`fr.${k}`);
      if (typeof en[k] === 'string' && (en[k] as string).trim() === '') empties.push(`en.${k}`);
    });
    expect(empties).toEqual([]);
  });

  it('keeps list-valued keys the same length across locales', () => {
    const lists = ['cal_days', 'cal_months', 'os_tips', 't_fortunes', 't_neofetch'] as const;
    lists.forEach((k) => {
      expect(en[k]).toHaveLength(fr[k].length);
      expect(fr[k].length).toBeGreaterThan(0);
    });
  });

  it('has twelve month names per locale', () => {
    expect(fr.cal_months).toHaveLength(12);
    expect(en.cal_months).toHaveLength(12);
  });

  it('has one weekday label per day, and a valid week start', () => {
    [fr, en].forEach((locale) => {
      expect(locale.cal_days).toHaveLength(7);
      expect(locale.cal_weekstart).toBeGreaterThanOrEqual(0);
      expect(locale.cal_weekstart).toBeLessThanOrEqual(6);
    });
  });

  it('states the real project count in neofetch', () => {
    [fr, en].forEach((l) => {
      const mem = l.t_neofetch.find((row) => /Mémoire|Memory/.test(row[0]));
      expect(mem?.[1]).toContain(String(mockProjects.length));
    });
  });
});

describe('interpolate', () => {
  it('substitutes named placeholders', () => {
    expect(interpolate('{n} objets', { n: 6 })).toBe('6 objets');
  });

  it('substitutes every occurrence', () => {
    expect(interpolate('{a} puis {a}', { a: 'x' })).toBe('x puis x');
  });

  it('leaves an unmatched placeholder visible', () => {
    expect(interpolate('{c} inconnu', {})).toBe('{c} inconnu');
  });

  it('returns the text untouched when no vars are given', () => {
    expect(interpolate('{c} inconnu')).toBe('{c} inconnu');
  });
});

describe('t', () => {
  it('interpolates string values', () => {
    expect(t('fr', 't_projects_l', { n: 3 })).toBe('3 projets :');
  });

  it('returns non-string values as-is', () => {
    expect(t('fr', 'cal_days')).toEqual(['lu', 'ma', 'me', 'je', 've', 'sa', 'di']);
    expect(t('fr', 'cal_weekstart')).toBe(1);
  });

  it('resolves per language', () => {
    expect(t('en', 'cv_exp')).toBe(en.cv_exp);
    expect(t('fr', 'cv_exp')).toBe(fr.cv_exp);
  });
});
