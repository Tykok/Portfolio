import { useMemo } from 'react';
import { blank, dim, out } from 'terminal/lines';
import { runCommand } from 'terminal/run';
import type { TerminalCtx, TerminalHost } from 'terminal/types';
import { lineClass, useTerminal } from 'terminal/useTerminal';

import { useLang } from 'context/LangContext';
import { useOS } from 'context/OSContext';
import { useWindowContext } from 'context/WindowContext';

interface Props {
  onGui: () => void;
  onLogout: () => void;
  onShutdown: () => void;
}

/**
 * What the console prints before anyone types: a POST-style banner, one line
 * saying what this is, then the whole of `help`. The first screen teaches the
 * interface instead of waiting to be asked — which is the point of the profile.
 */
function intro(ctx: TerminalCtx) {
  return [
    ...out('TicoqBIOS v5.1.2003 — POST OK'),
    ...dim('Memory Test: 640K OK          CPU: Ticoq K7 @ 1.4GHz'),
    ...out('Booting TicoqOS console (root)…'),
    ...blank,
    ...runCommand('help', ctx).lines,
  ];
}

export function Console({ onGui, onLogout, onShutdown }: Props) {
  const { setLang } = useLang();
  const { openApp } = useWindowContext();
  const { triggerBsod, setTheme } = useOS();

  const host = useMemo<TerminalHost>(
    () => ({
      mode: 'console',
      openApp,
      setTheme,
      setLang,
      triggerBsod: () => setTimeout(triggerBsod, 800),
      openUrl: (url) => window.open(url, '_blank', 'noopener'),
      gui: onGui,
      logout: onLogout,
      shutdown: onShutdown,
    }),
    [openApp, setTheme, setLang, triggerBsod, onGui, onLogout, onShutdown],
  );

  const { lines, input, setInput, onKeyDown, logRef, inputRef, focus } = useTerminal({ host, intro });

  return (
    <div className="os-term os-console" onClick={focus} role="application" aria-label="TicoqOS console">
      <div className="os-console-log" ref={logRef}>
        {lines.map((line, i) => (
          <div key={i} className={lineClass(line)}>
            {line.text}
          </div>
        ))}
      </div>

      <div className="os-term-row">
        <span className="pr">C:\&gt;</span>
        <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={onKeyDown} spellCheck={false} autoComplete="off" autoFocus />
      </div>

      <div className="os-console-foot">help · gui</div>
    </div>
  );
}
