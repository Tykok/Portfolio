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
  {
    name: 'show',
    group: 'navigation',
    usage: '<id>',
    summary: 'show a project or article',
    run: () => ({ lines: out('show placeholder') }),
  },
  {
    name: 'cv',
    group: 'profile',
    usage: '',
    summary: 'view my resume',
    run: () => ({ lines: out('cv placeholder') }),
  },
  {
    name: 'easter',
    group: 'fun',
    usage: '',
    summary: 'find the easter egg',
    run: () => ({ lines: out('easter egg') }),
  },
  {
    name: 'gui',
    group: 'system',
    usage: '',
    summary: 'leave the console for the desktop',
    modes: ['console'],
    run: (ctx) => {
      ctx.host.gui?.();
      return { lines: out('returning to desktop...') };
    },
  },
];
