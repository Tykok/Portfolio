import { useEffect, useRef } from 'react';

import { useLang } from 'context/LangContext';
import { useOS } from 'context/OSContext';
import type { DesktopTheme } from 'context/OSContext';

interface Props {
  x: number;
  y: number;
  onClose: () => void;
  onLineup: () => void;
}

const THEME_ENTRIES: Array<[DesktopTheme, string, string]> = [
  ['bliss', 'th_bliss', '☀️'],
  ['field', 'th_field', '🌿'],
  ['dusk', 'th_dusk', '🌅'],
  ['matrix', 'th_matrix', '💚'],
  ['rose', 'th_rose', '🌸'],
];

export function ContextMenu({ x, y, onClose, onLineup }: Props) {
  const { t } = useLang();
  const { setTheme, theme } = useOS();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', handleDown);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleDown);
      document.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  const safeX = Math.min(x, window.innerWidth - 210);
  const safeY = Math.min(y, window.innerHeight - 290);

  return (
    <div className="os-ctxmenu" style={{ left: safeX, top: safeY }} ref={ref}>
      <div className="os-mi has-sub">
        <span className="os-mi-ico" />
        <span className="os-mi-label">{String(t('ctx_arrange'))}</span>
        <span className="os-mi-sub-arrow">›</span>
        <div className="os-submenu">
          <div className="os-mi" onClick={onClose}>
            <span className="os-mi-check" />
            <span className="os-mi-label">{String(t('ctx_by_name'))}</span>
          </div>
          <div className="os-mi" onClick={onClose}>
            <span className="os-mi-check" />
            <span className="os-mi-label">{String(t('ctx_by_type'))}</span>
          </div>
        </div>
      </div>
      <div className="os-mi" onClick={() => { onLineup(); onClose(); }}>
        <span className="os-mi-ico" />
        <span className="os-mi-label">{String(t('ctx_lineup'))}</span>
      </div>
      <div className="os-mi" onClick={onClose}>
        <span className="os-mi-ico" />
        <span className="os-mi-label">{String(t('ctx_refresh'))}</span>
      </div>
      <div className="os-mi-sep" />
      <div className="os-mi is-disabled">
        <span className="os-mi-ico" />
        <span className="os-mi-label">{String(t('ctx_paste'))}</span>
      </div>
      <div className="os-mi is-disabled">
        <span className="os-mi-ico" />
        <span className="os-mi-label">{String(t('ctx_newfolder'))}</span>
      </div>
      <div className="os-mi-sep" />
      <div className="os-mi has-sub">
        <span className="os-mi-ico">🎨</span>
        <span className="os-mi-label">{String(t('ctx_theme'))}</span>
        <span className="os-mi-sub-arrow">›</span>
        <div className="os-submenu">
          {THEME_ENTRIES.map(([key, labelKey, ico]) => (
            <div
              key={key}
              className="os-mi"
              onClick={() => { setTheme(key); onClose(); }}
            >
              <span className="os-mi-check">{theme === key ? '✓' : ''}</span>
              <span className="os-mi-ico">{ico}</span>
              <span className="os-mi-label">{String(t(labelKey as Parameters<typeof t>[0]))}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="os-mi-sep" />
      <div className="os-mi" onClick={onClose}>
        <span className="os-mi-ico">⚙</span>
        <span className="os-mi-label">{String(t('ctx_props'))}</span>
      </div>
    </div>
  );
}
