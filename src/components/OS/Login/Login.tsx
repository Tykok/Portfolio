import { useLang } from 'context/LangContext';
import { identity } from 'data/identity';

interface Props {
  onLogin: () => void;
}

export function Login({ onLogin }: Props) {
  const { t } = useLang();

  return (
    <div className="os-login">
      <div className="os-login-bar" />
      <div className="os-login-main">
        <div className="os-login-left">
          <div className="lg">
            Ticoq<b>OS</b>
          </div>
          <div className="hint">{t('login_hint')}</div>
        </div>
        <div className="os-login-div" />
        <div className="os-login-right">
          <div className="os-usertile" onClick={onLogin} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onLogin()}>
            <div className="os-avatar">T</div>
            <div>
              <div className="name">{identity.name}</div>
              <div className="role">{t('login_role')}</div>
            </div>
          </div>
        </div>
      </div>
      <div className="os-login-bar" />
      <div className="os-login-foot">{t('login_foot')}</div>
    </div>
  );
}
