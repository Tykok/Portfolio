import { useLang } from 'context/LangContext';
import { identity } from 'data/identity';
import { primarySocials } from 'data/socials';
import { getBadge, techBadges } from 'data/techBadges';

const MAIN_SKILLS = ['Go', 'TypeScript', 'Python', 'PostgreSQL', 'Redis', 'Kafka', 'Docker', 'Kubernetes', 'gRPC'];

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

      <p className="ab-bio">{identity.bio[lang]}</p>

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
      <div className="ab-sklab">{String(t('about_skills'))}</div>
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
