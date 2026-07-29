/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Set to 'false' to hit the real API instead of the in-repo mock. */
  readonly VITE_USE_MOCK?: string;
  /** Base URL of the projects API. Empty means same-origin. */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
