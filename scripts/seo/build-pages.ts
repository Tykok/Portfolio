import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { buildPages } from 'seo/pages';
import { renderDocument, renderRobots, renderSitemap } from 'seo/render';
import { normalizeSiteUrl } from 'seo/siteUrl';

/*
 * Coquille d'I/O du prérendu. Volontairement sans logique : tout ce qui décide
 * de quelque chose vit sous src/seo, où c'est typé, linté et testé. Ici, on lit
 * un gabarit et on écrit des fichiers.
 *
 * Exécuté par vite-node après `vite build`, afin que le gabarit porte déjà les
 * balises d'assets empreintées.
 */

/* Les scripts npm s'exécutent depuis la racine du dépôt. `import.meta.dirname`
   serait plus précis, mais vite-node ne le renseigne pas de façon fiable. */
const ROOT = process.cwd();
const BUILD_DIR = resolve(ROOT, 'build');
const TEMPLATE_PATH = resolve(BUILD_DIR, 'index.html');
const CSS_PATH = resolve(ROOT, 'src', 'seo', 'seo.css');

function write(relativePath: string, contents: string): void {
  const target = resolve(BUILD_DIR, relativePath);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, contents, 'utf8');
  /* `no-console` n'autorise que warn et error, et ceci n'est ni l'un ni
     l'autre : c'est la sortie normale d'un script de build. */
  process.stdout.write(`[seo] ${relativePath} — ${contents.length} octets\n`);
}

function main(): void {
  const siteUrl = normalizeSiteUrl(process.env.VITE_SITE_URL);
  const template = readFileSync(TEMPLATE_PATH, 'utf8');
  const css = readFileSync(CSS_PATH, 'utf8');
  const lastmod = new Date().toISOString().slice(0, 10);

  const pages = buildPages(siteUrl);

  pages.forEach((page) => {
    write(page.file, renderDocument(template, page, css));
  });

  write('sitemap.xml', renderSitemap(pages, lastmod));
  write('robots.txt', renderRobots(siteUrl));

  process.stdout.write(`[seo] ${pages.length} page(s) prérendue(s) pour ${siteUrl}\n`);
}

main();
