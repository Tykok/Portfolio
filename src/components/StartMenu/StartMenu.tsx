import { useLang } from 'context/LangContext';
import { useOS } from 'context/OSContext';
import { useWindowContext } from 'context/WindowContext';
import { appsMeta } from 'data/apps';
import { identity } from 'data/identity';
import type { StringKey } from 'i18n/types';
import type { AppKey } from 'types/app';

import { AppIcon } from '../AppIcon/AppIcon';

interface Props {
  onClose: () => void;
  onShutdown: () => void;
  onLogoff: () => void;
}

const PINNED: AppKey[] = ['web', 'projects', 'cv', 'contact', 'terminal'];

const SUB_KEY: Record<AppKey, StringKey> = {
  projects: 'sub_projects',
  cv: 'sub_cv',
  contact: 'sub_contact',
  terminal: 'sub_terminal',
  articles: 'sub_articles',
  web: 'sub_web',
};

export function StartMenu({ onClose, onShutdown, onLogoff }: Props) {
  const { lang, t } = useLang();
  const { openApp } = useWindowContext();
  const { openAbout, openTips } = useOS();

  const handleOpen = (key: AppKey) => {
    openApp(key);
    onClose();
  };

  const handleAbout = () => {
    openAbout();
    onClose();
  };

  const handleTips = () => {
    openTips();
    onClose();
  };

  const pinnedApps = PINNED.map((k) => appsMeta.find((a) => a.key === k)).filter(Boolean) as typeof appsMeta;

  return (
    /* One attribute for the whole menu: every item inside it clicks with the
       menu tick rather than the generic one. */
    <div className="os-startmenu" data-sound="menu">
      <div className="os-start-head">
        <div className="os-avatar sm">T</div>
        <div className="os-start-user">{identity.name}</div>
      </div>

      <div className="os-start-cols">
        <div className="os-start-left">
          {pinnedApps.map((app) => (
            <button key={app.key} type="button" className="os-startitem pinned" onClick={() => handleOpen(app.key)}>
              <span className="os-si-ic">
                <AppIcon kind={app.icon} size={32} />
              </span>
              <span className="os-si-tx">
                <b>{app.title[lang]}</b>
                <span className="sub">{t(SUB_KEY[app.key])}</span>
              </span>
            </button>
          ))}
          <div className="os-sep" />
          <button type="button" className="os-allprogs">
            {t('sm_allprogs')}
            <span className="ap-chev">›</span>
          </button>
        </div>

        <div className="os-start-right">
          <button type="button" className="os-place" onClick={() => handleOpen('projects')}>
            <span className="os-place-ic gly">📁</span>
            {t('sub_projects')}
          </button>
          <button type="button" className="os-place" onClick={() => handleOpen('cv')}>
            <span className="os-place-ic gly">📄</span>
            {t('sub_cv')}
          </button>
          <button type="button" className="os-place" onClick={() => handleOpen('articles')}>
            <span className="os-place-ic gly">📰</span>
            {t('sub_articles')}
          </button>
          <button type="button" className="os-place" onClick={() => handleOpen('web')}>
            <span className="os-place-ic gly">🌐</span>
            {t('sub_web')}
          </button>
          <div className="os-sep blue" />
          <button type="button" className="os-place" onClick={() => handleOpen('terminal')}>
            <span className="os-place-ic gly">⌨</span>
            {t('sub_terminal')}
          </button>
          <div className="os-sep blue" />
          <button type="button" className="os-place" onClick={handleTips}>
            <span className="os-place-ic gly">💡</span>
            {t('m_tips')}
          </button>
          <button type="button" className="os-place" onClick={handleAbout}>
            <span className="os-place-ic gly">ℹ️</span>
            {t('m_about_os')}
          </button>
        </div>
      </div>

      <div className="os-start-foot">
        <button onClick={onLogoff}>
          <span className="os-power-ico lo">↩</span>
          {t('logoff')}
        </button>
        <button onClick={onShutdown}>
          <span className="os-power-ico">⏻</span>
          {t('shutdown')}
        </button>
      </div>
    </div>
  );
}
