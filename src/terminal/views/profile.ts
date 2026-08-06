import { EDUCATION, EXPERIENCE, HARD_SKILLS, LANGUAGES, SOFT_SKILLS, WANTS } from 'data/cv';
import { identity } from 'data/identity';
import { socials } from 'data/socials';
import type { Lang } from 'types/lang';

import { blank, bullets, col, dim, heading, out } from '../lines';
import type { Line } from '../types';
import { TERM_LANG } from '../types';

/**
 * `skills` output, grouped so the list reads like a stack rather than a dump.
 * The categories are hand-picked (`HARD_SKILLS` is flat, with no domain of its
 * own), but the items are exactly `HARD_SKILLS`'s items, partitioned — a test
 * in `profile.test.ts` checks the two never drift apart again the way they
 * once did against the CV's hardcoded groups.
 */
export const SKILL_GROUPS: Array<[string, string[]]> = [
  ['Backend', ['Kotlin', 'Spring Boot', 'Java', 'Python', 'PHP', 'Laravel']],
  ['Data', ['PostgreSQL', 'MySQL']],
  ['Front', ['TypeScript', 'Next.js', 'React', 'Angular']],
  ['Ops & tooling', ['Docker', 'Linux', 'Bash', 'Git', 'CI/CD', 'GCP']],
  ['Integrations', ['Stripe', 'Klaviyo', 'JWT', 'OAuth2']],
];

export function whoView(): Line[] {
  return [
    ...out(`${identity.name} (${identity.alias})`),
    ...out(`${identity.role[TERM_LANG]} · ${identity.location[TERM_LANG]}`),
    ...dim(identity.tagline[TERM_LANG]),
    ...blank,
    ...out(...identity.bio[TERM_LANG].split('\n\n')),
    ...blank,
    ...out(identity.now[TERM_LANG]),
    ...out(`Status: ${identity.status[TERM_LANG]}`),
    ...dim("→ 'cv' for the full track record, 'contact' for links."),
  ];
}

export function skillsView(): Line[] {
  return [
    ...out('Stack:'),
    ...out(...SKILL_GROUPS.map(([label, techs]) => col(label, techs.join(' · '), 16))),
    ...blank,
    ...dim("Role-by-role detail lives in 'cv'."),
  ];
}

export function contactView(): Line[] {
  return [
    ...out('Links:'),
    ...out(...socials.map((social) => col(social.label, social.value, 12))),
    ...blank,
    ...dim(...socials.filter((s) => s.primary).map((s) => `  ${s.label}: ${s.href}`)),
  ];
}

export function cvView(): Line[] {
  return [
    ...out(`${identity.name} — ${identity.role[TERM_LANG]}`),
    ...dim(`${identity.location[TERM_LANG]} · ${identity.email}`),
    ...blank,
    ...heading('EXPERIENCE'),
    ...EXPERIENCE.flatMap((xp) => [
      ...out(col(xp.when[TERM_LANG], `${xp.org[TERM_LANG]} — ${xp.pos[TERM_LANG]}`, 22)),
      ...bullets(xp.bullets[TERM_LANG]),
      ...dim(`    ${xp.tags.join(' · ')}`),
      ...blank,
    ]),
    ...heading('EDUCATION'),
    ...out(...EDUCATION.map((ed) => col(ed.yr, `${ed.ti[TERM_LANG]} · ${ed.sc}`, 22))),
    ...blank,
    ...heading('SKILLS'),
    ...out(`    ${HARD_SKILLS.join(' · ')}`),
    ...out(`    ${SOFT_SKILLS[TERM_LANG].join(' · ')}`),
    ...blank,
    ...heading('LANGUAGES'),
    ...out(...LANGUAGES[TERM_LANG].map((entry) => `    ${entry}`)),
    ...blank,
    ...heading('WHAT I AM AFTER'),
    ...bullets(WANTS.map((want) => `${want.lead[TERM_LANG]} ${want.rest[TERM_LANG]}`)),
    ...blank,
    ...dim("→ 'download cv' for the PDF."),
  ];
}

/** The same files the CV window's toolbar links to. */
export function cvUrl(lang: Lang): string {
  return `/cv-elie-treport-${lang}.pdf`;
}
