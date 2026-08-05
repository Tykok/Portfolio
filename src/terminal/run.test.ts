import { mockProjects } from 'api/mock/projects.mock';
import { vi } from 'vitest';

import { complete, runCommand, visibleIn } from './run';
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
