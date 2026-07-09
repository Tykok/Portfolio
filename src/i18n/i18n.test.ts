import en from './en';
import fr from './fr';

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
