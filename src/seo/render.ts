import { renderToStaticMarkup } from 'react-dom/server';

import { identity } from 'data/identity';
import type { Lang } from 'types/lang';

import type { JsonLdNode, SeoPage } from './types';

/**
 * Marqueurs du gabarit.
 *
 * Le bloc de tête est délimité plutôt que remplacé balise par balise : une
 * série d'expressions régulières sur `<title>`, la description, le canonical
 * et les dix balises de partage casserait au premier ajout. Entre les deux
 * marqueurs, index.html garde des valeurs réelles, qui servent en dev et que
 * `head.test.ts` continue de lire.
 */
export const HEAD_START = '<!--seo:head:start-->';
export const HEAD_END = '<!--seo:head:end-->';
export const BODY_MARKER = '<!--seo:body-->';

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** Pour les valeurs d'attribut. Le corps passe par React, qui échappe déjà. */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ESCAPES[char]);
}

/**
 * Valeurs de partage qui ne dépendent pas de la page : la marque de
 * l'interface, l'image générique et son texte alternatif. Elles viennent de
 * index.html, seul endroit qui les portait jusqu'ici.
 */
const OG_SITE_NAME = 'TicoqOS';
const OG_IMAGE_PATH = '/og-image.png';
const OG_IMAGE_WIDTH = '1200';
const OG_IMAGE_HEIGHT = '630';
const OG_IMAGE_ALT = 'Fenêtre rétro affichant Elie Treport, développeur backend Kotlin, à côté d\'un coq.';
const TWITTER_CARD = 'summary_large_image';

/**
 * `og:locale` attend `xx_XX`, pas le BCP47 `xx-XX` qu'utilise `inLanguage` en
 * JSON-LD (voir jsonld.ts) : deux standards différents pour la même langue,
 * donc deux tables plutôt qu'une conversion approximative de l'une vers l'autre.
 */
const OG_LOCALE: Record<Lang, string> = { fr: 'fr_FR', en: 'en_US' };

/**
 * Origine absolue de la page, dérivée de son canonical plutôt que d'un
 * `https://tykok.fr` en dur : un build de prévisualisation dont
 * VITE_SITE_URL pointe ailleurs ne doit pas se mettre à annoncer une image de
 * partage en production.
 */
function originOf(canonical: string): string {
  return new URL(canonical).origin;
}

/**
 * `</script>` à l'intérieur d'une chaîne JSON fermerait le bloc pour l'analyseur
 * HTML, qui ne connaît pas les règles de JSON. Les données viennent du dépôt et
 * non d'un visiteur, mais un titre d'article rapatrié de dev.to au lot 4 en
 * viendra, lui.
 */
function serializeJsonLd(node: JsonLdNode): string {
  return JSON.stringify(node).replace(/<\//g, '<\\/');
}

function headFor(page: SeoPage, css: string): string {
  const origin = originOf(page.canonical);
  const imageUrl = `${origin}${OG_IMAGE_PATH}`;

  const lines = [
    `<title>${escapeHtml(page.title)}</title>`,
    `<meta name="description" content="${escapeHtml(page.description)}" />`,
    `<meta name="author" content="${escapeHtml(identity.name)}" />`,
    `<link rel="canonical" href="${escapeHtml(page.canonical)}" />`,
  ];

  if (page.noindex) {
    lines.push('<meta name="robots" content="noindex, follow" />');
  }

  page.alternates.forEach((alt) => {
    lines.push(`<link rel="alternate" hreflang="${escapeHtml(alt.hreflang)}" href="${escapeHtml(alt.href)}" />`);
  });

  /*
   * Les dix balises de partage : le bloc délimité par HEAD_START/HEAD_END
   * dans index.html en portait treize (og:*, twitter:*, author) et headFor
   * n'en réémettait que trois — og:title, og:description, og:url. Le lien
   * partagé rendait alors sans image ni carte sur LinkedIn, Slack, Discord ou
   * X. La liste ci-dessous doit rester le miroir exact de ce que index.html
   * déclarait ; render.test.ts en garde le compte sur la sortie réellement
   * servie, et non plus seulement sur le gabarit source.
   */
  lines.push('<meta property="og:type" content="website" />');
  lines.push(`<meta property="og:site_name" content="${escapeHtml(OG_SITE_NAME)}" />`);
  lines.push(`<meta property="og:locale" content="${OG_LOCALE[page.lang]}" />`);
  lines.push(`<meta property="og:title" content="${escapeHtml(page.title)}" />`);
  lines.push(`<meta property="og:description" content="${escapeHtml(page.description)}" />`);
  lines.push(`<meta property="og:url" content="${escapeHtml(page.canonical)}" />`);
  lines.push(`<meta property="og:image" content="${escapeHtml(imageUrl)}" />`);
  lines.push(`<meta property="og:image:width" content="${OG_IMAGE_WIDTH}" />`);
  lines.push(`<meta property="og:image:height" content="${OG_IMAGE_HEIGHT}" />`);
  lines.push(`<meta property="og:image:alt" content="${escapeHtml(OG_IMAGE_ALT)}" />`);

  lines.push(`<meta name="twitter:card" content="${TWITTER_CARD}" />`);
  lines.push(`<meta name="twitter:title" content="${escapeHtml(page.title)}" />`);
  lines.push(`<meta name="twitter:description" content="${escapeHtml(page.description)}" />`);
  lines.push(`<meta name="twitter:image" content="${escapeHtml(imageUrl)}" />`);

  page.jsonLd.forEach((node) => {
    lines.push(`<script type="application/ld+json">${serializeJsonLd(node)}</script>`);
  });

  lines.push(`<style>${css}</style>`);

  return lines.join('\n    ');
}

/**
 * Produit le HTML d'une page à partir du gabarit construit par Vite.
 *
 * Le gabarit apporte les balises d'assets empreintées, identiques d'une page à
 * l'autre : un seul bundle, mis en cache une fois pour tout le site.
 */
export function renderDocument(template: string, page: SeoPage, css: string): string {
  const headStart = template.indexOf(HEAD_START);
  const headEnd = template.indexOf(HEAD_END);

  if (headStart === -1 || headEnd === -1 || headEnd < headStart) {
    throw new Error(`Le gabarit a perdu le marqueur ${HEAD_START} ou ${HEAD_END} — index.html a été modifié sans mettre à jour le prérendu.`);
  }

  if (!template.includes(BODY_MARKER)) {
    throw new Error(`Le gabarit a perdu le marqueur ${BODY_MARKER} — le document SEO n'aurait nulle part où aller.`);
  }

  const withHead = template.slice(0, headStart) + headFor(page, css) + template.slice(headEnd + HEAD_END.length);

  /* Frère de #root, jamais enfant : createRoot().render() remplace les enfants
     de sa cible, et Google indexe le DOM rendu. Un document placé dans #root
     disparaîtrait au montage sans laisser de trace. */
  const body = `<main id="seo-content">${renderToStaticMarkup(page.body)}</main>`;

  /* Remplacement sous forme de fonction : une chaîne de remplacement littérale
     est passée par GetSubstitution, qui interprète $&, $$, $` et $' — et le
     corps rendu peut légitimement contenir un $ (extrait shell, prix, LaTeX).
     Une fonction renvoie `body` telle quelle, sans y chercher ces motifs. */
  return withHead.replace(BODY_MARKER, () => body);
}

export function renderSitemap(pages: SeoPage[], lastmod: string): string {
  const entries = pages
    .filter((page) => !page.noindex)
    .map((page) =>
      [
        '  <url>',
        `    <loc>${escapeHtml(page.canonical)}</loc>`,
        `    <lastmod>${lastmod}</lastmod>`,
        `    <priority>${page.priority.toFixed(1)}</priority>`,
        '  </url>',
      ].join('\n'),
    );

  return ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', ...entries, '</urlset>', ''].join(
    '\n',
  );
}

export function renderRobots(siteUrl: string): string {
  return ['# https://www.robotstxt.org/robotstxt.html', 'User-agent: *', 'Disallow:', '', `Sitemap: ${siteUrl}/sitemap.xml`, ''].join('\n');
}
