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
