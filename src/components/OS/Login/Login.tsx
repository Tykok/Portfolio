import { useRef } from 'react';

import { useLang } from 'context/LangContext';
import { identity } from 'data/identity';

export type LoginProfile = 'desktop' | 'console';

interface Props {
  onLogin: (profile: LoginProfile) => void;
}

export function Login({ onLogin }: Props) {
  const { t } = useLang();
  const tiles = useRef<Array<HTMLDivElement | null>>([]);

  const profiles: Array<{ profile: LoginProfile; avatar: React.ReactNode; name: string; role: string }> = [
    {
      profile: 'desktop',
      avatar: <img src={identity.githubAvatar} alt="" />,
      name: identity.name,
      role: t('login_role'),
    },
    { profile: 'console', avatar: '>_', name: t('login_console_name'), role: t('login_role_console') },
  ];

  /* Arrow keys walk the tiles and wrap, the way a boot menu does. Enter and
     Space activate — the same two keys a real button answers to. */
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, index: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onLogin(profiles[index].profile);
      return;
    }
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    const step = event.key === 'ArrowDown' ? 1 : -1;
    const next = (index + step + profiles.length) % profiles.length;
    tiles.current[next]?.focus();
  };

  return (
    <div className="os-login">
      <div className="os-login-bar" />
      <div className="os-login-main">
        <div className="os-login-left">
          <div className="lg">
            Ticoq<b>OS</b>
          </div>
          <div className="hint">{t('login_hint_profiles')}</div>
        </div>
        <div className="os-login-div" />
        <div className="os-login-right">
          {profiles.map((entry, index) => (
            <div
              key={entry.profile}
              ref={(el) => {
                tiles.current[index] = el;
              }}
              className={`os-usertile${entry.profile === 'console' ? ' is-console' : ''}`}
              role="button"
              tabIndex={0}
              onClick={() => onLogin(entry.profile)}
              onKeyDown={(event) => onKeyDown(event, index)}
            >
              <div className="os-avatar">{entry.avatar}</div>
              <div>
                <div className="name">{entry.name}</div>
                <div className="role">{entry.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="os-login-bar" />
      <div className="os-login-foot">{t('login_foot')}</div>
    </div>
  );
}
