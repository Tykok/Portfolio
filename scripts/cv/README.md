# CV PDF generator

One-off tool, run by hand. **Never wired into CI or the deploy path** — same rule as
`scripts/images`.

```bash
./scripts/cv/make_cv_pdf.sh
```

It builds the site, serves it on port 4173, and prints `#/cv` to PDF twice — once
per language — into:

- `public/cv-elie-treport-fr.pdf`
- `public/cv-elie-treport-en.pdf`

Those two files are what the CV window's **Télécharger le PDF / Download the PDF**
button links to. They are committed.

## Why print the app instead of keeping a separate document

The PDF then cannot say anything the site does not: same data (`Cv.tsx`), same
component, same `@media print` block in `src/styles/os.css`. A résumé maintained
in Word beside a portfolio drifts from it within one edit.

The corollary: **re-run this whenever the CV changes**, or the download button
serves a stale résumé. Nothing enforces it automatically.

## Requirements

A Chrome or Chromium with a working `--print-to-pdf`. The script looks for, in
order: Google Chrome, Chromium, then a Playwright-cached Chrome for Testing.
If none is found:

```bash
npx playwright install chromium
```

Some sandboxed shells run the browser but silently refuse its PDF and screenshot
output — the process starts, prints nothing and never exits. If the script hangs
with no file produced, run it from a normal terminal session.

## Checking the result

The print layout is A4 portrait, margins 11mm × 12mm, the OS chrome removed and
the CV window promoted to the page. The window is picked by content
(`.os-window:has(.cv2)`), so `Ctrl+P` from anywhere in the CV gives the same
output as the button — no JS involved.

Worth an eye each time: that no experience or education entry is split across a
page break, and that the stack badges kept their colours (they rely on
`print-color-adjust: exact`).
