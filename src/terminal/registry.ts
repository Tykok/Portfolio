import type { DesktopTheme } from 'context/OSContext';
import { appsMeta } from 'data/apps';
import { entryId } from 'data/deck';
import type { AppKey } from 'types/app';
import type { Lang } from 'types/lang';

import { aboutView } from './views/about';
import { articlesView } from './views/articles';
import { deckFrom, entryView, findEntry, projectsView } from './views/deck';
import { cowsay, FORTUNES, LOGO, NEOFETCH, VALID_THEMES } from './views/fun';
import { contactView, cvUrl, cvView, skillsView, whoView } from './views/profile';
import { blank, col, dim, err, heading, out } from './lines';
import type { Command, CommandGroup, CommandResult, TerminalCtx, TerminalMode } from './types';

/** Every app's key, in the order the desktop lists them. */
export const APP_SLUGS: AppKey[] = appsMeta.map((app) => app.key);

export const GROUP_LABELS: Record<CommandGroup, string> = {
  navigation: 'NAVIGATION',
  profile: 'PROFILE',
  system: 'SYSTEM',
  fun: 'FUN',
};

const GROUP_ORDER: CommandGroup[] = ['navigation', 'profile', 'system', 'fun'];

/** The commands a given mode admits — what help lists and what resolves. */
export function visibleIn(mode: TerminalMode): Command[] {
  return COMMANDS.filter((command) => !command.modes || command.modes.includes(mode));
}

export function findCommand(name: string, mode: TerminalMode): Command | undefined {
  return visibleIn(mode).find((command) => command.name === name || command.aliases?.includes(name));
}

/** `name usage`, as help's left column prints it. */
function signature(command: Command): string {
  return command.usage ? `${command.name} ${command.usage}` : command.name;
}

function helpAll(ctx: TerminalCtx): CommandResult {
  const shown = visibleIn(ctx.host.mode).filter((c) => !c.hidden);
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
    name: 'projects',
    aliases: ['ls', 'work'],
    group: 'navigation',
    usage: '',
    summary: 'the whole deck: employers, then side projects',
    run: (ctx) => {
      if (ctx.data.projectsLoading) return { lines: dim('Loading projects…') };
      const notice = ctx.data.projectsError ? dim('The projects API is unreachable — companies only.') : [];
      return { lines: [...notice, ...projectsView(deckFrom(ctx.data))] };
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
    complete: (arg, ctx) => deckFrom(ctx.data).map(entryId).filter((id) => id.startsWith(arg)),
    run: (ctx, arg) => {
      if (!arg.trim()) return { lines: err('Which one? `show <id>` — run `ls` for the ids.') };
      const entry = findEntry(deckFrom(ctx.data), arg);
      if (!entry) return { lines: err(`No entry called '${arg.trim()}'. Run \`ls\` for the ids.`) };
      return { lines: entryView(entry) };
    },
  },
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
    detail: [`Apps: ${APP_SLUGS.join(' | ')}.`, 'In the console there are no windows, so the app prints instead.'],
    example: 'open articles',
    run: (ctx, arg) => {
      const wanted = arg.trim().toLowerCase();
      if (!wanted) return { lines: err(`Which app? ${APP_SLUGS.join(' | ')}`) };
      if (!appsMeta.some((app) => app.key === wanted)) {
        return { lines: err(`Unknown app: ${wanted}. Try ${APP_SLUGS.join(' | ')}.`) };
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
  {
    name: 'help',
    aliases: ['?', 'man'],
    group: 'system',
    usage: '<command>',
    summary: 'this help, or one command in detail',
    example: 'help show',
    complete: (arg, ctx) =>
      visibleIn(ctx.host.mode)
        .filter((c) => c.name.startsWith(arg))
        .map((c) => c.name),
    run: (ctx, arg) => (arg.trim() ? helpOne(arg.trim().toLowerCase()) : helpAll(ctx)),
  },
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
  {
    name: 'clear',
    aliases: ['cls'],
    group: 'system',
    usage: '',
    summary: 'clear the screen',
    run: () => ({ lines: [], clear: true }),
  },
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
];
