import { identity } from 'data/identity';

import { contactView, cvUrl, cvView, skillsView, whoView } from './profile';

const text = (lines: { text: string }[]) => lines.map((l) => l.text).join('\n');

describe('whoView', () => {
  it('leads with the name and the English role, never the French one', () => {
    const out = text(whoView());
    expect(out).toContain(identity.name);
    expect(out).toContain(identity.role.en);
    expect(out).not.toContain(identity.role.fr);
  });

  it('carries the full bio, paragraph by paragraph', () => {
    const paragraphs = identity.bio.en.split('\n\n');
    const out = text(whoView());
    paragraphs.forEach((paragraph) => expect(out).toContain(paragraph));
  });
});

describe('skillsView', () => {
  it('groups the stack rather than dumping it', () => {
    const out = text(skillsView());
    ['Backend', 'Data', 'Front', 'Ops', 'Integrations'].forEach((group) => expect(out).toContain(group));
    expect(out).toContain('Kotlin');
    expect(out).toContain('PostgreSQL');
  });
});

describe('contactView', () => {
  it('prints every link with something to click or copy', () => {
    const out = text(contactView());
    ['Email', 'GitHub', 'LinkedIn', 'Dev.to', 'Medium'].forEach((label) => expect(out).toContain(label));
    expect(out).toContain(identity.email);
  });
});

describe('cvView', () => {
  it('reads as a résumé: experience, education, skills, languages', () => {
    const out = text(cvView());
    expect(out).toContain('EXPERIENCE');
    expect(out).toContain('EDUCATION');
    expect(out).toContain('Pictarine · Toulouse');
    expect(out).toContain('Back-End Developer');
    expect(out).toContain('IPI');
  });

  it('stays English even though the CV data is bilingual', () => {
    expect(text(cvView())).not.toContain('Développeur Back-End');
  });

  it('points at the PDF', () => {
    expect(text(cvView())).toContain('download cv');
  });
});

describe('cvUrl', () => {
  it('serves the file in the language asked for', () => {
    expect(cvUrl('fr')).toBe('/cv-elie-treport-fr.pdf');
    expect(cvUrl('en')).toBe('/cv-elie-treport-en.pdf');
  });
});
