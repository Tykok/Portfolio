import { mockProjects } from 'api/mock/projects.mock';

import { companies } from 'data/companies';
import { entryId } from 'data/deck';

import { consoleDeck, entryView, findEntry, projectsView } from './deck';

const text = (lines: { text: string }[]) => lines.map((l) => l.text).join('\n');

describe('consoleDeck', () => {
  it('puts the companies first, then the personal projects', () => {
    const entries = consoleDeck(mockProjects);
    expect(entries.slice(0, companies.length).every((e) => e.kind === 'company')).toBe(true);
    expect(entries).toHaveLength(companies.length + mockProjects.length);
  });

  it('drops the personal group when the projects API gave nothing', () => {
    expect(consoleDeck([]).every((e) => e.kind === 'company')).toBe(true);
  });
});

describe('projectsView', () => {
  it('lists both groups with the ids `show` takes', () => {
    const out = text(projectsView(consoleDeck(mockProjects)));
    expect(out).toContain('WORK');
    expect(out).toContain('PERSONAL PROJECTS');
    expect(out).toContain('pictarine');
    expect(out).toContain('ticoqos');
    expect(out).toContain('show <id>');
  });

  it('names each company by its role and period', () => {
    const out = text(projectsView(consoleDeck([])));
    expect(out).toContain('Oct 2022 → present');
  });
});

describe('entryView', () => {
  it('details a company: what it does, the role, the work, the stack', () => {
    const entry = consoleDeck([]).find((e) => entryId(e) === 'pictarine')!;
    const out = text(entryView(entry));
    expect(out).toContain('Pictarine');
    expect(out).toContain('Backend Engineer');
    expect(out).toContain('Stripe payments and customer account management');
    expect(out).toContain('Kotlin');
    expect(out).not.toContain('Impression photo en magasin');
  });

  it('details a project: what it is, its bullets, and where to find it', () => {
    const entry = consoleDeck(mockProjects).find((e) => entryId(e) === 'plant974')!;
    const out = text(entryView(entry));
    expect(out).toContain('Plant974');
    expect(out).toContain('FLORA OF RÉUNION');
  });

  it('prints a real repo link when there is one', () => {
    const entry = consoleDeck(mockProjects).find((e) => entryId(e) === 'plant974')!;
    expect(text(entryView(entry))).toContain('https://github.com/Tykok/Plant974');
  });

  it('says why there is no link instead of printing the # sentinel', () => {
    const entry = consoleDeck(mockProjects).find((e) => entryId(e) === 'ticoqos')!;
    const out = text(entryView(entry));
    expect(out).not.toMatch(/repo\s+#/);
    expect(out).not.toMatch(/demo\s+#/);
  });
});

describe('findEntry', () => {
  const entries = consoleDeck(mockProjects);

  it('matches an id exactly, whatever the case', () => {
    expect(findEntry(entries, 'PICTARINE')).toBeDefined();
  });

  it('matches an unambiguous prefix', () => {
    expect(entryId(findEntry(entries, 'plant')!)).toBe('plant974');
  });

  it('returns nothing for an id that matches nothing', () => {
    expect(findEntry(entries, 'nope')).toBeUndefined();
  });

  it('refuses an ambiguous prefix rather than guessing', () => {
    // 'ce' matches both the company `cegid` and the project `cedict` — the
    // only two fixture ids sharing that prefix.
    expect(findEntry(entries, 'ce')).toBeUndefined();
  });
});
