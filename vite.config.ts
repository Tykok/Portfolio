import react from '@vitejs/plugin-react';
import type { Plugin } from 'vite';
import { loadEnv } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
// from vitest/config, not vite — plain defineConfig has no `test` field
import { defineConfig } from 'vitest/config';

/** Used when VITE_SITE_URL is unset, which is the normal case in dev and CI. */
const SITE_URL_FALLBACK = 'http://localhost:3000';

/**
 * Substitutes __SITE_URL__ in index.html with VITE_SITE_URL.
 *
 * Deliberately not Vite's own %VITE_SITE_URL% mechanism, for two reasons: when
 * the variable is unset Vite only warns and leaves the literal in the output,
 * shipping a plainly broken canonical and og:url; and when it is set, Vite
 * substitutes the raw value ahead of any user plugin, so a trailing slash in the
 * variable produces `https://host//`. A token Vite does not know about leaves
 * normalisation and the fallback under our control.
 *
 * The deploy workflow is what requires a real value; verification builds are
 * fine on the fallback.
 */
function siteUrl(mode: string): Plugin {
  return {
    name: 'portfolio:site-url',
    enforce: 'pre',
    transformIndexHtml(html) {
      const configured = loadEnv(mode, process.cwd(), 'VITE_').VITE_SITE_URL ?? '';
      const resolved = configured.trim().replace(/\/+$/, '');

      if (!resolved && mode === 'production') {
        console.warn(
          '\n[portfolio] VITE_SITE_URL is unset — canonical, og:url and og:image ' +
            `will point at ${SITE_URL_FALLBACK}. Fine for a verification build, ` +
            'never for production.\n',
        );
      }

      return html.replace(/__SITE_URL__/g, resolved || SITE_URL_FALLBACK);
    },
  };
}

export default defineConfig(({ mode }) => ({
  // tsconfigPaths reads baseUrl from tsconfig.json, so the existing
  // 'components/…' / 'context/…' style imports keep working unchanged.
  plugins: [siteUrl(mode), react(), tsconfigPaths()],
  server: {
    port: 3000,
  },
  build: {
    outDir: 'build',
    sourcemap: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    css: true,
    restoreMocks: true,
    /* Vitest's default pool forks one worker per file, run in parallel. Under
       memory pressure — this suite's own dev box, and standard GitHub-hosted
       runners alike — a worker occasionally gets killed mid-file, and Vitest's
       "Worker exited unexpectedly" path hangs the whole run instead of failing
       it: `vitest run` prints every result, then never exits, until something
       external kills it. Six runs with file parallelism on hit that twice; six
       runs with it off hit it zero times. Serial files cost ~3x the wall clock
       (~16s vs ~5s here) for a suite this size — cheap next to a CI job that
       silently hangs until its own timeout cancels it. */
    fileParallelism: false,
  },
}));
