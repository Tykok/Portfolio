import { renderToStaticMarkup } from 'react-dom/server';

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
 * `</script>` à l'intérieur d'une chaîne JSON fermerait le bloc pour l'analyseur
 * HTML, qui ne connaît pas les règles de JSON. Les données viennent du dépôt et
 * non d'un visiteur, mais un titre d'article rapatrié de dev.to au lot 4 en
 * viendra, lui.
 */
function serializeJsonLd(node: JsonLdNode): string {
  return JSON.stringify(node).replace(/<\//g, '<\\/');
}

function headFor(page: SeoPage, css: string): string {
  const lines = [
    `<title>${escapeHtml(page.title)}</title>`,
    `<meta name="description" content="${escapeHtml(page.description)}" />`,
    `<link rel="canonical" href="${escapeHtml(page.canonical)}" />`,
  ];

  if (page.noindex) {
    lines.push('<meta name="robots" content="noindex, follow" />');
  }

  page.alternates.forEach((alt) => {
    lines.push(`<link rel="alternate" hreflang="${alt.hreflang}" href="${escapeHtml(alt.href)}" />`);
  });

  lines.push(`<meta property="og:title" content="${escapeHtml(page.title)}" />`);
  lines.push(`<meta property="og:description" content="${escapeHtml(page.description)}" />`);
  lines.push(`<meta property="og:url" content="${escapeHtml(page.canonical)}" />`);

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
