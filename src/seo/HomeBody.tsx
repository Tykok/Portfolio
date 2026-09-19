import type { ReactElement } from 'react';
import { mockProjects } from 'api/mock/projects.mock';

import { companies } from 'data/companies';
import { identity } from 'data/identity';
import { profileSocials } from 'data/socials';
import type { Lang } from 'types/lang';
import { localize, localizeArray } from 'types/lang';

/**
 * Ce que `repo` et `demo` valent quand le projet n'a pas de lien public.
 * Dans l'OS, un tel lien ne fait rien ; dans un document servi à un crawler,
 * il compterait comme un lien mort. On ne le rend pas.
 */
export const NO_LINK = '#';

function hasLink(href: string | undefined): href is string {
  return typeof href === 'string' && href !== NO_LINK && href.trim().length > 0;
}

/**
 * Le document que reçoit un visiteur — ou un crawler — avant que le moindre
 * JavaScript ne s'exécute.
 *
 * Tout vient des données qui alimentent déjà l'OS : rien n'est réécrit ici,
 * donc rien ne peut dériver de ce que les fenêtres affichent. Le paramètre
 * `lang` existe dès maintenant bien que ce lot ne génère que le français —
 * le lot 3 ajoutera `/en/` sans toucher à ce fichier.
 */
export function HomeBody({ lang }: { lang: Lang }): ReactElement {
  const bio = localize(identity.bio, lang).split('\n\n');

  return (
    <>
      <header className="seo-head">
        <h1>{identity.name}</h1>
        <p className="seo-lead">
          Alias {identity.alias}. {localize(identity.role, lang)} — {localize(identity.location, lang)}.
        </p>
        <p className="seo-tagline">{localize(identity.tagline, lang)}</p>
      </header>

      <section aria-labelledby="seo-bio">
        <h2 id="seo-bio">{lang === 'fr' ? 'À propos' : 'About'}</h2>
        {bio.map((paragraph) => (
          <p key={paragraph.slice(0, 40)}>{paragraph.trim()}</p>
        ))}
        <p>{localize(identity.now, lang)}</p>
      </section>

      <section aria-labelledby="seo-work">
        <h2 id="seo-work">{lang === 'fr' ? 'Parcours' : 'Work'}</h2>
        {companies.map((company) => (
          <article key={company.id}>
            <h3>
              {company.name} — {localize(company.place, lang)}
            </h3>
            <p className="seo-meta">{localize(company.period, lang)}</p>
            <p>{localize(company.role, lang)}</p>
            <p>{localize(company.what, lang)}</p>
            <ul>
              {localizeArray(company.work, lang).map((item) => (
                <li key={item.slice(0, 40)}>{item}</li>
              ))}
            </ul>
            <p className="seo-meta">{company.stack.join(' · ')}</p>
          </article>
        ))}
      </section>

      <section aria-labelledby="seo-projects">
        <h2 id="seo-projects">{lang === 'fr' ? 'Projets personnels' : 'Personal projects'}</h2>
        {mockProjects.map((project) => (
          <article key={project.id}>
            <h3>{localize(project.title, lang)}</h3>
            <p className="seo-meta">
              {project.year} · {localize(project.status.label, lang)}
            </p>
            <p>{localize(project.desc, lang)}</p>
            {project.context ? <p>{localize(project.context, lang)}</p> : null}
            <ul>
              {localizeArray(project.bullets, lang).map((item) => (
                <li key={item.slice(0, 40)}>{item}</li>
              ))}
            </ul>
            {project.takeaway ? <p>{localize(project.takeaway, lang)}</p> : null}
            <p className="seo-meta">{project.stack.join(' · ')}</p>
            {hasLink(project.repo) ? (
              <p>
                <a href={project.repo}>{lang === 'fr' ? 'Code source' : 'Source code'}</a>
              </p>
            ) : project.linkNote ? (
              <p className="seo-meta">{localize(project.linkNote, lang)}</p>
            ) : null}
            {hasLink(project.demo) ? (
              <p>
                <a href={project.demo}>{lang === 'fr' ? 'Démonstration' : 'Live demo'}</a>
              </p>
            ) : null}
          </article>
        ))}
      </section>

      <section aria-labelledby="seo-contact">
        <h2 id="seo-contact">Contact</h2>
        {/*
          L'email n'est volontairement pas dans cette liste : avant ce lot, il
          n'atteignait le DOM qu'après l'animation de démarrage et un clic —
          un moissonneur qui se contente d'un curl ne le voyait jamais. Le
          document SEO, lui, arrive dans le tout premier octet de chaque
          réponse : y laisser l'email l'aurait publié en clair sur `/` et sur
          toute URL de repli SPA. `profileSocials` (data/socials.ts) exclut déjà
          l'email pour `sameAs`, qui n'accepte pas les `mailto:` ; on réutilise
          le même filtre ici plutôt que d'en tenir un second à la main, pour
          que la liste de contact et `sameAs` ne puissent pas diverger. La
          fenêtre Contact de l'OS continue de montrer l'email aux vrais
          visiteurs — rien n'est perdu, seul le premier octet change.
        */}
        <ul>
          {profileSocials.map((social) => (
            <li key={social.key}>
              {/* rel="me" confirme dans l'autre sens ce que Person.sameAs déclare. */}
              <a href={social.href} rel={social.href.startsWith('https://') ? 'me noopener' : undefined}>
                {social.label} — {social.value}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
