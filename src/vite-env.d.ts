/// <reference types="vite/client" />

declare module "*.css" {
  const content: Record<string, string>;
  export default content;
}

declare module "react-multi-carousel/lib/styles.css";

declare interface ImportMetaEnv {
  readonly VITE_REACT_APP_SUPABASE_URL: string;
  readonly VITE_REACT_APP_SUPABASE_ANON_KEY: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_API_URL?: string;
  readonly VITE_GEMINI_API_KEY?: string;
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}
