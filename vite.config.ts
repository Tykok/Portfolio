import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
// from vitest/config, not vite — plain defineConfig has no `test` field
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // tsconfigPaths reads baseUrl from tsconfig.json, so the existing
  // 'components/…' / 'context/…' style imports keep working unchanged.
  plugins: [react(), tsconfigPaths()],
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
  },
});
