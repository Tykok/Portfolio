import type { Lang } from '../types/lang';

import type { Company } from './companies';
import type { Project } from './projects';

/**
 * One entry in the deck, of either kind.
 *
 * The union wraps rather than intersects: `Project` and `Company` both carry
 * `monogram`, `gradient`, `stack` and `role`, and `role` means different things
 * in each. Intersecting them would let one shape's field quietly satisfy the
 * other's; wrapping makes `kind` the only way in.
 */
export type DeckEntry = { kind: 'personal'; project: Project } | { kind: 'company'; company: Company };

/** Everything the rail needs, and nothing it does not. */
export function toRailItem(entry: DeckEntry, lang: Lang): { id: string; monogram: string; gradient: string; label: string } {
  if (entry.kind === 'company') {
    const { id, monogram, gradient, name } = entry.company;
    return { id, monogram, gradient, label: name };
  }
  const { id, monogram, gradient, title } = entry.project;
  return { id, monogram, gradient, label: title[lang] };
}
