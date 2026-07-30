#!/usr/bin/env bash
#
# Serves the vhost against a fake release and asserts the behaviour that matters:
# the SPA fallback, the cache policy per path, and that every security header
# survives. That last one is not paranoia — an earlier revision declared
# Cache-Control per location, and in nginx a location with any add_header
# replaces the server-level set rather than extending it, so all five security
# headers were silently dropped on exactly the paths people request most.
#
# Requires docker and curl.
set -euo pipefail

CONF="$(cd "$(dirname "$0")/../nginx" && pwd)/tykok.fr.conf"
PORT=8911
ROOT="$(mktemp -d)"
CID=''

cleanup() {
  [ -n "${CID}" ] && docker rm -f "${CID}" >/dev/null 2>&1
  rm -rf "${ROOT}"
}
trap cleanup EXIT

mkdir -p "${ROOT}/releases/r1/assets"
printf '<!doctype html><title>portfolio</title>' >"${ROOT}/releases/r1/index.html"
printf 'console.log(1)' >"${ROOT}/releases/r1/assets/index-abc123.js"
printf 'x' >"${ROOT}/releases/r1/og-image.png"
printf '{}' >"${ROOT}/releases/r1/manifest.json"
printf 'leak' >"${ROOT}/releases/r1/assets/index-abc123.js.map"
chmod -R a+rX "${ROOT}"

CID="$(docker run -d -p "${PORT}:80" \
  -v "${CONF}:/etc/nginx/conf.d/default.conf:ro" \
  -v "${ROOT}:/var/www/portfolio" \
  nginx:stable-alpine \
  sh -c 'ln -sfnT /var/www/portfolio/releases/r1 /var/www/portfolio/current && nginx -g "daemon off;"')"

for _ in $(seq 1 30); do
  curl -fsS -o /dev/null -H 'Host: tykok.fr' "http://localhost:${PORT}/" 2>/dev/null && break
  sleep 1
done

pass=0
fail=0
check() {
  if [ "$2" = "$3" ]; then
    printf '  ok   — %s\n' "$1"
    pass=$((pass + 1))
  else
    printf '  FAIL — %s: expected [%s], got [%s]\n' "$1" "$2" "$3"
    fail=$((fail + 1))
  fi
}

status() { curl -s -o /dev/null -w '%{http_code}' -H 'Host: tykok.fr' "http://localhost:${PORT}$1"; }
cache() {
  curl -sI -H 'Host: tykok.fr' "http://localhost:${PORT}$1" |
    tr -d '\r' | awk 'tolower($1)=="cache-control:"{$1=""; sub(/^ /,""); print}'
}
security_count() {
  curl -sI -H 'Host: tykok.fr' "http://localhost:${PORT}$1" |
    grep -icE 'content-security-policy|x-frame-options|x-content-type-options|referrer-policy|permissions-policy'
}

echo '== routing =='
check 'index served' 200 "$(status /)"
check 'unknown path falls back to the app' 200 "$(status /route/does-not-exist)"
check 'fallback serves the shell' '<!doctype html><title>portfolio</title>' \
  "$(curl -s -H 'Host: tykok.fr' "http://localhost:${PORT}/route/does-not-exist")"
check 'missing asset does not fall back' 404 "$(status /assets/absent.js)"
check 'source maps refused' 404 "$(status /assets/index-abc123.js.map)"
check 'dotfiles refused' 404 "$(status /.env)"

echo '== caching =='
check 'html revalidates' 'no-cache, must-revalidate' "$(cache /)"
check 'index.html revalidates' 'no-cache, must-revalidate' "$(cache /index.html)"
check 'fingerprinted asset immutable' 'public, max-age=31536000, immutable' "$(cache /assets/index-abc123.js)"
check 'image cached a week' 'public, max-age=604800' "$(cache /og-image.png)"
check 'manifest revalidates' 'no-cache, must-revalidate' "$(cache /manifest.json)"
# A 404 must not be cached as immutable for a year.
check 'no cache header on 404' '' "$(cache /assets/absent.js)"

echo '== security headers =='
for path in / /index.html /assets/index-abc123.js /og-image.png /route/does-not-exist /assets/absent.js; do
  check "all five present on ${path}" 5 "$(security_count "${path}")"
done

printf '\npassed: %s  failed: %s\n' "${pass}" "${fail}"
[ "${fail}" -eq 0 ]
