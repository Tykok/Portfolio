#!/usr/bin/env bash
#
# Sert docker/nginx.conf contre un faux build et vérifie ce qui compte : le
# fallback SPA, la politique de cache par chemin, et que les cinq en-têtes de
# sécurité survivent partout. Ce dernier point n'est pas de la paranoïa : dans
# nginx, une location qui déclare un add_header remplace le jeu défini au niveau
# serveur au lieu de l'étendre, et une version antérieure du vhost avait ainsi
# supprimé tous les en-têtes sur les chemins les plus demandés.
#
# Requiert docker et curl.
set -euo pipefail

CONF="$(cd "$(dirname "$0")/.." && pwd)/nginx.conf"
IMAGE='nginxinc/nginx-unprivileged:1.30.4-alpine'
PORT=8911
ROOT="$(mktemp -d)"
CID=''

cleanup() {
  [ -n "${CID}" ] && docker rm -f "${CID}" >/dev/null 2>&1
  rm -rf "${ROOT}"
}
trap cleanup EXIT

mkdir -p "${ROOT}/assets"
printf '%s' '<!doctype html><html lang="fr"><head><title>Elie Treport</title><script type="application/ld+json">{"@type":"Person","alternateName":"Tykok"}</script></head><body><div id="root"></div><main id="seo-content"><h1>Elie Treport</h1></main></body></html>' >"${ROOT}/index.html"
printf '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>\n' >"${ROOT}/sitemap.xml"
printf 'User-agent: *\nDisallow:\n\nSitemap: https://tykok.fr/sitemap.xml\n' >"${ROOT}/robots.txt"
printf 'console.log(1)' >"${ROOT}/assets/index-abc123.js"
printf 'x' >"${ROOT}/og-image.png"
printf '{}' >"${ROOT}/manifest.json"
printf 'leak' >"${ROOT}/assets/index-abc123.js.map"
# L'image tourne en uid 101 : sans ceci elle ne peut pas lire le montage.
chmod -R a+rX "${ROOT}"

CID="$(docker run -d -p "${PORT}:8080" \
  -v "${CONF}:/etc/nginx/conf.d/default.conf:ro" \
  -v "${ROOT}:/usr/share/nginx/html:ro" \
  "${IMAGE}")"

for _ in $(seq 1 30); do
  curl -fsS -o /dev/null "http://localhost:${PORT}/" 2>/dev/null && break
  sleep 1
done

pass=0
fail=0
check() {
  if [ "$2" = "$3" ]; then
    printf '  ok   — %s\n' "$1"
    pass=$((pass + 1))
  else
    printf '  FAIL — %s: attendu [%s], obtenu [%s]\n' "$1" "$2" "$3"
    fail=$((fail + 1))
  fi
}

status() { curl -s -o /dev/null -w '%{http_code}' "http://localhost:${PORT}$1"; }
cache() {
  curl -sI "http://localhost:${PORT}$1" |
    tr -d '\r' | awk 'tolower($1)=="cache-control:"{$1=""; sub(/^ /,""); print}'
}
security_count() {
  curl -sI "http://localhost:${PORT}$1" |
    grep -icE 'content-security-policy|x-frame-options|x-content-type-options|referrer-policy|permissions-policy'
}
body_has() {
  if curl -s "http://localhost:${PORT}$1" | grep -qF "$2"; then echo present; else echo absent; fi
}
ctype() {
  curl -sI "http://localhost:${PORT}$1" |
    tr -d '\r' | awk 'tolower($1)=="content-type:"{sub(/;.*/,"",$2); print $2}'
}

echo '== routage =='
check 'index servi' 200 "$(status /)"
check 'chemin inconnu retombe sur l app' 200 "$(status /route/does-not-exist)"
check 'le fallback sert le shell' present "$(body_has /route/does-not-exist '<div id="root"></div>')"
check 'asset absent ne retombe pas' 404 "$(status /assets/absent.js)"
check 'source maps refusees' 404 "$(status /assets/index-abc123.js.map)"
check 'dotfiles refuses' 404 "$(status /.env)"

echo '== cache =='
check 'html revalide' 'no-cache, must-revalidate' "$(cache /)"
check 'index.html revalide' 'no-cache, must-revalidate' "$(cache /index.html)"
check 'asset empreinte immuable' 'public, max-age=31536000, immutable' "$(cache /assets/index-abc123.js)"
check 'image cachee une semaine' 'public, max-age=604800' "$(cache /og-image.png)"
check 'manifest revalide' 'no-cache, must-revalidate' "$(cache /manifest.json)"
check 'pas de cache sur un 404' '' "$(cache /assets/absent.js)"

echo '== prerendu =='
# Tout l'objet du lot : le document doit survivre au service.
check 'le document prerendu est servi' present "$(body_has / '<h1>Elie Treport</h1>')"
check "l alias figure dans la page" present "$(body_has / 'Tykok')"

# La CSP declare script-src 'self'. Un bloc application/ld+json est un data
# block, que le navigateur n execute pas, donc il ne doit pas etre bloque.
# Verifie plutot que suppose : tout le balisage d entite en depend.
check 'le bloc JSON-LD est servi' present "$(body_has / 'application/ld+json')"

echo '== sitemap et robots =='
check 'sitemap servi' 200 "$(status /sitemap.xml)"
check 'robots servi' 200 "$(status /robots.txt)"
# Un sitemap servi en text/html est ignore sans un mot.
check 'sitemap en xml' 'application/xml' "$(ctype /sitemap.xml)"
check 'robots en texte brut' 'text/plain' "$(ctype /robots.txt)"
# Sans cette ligne, Search Console ne trouve le sitemap qu une fois soumis
# a la main.
check 'robots declare le sitemap' present "$(body_has /robots.txt 'Sitemap:')"
# Le HTML doit revalider : un index.html mis en cache laisserait des
# visiteurs sur des noms d assets qui n existent plus.
check 'sitemap revalide' 'no-cache, must-revalidate' "$(cache /sitemap.xml)"
check 'robots revalide' 'no-cache, must-revalidate' "$(cache /robots.txt)"

echo '== en-tetes de securite =='
for path in / /index.html /assets/index-abc123.js /og-image.png /route/does-not-exist /assets/absent.js /sitemap.xml /robots.txt; do
  check "les cinq presents sur ${path}" 5 "$(security_count "${path}")"
done

printf '\nreussis: %s  echoues: %s\n' "${pass}" "${fail}"
[ "${fail}" -eq 0 ]
