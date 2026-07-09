import type { LocalizedString, LocalizedStringArray } from '../types/lang';

export type ProjectStatus = 'live' | 'maintained' | 'archived' | 'in-progress' | 'open-source';

export interface StackItem {
  label: string;
  color: string;
}

export interface Project {
  id: string;
  emoji: string;
  monogram: string;
  accent: string;
  gradient: string;
  title: LocalizedString;
  year: string;
  status: { label: LocalizedString; type: ProjectStatus };
  stack: StackItem[];
  tags: string[];
  desc: LocalizedString;
  bullets: LocalizedStringArray;
  repo: string;
  demo: string;
  cover?: string;
  role?: LocalizedString;
}
