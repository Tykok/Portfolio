import { contactView, cvUrl, cvView, skillsView, whoView } from './views/profile';
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
