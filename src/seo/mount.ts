/**
 * Passe la main de la page prérendue à l'OS.
 *
 * Le contenu reste dans le DOM : Google indexe le DOM rendu, et non le HTML
 * source, donc le retirer au montage reviendrait à n'avoir rien prérendu du
 * tout. Il est recouvert par l'OS — voir `.os-mounted` dans os.css — et sorti
 * de l'arbre d'accessibilité pour ne pas être lu une seconde fois derrière
 * l'interface.
 *
 * En développement, index.html n'est pas prérendu et `#seo-content` n'existe
 * pas : la fonction pose quand même la classe, dont les règles de mise en page
 * valent dans les deux cas.
 */
export function hideSeoDocument(doc: Document): void {
  doc.body.classList.add('os-mounted');

  const seo = doc.getElementById('seo-content');
  if (!seo) return;

  seo.setAttribute('aria-hidden', 'true');
  seo.setAttribute('inert', '');
}
