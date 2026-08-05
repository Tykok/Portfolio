import { blank, err } from './lines';
import { findCommand, visibleIn } from './registry';
import type { CommandResult, Line, TerminalCtx } from './types';

export { findCommand, visibleIn } from './registry';

const PROMPT = 'C:\\> ';

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

/**
 * Tab completion. A bare word completes command names; an argument completes
 * whatever the command itself offers, so a new command opts in by declaring
 * `complete` rather than by being named here.
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
  if (!command?.complete) return [];
  return command.complete(rest.join(' ').toLowerCase(), ctx).map((value) => `${word} ${value}`);
}
