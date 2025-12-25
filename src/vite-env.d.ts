/// <reference types="vite/client" />

declare interface ImportMetaEnv {
  readonly VITE_REACT_APP_SUPABASE_URL: string;
  readonly VITE_API_BASE_URL?: string;
  // ...add other VITE_ env vars here as needed...
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}
