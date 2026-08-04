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
    expect(text(runCommand('?', makeCtx()))).toContain('NAVIGATION');
  });

  it('groups help, and shows a usage column', () => {
    const out = text(runCommand('help', makeCtx()));
    ['NAVIGATION', 'PROFILE', 'SYSTEM', 'FUN'].forEach((group) => expect(out).toContain(group));
    expect(out).toContain('help <command>');
  });

  it('hides console-only commands from the windowed terminal, and lists them in the console', () => {
    expect(text(runCommand('help', makeCtx('window')))).not.toContain('gui ');
    expect(text(runCommand('help', makeCtx('console')))).toContain('gui');
  });

  it('details a single command on request, with its aliases and an example', () => {
    const out = text(runCommand('help clear', makeCtx()));
    expect(out).toContain('clear');
    expect(out).toContain('cls');
    expect(out).not.toContain('NAVIGATION');
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
