import { mockProjects } from 'api/mock/projects.mock';
import { vi } from 'vitest';

import type { Article } from 'data/articles';

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

  it('dispatches every app to its own command in the console', () => {
    const ctx = makeCtx('console', { articles: [ARTICLE] });
    expect(text(runCommand('open cv', ctx))).toContain('EXPERIENCE');
    expect(text(runCommand('open contact', ctx))).toContain('Links:');
    expect(text(runCommand('open articles', ctx))).toContain('ARTICLES');
  });

  it('says you are already in it for the terminal itself', () => {
    expect(text(runCommand('open terminal', makeCtx('console')))).toContain('already in it');
  });

  it('points at gui rather than printing a page for the portfolio site', () => {
    const out = text(runCommand('open web', makeCtx('console')));
    expect(out).toContain('gui');
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
