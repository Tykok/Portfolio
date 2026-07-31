import type { Company } from './companies';
import type { DeckEntry } from './deck';
import { toRailItem } from './deck';
import type { Project } from './projects';

const project: Project = {
  id: 'p',
  emoji: '🚀',
  monogram: 'PP',
  accent: '#123456',
  gradient: 'linear-gradient(135deg,#111,#222)',
  title: { fr: 'Titre FR', en: 'Title EN' },
  year: '2024',
  status: { label: { fr: 'En prod', en: 'Live' }, type: 'live' },
  stack: ['Go'],
  desc: { fr: 'd', en: 'd' },
  bullets: { fr: ['un'], en: ['one'] },
  repo: '#',
  demo: '#',
};

const company: Company = {
  id: 'c',
  monogram: 'CC',
  gradient: 'linear-gradient(135deg,#333,#444)',
  name: 'Contoso',
  place: { fr: 'Lyon', en: 'Lyon' },
  period: { fr: 'jan. 2020', en: 'Jan 2020' },
  role: { fr: 'Rôle FR', en: 'Role EN' },
  what: { fr: 'Quoi FR', en: 'What EN' },
  work: { fr: ['a'], en: ['a'] },
  stack: ['Go'],
};

describe('toRailItem', () => {
  it('labels a personal entry with its localized title', () => {
    const entry: DeckEntry = { kind: 'personal', project };
    expect(toRailItem(entry, 'fr')).toEqual({
      id: 'p',
      monogram: 'PP',
      gradient: 'linear-gradient(135deg,#111,#222)',
      label: 'Titre FR',
    });
    expect(toRailItem(entry, 'en').label).toBe('Title EN');
  });

  it('labels a company entry with its name, which is the same in both languages', () => {
    const entry: DeckEntry = { kind: 'company', company };
    expect(toRailItem(entry, 'fr')).toEqual({
      id: 'c',
      monogram: 'CC',
      gradient: 'linear-gradient(135deg,#333,#444)',
      label: 'Contoso',
    });
    expect(toRailItem(entry, 'en').label).toBe('Contoso');
  });
});
