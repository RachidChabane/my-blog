// Server-only: do not import in client-side islands.

/** Union of all env var names this project uses. */
export type EnvKey =
  | 'OPENROUTER_API_KEY'
  | 'EMBEDDINGS_API_KEY'
  | 'CLOUDFLARE_API_TOKEN'
  | 'CLOUDFLARE_ACCOUNT_ID';

/** All documented keys (matches .env.example). */
export const ENV_KEYS: readonly EnvKey[] = [
  'OPENROUTER_API_KEY',
  'EMBEDDINGS_API_KEY',
  'CLOUDFLARE_API_TOKEN',
  'CLOUDFLARE_ACCOUNT_ID',
] as const;

/**
 * Env record type — compatible with Cloudflare Workers env bindings
 * (plain string-keyed objects) and process.env.
 */
export type EnvRecord = Record<string, string | undefined>;

/**
 * Read a required env var. Throws with a helpful message if missing or empty.
 * Pass `env` to override process.env (e.g. Cloudflare Workers binding).
 */
export function getRequired(key: EnvKey, env?: EnvRecord): string {
  const record = env ?? process.env;
  const value = record[key];
  if (!value) {
    throw new Error(
      `Missing required env var: ${key}\nSet it in your .env file (copy .env.example and fill in the value).`
    );
  }
  return value;
}

/**
 * Read an optional env var. Returns undefined when absent or empty.
 * Pass `env` to override process.env.
 */
export function getOptional(key: EnvKey, env?: EnvRecord): string | undefined {
  const record = env ?? process.env;
  const value = record[key];
  return value || undefined;
}
