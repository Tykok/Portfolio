import type { LocalizedString, LocalizedStringArray } from '../types/lang';

export type ProjectStatus = 'live' | 'maintained' | 'archived' | 'in-progress' | 'open-source';

export interface Project {
  id: string;
  emoji: string;
  monogram: string;
  accent: string;
  gradient: string;
  title: LocalizedString;
  year: string;
  status: { label: LocalizedString; type: ProjectStatus };
  /** Technology labels. Rendered through `getBadge`, which owns the colour. */
  stack: string[];
  desc: LocalizedString;
  bullets: LocalizedStringArray;
  repo: string;
  demo: string;
  cover?: string;
  /** The problem the project existed to solve. */
  context?: LocalizedString;
  /** One sentence on what building it taught. */
  takeaway?: LocalizedString;
  /** Why this project has no link, in its own words. Falls back to `p_no_public_code`. */
  linkNote?: LocalizedString;
  role?: LocalizedString;
}
