#!/usr/bin/env bash
#
# Renders public/cv-elie-treport-{fr,en}.pdf from the CV app itself.
#
# Run from the repository root:  ./scripts/cv/make_cv_pdf.sh
#
# By hand, never in CI or the deploy path — same rule as scripts/images. The
# point of printing the running app rather than maintaining a separate document
# is that the PDF cannot say something the site does not: it is the same data,
# the same component and the same @media print block in src/styles/os.css.
#
# Re-run it whenever the CV content changes, or the download button will serve
# a stale résumé.

set -euo pipefail

cd "$(dirname "$0")/../.."

PORT=4173
BASE="http://localhost:${PORT}"

find_chrome() {
  local candidates=(
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    "/Applications/Chromium.app/Contents/MacOS/Chromium"
    "$HOME/Library/Caches/ms-playwright"/chromium-*/chrome-mac-arm64/"Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing"
    "$HOME/Library/Caches/ms-playwright"/chromium-*/chrome-mac/"Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing"
  )
  for c in "${candidates[@]}"; do
    [ -x "$c" ] && printf '%s' "$c" && return 0
  done
  command -v google-chrome-stable chromium chrome 2>/dev/null | head -1
}

CHROME="$(find_chrome)"
if [ -z "$CHROME" ]; then
  echo "No Chrome or Chromium found. Install one, or run: npx playwright install chromium" >&2
  exit 1
fi

echo "Browser: $CHROME"

echo "Building…"
npm run build >/dev/null

npm run preview -- --port "$PORT" >/tmp/cv-pdf-preview.log 2>&1 &
PREVIEW_PID=$!
trap 'kill "$PREVIEW_PID" 2>/dev/null || true' EXIT

for _ in $(seq 1 40); do
  curl -sf "$BASE" >/dev/null && break
  sleep 0.25
done

# The language lives in localStorage, which a fresh headless profile does not
# have — so each language gets its own throwaway profile, seeded through the
# one page that writes the key.
for lang in fr en; do
  profile="$(mktemp -d)"
  out="public/cv-elie-treport-${lang}.pdf"

  "$CHROME" --headless --disable-gpu --no-sandbox \
    --user-data-dir="$profile" \
    --virtual-time-budget=8000 \
    --no-pdf-header-footer \
    --print-to-pdf="$out" \
    "${BASE}/?lang=${lang}#/cv" >/dev/null 2>&1

  rm -rf "$profile"
  printf '  %s  %s bytes\n' "$out" "$(wc -c <"$out" | tr -d ' ')"
done

echo "Done. Commit the two PDFs alongside whatever CV change produced them."
