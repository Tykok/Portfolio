# Two Profiles, One Command Engine — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `root — Console` login profile that boots into a full-screen text portfolio, and move the terminal's command engine into `src/terminal/` so the windowed terminal and the console run the same commands.

**Architecture:** Commands become data in a registry, executed by a pure `runCommand(raw, ctx)` that returns `Line[]`. Per-mode behaviour lives in a `TerminalHost` the component supplies, not in forks of the command list. Views are pure functions from portfolio data to `Line[]`. A React hook (`useTerminal`) owns log, input, history and Tab completion for both UIs.

**Tech Stack:** React 19, TypeScript 5.9 (strict), Vite 6, Vitest 4 + Testing Library, plain CSS in `src/styles/os.css`. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-08-04-console-profile-design.md`

## Global Constraints

- **No new dependencies.** Everything here is React + TypeScript already in `package.json`.
- **The terminal is English-only**, chrome and data alike. Views read localized data at `'en'` via the exported `TERM_LANG` constant, never via `useLang().lang`. The only exception is `download cv`, which serves a file and follows the OS language.
- **OS chrome stays bilingual.** Any new login/desktop string gets a key in `i18n/types.ts`, `i18n/fr.ts` **and** `i18n/en.ts`. Terminal strings get no keys at all.
- **`Line` keeps its shape** — `{ type: 'prompt' | 'output' | 'error' | 'dim'; text: string }` — so the existing `.os-term .line/.pr/.pa/.er/.dim` rules in `src/styles/os.css:623-631` apply to both terminals unchanged.
- **Slug vocabulary is the English `AppKey`** (`about`, `web`, `projects`, `cv`, `contact`, `terminal`, `articles`), plus the new `console` hash segment. Never a localized slug.
- **Before every commit:** `npm run typecheck && npm run lint && npm test` must pass. `tsconfig` is strict; `eslint` enforces `simple-import-sort`, so keep import blocks sorted (external, then absolute `components/…`/`context/…`/`data/…`, then relative).
- **Imports are path-mapped** (`vite-tsconfig-paths`): `context/LangContext`, `data/identity`, `types/app` — no `../../..` chains except inside a directory (`./types`, `./lines`).
- **Commits** are Conventional Commits, one per task, subject ≤ 50 chars.
- Node ≥ 20.14, npm 10.9.4.

---

## File Structure

**Created:**

| Path | Responsibility |
| --- | --- |
| `src/terminal/types.ts` | `Line`, `TerminalMode`, `TerminalHost`, `TerminalData`, `TerminalCtx`, `Command`, `CommandResult`, `TERM_LANG` |
| `src/terminal/lines.ts` | `out`, `dim`, `err`, `blank`, `col` — the only place output formatting lives |
| `src/terminal/registry.ts` | `COMMANDS: Command[]`, `GROUP_LABELS` — every command, declared as data |
| `src/terminal/run.ts` | `runCommand`, `findCommand`, `visibleIn`, `complete` — pure, no React |
| `src/terminal/useTerminal.ts` | the shared React hook: log, input, history, Tab, autoscroll, intro |
| `src/terminal/views/profile.ts` | `whoView`, `skillsView`, `contactView`, `cvView` |
| `src/terminal/views/deck.ts` | `consoleDeck`, `projectsView`, `entryView` |
| `src/terminal/views/articles.ts` | `articlesView` |
| `src/terminal/views/about.ts` | `aboutView` |
| `src/terminal/views/fun.ts` | `NEOFETCH`, `FORTUNES`, `LOGO`, `cowsay` |
| `src/data/cv.ts` | `EXPERIENCE`, `EDUCATION`, `HARD_SKILLS`, `SOFT_SKILLS`, `LANGUAGES`, `WANTS` — extracted from `Cv.tsx` so both the window and `cvView` read one source |
| `src/components/OS/Console/Console.tsx` | full-screen console shell: banner, auto-help, no TaskBar |
| Tests | `src/terminal/run.test.ts`, `src/terminal/views/*.test.ts`, `src/components/OS/Login/Login.test.tsx`, `src/components/OS/Console/Console.test.tsx`, `src/components/apps/Terminal/Terminal.test.tsx` |

**Modified:**

| Path | Change |
| --- | --- |
| `src/components/apps/Terminal/Terminal.tsx` | 296 lines → ~45: `useTerminal({ host })` plus rendering |
| `src/components/apps/Cv/Cv.tsx` | imports its data from `data/cv` instead of declaring it |
| `src/components/OS/Login/Login.tsx` | two profile tiles, arrow-key navigation, `onLogin(profile)` |
| `src/Main.tsx` | `Phase` gains `'console'`; console host; `#/console` deep link |
| `src/routing/route.ts` | `Route.console`, parse/format/compare |
| `src/context/RouteContext.tsx` | `setRouteConsole` |
| `src/i18n/types.ts`, `fr.ts`, `en.ts` | drop the 43 `t_*` keys; add the login profile keys |
| `src/i18n/i18n.test.ts` | drop the three terminal assertions (lines 37, 59, 85) |
| `src/styles/os.css` | `.os-console` block; a second login tile |
| `src/Main.test.tsx` | `#/console` deep link, `gui` back to the desktop, console tile from login |

---

### Task 1: Terminal core — types, runner, `help`, `clear`

Sets the contract every later task plugs into: a pure runner over a data registry, with `help` generated from that registry so help can never drift from behaviour.

**Files:**
- Create: `src/terminal/types.ts`
- Create: `src/terminal/lines.ts`
- Create: `src/terminal/registry.ts`
- Create: `src/terminal/run.ts`
- Test: `src/terminal/run.test.ts`

**Interfaces:**
- Consumes: `AppKey` from `types/app`, `Lang` from `types/lang`, `DesktopTheme` from `context/OSContext`, `Project` from `data/projects`, `Article` from `data/articles`.
- Produces: everything later tasks build on —
  - `type TerminalMode = 'window' | 'console'`
  - `interface Line { type: 'prompt' | 'output' | 'error' | 'dim'; text: string }`
  - `interface CommandResult { lines: Line[]; clear?: boolean }`
  - `interface TerminalHost` (fields listed in the code below)
  - `interface TerminalData { projects; projectsLoading; projectsError; articles; articlesLoading; articlesError }`
  - `interface TerminalCtx { host: TerminalHost; data: TerminalData; lang: Lang }`
  - `interface Command { name; aliases?; group; usage; summary; detail?; example?; modes?; hidden?; run(ctx, arg): CommandResult }`
  - `const TERM_LANG: Lang = 'en'`
  - `out(...t): Line[]`, `dim(...t): Line[]`, `err(t): Line[]`, `blank: Line[]`, `col(left, right, width?): string`
  - `COMMANDS: Command[]`, `GROUP_LABELS: Record<CommandGroup, string>`
  - `runCommand(raw, ctx): CommandResult`, `findCommand(name, mode): Command | undefined`, `visibleIn(mode): Command[]`, `complete(partial, ctx): string[]`

- [ ] **Step 1: Write the failing test**

Create `src/terminal/run.test.ts`:

```ts
import { mockProjects } from 'api/mock/projects.mock';
import { vi } from 'vitest';

import { runCommand, visibleIn } from './run';
import type { TerminalCtx, TerminalHost, TerminalMode } from './types';

/** A host whose every call is observable, so tests assert effects, not prose. */
export function makeHost(mode: TerminalMode): TerminalHost {
  return {
    mode,
    openApp: vi.fn(),
    triggerBsod: vi.fn(),
    setTheme: vi.fn(),
    setLang: vi.fn(),
    openUrl: vi.fn(),
    gui: vi.fn(),
    logout: vi.fn(),
    shutdown: vi.fn(),
  };
}

export function makeCtx(mode: TerminalMode = 'console', over: Partial<TerminalCtx['data']> = {}): TerminalCtx {
  return {
    host: makeHost(mode),
    lang: 'fr',
    data: {
      projects: mockProjects,
      projectsLoading: false,
      projectsError: false,
      articles: [],
      articlesLoading: false,
      articlesError: false,
      ...over,
    },
  };
}

/** The rendered log, so assertions read like the screen does. */
export const text = (result: { lines: { text: string }[] }) => result.lines.map((l) => l.text).join('\n');

describe('runCommand', () => {
  it('echoes the command it was given, prompt included', () => {
    const result = runCommand('help', makeCtx());
    expect(result.lines[0]).toEqual({ type: 'prompt', text: 'C:\\> help' });
  });

  it('echoes an empty line without complaining', () => {
    const result = runCommand('   ', makeCtx());
    expect(result.lines).toHaveLength(1);
    expect(result.lines[0].type).toBe('prompt');
  });

  it('reports an unknown command as an error, pointing at help', () => {
    const result = runCommand('rm -rf /', makeCtx());
    expect(result.lines.some((l) => l.type === 'error')).toBe(true);
    expect(text(result)).toContain("Type 'help'");
  });

  it('resolves a command through its alias', () => {
    expect(text(runCommand('?', makeCtx()))).toContain('SYSTEM');
  });

  /* Only the system group has members at this point — the navigation, profile
     and fun groups arrive with their commands in Tasks 2-5, and each asserts
     its own heading there. An empty group prints nothing at all. */
  it('groups help under a heading, and shows a usage column', () => {
    const out = text(runCommand('help', makeCtx()));
    expect(out).toContain('SYSTEM');
    expect(out).toContain('help <command>');
  });

  it('details a single command on request, with its aliases and an example', () => {
    const out = text(runCommand('help clear', makeCtx()));
    expect(out).toContain('clear');
    expect(out).toContain('cls');
    expect(out).not.toContain('SYSTEM');
  });

  it('says so when asked to detail something that is not a command', () => {
    expect(runCommand('help nope', makeCtx()).lines.some((l) => l.type === 'error')).toBe(true);
  });

  it('clear wipes the log instead of appending to it', () => {
    const result = runCommand('clear', makeCtx());
    expect(result.clear).toBe(true);
    expect(result.lines).toEqual([]);
  });

  it('keeps every non-hidden command reachable from help', () => {
    const out = text(runCommand('help', makeCtx()));
    visibleIn('console')
      .filter((c) => !c.hidden)
      .forEach((c) => expect(out).toContain(c.name));
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run src/terminal/run.test.ts`
Expected: FAIL — `Failed to resolve import "./run"`.

- [ ] **Step 3: Write `src/terminal/types.ts`**

```ts
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
```

- [ ] **Step 4: Write `src/terminal/lines.ts`**

```ts
import type { Line } from './types';

export const out = (...texts: string[]): Line[] => texts.map((text) => ({ type: 'output', text }));
export const dim = (...texts: string[]): Line[] => texts.map((text) => ({ type: 'dim', text }));
export const err = (text: string): Line[] => [{ type: 'error', text }];

/** One blank spacer. Dim rather than output so it never picks up a colour. */
export const blank: Line[] = [{ type: 'dim', text: '' }];

/** Two columns without a table. Long left cells push their right cell over. */
export const col = (left: string, right: string, width = 22): string => `  ${left.padEnd(width)}${right}`;

/** A group heading, padded out to a fixed rule so the sections line up. */
export const heading = (label: string): Line[] => out(`  ── ${label} ${'─'.repeat(Math.max(0, 44 - label.length))}`);

/** Bullets, indented under whatever printed them. */
export const bullets = (items: string[]): Line[] => out(...items.map((item) => `    • ${item}`));
```

- [ ] **Step 5: Write `src/terminal/registry.ts` with `help` and `clear`**

Later tasks append to `COMMANDS`; nothing else in this file changes.

```ts
import { blank, col, dim, err, heading, out } from './lines';
import type { Command, CommandGroup, CommandResult, TerminalCtx } from './types';

export const GROUP_LABELS: Record<CommandGroup, string> = {
  navigation: 'NAVIGATION',
  profile: 'PROFILE',
  system: 'SYSTEM',
  fun: 'FUN',
};

const GROUP_ORDER: CommandGroup[] = ['navigation', 'profile', 'system', 'fun'];

/** `name usage`, as help's left column prints it. */
function signature(command: Command): string {
  return command.usage ? `${command.name} ${command.usage}` : command.name;
}

function helpAll(ctx: TerminalCtx): CommandResult {
  const shown = COMMANDS.filter((c) => !c.hidden && (!c.modes || c.modes.includes(ctx.host.mode)));
  const lines = GROUP_ORDER.flatMap((group) => {
    const members = shown.filter((c) => c.group === group);
    if (members.length === 0) return [];
    return [...heading(GROUP_LABELS[group]), ...out(...members.map((c) => col(signature(c), c.summary, 26)))];
  });

  return {
    lines: [
      ...out('This portfolio, as a command line. Everything the desktop shows is readable here.'),
      ...blank,
      ...lines,
      ...blank,
      ...dim("Some commands are not listed. `help <command>` details any of them."),
    ],
  };
}

function helpOne(name: string): CommandResult {
  const command = COMMANDS.find((c) => c.name === name || c.aliases?.includes(name));
  if (!command) return { lines: err(`No such command: ${name}. Type 'help' for the list.`) };

  return {
    lines: [
      ...out(`  ${signature(command)}`),
      ...out(`  ${command.summary}`),
      ...(command.aliases?.length ? dim(`  aliases: ${command.aliases.join(', ')}`) : []),
      ...(command.detail?.length ? [...blank, ...out(...command.detail.map((line) => `  ${line}`))] : []),
      ...(command.example ? [...blank, ...dim(`  e.g. ${command.example}`)] : []),
    ],
  };
}

export const COMMANDS: Command[] = [
  {
    name: 'help',
    aliases: ['?', 'man'],
    group: 'system',
    usage: '<command>',
    summary: 'this help, or one command in detail',
    example: 'help show',
    run: (ctx, arg) => (arg.trim() ? helpOne(arg.trim().toLowerCase()) : helpAll(ctx)),
  },
  {
    name: 'clear',
    aliases: ['cls'],
    group: 'system',
    usage: '',
    summary: 'clear the screen',
    run: () => ({ lines: [], clear: true }),
  },
];
```

- [ ] **Step 6: Write `src/terminal/run.ts`**

```ts
import { blank, err } from './lines';
import { COMMANDS } from './registry';
import type { Command, CommandResult, Line, TerminalCtx, TerminalMode } from './types';

const PROMPT = 'C:\\> ';

/** The commands a given mode admits — what help lists and what resolves. */
export function visibleIn(mode: TerminalMode): Command[] {
  return COMMANDS.filter((command) => !command.modes || command.modes.includes(mode));
}

export function findCommand(name: string, mode: TerminalMode): Command | undefined {
  return visibleIn(mode).find((command) => command.name === name || command.aliases?.includes(name));
}

/**
 * One line in, the lines it produced out. Pure: every effect goes through
 * `ctx.host`, which is what lets the whole command surface be tested without
 * rendering anything.
 *
 * Only the command name is lowercased. Arguments keep their case, because
 * `cowsay Hello` should not come back shouting in lowercase.
 */
export function runCommand(raw: string, ctx: TerminalCtx): CommandResult {
  const echo: Line[] = [{ type: 'prompt', text: `${PROMPT}${raw}` }];
  const trimmed = raw.trim();
  if (!trimmed) return { lines: echo };

  const [base, ...rest] = trimmed.split(/\s+/);
  const command = findCommand(base.toLowerCase(), ctx.host.mode);
  if (!command) {
    return { lines: [...echo, ...err(`'${trimmed}' is not recognized. Type 'help'.`), ...blank] };
  }

  const result = command.run(ctx, rest.join(' '));
  if (result.clear) return result;
  return { lines: [...echo, ...result.lines, ...blank] };
}

/** Tab completion: command names, plus the ids `show` takes. Filled in Task 3. */
export function complete(partial: string, ctx: TerminalCtx): string[] {
  const word = partial.trimStart().toLowerCase();
  if (!word) return [];
  return visibleIn(ctx.host.mode)
    .filter((command) => command.name.startsWith(word))
    .map((command) => command.name);
}
```

- [ ] **Step 7: Run the tests**

Run: `npx vitest run src/terminal/run.test.ts`
Expected: PASS, 10 tests.

- [ ] **Step 8: Typecheck and lint**

Run: `npm run typecheck && npm run lint`
Expected: no output from either beyond success.

- [ ] **Step 9: Commit**

```bash
git add src/terminal
git commit -m "feat(term): a pure command runner over a registry"
```

---

### Task 2: Profile commands — `who`, `skills`, `contact`, `cv`, `download cv`

The résumé has to read as text without a second copy of the résumé, so `Cv.tsx`'s module constants move to `src/data/cv.ts` first and both consumers read them.

**Files:**
- Create: `src/data/cv.ts`
- Modify: `src/components/apps/Cv/Cv.tsx:1-191` (delete the constants, import them)
- Create: `src/terminal/views/profile.ts`
- Modify: `src/terminal/registry.ts` (append four commands)
- Test: `src/terminal/views/profile.test.ts`

**Interfaces:**
- Consumes: `TERM_LANG`, `Line`, `TerminalCtx` (Task 1); `identity` from `data/identity`; `socials` from `data/socials`.
- Produces:
  - `src/data/cv.ts` exports `interface CvExperience { org: LocalizedString; pos: LocalizedString; when: LocalizedString; bullets: LocalizedStringArray; tags: string[] }`, `interface CvEducation { yr: string; ti: LocalizedString; sc: string }`, `interface CvWant { lead: LocalizedString; rest: LocalizedString }`, and the values `EXPERIENCE: CvExperience[]`, `EDUCATION: CvEducation[]`, `HARD_SKILLS: string[]`, `SOFT_SKILLS: LocalizedStringArray`, `LANGUAGES: LocalizedStringArray`, `WANTS: CvWant[]`.
  - `src/terminal/views/profile.ts` exports `whoView(): Line[]`, `skillsView(): Line[]`, `contactView(): Line[]`, `cvView(): Line[]`, `cvUrl(lang: Lang): string`.

- [ ] **Step 1: Write the failing test**

Create `src/terminal/views/profile.test.ts`:

```ts
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
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run src/terminal/views/profile.test.ts`
Expected: FAIL — `Failed to resolve import "./profile"`.

- [ ] **Step 3: Extract the CV data into `src/data/cv.ts`**

Move the six constants out of `src/components/apps/Cv/Cv.tsx:6-191` **verbatim** — no wording changes, this is a move — and give them exported types:

```ts
import type { LocalizedString, LocalizedStringArray } from '../types/lang';

export interface CvExperience {
  org: LocalizedString;
  pos: LocalizedString;
  when: LocalizedString;
  bullets: LocalizedStringArray;
  /** Technology labels, rendered through `getBadge` in the window. */
  tags: string[];
}

export interface CvEducation {
  yr: string;
  ti: LocalizedString;
  /** School name — not localized. */
  sc: string;
}

export interface CvWant {
  lead: LocalizedString;
  rest: LocalizedString;
}

export const EXPERIENCE: CvExperience[] = [
  /* …the four entries currently in Cv.tsx, unchanged, comments included… */
];

export const EDUCATION: CvEducation[] = [
  /* …the five entries currently in Cv.tsx, unchanged… */
];

export const HARD_SKILLS: string[] = [
  /* …the sixteen labels currently in Cv.tsx, unchanged… */
];

export const SOFT_SKILLS: LocalizedStringArray = {
  /* …unchanged… */
};

export const LANGUAGES: LocalizedStringArray = {
  /* …unchanged… */
};

export const WANTS: CvWant[] = [
  /* …the three entries currently in Cv.tsx, unchanged… */
];
```

Then in `Cv.tsx`, delete lines 6-191 and add the import beside the existing ones:

```ts
import { EDUCATION, EXPERIENCE, HARD_SKILLS, LANGUAGES, SOFT_SKILLS, WANTS } from 'data/cv';
```

`Cv.tsx` no longer needs `LocalizedString`/`LocalizedStringArray` from `types/lang` unless its remaining body uses them — if the import goes unused, `npm run lint` will say so; remove it then.

- [ ] **Step 4: Verify the CV window is untouched**

Run: `npx vitest run src/components/apps/Cv/Cv.test.tsx`
Expected: PASS, unchanged — the extraction is behaviour-neutral, and this suite is the proof.

- [ ] **Step 5: Write `src/terminal/views/profile.ts`**

```ts
import { EDUCATION, EXPERIENCE, HARD_SKILLS, LANGUAGES, SOFT_SKILLS, WANTS } from 'data/cv';
import { identity } from 'data/identity';
import { socials } from 'data/socials';
import type { Lang } from 'types/lang';

import { blank, bullets, col, dim, heading, out } from '../lines';
import type { Line } from '../types';
import { TERM_LANG } from '../types';

/** `skills` output, grouped so the list reads like a stack rather than a dump. */
const SKILL_GROUPS: Array<[string, string[]]> = [
  ['Backend', ['Kotlin', 'Spring Boot', 'Java / JEE', 'Python']],
  ['Data', ['PostgreSQL', 'MySQL']],
  ['Front', ['TypeScript', 'Next.js', 'React', 'Angular']],
  ['Ops & tooling', ['Docker', 'Linux', 'Bash', 'Git', 'CI/CD', 'GCP']],
  ['Integrations', ['Stripe', 'Klaviyo', 'JWT / OAuth2']],
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
```

- [ ] **Step 6: Append the commands to `src/terminal/registry.ts`**

Add to the imports:

```ts
import { contactView, cvUrl, cvView, skillsView, whoView } from './views/profile';
```

And to `COMMANDS`, before the `help` entry (order in the array is help's order within a group):

```ts
  {
    name: 'who',
    aliases: ['whoami', 'about'],
    group: 'profile',
    usage: '',
    summary: 'who I am, at length',
    run: () => ({ lines: whoView() }),
  },
  {
    name: 'skills',
    aliases: ['stack'],
    group: 'profile',
    usage: '',
    summary: 'my stack, by domain',
    run: () => ({ lines: skillsView() }),
  },
  {
    name: 'contact',
    aliases: ['links'],
    group: 'profile',
    usage: '',
    summary: 'every way to reach me',
    run: () => ({ lines: contactView() }),
  },
  {
    name: 'cv',
    aliases: ['resume'],
    group: 'profile',
    usage: '',
    summary: 'my résumé, as text',
    detail: ['In the desktop terminal this also opens the CV window.', "`download cv` fetches the PDF."],
    run: (ctx) => {
      if (ctx.host.mode === 'window') ctx.host.openApp('cv');
      return { lines: cvView() };
    },
  },
  {
    name: 'download',
    group: 'profile',
    usage: 'cv [fr|en]',
    summary: 'fetch the résumé PDF',
    detail: ['Defaults to the language the desktop is in — the file is not part of the English-only terminal.'],
    example: 'download cv fr',
    run: (ctx, arg) => {
      const [what, asked] = arg.toLowerCase().split(/\s+/);
      if (what !== 'cv') return { lines: err("Only 'download cv' is on offer. Try `download cv en`.") };
      const lang = asked === 'fr' || asked === 'en' ? asked : ctx.lang;
      ctx.host.openUrl(cvUrl(lang));
      return { lines: dim(`Fetching ${cvUrl(lang)}…`) };
    },
  },
```

- [ ] **Step 7: Extend `run.test.ts` for the two host-touching commands**

Append to `src/terminal/run.test.ts`:

```ts
describe('profile commands', () => {
  it('opens the CV window as well as printing it, but only on the desktop', () => {
    const windowed = makeCtx('window');
    runCommand('cv', windowed);
    expect(windowed.host.openApp).toHaveBeenCalledWith('cv');

    const console_ = makeCtx('console');
    runCommand('cv', console_);
    expect(console_.host.openApp).not.toHaveBeenCalled();
  });

  it('downloads the résumé in the OS language, and in an explicit one', () => {
    const ctx = makeCtx('console');
    runCommand('download cv', ctx); // ctx.lang is 'fr'
    expect(ctx.host.openUrl).toHaveBeenCalledWith('/cv-elie-treport-fr.pdf');
    runCommand('download cv en', ctx);
    expect(ctx.host.openUrl).toHaveBeenCalledWith('/cv-elie-treport-en.pdf');
  });

  it('refuses to download anything else', () => {
    expect(runCommand('download wallpaper', makeCtx()).lines.some((l) => l.type === 'error')).toBe(true);
  });
});
```

- [ ] **Step 8: Run the whole suite**

Run: `npm test`
Expected: PASS — the new files, plus every existing suite including `Cv.test.tsx`.

- [ ] **Step 9: Typecheck, lint, commit**

```bash
npm run typecheck && npm run lint
git add src/data/cv.ts src/components/apps/Cv/Cv.tsx src/terminal
git commit -m "feat(term): who, skills, contact and a text résumé"
```

---

### Task 3: Deck views — `ls` / `projects` and `show <id>`

**Files:**
- Create: `src/terminal/views/deck.ts`
- Modify: `src/terminal/registry.ts` (two commands), `src/terminal/run.ts` (`complete` learns ids)
- Test: `src/terminal/views/deck.test.ts`

**Interfaces:**
- Consumes: `DeckEntry` and `entryId` from `data/deck`, `companies` from `data/companies`, `Project` from `data/projects`, plus Task 1's helpers.
- Produces: `consoleDeck(projects: Project[]): DeckEntry[]`, `projectsView(entries: DeckEntry[]): Line[]`, `entryView(entry: DeckEntry): Line[]`, `findEntry(entries: DeckEntry[], id: string): DeckEntry | undefined`.

- [ ] **Step 1: Write the failing test**

Create `src/terminal/views/deck.test.ts`:

```ts
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
    expect(out).toContain('flora of Réunion');
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
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run src/terminal/views/deck.test.ts`
Expected: FAIL — `Failed to resolve import "./deck"`.

- [ ] **Step 3: Write `src/terminal/views/deck.ts`**

```ts
import { companies } from 'data/companies';
import { type DeckEntry, entryId } from 'data/deck';
import type { Project } from 'data/projects';

import { blank, bullets, col, dim, heading, out } from '../lines';
import type { Line } from '../types';
import { TERM_LANG } from '../types';

/**
 * The console's deck, in the order a reader wants it: paid work first, side
 * projects after. Mirrors the window's own composition rule — an empty or
 * failed projects fetch drops that group rather than the whole deck.
 */
export function consoleDeck(projects: Project[]): DeckEntry[] {
  return [
    ...companies.map((company) => ({ kind: 'company' as const, company })),
    ...projects.map((project) => ({ kind: 'personal' as const, project })),
  ];
}

export function findEntry(entries: DeckEntry[], id: string): DeckEntry | undefined {
  const wanted = id.trim().toLowerCase();
  if (!wanted) return undefined;
  const exact = entries.find((entry) => entryId(entry) === wanted);
  if (exact) return exact;
  const prefixed = entries.filter((entry) => entryId(entry).startsWith(wanted));
  return prefixed.length === 1 ? prefixed[0] : undefined;
}

export function projectsView(entries: DeckEntry[]): Line[] {
  const work = entries.filter((entry) => entry.kind === 'company');
  const personal = entries.filter((entry) => entry.kind === 'personal');

  return [
    ...(work.length
      ? [
          ...heading(`WORK — ${work.length}`),
          ...out(
            ...work.map((entry) =>
              entry.kind === 'company'
                ? col(entry.company.id, `${entry.company.name} · ${entry.company.period[TERM_LANG]}`, 16)
                : '',
            ),
          ),
        ]
      : []),
    ...(personal.length ? [...blank, ...heading(`PERSONAL PROJECTS — ${personal.length}`)] : []),
    ...out(
      ...personal.map((entry) =>
        entry.kind === 'personal' ? col(entry.project.id, `${entry.project.emoji}  ${entry.project.title[TERM_LANG]}`, 16) : '',
      ),
    ),
    ...blank,
    ...dim('→ `show <id>` for any of them.'),
  ];
}

export function entryView(entry: DeckEntry): Line[] {
  if (entry.kind === 'company') {
    const { name, role, place, period, what, work, stack } = entry.company;
    return [
      ...out(`${name.toUpperCase()} — ${period[TERM_LANG]}`),
      ...dim(place[TERM_LANG]),
      ...blank,
      ...out(what[TERM_LANG]),
      ...blank,
      ...out(role[TERM_LANG]),
      ...blank,
      ...out('  What I worked on:'),
      ...bullets(work[TERM_LANG]),
      ...blank,
      ...dim(`  Stack: ${stack.join(' · ')}`),
      ...dim('→ `ls` for the list, `cv` for the résumé.'),
    ];
  }

  const { emoji, title, year, status, desc, bullets: items, stack, repo, demo, context, takeaway, linkNote } = entry.project;
  return [
    ...out(`${emoji}  ${title[TERM_LANG].toUpperCase()} — ${year}`),
    ...dim(`${status.label[TERM_LANG]} · ${stack.join(' · ')}`),
    ...blank,
    ...(context ? [...out(context[TERM_LANG]), ...blank] : []),
    ...out(desc[TERM_LANG]),
    ...blank,
    ...bullets(items[TERM_LANG]),
    ...blank,
    ...(takeaway ? dim(`  Took away: ${takeaway[TERM_LANG]}`) : []),
    ...(repo ? out(col('  repo', repo, 10)) : []),
    ...(demo ? out(col('  demo', demo, 10)) : []),
    ...(!repo && !demo ? dim(`  ${linkNote?.[TERM_LANG] ?? 'No public code for this one.'}`) : []),
    ...dim('→ `ls` for the list.'),
  ];
}
```

- [ ] **Step 4: Append the commands to `src/terminal/registry.ts`**

Imports:

```ts
import { consoleDeck, entryView, findEntry, projectsView } from './views/deck';
```

Commands, at the top of `COMMANDS` so they lead the navigation group:

```ts
  {
    name: 'projects',
    aliases: ['ls', 'work'],
    group: 'navigation',
    usage: '',
    summary: 'the whole deck: employers, then side projects',
    run: (ctx) => {
      if (ctx.data.projectsLoading) return { lines: dim('Loading projects…') };
      const entries = consoleDeck(ctx.data.projectsError ? [] : ctx.data.projects);
      const notice = ctx.data.projectsError ? dim('The projects API is unreachable — companies only.') : [];
      return { lines: [...notice, ...projectsView(entries)] };
    },
  },
  {
    name: 'show',
    aliases: ['cat', 'open-entry'],
    group: 'navigation',
    usage: '<id>',
    summary: 'one entry in full',
    detail: ['Ids come from `ls`. An unambiguous prefix is enough — `show plant` finds plant974.'],
    example: 'show pictarine',
    run: (ctx, arg) => {
      if (!arg.trim()) return { lines: err('Which one? `show <id>` — run `ls` for the ids.') };
      const entries = consoleDeck(ctx.data.projectsError ? [] : ctx.data.projects);
      const entry = findEntry(entries, arg);
      if (!entry) return { lines: err(`No entry called '${arg.trim()}'. Run \`ls\` for the ids.`) };
      return { lines: entryView(entry) };
    },
  },
```

- [ ] **Step 5: Teach `complete` the entry ids**

In `src/terminal/run.ts`, replace `complete` with:

```ts
/**
 * Tab completion. A bare word completes command names; the argument of a
 * command that takes an id completes the ids, because those are the only words
 * in this shell nobody can be expected to remember.
 */
export function complete(partial: string, ctx: TerminalCtx): string[] {
  const [base, ...rest] = partial.trimStart().split(/\s+/);
  const word = base.toLowerCase();

  if (rest.length === 0) {
    if (!word) return [];
    return visibleIn(ctx.host.mode)
      .filter((command) => command.name.startsWith(word))
      .map((command) => command.name);
  }

  const command = findCommand(word, ctx.host.mode);
  if (!command || (command.name !== 'show' && command.name !== 'help')) return [];

  const arg = rest.join(' ').toLowerCase();
  if (command.name === 'help') {
    return visibleIn(ctx.host.mode)
      .filter((c) => c.name.startsWith(arg))
      .map((c) => `help ${c.name}`);
  }

  return consoleDeck(ctx.data.projectsError ? [] : ctx.data.projects)
    .map((entry) => entryId(entry))
    .filter((id) => id.startsWith(arg))
    .map((id) => `show ${id}`);
}
```

Add its imports to `run.ts`:

```ts
import { entryId } from 'data/deck';

import { consoleDeck } from './views/deck';
```

- [ ] **Step 6: Extend `run.test.ts` for the navigation commands and completion**

```ts
import { complete } from './run';

describe('navigation commands', () => {
  it('says it is loading rather than claiming an empty deck', () => {
    const out = text(runCommand('ls', makeCtx('console', { projects: [], projectsLoading: true })));
    expect(out).toContain('Loading');
  });

  it('keeps the companies when the projects API fails, and says so', () => {
    const out = text(runCommand('ls', makeCtx('console', { projects: [], projectsError: true })));
    expect(out).toContain('unreachable');
    expect(out).toContain('pictarine');
  });

  it('asks which entry when show is given nothing', () => {
    expect(runCommand('show', makeCtx()).lines.some((l) => l.type === 'error')).toBe(true);
  });

  it('shows an entry by prefix', () => {
    expect(text(runCommand('show plant', makeCtx()))).toContain('Plant974');
  });
});

describe('complete', () => {
  it('completes command names', () => {
    expect(complete('sk', makeCtx())).toContain('skills');
  });

  it('completes entry ids behind show', () => {
    expect(complete('show pic', makeCtx())).toEqual(['show pictarine']);
  });

  it('completes command names behind help', () => {
    expect(complete('help cle', makeCtx())).toEqual(['help clear']);
  });

  it('offers nothing for a word that matches nothing', () => {
    expect(complete('zzz', makeCtx())).toEqual([]);
  });
});
```

- [ ] **Step 7: Run the suite, typecheck, lint**

Run: `npx vitest run src/terminal && npm run typecheck && npm run lint`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/terminal
git commit -m "feat(term): browse the deck with ls and show"
```

---

### Task 4: `articles`, `open <app>`, and the About text

**Files:**
- Create: `src/terminal/views/articles.ts`, `src/terminal/views/about.ts`
- Modify: `src/terminal/registry.ts`
- Test: `src/terminal/views/articles.test.ts`

**Interfaces:**
- Consumes: `Article` from `data/articles`, `identity` from `data/identity`, `appsMeta` from `data/apps`.
- Produces: `articlesView(articles: Article[], loading: boolean, failed: boolean): Line[]`, `aboutView(): Line[]`, `APP_SLUGS: AppKey[]`.

- [ ] **Step 1: Write the failing test**

Create `src/terminal/views/articles.test.ts`:

```ts
import type { Article } from 'data/articles';

import { articlesView } from './articles';

const text = (lines: { text: string }[]) => lines.map((l) => l.text).join('\n');

const ARTICLE: Article = {
  id: 1,
  title: 'Kotlin coroutines, without the folklore',
  description: 'What suspend actually does.',
  url: 'https://dev.to/tykok/coroutines',
  publishedAt: '2026-03-04T08:00:00Z',
  readingMinutes: 7,
  reactions: 42,
  comments: 3,
  tags: ['kotlin', 'concurrency'],
};

describe('articlesView', () => {
  it('lists each post with its URL and reading time', () => {
    const out = text(articlesView([ARTICLE], false, false));
    expect(out).toContain(ARTICLE.title);
    expect(out).toContain(ARTICLE.url);
    expect(out).toContain('7 min');
  });

  it('says it is loading rather than claiming there are none', () => {
    expect(text(articlesView([], true, false))).toContain('Loading');
  });

  it('names the failure when dev.to is unreachable', () => {
    const out = text(articlesView([], false, true));
    expect(out).toContain('dev.to');
    expect(out).toContain('dev.to/tykok');
  });

  it('handles an empty but successful fetch', () => {
    expect(text(articlesView([], false, false))).toContain('No articles');
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run src/terminal/views/articles.test.ts`
Expected: FAIL — unresolved import.

- [ ] **Step 3: Write `src/terminal/views/articles.ts`**

```ts
import type { Article } from 'data/articles';

import { blank, col, dim, out } from '../lines';
import type { Line } from '../types';

/** `2026-03-04`, from dev.to's ISO timestamp — no locale in an English shell. */
const day = (iso: string): string => iso.slice(0, 10);

export function articlesView(articles: Article[], loading: boolean, failed: boolean): Line[] {
  if (loading) return dim('Loading articles from dev.to…');
  if (failed) return [...out('dev.to is unreachable from here.'), ...dim('The posts live at dev.to/tykok.')];
  if (articles.length === 0) return [...out('No articles came back.'), ...dim('They live at dev.to/tykok.')];

  return [
    ...out(`ARTICLES — ${articles.length}`),
    ...blank,
    ...articles.flatMap((article) => [
      ...out(`  ${article.title}`),
      ...dim(col('', `${day(article.publishedAt)} · ${article.readingMinutes} min · ${article.reactions} reactions`, 2)),
      ...dim(`    ${article.url}`),
    ]),
    ...blank,
    ...dim('→ `open articles` in the desktop terminal opens the reader.'),
  ];
}
```

- [ ] **Step 4: Write `src/terminal/views/about.ts`**

```ts
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
```

- [ ] **Step 5: Append `articles` and `open` to the registry**

Imports:

```ts
import { appsMeta } from 'data/apps';
import type { AppKey } from 'types/app';

import { aboutView } from './views/about';
import { articlesView } from './views/articles';
```

Commands, in the navigation group after `show`:

```ts
  {
    name: 'articles',
    aliases: ['posts', 'blog'],
    group: 'navigation',
    usage: '',
    summary: 'my dev.to posts',
    run: (ctx) => ({ lines: articlesView(ctx.data.articles, ctx.data.articlesLoading, ctx.data.articlesError) }),
  },
  {
    name: 'open',
    group: 'navigation',
    usage: '<app>',
    summary: 'an app — as a window on the desktop, as text here',
    detail: [`Apps: ${appsMeta.map((app) => app.key).join(' | ')}.`, 'In the console there are no windows, so the app prints instead.'],
    example: 'open articles',
    run: (ctx, arg) => {
      const wanted = arg.trim().toLowerCase();
      if (!wanted) return { lines: err(`Which app? ${appsMeta.map((app) => app.key).join(' | ')}`) };
      if (!appsMeta.some((app) => app.key === wanted)) {
        return { lines: err(`Unknown app: ${wanted}. Try ${appsMeta.map((app) => app.key).join(' | ')}.`) };
      }

      const key = wanted as AppKey;
      if (ctx.host.mode === 'window') {
        ctx.host.openApp(key);
        return { lines: dim(`Opening ${key}…`) };
      }

      switch (key) {
        case 'projects':
          return COMMANDS.find((c) => c.name === 'projects')!.run(ctx, '');
        case 'articles':
          return COMMANDS.find((c) => c.name === 'articles')!.run(ctx, '');
        case 'cv':
          return COMMANDS.find((c) => c.name === 'cv')!.run(ctx, '');
        case 'contact':
          return COMMANDS.find((c) => c.name === 'contact')!.run(ctx, '');
        case 'about':
          return { lines: aboutView() };
        case 'terminal':
          return { lines: dim('You are already in it.') };
        case 'web':
          return {
            lines: [...out('The portfolio page is the desktop version of everything here.'), ...dim('→ `gui` for it, or `ls` to stay.')],
          };
      }
    },
  },
```

- [ ] **Step 6: Extend `run.test.ts`**

```ts
describe('open', () => {
  it('opens a real window on the desktop', () => {
    const ctx = makeCtx('window');
    runCommand('open articles', ctx);
    expect(ctx.host.openApp).toHaveBeenCalledWith('articles');
  });

  it('prints the app instead of opening it in the console', () => {
    const ctx = makeCtx('console');
    const out = text(runCommand('open projects', ctx));
    expect(ctx.host.openApp).not.toHaveBeenCalled();
    expect(out).toContain('PERSONAL PROJECTS');
  });

  it('prints the About text in the console', () => {
    expect(text(runCommand('open about', makeCtx('console')))).toContain('Interests');
  });

  it('rejects an app that does not exist, and lists the ones that do', () => {
    const result = runCommand('open media', makeCtx());
    expect(result.lines.some((l) => l.type === 'error')).toBe(true);
    expect(text(result)).toContain('projects');
  });

  it('asks which app when given none', () => {
    expect(runCommand('open', makeCtx()).lines.some((l) => l.type === 'error')).toBe(true);
  });
});
```

- [ ] **Step 7: Run, typecheck, lint, commit**

```bash
npx vitest run src/terminal && npm run typecheck && npm run lint
git add src/terminal
git commit -m "feat(term): articles, About text and dual-mode open"
```

---

### Task 5: System and fun commands

Completes the surface: `gui`, `exit`, `logout`, `shutdown`, `theme`, `lang`, and the ten easter eggs the current terminal already has — ported to English strings, since the `t_*` keys go away in Task 6.

**Files:**
- Create: `src/terminal/views/fun.ts`
- Modify: `src/terminal/registry.ts`
- Test: `src/terminal/run.test.ts` (append)

**Interfaces:**
- Consumes: `DesktopTheme` from `context/OSContext`.
- Produces: `LOGO: string[]`, `NEOFETCH: Array<[string, string]>`, `FORTUNES: string[]`, `cowsay(message: string): Line[]`, `VALID_THEMES: DesktopTheme[]`.

- [ ] **Step 1: Write the failing test (append to `src/terminal/run.test.ts`)**

```ts
describe('system commands', () => {
  it('crosses to the desktop from the console', () => {
    const ctx = makeCtx('console');
    runCommand('gui', ctx);
    expect(ctx.host.gui).toHaveBeenCalled();
  });

  it('has no gui to offer in the windowed terminal', () => {
    const ctx = makeCtx('window');
    expect(runCommand('gui', ctx).lines.some((l) => l.type === 'error')).toBe(true);
    expect(ctx.host.gui).not.toHaveBeenCalled();
  });

  /* The mode filter, now that there is a console-only command to filter. */
  it('lists gui in the console help and nowhere else', () => {
    expect(text(runCommand('help', makeCtx('console')))).toContain('gui');
    expect(text(runCommand('help', makeCtx('window')))).not.toContain('gui');
  });

  it('advertises every group once its commands exist', () => {
    const out = text(runCommand('help', makeCtx('console')));
    ['NAVIGATION', 'PROFILE', 'SYSTEM', 'FUN'].forEach((group) => expect(out).toContain(group));
  });

  it('exit leaves the shell in the console, and jokes in a window', () => {
    const console_ = makeCtx('console');
    runCommand('exit', console_);
    expect(console_.host.gui).toHaveBeenCalled();

    const windowed = makeCtx('window');
    runCommand('exit', windowed);
    expect(text(runCommand('exit', windowed))).toContain('close the window');
  });

  it('logs off and shuts down from the console only', () => {
    const ctx = makeCtx('console');
    runCommand('logout', ctx);
    runCommand('shutdown', ctx);
    expect(ctx.host.logout).toHaveBeenCalled();
    expect(ctx.host.shutdown).toHaveBeenCalled();
    expect(runCommand('shutdown', makeCtx('window')).lines.some((l) => l.type === 'error')).toBe(true);
  });

  it('sets a theme by name, cycles with next, and refuses nonsense', () => {
    const ctx = makeCtx();
    runCommand('theme matrix', ctx);
    expect(ctx.host.setTheme).toHaveBeenCalledWith('matrix');
    runCommand('theme next', ctx);
    expect(ctx.host.setTheme).toHaveBeenCalledWith('next');
    expect(runCommand('theme mauve', ctx).lines.some((l) => l.type === 'error')).toBe(true);
  });

  it('switches the OS language while staying English itself', () => {
    const ctx = makeCtx();
    const out = text(runCommand('lang fr', ctx));
    expect(ctx.host.setLang).toHaveBeenCalledWith('fr');
    expect(out).toContain('desktop');
  });

  it('rejects a language it does not have', () => {
    expect(runCommand('lang de', makeCtx()).lines.some((l) => l.type === 'error')).toBe(true);
  });
});

describe('fun commands', () => {
  it('blue-screens on demand, through the host', () => {
    const ctx = makeCtx();
    runCommand('crash', ctx);
    expect(ctx.host.triggerBsod).toHaveBeenCalled();
  });

  it('keeps the case of what cowsay is given', () => {
    expect(text(runCommand('cowsay Hello There', makeCtx()))).toContain('Hello There');
  });

  it('keeps the eggs out of the help listing', () => {
    const out = text(runCommand('help', makeCtx()));
    expect(out).not.toContain('cocorico');
    expect(text(runCommand('cocorico', makeCtx()))).toContain('🐓');
  });

  it('still answers the classic', () => {
    expect(text(runCommand('sudo make me a sandwich', makeCtx()))).toContain('sandwich');
    expect(runCommand('sudo rm', makeCtx()).lines.some((l) => l.type === 'error')).toBe(true);
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run src/terminal/run.test.ts`
Expected: FAIL — `'gui' is not recognized`, and the rest.

- [ ] **Step 3: Write `src/terminal/views/fun.ts`**

Port the strings from `src/i18n/en.ts:167-202` — the English side of the keys that Task 6 deletes.

```ts
import type { DesktopTheme } from 'context/OSContext';

import { out } from '../lines';
import type { Line } from '../types';

export const VALID_THEMES: DesktopTheme[] = ['bliss', 'field', 'dusk', 'matrix', 'rose'];

export const LOGO: string[] = [
  '   _____ _  __  ___  ____  __ __',
  '  |_   _|  \\/  |/ _ \\/ __ \\/ _ \\',
  '    | | | |\\/| | (_) \\__ \\> <',
  '    |_| |_|  |_|\\___/____/_/_\\_\\',
];

export const NEOFETCH: Array<[string, string]> = [
  ['user', 'tykok@ticoqos'],
  ['OS', 'TicoqOS 1.0 (Luna)'],
  ['Kernel', 'Coq-6.51.77'],
  ['Uptime', '∞ coffees'],
  ['Shell', 'ticoq-sh'],
  ['Resolution', 'nostalgia × pride'],
  ['CPU', 'Backend Core i∞'],
  ['Memory', '8 projects / 1 developer'],
];

export const FORTUNES: string[] = [
  /* …the entries from `t_fortunes` in src/i18n/en.ts, verbatim… */
];

export function cowsay(message: string): Line[] {
  const rule = '-'.repeat(message.length + 2);
  return out(`  ${rule}`, `< ${message} >`, `  ${rule}`, '     \\   🐓', '      \\      ^^');
}
```

- [ ] **Step 4: Append the commands to `src/terminal/registry.ts`**

Imports:

```ts
import type { DesktopTheme } from 'context/OSContext';
import type { Lang } from 'types/lang';

import { cowsay, FORTUNES, LOGO, NEOFETCH, VALID_THEMES } from './views/fun';
```

System group (after `help`, before `clear`):

```ts
  {
    name: 'gui',
    aliases: ['startx', 'desktop'],
    group: 'system',
    usage: '',
    summary: 'leave the console for the graphical desktop',
    modes: ['console'],
    run: (ctx) => {
      ctx.host.gui?.();
      return { lines: dim('Starting the graphical environment…') };
    },
  },
  {
    name: 'exit',
    aliases: ['quit'],
    group: 'system',
    usage: '',
    summary: 'end the session',
    run: (ctx) => {
      if (ctx.host.mode === 'console') {
        ctx.host.gui?.();
        return { lines: dim('Leaving the console…') };
      }
      return { lines: out("You don't just quit TicoqOS. 😉 (close the window if you insist)") };
    },
  },
  {
    name: 'logout',
    aliases: ['logoff'],
    group: 'system',
    usage: '',
    summary: 'back to the login screen',
    modes: ['console'],
    run: (ctx) => {
      ctx.host.logout?.();
      return { lines: dim('Logging off…') };
    },
  },
  {
    name: 'shutdown',
    aliases: ['poweroff', 'halt'],
    group: 'system',
    usage: '',
    summary: 'turn the machine off',
    modes: ['console'],
    run: (ctx) => {
      ctx.host.shutdown?.();
      return { lines: dim('Shutting down…') };
    },
  },
  {
    name: 'theme',
    group: 'system',
    usage: '<name>',
    summary: `desktop theme: ${VALID_THEMES.join(' | ')} | next`,
    example: 'theme matrix',
    run: (ctx, arg) => {
      const wanted = arg.trim().toLowerCase();
      if (!wanted) return { lines: dim(`Themes: ${VALID_THEMES.join(' · ')} · next`) };
      if (wanted !== 'next' && !(VALID_THEMES as string[]).includes(wanted)) {
        return { lines: err(`Unknown theme: ${wanted}. Themes: ${VALID_THEMES.join(' · ')} · next.`) };
      }
      ctx.host.setTheme(wanted === 'next' ? 'next' : (wanted as DesktopTheme));
      return { lines: out(`Theme → ${wanted}.`) };
    },
  },
  {
    name: 'lang',
    group: 'system',
    usage: 'fr|en',
    summary: 'language of the desktop and its windows',
    detail: ['The terminal itself is English only — this changes the desktop, the windows and the start menu.'],
    example: 'lang en',
    run: (ctx, arg) => {
      const wanted = arg.trim().toLowerCase();
      if (wanted !== 'fr' && wanted !== 'en') return { lines: err("Two languages here: 'lang fr' or 'lang en'.") };
      ctx.host.setLang(wanted as Lang);
      return { lines: out(`The desktop now speaks ${wanted === 'fr' ? 'French' : 'English'}. This shell stays English.`) };
    },
  },
```

Fun group — `neofetch` and `cowsay` listed, the rest hidden:

```ts
  {
    name: 'neofetch',
    aliases: ['fetch'],
    group: 'fun',
    usage: '',
    summary: 'the machine, as it likes to present itself',
    run: () => ({ lines: [...out(...LOGO), ...blank, ...out(...NEOFETCH.map(([k, v]) => col(k, v, 14)))] }),
  },
  {
    name: 'cowsay',
    group: 'fun',
    usage: '<message>',
    summary: 'a rooster says what you tell it',
    example: 'cowsay ship it',
    run: (_ctx, arg) => ({ lines: cowsay(arg.trim() || "Cock-a-doodle-doo! Type 'cowsay your message'.") }),
  },
  {
    name: 'fortune',
    group: 'fun',
    usage: '',
    summary: 'a developer proverb',
    run: () => ({ lines: dim(`"${FORTUNES[Math.floor(Math.random() * FORTUNES.length)]}"`) }),
  },
  {
    name: 'coffee',
    group: 'fun',
    usage: '',
    summary: 'fuel',
    hidden: true,
    run: () => ({ lines: out('☕  coffee served. Happy coding.') }),
  },
  {
    name: 'cocorico',
    group: 'fun',
    usage: '',
    summary: 'the house greeting',
    hidden: true,
    run: () => ({ lines: out('🐓  Cock-a-doodle-doo! TicoqOS salutes you.') }),
  },
  {
    name: 'matrix',
    group: 'fun',
    usage: '',
    summary: 'wake up',
    hidden: true,
    run: () => ({ lines: dim('…wake up, Neo. (Ctrl-C to leave the matrix)') }),
  },
  {
    name: 'konami',
    group: 'fun',
    usage: '',
    summary: 'a timeless classic',
    hidden: true,
    run: () => ({ lines: out('🎮 ↑ ↑ ↓ ↓ ← → ← → B A. Type it on the keyboard, not here…') }),
  },
  {
    name: 'easter',
    aliases: ['egg'],
    group: 'fun',
    usage: '',
    summary: 'you found it',
    hidden: true,
    run: () => ({
      lines: [
        ...out('🥚 Easter egg found! You really read terminals, respect.'),
        ...dim("Hint: try 'coffee', 'matrix', 'fortune'… and 'crash' (if you dare)."),
      ],
    }),
  },
  {
    name: 'sudo',
    group: 'fun',
    usage: '<anything>',
    summary: 'nice try',
    hidden: true,
    run: (_ctx, arg) => {
      const asked = arg.trim().toLowerCase().replace(/!$/, '');
      if (asked === 'make me a sandwich') {
        return { lines: out('🥪 Fine. *hands you a sandwich*  (xkcd 149, still relevant)') };
      }
      return { lines: err('Nope. You are not root on MY portfolio 😏') };
    },
  },
  {
    name: 'crash',
    group: 'fun',
    usage: '',
    summary: 'a blue screen, on request',
    hidden: true,
    run: (ctx) => {
      ctx.host.triggerBsod();
      return { lines: err('⚠ Simulated fatal error… preparing the blue screen.') };
    },
  },
```

Note on `crash`: the old terminal delayed the BSOD by 800 ms with `setTimeout` inside the component. The delay belongs to the host, not the pure runner — `Main.tsx` wires `triggerBsod` with the delay in Task 9, and the tests assert the host was called.

- [ ] **Step 5: Run, typecheck, lint**

Run: `npx vitest run src/terminal && npm run typecheck && npm run lint`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/terminal
git commit -m "feat(term): system commands and the easter eggs"
```

---

### Task 6: `useTerminal`, the windowed terminal on top of it, and the i18n cleanup

The engine now covers everything the old component did. This task swaps the component over, removes the 43 `t_*` keys, and proves the windowed terminal still behaves.

**Files:**
- Create: `src/terminal/useTerminal.ts`
- Rewrite: `src/components/apps/Terminal/Terminal.tsx`
- Create: `src/components/apps/Terminal/Terminal.test.tsx`
- Modify: `src/i18n/types.ts:134-176` (delete the `t_*` block), `src/i18n/fr.ts:140-202`, `src/i18n/en.ts:140-202` (delete the `// Terminal` blocks, from `t_b1` through the end of `t_fortunes`)
- Modify: `src/i18n/i18n.test.ts:37,59,85`

**Interfaces:**
- Consumes: `runCommand`, `complete` (Tasks 1–5); `useLang`, `useOS`, `useProjects`, `useArticles`, `useWindowContext`.
- Produces: `useTerminal(options: UseTerminalOptions): TerminalUi`, where

```ts
export interface UseTerminalOptions {
  host: TerminalHost;
  /** Printed once, before the first prompt. The console's banner and help. */
  intro?: (ctx: TerminalCtx) => Line[];
}

export interface TerminalUi {
  lines: Line[];
  input: string;
  setInput: (value: string) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  logRef: React.RefObject<HTMLDivElement | null>;
  inputRef: React.RefObject<HTMLInputElement | null>;
  focus: () => void;
}
```

- [ ] **Step 1: Write the failing test**

Create `src/components/apps/Terminal/Terminal.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockProjects } from 'api/mock/projects.mock';
import type * as articlesApi from 'api/articles';
import { getArticles } from 'api/articles';
import type * as projectsApi from 'api/projects';
import { getProjects } from 'api/projects';
import { vi } from 'vitest';

import { ArticlesProvider } from 'context/ArticlesContext';
import { LangProvider } from 'context/LangContext';
import { OSProvider } from 'context/OSContext';
import { ProjectsProvider } from 'context/ProjectsContext';
import { WindowProvider } from 'context/WindowContext';

import { Terminal } from './Terminal';

vi.mock('api/projects', async (importOriginal) => ({
  ...(await importOriginal<typeof projectsApi>()),
  getProjects: vi.fn(),
}));
vi.mock('api/articles', async (importOriginal) => ({
  ...(await importOriginal<typeof articlesApi>()),
  getArticles: vi.fn(),
}));

function renderTerminal() {
  return render(
    <LangProvider>
      <WindowProvider>
        <OSProvider>
          <ProjectsProvider>
            <ArticlesProvider>
              <Terminal />
            </ArticlesProvider>
          </ProjectsProvider>
        </OSProvider>
      </WindowProvider>
    </LangProvider>,
  );
}

async function type(command: string) {
  const input = screen.getByRole('textbox');
  await userEvent.type(input, `${command}{Enter}`);
}

describe('the windowed terminal', () => {
  beforeEach(() => {
    vi.mocked(getProjects).mockResolvedValue(mockProjects);
    vi.mocked(getArticles).mockResolvedValue([]);
    localStorage.clear();
  });

  it('greets in English and points at help', () => {
    renderTerminal();
    expect(screen.getByText(/Type 'help' for commands/)).toBeInTheDocument();
  });

  it('runs the shared registry — grouped help, no gui line', async () => {
    renderTerminal();
    await type('help');
    expect(screen.getByText(/NAVIGATION/)).toBeInTheDocument();
    expect(screen.queryByText(/leave the console/)).not.toBeInTheDocument();
  });

  it('stays English on a French desktop', async () => {
    localStorage.setItem('ticoq.lang', 'fr');
    renderTerminal();
    await type('who');
    expect(screen.getByText(/Kotlin Backend Developer/)).toBeInTheDocument();
  });

  it('recalls the last command with the up arrow', async () => {
    renderTerminal();
    await type('skills');
    const input = screen.getByRole('textbox');
    await userEvent.type(input, '{ArrowUp}');
    expect(input).toHaveValue('skills');
  });

  it('completes a command name on Tab', async () => {
    renderTerminal();
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'neo{Tab}');
    expect(input).toHaveValue('neofetch');
  });

  it('clears the log', async () => {
    renderTerminal();
    await type('skills');
    expect(screen.getByText(/Stack:/)).toBeInTheDocument();
    await type('clear');
    expect(screen.queryByText(/Stack:/)).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run src/components/apps/Terminal/Terminal.test.tsx`
Expected: FAIL — the greeting comes from `t_b2` in the visitor's language, `help` is ungrouped, Tab does nothing.

- [ ] **Step 3: Write `src/terminal/useTerminal.ts`**

```ts
import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useArticles } from 'context/ArticlesContext';
import { useProjects } from 'context/ProjectsContext';
import { useLang } from 'context/LangContext';

import { complete, runCommand } from './run';
import type { Line, TerminalCtx, TerminalHost } from './types';

export interface UseTerminalOptions {
  host: TerminalHost;
  /** Printed once, before the first prompt. */
  intro?: (ctx: TerminalCtx) => Line[];
}

export interface TerminalUi {
  lines: Line[];
  input: string;
  setInput: (value: string) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  logRef: React.RefObject<HTMLDivElement | null>;
  inputRef: React.RefObject<HTMLInputElement | null>;
  focus: () => void;
}

const HISTORY_LIMIT = 50;

/**
 * Everything both terminals share: the log, the input, the history, Tab
 * completion and the autoscroll. The commands themselves live in the registry,
 * and everything mode-specific arrives through `host`.
 */
export function useTerminal({ host, intro }: UseTerminalOptions): TerminalUi {
  const { lang, setLang } = useLang();
  const projects = useProjects();
  const articles = useArticles();

  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const ctx = useMemo<TerminalCtx>(
    () => ({
      host,
      lang,
      data: {
        projects: projects.data,
        projectsLoading: projects.loading,
        projectsError: projects.error !== null,
        articles: articles.data,
        articlesLoading: articles.loading,
        articlesError: articles.error !== null,
      },
    }),
    [host, lang, projects.data, projects.loading, projects.error, articles.data, articles.loading, articles.error],
  );

  /* The intro reads the context, and the context changes as the fetches land.
     A ref keeps the effect from replaying the banner every time that happens. */
  const ctxRef = useRef(ctx);
  ctxRef.current = ctx;
  const introduced = useRef(false);
  useEffect(() => {
    if (introduced.current || !intro) return;
    introduced.current = true;
    setLines(intro(ctxRef.current));
  }, [intro]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [lines]);

  const submit = useCallback(
    (raw: string) => {
      const result = runCommand(raw, ctxRef.current);
      setLines((prev) => (result.clear ? result.lines : [...prev, ...result.lines]));
      if (raw.trim()) {
        setHistory((prev) => [raw, ...prev.slice(0, HISTORY_LIMIT - 1)]);
      }
      setHistIdx(-1);
    },
    [],
  );

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        submit(input);
        setInput('');
        return;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        const next = Math.min(histIdx + 1, history.length - 1);
        setHistIdx(next);
        setInput(history[next] ?? '');
        return;
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        const next = Math.max(histIdx - 1, -1);
        setHistIdx(next);
        setInput(next === -1 ? '' : (history[next] ?? ''));
        return;
      }

      /* Tab: one candidate completes, several print. Never the browser's own
         focus move — there is one input on this screen. */
      if (event.key === 'Tab') {
        event.preventDefault();
        const candidates = complete(input, ctxRef.current);
        if (candidates.length === 1) setInput(candidates[0]);
        else if (candidates.length > 1) setLines((prev) => [...prev, { type: 'dim', text: `  ${candidates.join('   ')}` }]);
      }
    },
    [input, history, histIdx, submit],
  );

  const focus = useCallback(() => inputRef.current?.focus(), []);

  return { lines, input, setInput, onKeyDown, logRef, inputRef, focus };
}

/**
 * The class a line renders with. Both shells share it, because they differ in
 * their frame, not in their lines — the CSS at os.css:625-629 owns the colours.
 */
export function lineClass(line: Line): string {
  if (line.type === 'error') return 'line er';
  if (line.type === 'dim') return 'line dim';
  if (line.type === 'prompt') return 'line pa';
  return 'line';
}
```

The file ends there. Each shell builds its own `TerminalHost` from `useLang().setLang`, `useOS()` and `useWindowContext()` — the hook does not build it for them, because what the host does is exactly what differs between the two.

- [ ] **Step 4: Rewrite `src/components/apps/Terminal/Terminal.tsx`**

```tsx
import { useMemo } from 'react';

import { useLang } from 'context/LangContext';
import { useOS } from 'context/OSContext';
import { useWindowContext } from 'context/WindowContext';
import { blank, dim, out } from 'terminal/lines';
import type { TerminalCtx, TerminalHost } from 'terminal/types';
import { lineClass, useTerminal } from 'terminal/useTerminal';

/** The banner the DOS-era terminal has always opened with. */
const intro = (_ctx: TerminalCtx) => [
  ...out('TicoqOS [Version 5.1.2003] — Backend Edition'),
  ...out('(c) Elie "Tykok" Treport. Type \'help\' for commands.'),
  ...blank,
];

export function Terminal() {
  const { setLang } = useLang();
  const { openApp } = useWindowContext();
  const { triggerBsod, setTheme } = useOS();

  const host = useMemo<TerminalHost>(
    () => ({
      mode: 'window',
      openApp,
      setTheme,
      setLang,
      /* The old terminal printed its warning, then blue-screened 800ms later.
         The pause is presentation, so it lives here rather than in the runner. */
      triggerBsod: () => setTimeout(triggerBsod, 800),
      openUrl: (url) => window.open(url, '_blank', 'noopener'),
    }),
    [openApp, setTheme, setLang, triggerBsod],
  );

  const { lines, input, setInput, onKeyDown, logRef, inputRef, focus } = useTerminal({ host, intro });

  return (
    <div className="os-term" onClick={focus} style={{ cursor: 'text', minHeight: '100%' }}>
      <div ref={logRef} style={{ overflow: 'auto', maxHeight: 'calc(100% - 28px)' }}>
        {lines.map((line, i) => (
          <div key={i} className={lineClass(line)}>
            {line.text}
          </div>
        ))}
      </div>

      <div className="os-term-row">
        <span className="pr">C:\&gt;</span>
        <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={onKeyDown} spellCheck={false} autoComplete="off" autoFocus />
      </div>
    </div>
  );
}
```

`dim` is imported but unused in the snippet above — remove it, `npm run lint` will flag it otherwise.

- [ ] **Step 5: Delete the `t_*` keys**

- `src/i18n/types.ts`: remove the block from `t_b1: string;` through `t_fortunes: string[];` inclusive, plus its `// Terminal` comment.
- `src/i18n/fr.ts` and `src/i18n/en.ts`: remove the matching blocks, from `t_b1:` through the end of the `t_fortunes` array.
- `src/i18n/i18n.test.ts:37`: drop `'t_fortunes'` and `'t_neofetch'` from the `lists` tuple.
- `src/i18n/i18n.test.ts:55-62`: delete the test that reads `l.t_neofetch` for the memory row.
- `src/i18n/i18n.test.ts:85`: replace the `t_projects_l` interpolation assertion with one on a key that survives and takes a variable — grep for a remaining `{` placeholder (`npm run typecheck` will point at any key that no longer exists):

```ts
    expect(t('fr', 'w_close')).toBeTruthy();
```

If no surviving key interpolates, delete that assertion rather than inventing a key: `interpolate` is already covered directly in the same file.

- [ ] **Step 6: Run everything**

Run: `npm test`
Expected: PASS, including the new `Terminal.test.tsx` and the trimmed `i18n.test.ts`.

- [ ] **Step 7: Typecheck, lint, commit**

```bash
npm run typecheck && npm run lint
git add src/terminal src/components/apps/Terminal src/i18n
git commit -m "refactor(term): one engine, and an English-only shell"
```

---

### Task 7: `#/console` in the address bar

**Files:**
- Modify: `src/routing/route.ts:11-51`
- Modify: `src/context/RouteContext.tsx:7-59`
- Test: `src/routing/route.test.ts` (append)

**Interfaces:**
- Produces: `Route` gains `console?: true`; `RouteContextValue` gains `setRouteConsole: (on: boolean) => void`.

- [ ] **Step 1: Write the failing test (append to `src/routing/route.test.ts`)**

```ts
describe('the console profile', () => {
  it('reads #/console as the console, with no app', () => {
    expect(parseHash('#/console')).toEqual({ app: null, console: true });
  });

  it('ignores anything after it — a shell has no page to restore', () => {
    expect(parseHash('#/console/projects/pictarine')).toEqual({ app: null, console: true });
  });

  it('round-trips', () => {
    expect(formatRoute({ app: null, console: true })).toBe('#/console');
    expect(parseHash(formatRoute({ app: null, console: true }))).toEqual({ app: null, console: true });
  });

  it('is not the same route as the bare desktop', () => {
    expect(sameRoute({ app: null }, { app: null, console: true })).toBe(false);
  });

  it('is never confused with an app, because no app is called console', () => {
    expect(parseHash('#/console').app).toBeNull();
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run src/routing/route.test.ts`
Expected: FAIL — `parseHash('#/console')` returns `EMPTY_ROUTE`.

- [ ] **Step 3: Modify `src/routing/route.ts`**

```ts
export interface Route {
  app: AppKey | null;
  slide?: string;
  /**
   * The console profile. Mutually exclusive with `app`: the hash names the
   * mode, and a shell has no page state worth restoring from a URL.
   */
  console?: true;
}

const CONSOLE_SEGMENT = 'console';

export function parseHash(hash: string): Route {
  const [first, slide] = hash.replace(/^#\/?/, '').split('/');
  if (first === CONSOLE_SEGMENT) return { app: null, console: true };
  if (!first || !isAppKey(first)) return EMPTY_ROUTE;
  if (slide && SLIDE_PATTERN.test(slide)) return { app: first, slide };
  return { app: first };
}

export function formatRoute(route: Route): string {
  if (route.console) return `#/${CONSOLE_SEGMENT}`;
  if (!route.app) return '#/';
  return route.slide ? `#/${route.app}/${route.slide}` : `#/${route.app}`;
}

export function sameRoute(a: Route, b: Route): boolean {
  return a.app === b.app && (a.slide ?? null) === (b.slide ?? null) && (a.console ?? false) === (b.console ?? false);
}
```

Guard the vocabulary: `console` must never collide with an `AppKey`. Add to the same file, under `APP_KEYS`:

```ts
/* `console` is a profile, not an app. If one is ever added under that key the
   hash becomes ambiguous, so fail loudly here rather than mysteriously there. */
if (APP_KEYS.has(CONSOLE_SEGMENT)) {
  throw new Error('An app named "console" would collide with the console profile hash.');
}
```

- [ ] **Step 4: Add `setRouteConsole` to `src/context/RouteContext.tsx`**

In the interface:

```ts
  /** Entering or leaving the console profile — the hash names the mode. */
  setRouteConsole: (on: boolean) => void;
```

In the provider, beside `setRouteApp`:

```ts
  const setRouteConsole = useCallback((on: boolean) => {
    setRoute((prev) => (Boolean(prev.console) === on ? prev : on ? { app: null, console: true } : EMPTY_ROUTE));
  }, []);
```

Add it to the default context value (`setRouteConsole: () => {}`) and to the `useMemo` value and its dependency list.

- [ ] **Step 5: Run, typecheck, lint, commit**

```bash
npx vitest run src/routing src/context && npm run typecheck && npm run lint
git add src/routing src/context
git commit -m "feat(os): #/console names the console profile"
```

---

### Task 8: Two profiles on the login screen

**Files:**
- Modify: `src/components/OS/Login/Login.tsx`
- Modify: `src/i18n/types.ts`, `src/i18n/fr.ts`, `src/i18n/en.ts` (three new keys, both languages)
- Modify: `src/styles/os.css:69-84` (tile list spacing)
- Test: `src/components/OS/Login/Login.test.tsx`

**Interfaces:**
- Produces: `export type LoginProfile = 'desktop' | 'console'` and `Login({ onLogin }: { onLogin: (profile: LoginProfile) => void })`.
- New i18n keys: `login_role_console`, `login_hint_profiles`, `login_console_name`.

- [ ] **Step 1: Write the failing test**

Create `src/components/OS/Login/Login.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { LangProvider } from 'context/LangContext';
import { identity } from 'data/identity';
import en from 'i18n/en';

import { Login } from './Login';

function renderLogin() {
  const onLogin = vi.fn();
  render(
    <LangProvider>
      <Login onLogin={onLogin} />
    </LangProvider>,
  );
  return onLogin;
}

describe('the login screen', () => {
  beforeEach(() => localStorage.setItem('ticoq.lang', 'en'));

  it('offers both profiles', () => {
    renderLogin();
    expect(screen.getByRole('button', { name: new RegExp(identity.name) })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /root/ })).toBeInTheDocument();
  });

  it('names what each profile leads to', () => {
    renderLogin();
    expect(screen.getByText(en.login_role)).toBeInTheDocument();
    expect(screen.getByText(en.login_role_console)).toBeInTheDocument();
  });

  it('opens the desktop from the first tile', async () => {
    const onLogin = renderLogin();
    await userEvent.click(screen.getByRole('button', { name: new RegExp(identity.name) }));
    expect(onLogin).toHaveBeenCalledWith('desktop');
  });

  it('opens the console from the second', async () => {
    const onLogin = renderLogin();
    await userEvent.click(screen.getByRole('button', { name: /root/ }));
    expect(onLogin).toHaveBeenCalledWith('console');
  });

  it('is drivable from the keyboard: arrows move, Enter picks', async () => {
    const onLogin = renderLogin();
    const tiles = screen.getAllByRole('button');
    tiles[0].focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(tiles[1]).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(onLogin).toHaveBeenCalledWith('console');
  });

  it('wraps at the ends, so the arrows never dead-end', async () => {
    renderLogin();
    const tiles = screen.getAllByRole('button');
    tiles[0].focus();
    await userEvent.keyboard('{ArrowUp}');
    expect(tiles[tiles.length - 1]).toHaveFocus();
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run src/components/OS/Login/Login.test.tsx`
Expected: FAIL — one tile, and `onLogin` takes no argument.

- [ ] **Step 3: Add the three i18n keys**

`src/i18n/types.ts`, beside `login_role`:

```ts
  login_role_console: string;
  login_console_name: string;
  login_hint_profiles: string;
```

`src/i18n/fr.ts`:

```ts
  login_role_console: 'Console — ligne de commande',
  login_console_name: 'root',
  login_hint_profiles: 'Choisissez une session : le bureau, ou la console.',
```

`src/i18n/en.ts`:

```ts
  login_role_console: 'Console — command line',
  login_console_name: 'root',
  login_hint_profiles: 'Pick a session: the desktop, or the console.',
```

- [ ] **Step 4: Rewrite `src/components/OS/Login/Login.tsx`**

```tsx
import { useRef } from 'react';

import { useLang } from 'context/LangContext';
import { identity } from 'data/identity';

export type LoginProfile = 'desktop' | 'console';

interface Props {
  onLogin: (profile: LoginProfile) => void;
}

export function Login({ onLogin }: Props) {
  const { t } = useLang();
  const tiles = useRef<Array<HTMLDivElement | null>>([]);

  const profiles: Array<{ profile: LoginProfile; avatar: string; name: string; role: string }> = [
    { profile: 'desktop', avatar: identity.initials.charAt(0), name: identity.name, role: t('login_role') },
    { profile: 'console', avatar: '>_', name: t('login_console_name'), role: t('login_role_console') },
  ];

  /* Arrow keys walk the tiles and wrap, the way a boot menu does. Enter and
     Space activate — the same two keys a real button answers to. */
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, index: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onLogin(profiles[index].profile);
      return;
    }
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    const step = event.key === 'ArrowDown' ? 1 : -1;
    const next = (index + step + profiles.length) % profiles.length;
    tiles.current[next]?.focus();
  };

  return (
    <div className="os-login">
      <div className="os-login-bar" />
      <div className="os-login-main">
        <div className="os-login-left">
          <div className="lg">
            Ticoq<b>OS</b>
          </div>
          <div className="hint">{t('login_hint_profiles')}</div>
        </div>
        <div className="os-login-div" />
        <div className="os-login-right">
          {profiles.map((entry, index) => (
            <div
              key={entry.profile}
              ref={(el) => {
                tiles.current[index] = el;
              }}
              className={`os-usertile${entry.profile === 'console' ? ' is-console' : ''}`}
              role="button"
              tabIndex={0}
              onClick={() => onLogin(entry.profile)}
              onKeyDown={(event) => onKeyDown(event, index)}
            >
              <div className="os-avatar">{entry.avatar}</div>
              <div>
                <div className="name">{entry.name}</div>
                <div className="role">{entry.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="os-login-bar" />
      <div className="os-login-foot">{t('login_foot')}</div>
    </div>
  );
}
```

`login_hint` is now unused. Leave the key in place only if something else reads it — grep first (`grep -rn "login_hint'" src`); if nothing does, delete it from all three i18n files, and from `Main.test.tsx:52` which asserts on `fr.login_hint` (swap it for `fr.login_hint_profiles`).

- [ ] **Step 5: Stack the tiles in `src/styles/os.css`**

Beside the existing `.os-login-right` rule (line 69):

```css
.os-login-right { padding-left: 48px; display: flex; flex-direction: column; gap: 10px; align-items: flex-start; }
.os-usertile.is-console .os-avatar { background: #0b0b0d; color: #5be05b; font-family: var(--font-mono); font-size: 15px; }
```

Check the mobile block at line 645-648: `.os-login-right` there sets `display: flex; justify-content: center` — add `flex-direction: column; align-items: center;` so both tiles stay stacked and centred on a narrow screen.

- [ ] **Step 6: Run, typecheck, lint**

Run: `npx vitest run src/components/OS && npm run typecheck && npm run lint`
Expected: PASS. `Main.tsx` still calls `onLogin` with no argument — TypeScript accepts that (a handler may ignore its parameter), so this task stays green on its own; Task 9 wires it.

- [ ] **Step 7: Commit**

```bash
git add src/components/OS/Login src/i18n src/styles/os.css
git commit -m "feat(os): two profiles on the login screen"
```

---

### Task 9: The console shell, wired into the OS

**Files:**
- Create: `src/components/OS/Console/Console.tsx`
- Create: `src/components/OS/Console/Console.test.tsx`
- Modify: `src/Main.tsx:29,62-79,189-214`
- Modify: `src/styles/os.css` (append an `.os-console` block)

**Interfaces:**
- Consumes: `useTerminal`, `lineClass`, `runCommand`, `TerminalHost` (Tasks 1–6); `LoginProfile` (Task 8); `setRouteConsole` (Task 7).
- Produces: `Console({ onGui, onLogout, onShutdown }: ConsoleProps)`.

- [ ] **Step 1: Write the failing test**

Create `src/components/OS/Console/Console.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type * as articlesApi from 'api/articles';
import { getArticles } from 'api/articles';
import { mockProjects } from 'api/mock/projects.mock';
import type * as projectsApi from 'api/projects';
import { getProjects } from 'api/projects';
import { vi } from 'vitest';

import { ArticlesProvider } from 'context/ArticlesContext';
import { LangProvider } from 'context/LangContext';
import { OSProvider } from 'context/OSContext';
import { ProjectsProvider } from 'context/ProjectsContext';
import { WindowProvider } from 'context/WindowContext';

import { Console } from './Console';

vi.mock('api/projects', async (importOriginal) => ({
  ...(await importOriginal<typeof projectsApi>()),
  getProjects: vi.fn(),
}));
vi.mock('api/articles', async (importOriginal) => ({
  ...(await importOriginal<typeof articlesApi>()),
  getArticles: vi.fn(),
}));

function renderConsole(handlers: Partial<{ onGui: () => void; onLogout: () => void; onShutdown: () => void }> = {}) {
  const props = { onGui: vi.fn(), onLogout: vi.fn(), onShutdown: vi.fn(), ...handlers };
  render(
    <LangProvider>
      <WindowProvider>
        <OSProvider>
          <ProjectsProvider>
            <ArticlesProvider>
              <Console {...props} />
            </ArticlesProvider>
          </ProjectsProvider>
        </OSProvider>
      </WindowProvider>
    </LangProvider>,
  );
  return props;
}

describe('the console profile', () => {
  beforeEach(() => {
    vi.mocked(getProjects).mockResolvedValue(mockProjects);
    vi.mocked(getArticles).mockResolvedValue([]);
    localStorage.clear();
  });

  it('opens on a POST banner and the full help, unasked', () => {
    renderConsole();
    expect(screen.getByText(/TicoqBIOS/)).toBeInTheDocument();
    expect(screen.getByText(/NAVIGATION/)).toBeInTheDocument();
    expect(screen.getByText(/PROFILE/)).toBeInTheDocument();
  });

  it('advertises the way out in that help', () => {
    renderConsole();
    expect(screen.getByText(/leave the console for the graphical desktop/)).toBeInTheDocument();
  });

  it('reads the portfolio as text, without opening a window', async () => {
    renderConsole();
    await userEvent.type(screen.getByRole('textbox'), 'ls{Enter}');
    expect(screen.getByText(/PERSONAL PROJECTS/)).toBeInTheDocument();
    expect(document.querySelector('.os-window')).toBeNull();
  });

  it('crosses to the desktop on gui', async () => {
    const { onGui } = renderConsole();
    await userEvent.type(screen.getByRole('textbox'), 'gui{Enter}');
    expect(onGui).toHaveBeenCalled();
  });

  it('logs off and shuts down through its host', async () => {
    const { onLogout, onShutdown } = renderConsole();
    await userEvent.type(screen.getByRole('textbox'), 'logout{Enter}');
    expect(onLogout).toHaveBeenCalled();
    await userEvent.type(screen.getByRole('textbox'), 'shutdown{Enter}');
    expect(onShutdown).toHaveBeenCalled();
  });

  it('takes focus, so the first keystroke lands in the prompt', () => {
    renderConsole();
    expect(screen.getByRole('textbox')).toHaveFocus();
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run src/components/OS/Console/Console.test.tsx`
Expected: FAIL — unresolved import.

- [ ] **Step 3: Write `src/components/OS/Console/Console.tsx`**

```tsx
import { useMemo } from 'react';

import { useLang } from 'context/LangContext';
import { useOS } from 'context/OSContext';
import { useWindowContext } from 'context/WindowContext';
import { blank, dim, out } from 'terminal/lines';
import { runCommand } from 'terminal/run';
import type { TerminalCtx, TerminalHost } from 'terminal/types';
import { lineClass, useTerminal } from 'terminal/useTerminal';

interface Props {
  onGui: () => void;
  onLogout: () => void;
  onShutdown: () => void;
}

/**
 * What the console prints before anyone types: a POST-style banner, one line
 * saying what this is, then the whole of `help`. The first screen teaches the
 * interface instead of waiting to be asked — which is the point of the profile.
 */
function intro(ctx: TerminalCtx) {
  return [
    ...out('TicoqBIOS v5.1.2003 — POST OK'),
    ...dim('Memory Test: 640K OK          CPU: Ticoq K7 @ 1.4GHz'),
    ...out('Booting TicoqOS console (root)…'),
    ...blank,
    ...runCommand('help', ctx).lines,
  ];
}

export function Console({ onGui, onLogout, onShutdown }: Props) {
  const { setLang } = useLang();
  const { openApp } = useWindowContext();
  const { triggerBsod, setTheme } = useOS();

  const host = useMemo<TerminalHost>(
    () => ({
      mode: 'console',
      openApp,
      setTheme,
      setLang,
      triggerBsod: () => setTimeout(triggerBsod, 800),
      openUrl: (url) => window.open(url, '_blank', 'noopener'),
      gui: onGui,
      logout: onLogout,
      shutdown: onShutdown,
    }),
    [openApp, setTheme, setLang, triggerBsod, onGui, onLogout, onShutdown],
  );

  const { lines, input, setInput, onKeyDown, logRef, inputRef, focus } = useTerminal({ host, intro });

  return (
    <div className="os-term os-console" onClick={focus} role="application" aria-label="TicoqOS console">
      <div className="os-console-log" ref={logRef}>
        {lines.map((line, i) => (
          <div key={i} className={lineClass(line)}>
            {line.text}
          </div>
        ))}
      </div>

      <div className="os-term-row">
        <span className="pr">C:\&gt;</span>
        <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={onKeyDown} spellCheck={false} autoComplete="off" autoFocus />
      </div>

      <div className="os-console-foot">help · gui</div>
    </div>
  );
}
```

`openApp` is in the host because the interface requires it; in console mode no command calls it. Keep it wired rather than stubbed — the day a command wants a window, it works.

- [ ] **Step 4: Style it in `src/styles/os.css`**

Append after the `.os-term-row` rules (line 631):

```css
/* The console profile: the terminal, full screen, with room to breathe. */
.os-console { position: fixed; inset: 0; display: flex; flex-direction: column; gap: 8px; padding: 22px 26px 14px; font-size: 14px; z-index: 40; }
.os-console-log { flex: 1 1 auto; overflow: auto; }
.os-console .os-term-row { flex: 0 0 auto; font-size: 15px; }
.os-console-foot { flex: 0 0 auto; color: #4c5a4c; font-size: 11px; letter-spacing: 1px; }
@media (max-width: 720px) {
  .os-console { padding: 14px 14px 10px; font-size: 12px; }
}
```

- [ ] **Step 5: Wire it into `src/Main.tsx`**

Import the pieces:

```tsx
import { Console } from 'components/OS/Console/Console';
import type { LoginProfile } from 'components/OS/Login/Login';
```

`Phase` (line 29):

```tsx
type Phase = 'boot' | 'login' | 'desktop' | 'console' | 'off';
```

Replace the deep-link block (lines 62-63) with one that reads both kinds of link:

```tsx
  /* A shared link names a window or the console profile, so it lands there.
     Making someone sit through the boot sequence and click a login tile to
     reach the page they were sent is friction the link was meant to remove. */
  const [initialRoute] = useState(readInitialRoute);
  const deepLinked = initialRoute.app !== null || initialRoute.console === true;
  const [phase, setPhase] = useState<Phase>(initialRoute.console ? 'console' : initialRoute.app ? 'desktop' : 'boot');
```

Pull `setRouteConsole` out of `useRoute()` alongside `route` and `setRouteApp`, and add the crossings:

```tsx
  const enterConsole = useCallback(() => {
    setRouteConsole(true);
    setPhase('console');
  }, [setRouteConsole]);

  const leaveConsole = useCallback(() => {
    setRouteConsole(false);
    setPhase('desktop');
  }, [setRouteConsole]);
```

(`useCallback` joins the React import.)

Login and the new phase, in the render:

```tsx
      {phase === 'login' && <Login onLogin={(profile: LoginProfile) => (profile === 'console' ? enterConsole() : setPhase('desktop'))} />}
      {phase === 'console' && (
        <Console
          onGui={leaveConsole}
          onLogout={() => {
            setRouteConsole(false);
            setPhase('login');
          }}
          onShutdown={() => {
            setRouteConsole(false);
            setPhase('off');
          }}
        />
      )}
```

Two effects assume `phase === 'desktop'` and already guard on it — the route effect at line 84 and the keyboard effect at line 112. Leave both alone: the console has no windows to focus and owns its own keys. The theme class at line 189 currently applies to the desktop only; widen it so the console honours the theme too:

```tsx
  const themed = phase === 'desktop' || phase === 'console';
  const themeClass = themed && theme !== 'bliss' ? ` theme-${theme}` : '';
```

- [ ] **Step 6: Run, typecheck, lint**

Run: `npx vitest run src/components/OS && npm run typecheck && npm run lint`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/components/OS/Console src/Main.tsx src/styles/os.css
git commit -m "feat(os): a console profile you can boot into"
```

---

### Task 10: The OS end to end, and the docs

**Files:**
- Modify: `src/Main.test.tsx`
- Modify: `README.md` (only if it documents the terminal — check first)

**Interfaces:**
- Consumes: everything above. Produces nothing new.

- [ ] **Step 1: Write the failing tests (append to `src/Main.test.tsx`)**

```tsx
describe('the console profile', () => {
  it('lands straight in the console from a shared link', async () => {
    renderAt('#/console');

    await waitFor(() => expect(screen.getByText(/TicoqBIOS/)).toBeInTheDocument());
    expect(screen.getByText(/NAVIGATION/)).toBeInTheDocument();
    expect(windowsOnScreen()).toHaveLength(0);
    expect(screen.queryByText(fr.login_hint_profiles)).not.toBeInTheDocument();
  });

  it('reads the deck without opening a single window', async () => {
    renderAt('#/console');

    await waitFor(() => expect(screen.getByRole('textbox')).toBeInTheDocument());
    await userEvent.type(screen.getByRole('textbox'), 'show pictarine{Enter}');
    expect(screen.getByText(/Backend Engineer/)).toBeInTheDocument();
    expect(windowsOnScreen()).toHaveLength(0);
  });

  it('crosses to the desktop on gui, and says so in the address bar', async () => {
    renderAt('#/console');

    await waitFor(() => expect(screen.getByRole('textbox')).toBeInTheDocument());
    await userEvent.type(screen.getByRole('textbox'), 'gui{Enter}');
    await waitFor(() => expect(document.querySelector('.os-desktop')).toBeInTheDocument());
    expect(window.location.hash).toBe('#/');
  });

  it('is reachable from the login screen, and names itself in the address bar', async () => {
    renderAt('#/');

    await waitFor(() => expect(screen.getByText(fr.login_hint_profiles)).toBeInTheDocument(), { timeout: 4000 });
    await userEvent.click(screen.getByRole('button', { name: /root/ }));
    await waitFor(() => expect(screen.getByText(/TicoqBIOS/)).toBeInTheDocument());
    expect(window.location.hash).toBe('#/console');
  });
});
```

`userEvent` must be imported at the top of `Main.test.tsx` if it is not already: `import userEvent from '@testing-library/user-event';`. The desktop selector in the third test must match what `Desktop.tsx` renders — check it (`grep -n 'className="os-desktop' src/components/Desktop/Desktop.tsx`) and use the real class or an existing role/label instead.

The fourth test sits through the 2800 ms boot. If the wait proves flaky, drive it from `#/` with `vi.useFakeTimers()` and advance by `BOOT_MS`, following whatever the file already does for timers.

- [ ] **Step 2: Run them to make sure they fail**

Run: `npx vitest run src/Main.test.tsx`
Expected: the four new tests FAIL only if something is genuinely unwired; after Task 9 they should mostly pass. Any failure here is a real integration gap — fix it in the component, not by weakening the test.

- [ ] **Step 3: Make them pass**

Fix whatever the failures point at. The likely candidates: the desktop class name in test three, and `#/` after `gui` if `setRouteConsole(false)` lands after `setRouteApp` runs.

- [ ] **Step 4: Check the docs**

Run: `grep -n "terminal\|Terminal\|command" README.md`
If the README lists terminal commands or describes the boot flow, update it: two profiles, the console's `help`, and the fact that the terminal is English-only. If it says nothing about either, add nothing.

- [ ] **Step 5: Full verification**

Run, and paste the output into the commit conversation rather than summarising it:

```bash
npm run typecheck && npm run lint && npm test && npm run build
```

Expected: typecheck silent, lint clean, every suite passing, `vite build` writing `dist/` without warnings that name our files.

- [ ] **Step 6: Manual pass**

Run: `npm run dev`, then check by hand — the automated suite cannot see any of this:
1. `#/console` → banner and help on the first paint, cursor already in the prompt.
2. `ls`, `show pictarine`, `articles`, `cv`, `skills`, `contact` — all readable, no clipping, the log scrolls and the prompt stays put.
3. `theme matrix` then `gui` → the desktop comes up in the matrix theme.
4. Boot from `/` → two tiles, arrow keys move the highlight, Enter on `root` opens the console.
5. The windowed terminal: `help` is grouped, `gui` is absent, `open cv` opens the window.
6. A narrow window (720 px): the console still reads, the tiles stay stacked.

- [ ] **Step 7: Commit**

```bash
git add src/Main.test.tsx README.md
git commit -m "test(os): the console profile end to end"
```

---

## Self-Review

**Spec coverage:**

| Spec section | Task |
| --- | --- |
| Console content is text, `gui` escapes | 3, 4, 5, 9 |
| Profile choice on the login screen | 8 |
| Shared engine, per-mode output | 1, 2, 4, 5, 6 |
| `#/console` shareable, no sub-views | 7, 10 |
| Every app text-viewable, two levels | 3 (deck + `show`), 4 (articles, about), 2 (cv, contact, who) |
| Terminal English-only, 43 keys removed | 6 (keys), 2–5 (English strings), `TERM_LANG` in 1 |
| `download cv` follows OS language | 2 |
| `lang fr\|en` survives, switches the desktop | 5 |
| POST banner + auto-help on entry | 9 |
| Grouped help from the registry, `help <cmd>` | 1 |
| Tab completion for commands and ids | 1 (commands), 3 (ids), 6 (the key handler) |
| Session history, `↑↓` | 6 |
| No TaskBar in the console, theme applies | 9 |
| `logout` / `shutdown` exits | 5, 9 |
| Tests named in the spec | 1–10, all of them |
| `i18n.test.ts` loses its terminal assertions | 6 |

**Known deviations from the spec, deliberate:**
- The spec's help sketch shows `open <app>` with a `web` slug; `open web` in the console has no page to print, so it prints one line pointing at `gui`. Task 4.
- `who`'s alias list includes `about`, so `about` alone works as well as `open about`.

**Type consistency:** `TerminalHost`, `TerminalCtx`, `TerminalData`, `Command`, `CommandResult`, `Line` are defined once in Task 1 and used unchanged in 2–9. `consoleDeck`/`findEntry`/`entryView`/`projectsView` keep the same names in Task 3 and in `run.ts`'s `complete`. `LoginProfile` is produced in Task 8 and consumed in Task 9. `setRouteConsole` is produced in Task 7 and consumed in Task 9. `err`, `dim`, `out`, `col`, `blank`, `heading`, `bullets` come from `lines.ts` in Task 1 and are the only formatting used anywhere after it — `registry.ts` imports `err`, `dim`, `out`, `col`, `blank`, `heading` and needs every one of them by Task 5.

**Order guarantee:** Tasks 1–5 only add files, so `Terminal.tsx` keeps compiling against the `t_*` keys until Task 6 swaps the component and deletes the keys in the same commit. Every task ends on a green `typecheck && lint && test`.
