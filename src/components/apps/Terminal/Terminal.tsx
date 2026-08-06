import { useMemo } from 'react';
import { blank, out } from 'terminal/lines';
import type { TerminalCtx, TerminalHost } from 'terminal/types';
import { lineClass, useTerminal } from 'terminal/useTerminal';

import { useLang } from 'context/LangContext';
import { useOS } from 'context/OSContext';
import { useWindowContext } from 'context/WindowContext';

/** The banner the DOS-era terminal has always opened with. */
const intro = (_ctx: TerminalCtx) => [
  ...out('TicoqOS [Version 5.1.2003] — Backend Edition'),
  ...out('(c) Elie "Tykok" Treport. Type \'help\' for commands.'),
  ...blank,
];

export function Terminal() {
  const { setLang } = useLang();
  const { openApp } = useWindowContext();
  const { triggerBsod, setTheme } = useOS();

  const host = useMemo<TerminalHost>(
    () => ({
      mode: 'window',
      openApp,
      setTheme,
      setLang,
      /* The old terminal printed its warning, then blue-screened 800ms later.
         The pause is presentation, so it lives here rather than in the runner. */
      triggerBsod: () => setTimeout(triggerBsod, 800),
      openUrl: (url) => window.open(url, '_blank', 'noopener'),
    }),
    [openApp, setTheme, setLang, triggerBsod],
  );

  const { lines, input, setInput, onKeyDown, logRef, inputRef, focus } = useTerminal({ host, intro });

  return (
    <div className="os-term" onClick={focus} style={{ cursor: 'text', minHeight: '100%' }}>
      <div ref={logRef} style={{ overflow: 'auto', maxHeight: 'calc(100% - 28px)' }}>
        {lines.map((line, i) => (
          <div key={i} className={lineClass(line)}>
            {line.text}
          </div>
        ))}
      </div>

      <div className="os-term-row">
        <span className="pr">C:\&gt;</span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          spellCheck={false}
          autoComplete="off"
          autoFocus
        />
      </div>
    </div>
  );
}
