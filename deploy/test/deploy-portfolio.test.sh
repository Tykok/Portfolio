#!/usr/bin/env bash
#
# Exercises deploy-portfolio.sh against a fake release server.
#
# Meant to run inside Debian, because the script targets the homelab's Debian and
# relies on GNU find -printf, flock and sha256sum — none of which behave the same
# on macOS. From the repository root:
#
#   docker run --rm -v "$PWD:/work:ro" \
#     -v "$PWD/deploy/test/deploy-portfolio.test.sh:/test.sh:ro" \
#     debian:stable-slim bash /test.sh
#
# Two real defects were found by running this rather than reading the script: a
# failed extraction left an empty directory in releases/, which then counted
# against the prune budget; and a missing flock reported itself as lock
# contention.
set -euo pipefail

apt-get update -qq >/dev/null 2>&1
apt-get install -y -qq curl python3 >/dev/null 2>&1

BASE=/tmp/base
SRV=/tmp/srv
mkdir -p "${SRV}"

# Same script, pointed at a local server and writable paths. Nothing else changes.
sed -e "s#^BASE=.*#BASE='${BASE}'#" \
  -e "s#^LOCK=.*#LOCK='/tmp/lock'#" \
  -e "s#^DOWNLOAD=.*#DOWNLOAD='http://localhost:8899'#" \
  /work/deploy/bin/deploy-portfolio.sh >/tmp/dp.sh
chmod +x /tmp/dp.sh

publish() { # publish <label>
  rm -rf /tmp/site && mkdir -p /tmp/site/assets
  printf '<!doctype html><title>%s</title>' "$1" >/tmp/site/index.html
  printf 'console.log("%s")' "$1" >/tmp/site/assets/app-abc.js
  tar -czf "${SRV}/site.tar.gz" -C /tmp/site .
  (cd "${SRV}" && sha256sum site.tar.gz >site.tar.gz.sha256)
}

python3 -m http.server 8899 --directory "${SRV}" >/dev/null 2>&1 &
sleep 1

pass=0
fail=0
check() { # check <label> <expected> <actual>
  if [ "$2" = "$3" ]; then
    printf '  ok   — %s\n' "$1"
    pass=$((pass + 1))
  else
    printf '  FAIL — %s: expected [%s], got [%s]\n' "$1" "$2" "$3"
    fail=$((fail + 1))
  fi
}
count_releases() { find "${BASE}/releases" -mindepth 1 -maxdepth 1 -type d | wc -l | tr -d ' '; }
served() { cat "${BASE}/current/index.html"; }

echo '== first deploy =='
publish v1
/tmp/dp.sh >/tmp/out1 2>&1 || {
  echo 'script failed:'
  cat /tmp/out1
  exit 1
}
check 'index.html is served' '<!doctype html><title>v1</title>' "$(served)"
check 'current is a symlink' yes "$([ -L "${BASE}/current" ] && echo yes || echo no)"
check 'checksum recorded' 64 "$(tr -d '\n' <"${BASE}/.deployed-sha256" | wc -c | tr -d ' ')"

echo '== same artifact again is a no-op =='
/tmp/dp.sh >/tmp/out2 2>&1
check 'nothing downloaded' 1 "$(grep -c 'nothing to do' /tmp/out2)"
check 'still one release' 1 "$(count_releases)"

echo '== upgrade =='
publish v2
/tmp/dp.sh >/tmp/out3 2>&1
check 'new content served' '<!doctype html><title>v2</title>' "$(served)"
check 'previous release kept' 2 "$(count_releases)"

echo '== tampered checksum =='
publish v3
printf '%s  site.tar.gz\n' "$(printf 'a%.0s' $(seq 64))" >"${SRV}/site.tar.gz.sha256"
set +e
/tmp/dp.sh >/tmp/out4 2>&1
rc=$?
set -e
check 'exits non-zero' yes "$([ ${rc} -ne 0 ] && echo yes || echo no)"
check 'mismatch reported' 1 "$(grep -c 'checksum mismatch' /tmp/out4)"
check 'served content untouched' '<!doctype html><title>v2</title>' "$(served)"

echo '== corrupt artifact with a matching checksum =='
printf 'not-an-archive' >"${SRV}/site.tar.gz"
(cd "${SRV}" && sha256sum site.tar.gz >site.tar.gz.sha256)
set +e
/tmp/dp.sh >/tmp/out5 2>&1
rc=$?
set -e
check 'exits non-zero' yes "$([ ${rc} -ne 0 ] && echo yes || echo no)"
check 'served content untouched' '<!doctype html><title>v2</title>' "$(served)"
check 'no empty directory left behind' 0 \
  "$(find "${BASE}/releases" -mindepth 1 -maxdepth 1 -empty | wc -l | tr -d ' ')"
check 'no staging directory left behind' 0 \
  "$(find "${BASE}/releases" -mindepth 1 -maxdepth 1 -name '.staging*' | wc -l | tr -d ' ')"

echo '== pruning past KEEP =='
for v in a b c d e f g; do
  publish "${v}"
  /tmp/dp.sh >/dev/null 2>&1
done
kept="$(count_releases)"
check 'at most five releases' yes "$([ "${kept}" -le 5 ] && echo yes || echo no)"
check 'latest content served' '<!doctype html><title>g</title>' "$(served)"
check 'symlink target exists' yes "$([ -d "$(readlink -f "${BASE}/current")" ] && echo yes || echo no)"

printf '\npassed: %s  failed: %s\n' "${pass}" "${fail}"
[ "${fail}" -eq 0 ]
