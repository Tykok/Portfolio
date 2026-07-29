import { useLang } from 'context/LangContext';
import { useOS } from 'context/OSContext';

export function AboutDialog() {
  const { closeAbout } = useOS();
  const { t } = useLang();

  return (
    <div className="os-modal-scrim" onClick={closeAbout}>
      <div className="os-dialog tq" onClick={(e) => e.stopPropagation()}>
        {/* Title bar */}
        <div className="tq-titlebar os-dialog-bar">
          <span className="tq-tb-title">{t('aos_title')}</span>
          <div className="tq-tb-btns">
            <button className="tq-tb-btn is-close os-tb-btn-real" onClick={closeAbout}>
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="os-dialog-body">
          <div className="os-dialog-logo">
            <span style={{ fontSize: 32 }}>🐓</span>
          </div>
          <div className="os-dialog-text">
            <div className="aos-name">{t('aos_name')}</div>
            <div className="aos-ver">{t('aos_ver')}</div>
            <div className="aos-rule" />
            <div className="aos-copy">{t('aos_copy')}</div>
            <div className="aos-legal">{t('aos_legal')}</div>
            <div className="aos-mem">{t('aos_mem')}</div>
          </div>
        </div>

        {/* Footer */}
        <div className="os-dialog-foot">
          <button className="tq-btn is-default" onClick={closeAbout}>
            {t('aos_ok')}
          </button>
        </div>
      </div>
    </div>
  );
}
