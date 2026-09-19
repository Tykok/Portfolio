/** Utilisé quand VITE_SITE_URL est absente, ce qui est le cas normal en dev et en CI. */
export const SITE_URL_FALLBACK = 'http://localhost:3000';

/**
 * Origine absolue du site, sans slash final.
 *
 * Partagée par le plugin Vite qui substitue `__SITE_URL__` dans index.html et
 * par le script de prérendu : les deux doivent produire exactement la même
 * chaîne, sinon le canonical d'une page contredit celui du gabarit.
 */
export function normalizeSiteUrl(raw: string | undefined): string {
  const resolved = (raw ?? '').trim().replace(/\/+$/, '');
  return resolved || SITE_URL_FALLBACK;
}
