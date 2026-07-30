#!/usr/bin/env bash
#
# Deploys the portfolio onto this machine. Runs on the Nginx host, invoked over
# SSH by n8n.
#
# Everything it fetches is hardcoded below. It reads no arguments, no stdin and
# no environment from the caller, deliberately: the n8n webhook is reachable from
# the internet, so anyone who learns its URL can cause this to run. Since the
# source is fixed, the worst a forged call achieves is redeploying the release
# that was going to be deployed anyway.
#
# Requires: bash, curl, tar, sha256sum, flock.

set -euo pipefail

REPO='Tykok/Portfolio'
ARTIFACT='site.tar.gz'
BASE='/var/www/portfolio' # holds releases/ and the current symlink
KEEP=5                    # previous releases retained for rollback
LOCK='/var/lock/portfolio-deploy.lock'

RELEASES="${BASE}/releases"
CURRENT="${BASE}/current"
STAMP="${BASE}/.deployed-sha256"
HISTORY="${BASE}/.history" # deploy order, newest last
DOWNLOAD="https://github.com/${REPO}/releases/latest/download"

now() { date -Is 2>/dev/null || date +%Y-%m-%dT%H:%M:%S%z; }
log() { printf '[%s] %s\n' "$(now)" "$*"; }
die() {
  printf '[%s] error: %s\n' "$(now)" "$*" >&2
  exit 1
}

for cmd in curl tar sha256sum flock; do
  command -v "${cmd}" >/dev/null || die "${cmd} is not installed"
done

# Serialise: two webhook calls in a row must not interleave. Checked after the
# preflight so a missing flock reports itself instead of looking like contention.
exec 9>"${LOCK}"
flock --timeout 120 9 || die "another deploy already holds ${LOCK}"


mkdir -p "${RELEASES}"

tmp="$(mktemp -d)"
# Staging lives beside the releases so the final move is a rename on the same
# filesystem, hence atomic. Dot-prefixed so pruning ignores it.
staging="${RELEASES}/.staging.$$"
cleanup() { rm -rf "${tmp}" "${staging}"; }
trap cleanup EXIT

# The checksum doubles as the version: fetching it first makes the whole thing
# idempotent without needing to know the release tag.
log "fetching checksum from ${DOWNLOAD}/${ARTIFACT}.sha256"
curl --fail --silent --show-error --location --max-time 60 \
  --output "${tmp}/sum" "${DOWNLOAD}/${ARTIFACT}.sha256" ||
  die 'could not fetch the checksum'

expected="$(awk 'NR==1{print $1}' "${tmp}/sum")"
[ ${#expected} -eq 64 ] || die "checksum does not look like sha256: ${expected}"

if [ -f "${STAMP}" ] && [ "$(cat "${STAMP}")" = "${expected}" ] && [ -e "${CURRENT}" ]; then
  log "already at ${expected:0:12}, nothing to do"
  exit 0
fi

log "downloading ${ARTIFACT}"
curl --fail --silent --show-error --location --max-time 300 \
  --output "${tmp}/${ARTIFACT}" "${DOWNLOAD}/${ARTIFACT}" ||
  die 'could not download the artifact'

actual="$(sha256sum "${tmp}/${ARTIFACT}" | awk '{print $1}')"
[ "${actual}" = "${expected}" ] || die "checksum mismatch: got ${actual}, expected ${expected}"
log "checksum verified"

# Unpack and validate in staging, never in place: extracting straight into
# releases/ left an empty directory behind whenever tar failed, and those
# empties then counted against the prune budget.
rm -rf "${staging}"
mkdir -p "${staging}"
tar -xzf "${tmp}/${ARTIFACT}" -C "${staging}" ||
  die 'artifact is not a readable tar.gz'

# A build with no entry point must never reach the docroot.
[ -f "${staging}/index.html" ] || die 'extracted release has no index.html'

target="${RELEASES}/${expected:0:12}"
rm -rf "${target}"
mv -fT "${staging}" "${target}"

# Atomic swap. ln -T into a temporary name then mv -T replaces the symlink in one
# rename(2), so no request ever sees a missing or half-written docroot.
ln -sfnT "${target}" "${BASE}/.next-current"
mv -fT "${BASE}/.next-current" "${CURRENT}"
printf '%s\n' "${expected}" >"${STAMP}"
log "now serving ${target}"

# Prune by recorded deploy order, not by mtime. Release directories created
# within the same second tie on %T@ — overlayfs reports whole seconds — and
# `sort -rn` then orders ties arbitrarily, so the directory current pointed at
# could land outside the top KEEP. Skipping it, as it must, then left KEEP+1
# behind and the count crept up with every deploy.
printf '%s\n' "${expected:0:12}" >>"${HISTORY}"

# Newest last, duplicates collapsed onto their most recent position.
keep="$(tac "${HISTORY}" | awk '!seen[$0]++' | head -n "${KEEP}" | tac)"
printf '%s\n' "${keep}" >"${HISTORY}"

current_name="$(basename "$(readlink -f "${CURRENT}")")"
while IFS= read -r dir; do
  name="$(basename "${dir}")"
  [ "${name}" = "${current_name}" ] && continue
  printf '%s\n' "${keep}" | grep -qxF "${name}" && continue
  log "pruning ${name}"
  rm -rf "${dir}"
done < <(find "${RELEASES}" -mindepth 1 -maxdepth 1 -type d -not -name '.*')

log 'done'
