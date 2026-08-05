import { identity } from 'data/identity';

import { blank, bullets, dim, out } from '../lines';
import type { Line } from '../types';
import { TERM_LANG } from '../types';

/**
 * The About window as text. Deliberately shorter than `who`: this is the
 * sidebar version — who, where, what he cares about — where `who` is the bio.
 */
export function aboutView(): Line[] {
  return [
    ...out(`${identity.name} · ${identity.role[TERM_LANG]}`),
    ...dim(`${identity.location[TERM_LANG]} · ${identity.github}`),
    ...blank,
    ...out(identity.tagline[TERM_LANG]),
    ...blank,
    ...out('  Interests:'),
    ...bullets(identity.interests[TERM_LANG]),
    ...blank,
    ...dim("→ 'who' for the long version."),
  ];
}
