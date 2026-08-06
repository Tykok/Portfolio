import { useLang } from 'context/LangContext';
import { EDUCATION, EXPERIENCE, HARD_SKILLS, LANGUAGES, SOFT_SKILLS, WANTS } from 'data/cv';
import { identity } from 'data/identity';
import { getBadge } from 'data/techBadges';

export function Cv() {
  const { lang, t } = useLang();

  const handlePrint = () => window.print();

  return (
    <div className="cv2" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Toolbar — download first: it is what a recruiter came for. */}
      <div className="cv2-tb">
        <a className="cv2-act primary" href={`/cv-elie-treport-${lang}.pdf`} download>
          {t('cv_dl')}
        </a>
        <button className="cv2-act" onClick={handlePrint}>
          {t('cv_print')}
        </button>
      </div>

      <div className="cv2-body">
        {/* Header */}
        <div className="cv2-head">
          <img className="cv2-photo" src={identity.photo} alt={identity.name} />
          <div>
            <h1 className="cv2-nm">{identity.name}</h1>
            <div className="cv2-role">{identity.role[lang]}</div>
            <div className="cv2-contact">
              <b>{identity.email}</b>
              <i>·</i>
              <span>{identity.github}</span>
              <i>·</i>
              <span>{identity.location[lang]}</span>
            </div>
          </div>
        </div>

        {identity.bio[lang].split('\n\n').map((para) => (
          <p key={para.slice(0, 24)} className="cv2-profile">
            {para}
          </p>
        ))}

        {/* Two-column body */}
        <div className="cv2-cols">
          {/* Main column */}
          <div>
            <div className="cv2-sec">
              <h2>{t('cv_exp')}</h2>
              {EXPERIENCE.map((xp, i) => (
                <div key={i} className="cv2-xp">
                  <div className="when">{xp.when[lang]}</div>
                  <div className="org">{xp.org[lang]}</div>
                  <div className="pos">{xp.pos[lang]}</div>
                  <ul>
                    {xp.bullets[lang].map((b, j) => (
                      <li key={j}>{b}</li>
                    ))}
                  </ul>
                  <div className="cv2-tags">
                    {xp.tags.map((tag) => (
                      <span key={tag} className="cv2-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="cv2-sec">
              <h2>{t('cv_edu')}</h2>
              {EDUCATION.map((ed, i) => (
                <div key={i} className="cv2-edu">
                  <div className="yr">{ed.yr}</div>
                  <div className="ti">{ed.ti[lang]}</div>
                  <div className="sc">{ed.sc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Side column */}
          <div className="cv2-side">
            <div>
              <h3>{t('cv_skills')}</h3>
              <div className="wrap">
                {HARD_SKILLS.map((tech) => {
                  const badge = getBadge(tech);
                  return (
                    <div key={tech} className="cv2-skill">
                      <span className="cvb" style={{ background: badge.color }}>
                        {badge.monogram}
                      </span>
                      {tech}
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h3>{t('cv_soft')}</h3>
              <div className="wrap">
                {SOFT_SKILLS[lang].map((s) => (
                  <span key={s} className="cv2-soft">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3>{t('cv_lang')}</h3>
              <div className="wrap" style={{ flexDirection: 'column', gap: 4 }}>
                {LANGUAGES[lang].map((l) => (
                  <span key={l} style={{ fontSize: 12, color: 'var(--ink)' }}>
                    {l}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3>{t('cv_wants')}</h3>
              <div className="cv2-want">
                {WANTS.map((w) => (
                  <p key={w.lead.fr}>
                    <b>{w.lead[lang]}</b> {w.rest[lang]}
                  </p>
                ))}
              </div>
            </div>

            <div>
              <h3>{t('cv_interests')}</h3>
              <div className="wrap">
                {identity.interests[lang].map((i) => (
                  <span key={i} className="cv2-soft">
                    {i}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
