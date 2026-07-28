import { useLang } from 'context/LangContext';
import { identity } from 'data/identity';
import { primarySocials } from 'data/socials';
import { getBadge } from 'data/techBadges';

const MAIN_SKILLS = ['Kotlin', 'Spring Boot', 'Java', 'TypeScript', 'Next.js', 'PostgreSQL', 'MySQL', 'Docker', 'Stripe', 'Git'];

export function About() {
  const { lang, t } = useLang();

  return (
    <div className="ab-A">
      <div className="ab-ava">
        {identity.initials}
        <div className="ab-dot" />
      </div>

      <div className="ab-nm">{identity.name}</div>
      <div className="ab-role">
        <b>{identity.role[lang]}</b> · {identity.location[lang]}
      </div>

      <div className="ab-pill">
        <i />
        {identity.status[lang]}
      </div>

      {identity.bio[lang].split('\n\n').map((para) => (
        <p key={para.slice(0, 24)} className="ab-bio">{para}</p>
      ))}

      <div className="ab-socs">
        {primarySocials.map((s) => (
          <a key={s.key} href={s.href} target="_blank" rel="noreferrer" className="ab-soc">
            <span className="ic" style={{ background: s.color, width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {s.monogram}
            </span>
            {s.label}
          </a>
        ))}
      </div>

      <div className="ab-rule" />
      <div className="ab-sklab">{t('about_skills')}</div>
      <div className="ab-chips">
        {MAIN_SKILLS.map((tech) => {
          const badge = getBadge(tech);
          return (
            <div key={tech} className="ab-chip">
              <span className="bdg" style={{ background: badge.color, width: 20, height: 20, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                {badge.monogram}
              </span>
              {tech}
            </div>
          );
        })}
      </div>
    </div>
  );
}
