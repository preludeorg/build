/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PWA_ID: string;
  readonly VITE_PRELUDE_SERVICE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
