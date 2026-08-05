import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useArticles } from 'context/ArticlesContext';
import { useLang } from 'context/LangContext';
import { useProjects } from 'context/ProjectsContext';

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
  const { lang } = useLang();
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
     A ref keeps the effect from replaying the banner every time that happens.
     Synced from an effect, not during render, so a real DOM event always sees
     a ref that a completed commit set — never one render is still writing. */
  const ctxRef = useRef(ctx);
  useEffect(() => {
    ctxRef.current = ctx;
  });
  const introduced = useRef(false);
  useEffect(() => {
    if (introduced.current || !intro) return;
    introduced.current = true;
    setLines(intro(ctxRef.current));
  }, [intro]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [lines]);

  const submit = useCallback((raw: string) => {
    const result = runCommand(raw, ctxRef.current);
    setLines((prev) => (result.clear ? result.lines : [...prev, ...result.lines]));
    if (raw.trim()) {
      setHistory((prev) => [raw, ...prev.slice(0, HISTORY_LIMIT - 1)]);
    }
    setHistIdx(-1);
  }, []);

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
