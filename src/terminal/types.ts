import type { DesktopTheme } from 'context/OSContext';
import type { Article } from 'data/articles';
import type { Project } from 'data/projects';
import type { AppKey } from 'types/app';
import type { Lang } from 'types/lang';

/**
 * The terminal speaks English, chrome and data alike — a shell whose help is
 * translated but whose data comes from a mixed pool reads as neither language
 * done well. Views index localized data with this, never with the OS language.
 */
export const TERM_LANG: Lang = 'en';

export type TerminalMode = 'window' | 'console';

export interface Line {
  type: 'prompt' | 'output' | 'error' | 'dim';
  text: string;
}

export interface CommandResult {
  lines: Line[];
  /** Wipe the log before printing `lines` — `clear`'s whole job. */
  clear?: boolean;
}

/**
 * Everything a command can do to the world outside the log. The mode-dependent
 * half of the terminal lives here, so the command list itself never forks.
 */
export interface TerminalHost {
  mode: TerminalMode;
  /** Window mode: a real window. Console mode: unused — the view runs instead. */
  openApp: (key: AppKey) => void;
  triggerBsod: () => void;
  setTheme: (theme: DesktopTheme | 'next') => void;
  setLang: (lang: Lang) => void;
  /** Fetches a file — the résumé PDF. */
  openUrl: (url: string) => void;
  /** Console only: leave the shell for the desktop, the login screen, or off. */
  gui?: () => void;
  logout?: () => void;
  shutdown?: () => void;
}

/** Async portfolio data, with the loading and error states the views must show. */
export interface TerminalData {
  projects: Project[];
  projectsLoading: boolean;
  projectsError: boolean;
  articles: Article[];
  articlesLoading: boolean;
  articlesError: boolean;
}

export interface TerminalCtx {
  host: TerminalHost;
  data: TerminalData;
  /** The OS language. Only `lang` and `download cv` may read it. */
  lang: Lang;
}

export type CommandGroup = 'navigation' | 'profile' | 'system' | 'fun';

export interface Command {
  name: string;
  aliases?: string[];
  group: CommandGroup;
  /** Argument shape as help prints it — '' for a command that takes none. */
  usage: string;
  summary: string;
  /** Extra paragraphs for `help <command>`. */
  detail?: string[];
  example?: string;
  /** Absent means both modes. */
  modes?: TerminalMode[];
  /** Kept out of help's groups — the easter eggs. */
  hidden?: boolean;
  run: (ctx: TerminalCtx, arg: string) => CommandResult;
}
