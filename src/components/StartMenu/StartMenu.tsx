import type { Translations } from 'i18n/types';
import { useLang } from 'context/LangContext';
import { useWindowContext } from 'context/WindowContext';
import { useOS } from 'context/OSContext';
import { appsMeta } from 'data/apps';
import { identity } from 'data/identity';
import type { AppKey } from 'types/app';
import { AppIcon } from '../AppIcon/AppIcon';

interface Props {
  onClose: () => void;
  onShutdown: () => void;
  onLogoff: () => void;
}

const PINNED: AppKey[] = ['about', 'projects', 'cv', 'contact', 'terminal'];

const SUB_KEY: Record<AppKey, keyof Translations> = {
  about: 'sub_about',
  projects: 'sub_projects',
  cv: 'sub_cv',
  contact: 'sub_contact',
  terminal: 'sub_terminal',
  media: 'sub_media',
  web: 'sub_web',
};

export function StartMenu({ onClose, onShutdown, onLogoff }: Props) {
  const { lang, t } = useLang();
  const { openApp } = useWindowContext();
  const { openAbout } = useOS();

  const handleOpen = (key: AppKey) => {
    openApp(key);
    onClose();
  };

  const handleAbout = () => {
    openAbout();
    onClose();
  };

  const pinnedApps = PINNED.map((k) => appsMeta.find((a) => a.key === k)).filter(Boolean) as typeof appsMeta;

  return (
    <div className="os-startmenu">
      <div className="os-start-head">
        <div className="os-avatar sm">T</div>
        <div className="os-start-user">{identity.name}</div>
      </div>

      <div className="os-start-cols">
        <div className="os-start-left">
          {pinnedApps.map((app) => (
            <div key={app.key} className="os-startitem pinned" onClick={() => handleOpen(app.key)}>
              <span className="os-si-ic">
                <AppIcon kind={app.icon} size={32} />
              </span>
              <div className="os-si-tx">
                <b>{app.title[lang]}</b>
                <div className="sub">{String(t(SUB_KEY[app.key]))}</div>
              </div>
            </div>
          ))}
          <div className="os-sep" />
          <div className="os-allprogs">
            {t('sm_allprogs')}
            <span className="ap-chev">›</span>
          </div>
        </div>

        <div className="os-start-right">
          <div className="os-place" onClick={() => handleOpen('about')}>
            <span className="os-place-ic gly">👤</span>
            {t('sub_about')}
          </div>
          <div className="os-place" onClick={() => handleOpen('projects')}>
            <span className="os-place-ic gly">📁</span>
            {t('sub_projects')}
          </div>
          <div className="os-place" onClick={() => handleOpen('cv')}>
            <span className="os-place-ic gly">📄</span>
            {t('sub_cv')}
          </div>
          <div className="os-place" onClick={() => handleOpen('web')}>
            <span className="os-place-ic gly">🌐</span>
            {t('sub_web')}
          </div>
          <div className="os-sep blue" />
          <div className="os-place" onClick={() => handleOpen('terminal')}>
            <span className="os-place-ic gly">⌨</span>
            {t('sub_terminal')}
          </div>
          <div className="os-place" onClick={() => handleOpen('media')}>
            <span className="os-place-ic gly">🎵</span>
            {t('sub_media')}
          </div>
          <div className="os-sep blue" />
          <div className="os-place" onClick={handleAbout}>
            <span className="os-place-ic gly">ℹ️</span>
            {t('m_about_os')}
          </div>
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
