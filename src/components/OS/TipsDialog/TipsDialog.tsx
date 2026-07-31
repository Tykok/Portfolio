import { useLang } from 'context/LangContext';
import { useOS } from 'context/OSContext';

/**
 * The desktop's tips, listed on demand from the Start menu.
 *
 * These used to be the walking rooster's speech bubbles, which showed one tip
 * every 300 walked pixels — so a visitor saw a random few and never the list.
 * They are the only place the site explains the Konami code, the right-click
 * theme switcher and the terminal's commands, which is why they outlived him.
 */
export function TipsDialog() {
  const { closeTips } = useOS();
  const { t } = useLang();

  return (
    <div className="os-modal-scrim" onClick={closeTips}>
      <div className="os-dialog tq" onClick={(e) => e.stopPropagation()}>
        <div className="tq-titlebar os-dialog-bar">
          <span className="tq-tb-title">{t('m_tips')}</span>
          <div className="tq-tb-btns">
            <button className="tq-tb-btn is-close os-tb-btn-real" onClick={closeTips}>
              ✕
            </button>
          </div>
        </div>

        <div className="os-dialog-body">
          <ul className="tips-list">
            {t('os_tips').map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </div>

        <div className="os-dialog-foot">
          <button className="tq-btn is-default" onClick={closeTips}>
            {t('aos_ok')}
          </button>
        </div>
      </div>
    </div>
  );
}
