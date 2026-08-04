# Two Profiles, One Command Engine — Design

**Date:** 2026-08-04
**Status:** Approved
**Scope:** Add a second login profile that boots into a full-screen console, and move the
terminal's command engine out of the component so both terminals run the same commands.

## Goal

The login screen offers one way in: click the tile, get a Windows XP desktop. That desktop
is the portfolio's personality, and it is also a click-driven interface — the visitor who
would rather type has to find the Terminal icon first, and the terminal they find is a
sideshow with nine commands that mostly open windows.

This lot adds a second profile, `root — Console`, that boots straight into a full-screen
command line where the whole portfolio is readable as text. Nothing is desktop-only: the
work history, the articles, the résumé and the contact links all render in the console. A
`gui` command crosses back to the desktop, so the console is a door, not a cul-de-sac.

The two terminals must not drift. A single command registry serves both, and per-mode
behaviour is a property of the *host*, not a fork in the command list.

## Decisions taken

Recorded because each closed off a plausible alternative:

1. **Console content is text, with an explicit `gui` escape.** `open projects` prints the
   deck in the console rather than crossing to the desktop. The console is self-sufficient;
   crossing over is a deliberate command.
2. **Profile choice lives on the existing login screen**, as a second user tile — not a
   pre-boot BIOS/GRUB menu. One screen to change, and it keeps the boot sequence at the
   length visitors already tolerate.
3. **Shared engine, per-mode output.** Every command exists in both modes; only its effect
   adapts. `gui` is the one console-only command, and `help` filters by mode so it is never
   advertised where it does nothing.
4. **`#/console` is shareable, sub-views are not.** The hash names the mode. Replaying a
   scroll of terminal output from a URL, and reconciling it with browser Back, buys nothing
   a terminal user expects.
5. **Every app gets a text view, two levels deep** — list, then detail via `show <id>`. No
   virtual filesystem (`cd`, `cat`, `pwd`): immersive, but a large build and a learning
   curve aimed at recruiters who did not ask for one.
6. **The terminal is English-only, chrome and data alike.** See below.

## The terminal speaks English

The current terminal routes every string through i18n: 43 `t_*` keys across
`i18n/types.ts`, `i18n/fr.ts` and `i18n/en.ts`. Those keys go away. The registry carries
its own English strings, and the views force `lang = 'en'` when reading data, so
`project.title`, `identity.bio` and company roles print in English on a French desktop.

The reasoning: a shell whose help is translated but whose error messages come from a mixed
pool reads as neither language done well, and English is the working language of the thing
being described. One output means one thing to test and one thing to proofread.

Two consequences to carry out, not to discover later:

- `t_*` keys are used **only** by `Terminal.tsx` — verified by grep. Removing them touches
  no other component.
- `i18n/i18n.test.ts` asserts on `t_fortunes`, `t_neofetch` and `t_projects_l` (lines 37,
  59, 85). Those assertions move to the terminal's own tests or disappear with the keys.

`lang fr|en` survives as a command, because it still does something real: it switches the
OS language for the desktop, the windows and the start menu. Its help text says so, so
nobody types it expecting translated console output.

One exception, deliberate: `download cv` serves a file, not console text, and both PDFs
exist (`/cv-elie-treport-{fr,en}.pdf`, the same URLs the Cv toolbar uses at
`Cv.tsx:202`). It defaults to the current OS language and takes an explicit override —
`download cv fr` — so a French recruiter reading an English console still leaves with the
French résumé.

## Architecture

A new `src/terminal/` directory holds everything that is not rendering:

| File | Responsibility |
| --- | --- |
| `types.ts` | `Line`, `Command`, `TerminalHost`, `TerminalMode = 'window' \| 'console'`, `TerminalCtx` |
| `registry.ts` | The commands, declared as data: name, aliases, group, usage, summary, detail, `modes?`, `run` |
| `run.ts` | `runCommand(raw, ctx): Line[]` — pure, no React, no DOM |
| `views/` | One pure renderer per app: `projectsView`, `entryView`, `articlesView`, `cvView`, `aboutView`, `contactView`, `skillsView`, each `(data, t?) => Line[]` |
| `useTerminal.ts` | The shared hook: lines, input, history, `↑↓`, Tab completion, autoscroll |

`Line` keeps its current shape (`{ type: 'prompt' | 'output' | 'error' | 'dim'; text }`) so
the existing CSS in `styles/os.css` applies unchanged to both terminals.

### The host is what differs

```ts
interface TerminalHost {
  mode: TerminalMode;
  openApp(key: AppKey): void; // window: a real window — console: unused, the view runs instead
  gui?(): void;               // console only
  exit(): void;               // window: closeWindow — console: a message
  logout?(): void;            // console: back to the login screen
  shutdown?(): void;          // console: the Off phase
  triggerBsod(): void;
  setTheme(theme: DesktopTheme | 'next'): void;
  setLang(lang: Lang): void;
}
```

A command reads `ctx.host.mode` to choose its effect. `open projects` calls
`host.openApp('projects')` in window mode and returns `projectsView(...)` lines in console
mode — one command, one help entry, two outcomes.

Data reaches commands through `ctx`, not through hooks: `projects`, `articles` (with their
loading and error states), `deck`, `identity`, `socials`. That is what makes `run.ts` pure
and testable without rendering.

### What happens to the components

`components/apps/Terminal/Terminal.tsx` drops from 296 lines to roughly 50: it calls
`useTerminal({ mode: 'window', ... })` and renders lines plus the input row. Its current
behaviour must not change beyond the new help output — the existing tests are the guard.

`components/OS/Console/Console.tsx` is new: the same hook, a full-screen shell, no TaskBar,
a boot banner, and a footer hint. The theme class from `Main.tsx:189` applies to the console
phase too.

## Boot, profiles and routing

- `Phase` in `Main.tsx` gains a member: `'boot' | 'login' | 'desktop' | 'console' | 'off'`.
- `Login.tsx` takes `onLogin(profile: 'desktop' | 'console')` and renders two tiles —
  `Elie Treport — Desktop` and `root — Console`. Arrow keys and Tab move between them,
  Enter activates, matching the keyboard-driven turn the desktop just took.
- `routing/route.ts`: `Route` gains `console?: true`. `parseHash('#/console')` returns
  `{ app: null, console: true }`; `formatRoute` round-trips it. `console` and `app` are
  mutually exclusive — a hash naming both keeps only `console`.
- A `#/console` deep link skips boot and login exactly as an app deep link already does via
  the `deepLinked` flag.
- Exits: `gui` → `desktop` phase and hash `#/`; `logout` → `login`; `shutdown` → `off`.

## Console session

On entry the console prints, with no artificial delay, a short POST-style banner (version,
memory, CPU), one line saying what this is, and then the full `help` output — so the first
screen already teaches the interface instead of waiting to be asked.

`help` is grouped, and every line comes from the registry, so help cannot drift from
behaviour:

- **NAVIGATION** — `ls`/`projects`, `show <id>`, `articles`, `open <app>`
- **PROFILE** — `who`/`whoami`, `skills`, `cv`, `download cv [fr|en]`, `contact`
- **SYSTEM** — `gui`, `theme <name>`, `lang fr|en`, `clear`, `help <command>`
- **FUN** — `neofetch`, `cowsay`, `fortune`, `coffee`, `cocorico`, `crash`, `konami`

`help <command>` prints usage, aliases and one example from the same registry fields. The
windowed terminal shows the same grouped help minus the `gui` line.

Tab completes command names and `show` ids. History persists for the session, `↑↓` already
work. A dim footer repeats `help · gui`.

## Testing

- `terminal/run.test.ts` — the pure engine: unknown command, alias resolution, `help`
  filtered by mode, `open projects` producing a window call in `window` mode and lines in
  `console` mode, and console output staying English while `lang` is `fr`.
- `terminal/views/*.test.ts` — each view against `api/mock/projects.mock.ts`, including the
  loading and error branches.
- `Login.test.tsx` — both tiles present, arrow-key and Enter navigation, correct profile in
  the callback.
- `route.test.ts` — `#/console` parses and formats round-trip; `console` wins over `app`.
- `Main.test.tsx` — a `#/console` deep link renders the console with help already printed;
  `gui` lands on the desktop.
- Existing `Terminal.test`-adjacent suites and `Web.test.tsx` keep passing; `i18n.test.ts`
  loses its terminal assertions.

## Rejected

- **A pre-boot BIOS menu** with a countdown. A second gate before any content, for a
  reference most visitors would sit through rather than enjoy.
- **A virtual filesystem** (`cd /projects/pictarine`, `cat achievements.txt`). Real work —
  a tree, path resolution, contextual completion — and it hides content behind navigation
  the visitor has to learn.
- **Sub-view URLs** (`#/console/projects/pictarine`). Requires replaying output on load and
  answering what Back means mid-session.
- **A locked console** with no way to the desktop. Most immersive, and the one version where
  a visitor can feel trapped.
