/**
 * Vercel serverless: each concurrent invocation should use at most one DB
 * connection through PgBouncer. Without this, parallel queries (or Promise.all)
 * can exhaust Prisma's pool and hit "Timed out fetching a new connection".
 */
export function applyServerlessDbUrl(url: string): string {
  if (process.env.NODE_ENV !== "production") return url;
  if (process.env.PRISMA_SERVERLESS_POOL_OFF === "1") return url;

  const hasConnLimit = /[?&]connection_limit=\d+/.test(url);
  const hasPoolTimeout = /[?&]pool_timeout=\d+/.test(url);
  let next = url;
  if (!hasConnLimit) {
    next += (next.includes("?") ? "&" : "?") + "connection_limit=1";
  }
  if (!hasPoolTimeout) {
    next += (next.includes("?") ? "&" : "?") + "pool_timeout=20";
  }
  return next;
}

/**
 * Vercel often injects POSTGRES_PRISMA_URL / POSTGRES_URL; Supabase dashboard
 * uses DATABASE_URL. Prisma schema only names DATABASE_URL, so we normalize here.
 */
export function resolveDatabaseUrl(): string | undefined {
  const direct =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL;

  if (direct) return direct;

  const host = process.env.POSTGRES_HOST;
  const user = process.env.POSTGRES_USER ?? "postgres";
  const password = process.env.POSTGRES_PASSWORD;
  const database = process.env.POSTGRES_DATABASE ?? "postgres";
  if (host && password) {
    return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:5432/${database}?sslmode=require`;
  }

  return undefined;
}
