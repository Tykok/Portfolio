import { ChickenLoader } from 'components/ChickenLoader/ChickenLoader';
import { useArticles } from 'context/ArticlesContext';
import { useLang } from 'context/LangContext';
import type { Article } from 'data/articles';
import { socials } from 'data/socials';

const DEV_TO = socials.find((s) => s.key === 'devto');

function formatDate(iso: string, locale: string): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short' }).format(date);
}

function ArticleRow({ article, locale }: { article: Article; locale: string }) {
  const { t } = useLang();

  return (
    <a className="ar-row" href={article.url} target="_blank" rel="noreferrer">
      <div className="ar-when">{formatDate(article.publishedAt, locale)}</div>
      <div className="ar-main">
        <div className="ar-title">{article.title}</div>
        {article.description && <p className="ar-desc">{article.description}</p>}
        <div className="ar-meta">
          {article.readingMinutes > 0 && <span className="ar-chip">{t('ar_min', { n: article.readingMinutes })}</span>}
          {/* Reactions and comments are the only third-party proof on the site
              that anyone read this. They are worth showing even at zero. */}
          <span className="ar-chip" title={t('ar_reactions')}>
            ♥ {article.reactions}
          </span>
          <span className="ar-chip" title={t('ar_comments')}>
            💬 {article.comments}
          </span>
          {article.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="ar-tag">
              #{tag}
            </span>
          ))}
        </div>
      </div>
      <span className="ar-arr">↗</span>
    </a>
  );
}

export function Articles() {
  const { lang, t } = useLang();
  const { data, loading, error } = useArticles();
  const locale = lang === 'fr' ? 'fr-FR' : 'en-US';

  return (
    <div className="ar">
      <div className="ar-head">
        <div>
          <div className="ar-h1">{t('ar_title')}</div>
          <div className="ar-sub">{t('ar_sub')}</div>
        </div>
        {DEV_TO && (
          <a className="ar-profile" href={DEV_TO.href} target="_blank" rel="noreferrer">
            {t('ar_profile')} ↗
          </a>
        )}
      </div>

      <div className="ar-list">
        {loading && (
          <div className="ar-state">
            <ChickenLoader label={t('ar_loading')} />
          </div>
        )}
        {!loading && error && <div className="ar-state ar-err">{t('ar_error')}</div>}
        {!loading && !error && data.length === 0 && <div className="ar-state">{t('ar_empty')}</div>}
        {!loading && !error && data.map((article) => <ArticleRow key={article.id} article={article} locale={locale} />)}
      </div>
    </div>
  );
}
