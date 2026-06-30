import { useEffect, useRef, useState } from 'react';

import { useLang } from 'context/LangContext';
import { useWindowContext } from 'context/WindowContext';
import { useOS } from 'context/OSContext';
import { identity } from 'data/identity';
import { projects } from 'data/projects';
import { socials } from 'data/socials';
import { techBadges } from 'data/techBadges';
import type { AppKey } from 'types/app';
import type { DesktopTheme } from 'context/OSContext';

interface Line {
  type: 'prompt' | 'output' | 'error' | 'dim';
  text: string;
}

const APP_MAP: Record<string, AppKey> = {
  about: 'about', projets: 'projects', projects: 'projects',
  cv: 'cv', contact: 'contact', media: 'media', web: 'web', terminal: 'terminal',
};

const VALID_THEMES: DesktopTheme[] = ['bliss', 'field', 'dusk', 'matrix', 'rose'];

export function Terminal() {
  const { lang, t } = useLang();
  const { openApp } = useWindowContext();
  const { triggerBsod, setTheme, showMascot } = useOS();
  const [lines, setLines] = useState<Line[]>([
    { type: 'output', text: String(t('t_b1')) },
    { type: 'output', text: String(t('t_b2')) },
    { type: 'dim', text: '' },
  ]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [lines]);

  const push = (...newLines: Line[]) =>
    setLines((prev) => [...prev, ...newLines]);

  const runCommand = (raw: string) => {
    const cmd = raw.trim().toLowerCase();
    const parts = cmd.split(/\s+/);
    const base = parts[0];
    const arg = parts.slice(1).join(' ');

    push({ type: 'prompt', text: `C:\\> ${raw}` });
    setHistory((h) => [raw, ...h.slice(0, 49)]);
    setHistIdx(-1);

    if (!cmd) return;

    switch (base) {
      case 'help':
        push(
          { type: 'output', text: String(t('t_help')) },
          { type: 'dim', text: '' },
          { type: 'output', text: `  help        — ${String(t('t_h_help'))}` },
          { type: 'output', text: `  who         — ${String(t('t_h_who'))}` },
          { type: 'output', text: `  projects    — ${String(t('t_h_proj'))}` },
          { type: 'output', text: `  skills      — ${String(t('t_h_skills'))}` },
          { type: 'output', text: `  contact     — ${String(t('t_h_contact'))}` },
          { type: 'output', text: `  cv          — ${String(t('t_h_cv'))}` },
          { type: 'output', text: `  open <app>  — ${String(t('t_h_open'))}` },
          { type: 'output', text: `  theme <n>   — ${String(t('t_theme_list'))}` },
          { type: 'output', text: `  clear       — ${String(t('t_h_clear'))}` },
          { type: 'dim', text: String(t('t_secret_hint')) },
        );
        break;

      case 'who':
      case 'whoami':
        push(
          { type: 'output', text: `${identity.name} (${identity.alias})` },
          { type: 'output', text: identity.role[lang] },
          { type: 'output', text: identity.location[lang] },
          { type: 'output', text: identity.bio[lang] },
        );
        break;

      case 'projects':
      case 'ls':
        push(
          { type: 'output', text: `${projects.length} projets :` },
          ...projects.map((p) => ({
            type: 'output' as const,
            text: `  ${p.emoji}  ${p.title[lang].padEnd(30)} [${p.stack.map((s) => s.label).join(', ')}]`,
          })),
          { type: 'dim', text: String(t('t_open_hint')) },
        );
        break;

      case 'skills':
        push(
          { type: 'output', text: 'Stack :' },
          { type: 'output', text: Object.keys(techBadges).join('  ·  ') },
        );
        break;

      case 'contact':
        push(
          { type: 'output', text: 'Liens :' },
          ...socials.map((s) => ({ type: 'output' as const, text: `  ${s.label.padEnd(12)} ${s.value}` })),
        );
        break;

      case 'cv':
        push({ type: 'output', text: String(t('t_cv_open')) });
        openApp('cv');
        break;

      case 'open':
        if (!arg) {
          push({ type: 'output', text: String(t('t_h_open')) });
        } else if (APP_MAP[arg]) {
          push({ type: 'output', text: `${String(t('t_opening'))} ${arg}…` });
          openApp(APP_MAP[arg]);
        } else {
          push({ type: 'error', text: String(t('t_unknown_open')).replace('{a}', arg) });
        }
        break;

      case 'theme':
        if (!arg) {
          push({ type: 'dim', text: String(t('t_theme_list')) });
        } else if (arg === 'next') {
          setTheme('next');
          push({ type: 'output', text: String(t('t_theme_ok')).replace('{a}', 'next →') });
        } else if ((VALID_THEMES as string[]).includes(arg)) {
          setTheme(arg as DesktopTheme);
          push({ type: 'output', text: String(t('t_theme_ok')).replace('{a}', arg) });
        } else {
          push({ type: 'error', text: `Thème inconnu : ${arg}. ${String(t('t_theme_list'))}` });
        }
        break;

      case 'clear':
        setLines([]);
        break;

      case 'neofetch':
      case 'fetch': {
        const rows = t('t_neofetch') as [string, string][];
        push(
          { type: 'output', text: '   _____ _  __  ___  ____  __ __' },
          { type: 'output', text: '  |_   _|  \\/  |/ _ \\/ __ \\/ _ \\' },
          { type: 'output', text: '    | | | |\\/| | (_) \\__ \\> <' },
          { type: 'output', text: '    |_| |_|  |_|\\___/____/_/_\\_\\' },
          { type: 'dim', text: '' },
          ...rows.map(([k, v]) => ({ type: 'output' as const, text: `  ${k.padEnd(14)} ${v}` })),
        );
        break;
      }

      case 'cowsay': {
        const msg = arg || String(t('t_coqsay_default'));
        showMascot(msg);
        push(
          { type: 'output', text: `  ${'-'.repeat(msg.length + 2)}` },
          { type: 'output', text: `< ${msg} >` },
          { type: 'output', text: `  ${'-'.repeat(msg.length + 2)}` },
          { type: 'output', text: '     \\   🐓' },
          { type: 'output', text: '      \\  (mascotte activée)' },
        );
        break;
      }

      case 'sudo':
        if (arg === 'make me a sandwich' || arg === 'make me a sandwich!') {
          push({ type: 'output', text: String(t('t_sudo_sandwich')) });
        } else {
          push({ type: 'error', text: String(t('t_sudo')) });
        }
        break;

      case 'coffee':
        push({ type: 'output', text: `☕  ${String(t('t_coffee'))}` });
        break;

      case 'cocorico':
        push({ type: 'output', text: `🐓  ${String(t('t_cocorico'))}` });
        break;

      case 'fortune': {
        const fortunes = t('t_fortunes') as string[];
        push({ type: 'dim', text: `"${fortunes[Math.floor(Math.random() * fortunes.length)]}"` });
        break;
      }

      case 'matrix':
        push({ type: 'dim', text: String(t('t_matrix')) });
        break;

      case 'crash':
        push({ type: 'error', text: String(t('t_crash')) });
        setTimeout(triggerBsod, 800);
        break;

      case 'easter':
      case 'egg':
        push(
          { type: 'output', text: String(t('t_egg')) },
          { type: 'dim', text: String(t('t_egg2')) },
        );
        break;

      case 'exit':
        push({ type: 'dim', text: String(t('t_exit')) });
        break;

      case 'konami':
        push({ type: 'output', text: String(t('t_konami_hint')) });
        break;

      default:
        push({ type: 'error', text: String(t('t_unknown')).replace('{c}', cmd) });
    }

    push({ type: 'dim', text: '' });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      runCommand(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const next = Math.min(histIdx + 1, history.length - 1);
      setHistIdx(next);
      setInput(history[next] ?? '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = Math.max(histIdx - 1, -1);
      setHistIdx(next);
      setInput(next === -1 ? '' : history[next] ?? '');
    }
  };

  return (
    <div
      className="os-term"
      onClick={() => inputRef.current?.focus()}
      style={{ cursor: 'text', minHeight: '100%' }}
    >
      <div ref={logRef} style={{ overflow: 'auto', maxHeight: 'calc(100% - 28px)' }}>
        {lines.map((l, i) => (
          <div key={i} className={`line${l.type === 'error' ? ' er' : l.type === 'dim' ? ' dim' : l.type === 'prompt' ? ' pa' : ''}`}>
            {l.text}
          </div>
        ))}
      </div>

      <div className="os-term-row">
        <span className="pr">C:\&gt;</span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          autoComplete="off"
          autoFocus
        />
      </div>
    </div>
  );
}
