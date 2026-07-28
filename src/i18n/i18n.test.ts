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
    expect(t('fr', 'st_objs', { n: 3 })).toBe('3 objets');
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
