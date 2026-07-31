import { useLang } from 'context/LangContext';
import type { Company } from 'data/companies';

import { StackBadges } from './StackBadges';

/**
 * One employer, as a deck slide.
 *
 * Deliberately not a `ProjectSlide` with fields blanked out: a company has no
 * repository, no demo and no lesson, and the hero shows a period where a
 * project shows a year and a status. It shares `StackBadges` with
 * `ProjectSlide` for the stack chip row, since that block is identical logic
 * for both. Every class here is one `ProjectSlide` already uses, except
 * `.deck-work-l` — the label above the work list, which has no counterpart on
 * a project slide.
 */
export function CompanySlide({ company }: { company: Company }) {
  const { lang, t } = useLang();

  return (
    <article className="deck-slide">
      <header className="deck-hero" style={{ background: company.gradient }}>
        <div className="deck-hero-body">
          <span className="deck-monogram">{company.monogram}</span>
          <h2 className="deck-title">{company.name}</h2>
          <div className="deck-meta">
            <span className="deck-year">{company.period[lang]}</span>
            <span className="deck-status">{company.place[lang]}</span>
          </div>
        </div>
      </header>

      <section className="deck-pitch">
        <p className="deck-desc">
          <span className="deck-role-l">{t('co_what')}</span>
          {company.what[lang]}
        </p>
        <p className="deck-role">
          <span className="deck-role-l">{t('p_role')}</span>
          {company.role[lang]}
        </p>
      </section>

      <span className="deck-work-l">{t('co_work')}</span>
      <ul className="deck-bul">
        {company.work[lang].map((line, i) => (
          <li key={i}>
            <span className="ck">✓</span>
            {line}
          </li>
        ))}
      </ul>

      <section className="deck-foot">
        <StackBadges stack={company.stack} />
      </section>
    </article>
  );
}
