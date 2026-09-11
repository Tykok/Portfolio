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
printf '<!doctype html><title>portfolio</title>' >"${ROOT}/index.html"
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

echo '== routage =='
check 'index servi' 200 "$(status /)"
check 'chemin inconnu retombe sur l app' 200 "$(status /route/does-not-exist)"
check 'le fallback sert le shell' '<!doctype html><title>portfolio</title>' \
  "$(curl -s "http://localhost:${PORT}/route/does-not-exist")"
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

echo '== en-tetes de securite =='
for path in / /index.html /assets/index-abc123.js /og-image.png /route/does-not-exist /assets/absent.js; do
  check "les cinq presents sur ${path}" 5 "$(security_count "${path}")"
done

printf '\nreussis: %s  echoues: %s\n' "${pass}" "${fail}"
[ "${fail}" -eq 0 ]
